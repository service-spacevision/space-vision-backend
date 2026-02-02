import * as net from 'net';
import { and, eq, sql, desc } from 'drizzle-orm';
import { db } from '../db/connection';
import { mikrotikVessels } from '../models/MikrotikVessel';
import { mikrotikUsageSession } from '../models/MikrotikUsageSession';
import {
  mikrotikUsageAlltime,
  type MikrotikUsageAlltime,
  type NewMikrotikUsageAlltime,
} from '../models/MikrotikUsageAlltime';
import { RouterOSClient } from 'mikro-routeros';

// ---- helper for safe logging
function mask(val?: string, revealAll = false) {
  if (!val) return '(empty)';
  if (revealAll) return val;
  if (val.length <= 4) return val[0] + '***';
  return `${val.slice(0, 2)}***${val.slice(-2)}`;
}

export class MikrotikService {
  private static async isPortReachable(
    host: string,
    port: number,
    timeout = 5000
  ) {
    return new Promise<boolean>((resolve) => {
      const socket = new net.Socket();
      let settled = false;
      const done = (ok: boolean) => {
        if (!settled) {
          settled = true;
          try {
            socket.destroy();
          } catch {}
          resolve(ok);
        }
      };
      socket.setTimeout(timeout);
      socket.once('connect', () => done(true));
      socket.once('timeout', () => done(false));
      socket.once('error', () => done(false));
      try {
        socket.connect(port, host);
      } catch {
        done(false);
      }
    });
  }

  static async syncMikrotikUsage() {
    const vessels = await db.select().from(mikrotikVessels).execute();

    for (const vessel of vessels) {
      if (!vessel.routerIp || vessel.apiPort == null) continue;

      const reachable = await this.isPortReachable(
        vessel.routerIp,
        vessel.apiPort,
        4000
      );
      if (!reachable) {
        console.log(`[!] ${vessel.vesselName}: Vessel Offline`);
        continue;
      }

      try {
        await this.fetchAndStoreData({
          id: vessel.id,
          vesselName: vessel.vesselName,
          routerIp: vessel.routerIp,
          apiPort: vessel.apiPort!,
        });
        console.log(`✅ ${vessel.vesselName}: Data stored`);
      } catch (e: any) {
        console.error(`[X] Error with ${vessel.vesselName}:`, e?.message || e);
      }

      await new Promise((r) => setTimeout(r, 750));
    }
  }

  private static async updateAlltimeUsage(
    vesselName: string,
    username: string,
    vesselId: number,
    currRxMb: number,
    currTxMb: number,
    uptime: string,
    totalAllowedMb: number
  ): Promise<void> {
    try {
      const existing = await db
        .select()
        .from(mikrotikUsageAlltime)
        .where(
          and(
            eq(mikrotikUsageAlltime.vesselName, vesselName),
            eq(mikrotikUsageAlltime.username, username)
          )
        )
        .limit(1);

      const row = existing[0];
      const now = new Date();

      // ---------- No row yet: first time ever ----------
      if (!row) {
        const currentTotalMb = currRxMb + currTxMb;
        const percentageUsed =
          totalAllowedMb > 0
            ? Math.round((currentTotalMb / totalAllowedMb) * 100)
            : 0;

        const newRecord: NewMikrotikUsageAlltime = {
          vesselName,
          username,
          vesselId,

          // Current snapshot from router (NOT lifetime):
          rxMb: currRxMb,
          txMb: currTxMb,

          // Lifetime starts equal to current usage:
          lifetimeRxMb: currRxMb,
          lifetimeTxMb: currTxMb,

          // Snapshot for next delta computation:
          lastRouterRxMb: currRxMb,
          lastRouterTxMb: currTxMb,

          totalAllowedMb,
          percentageUsed: percentageUsed.toString(),
          uptime,
          lastUpdated: now,
        };

        await db.insert(mikrotikUsageAlltime).values(newRecord);
        return;
      }

      // ---------- Existing row: update ----------

      // Previous lifetime totals (fallback to rx/tx for older rows that don't have lifetime yet)
      const prevLifetimeRx = row.lifetimeRxMb ?? row.rxMb ?? 0;
      const prevLifetimeTx = row.lifetimeTxMb ?? row.txMb ?? 0;

      // Previous router snapshot (fallback to rx/tx for very old data)
      const prevSnapRx = row.lastRouterRxMb ?? row.rxMb ?? 0;
      const prevSnapTx = row.lastRouterTxMb ?? row.txMb ?? 0;

      // If both snapshots are 0 but lifetime/overall usage > 0,
      // it's probably first run after adding these columns.
      const missingSnapshot =
        (row.lastRouterRxMb == null && row.lastRouterTxMb == null) ||
        (row.lastRouterRxMb === 0 &&
          row.lastRouterTxMb === 0 &&
          (prevLifetimeRx > 0 || prevLifetimeTx > 0));

      let deltaRxMb = 0;
      let deltaTxMb = 0;

      if (!missingSnapshot) {
        // Normal case: we have a valid previous snapshot.

        if (currRxMb < prevSnapRx || currTxMb < prevSnapTx) {
          // Router reset: treat current counters as fresh usage since reset.
          deltaRxMb = currRxMb;
          deltaTxMb = currTxMb;
        } else {
          // Monotonic growth: simple delta.
          deltaRxMb = currRxMb - prevSnapRx;
          deltaTxMb = currTxMb - prevSnapTx;
        }
      } else {
        // Bootstrap case after adding snapshot columns:
        // Don't add any delta (to avoid double-counting old values).
        // We just start using lifetime from what we already have.
        deltaRxMb = 0;
        deltaTxMb = 0;
      }

      const newLifetimeRx = prevLifetimeRx + deltaRxMb;
      const newLifetimeTx = prevLifetimeTx + deltaTxMb;

      // For percentage/quota, use CURRENT usage, not lifetime:
      const currentTotalMb = currRxMb + currTxMb;
      const percentageUsed =
        totalAllowedMb > 0
          ? Math.round((currentTotalMb / totalAllowedMb) * 100)
          : 0;

      await db
        .update(mikrotikUsageAlltime)
        .set({
          // 👇 current router counters (NOT lifetime)
          rxMb: currRxMb,
          txMb: currTxMb,

          // 👇 lifetime cumulative usage
          lifetimeRxMb: newLifetimeRx,
          lifetimeTxMb: newLifetimeTx,

          // 👇 snapshot for next run
          lastRouterRxMb: currRxMb,
          lastRouterTxMb: currTxMb,

          totalAllowedMb,
          percentageUsed: percentageUsed.toString(),
          uptime,
          lastUpdated: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(mikrotikUsageAlltime.vesselName, vesselName),
            eq(mikrotikUsageAlltime.username, username)
          )
        );
    } catch (error) {
      console.error(
        `[${vesselName}] Error updating all-time usage for ${username}:`,
        error
      );
    }
  }

  /**
   * Gets all-time usage statistics for a vessel
   */
  static async getAlltimeUsage(
    vesselName: string
  ): Promise<MikrotikUsageAlltime[]> {
    return db
      .select()
      .from(mikrotikUsageAlltime)
      .where(eq(mikrotikUsageAlltime.vesselName, vesselName))
      .orderBy(mikrotikUsageAlltime.username);
  }

  /**
   * Resets all-time usage statistics for a user
   */
  static async resetAlltimeUsage(
    vesselName: string,
    username: string
  ): Promise<void> {
    await db
      .delete(mikrotikUsageAlltime)
      .where(
        and(
          eq(mikrotikUsageAlltime.vesselName, vesselName),
          eq(mikrotikUsageAlltime.username, username)
        )
      );
  }

  private static async fetchAndStoreData(vessel: {
    id: number;
    vesselName: string;
    routerIp: string;
    apiPort: number;
  }) {
    const host = vessel.routerIp;
    const port = vessel.apiPort;

    // Prefer env; fallback to your provided creds (with apostrophe)
    const user = process.env.MT_USER || 'svcoreadmin';
    const pass = process.env.MT_PASS || 'V3ss3l@dmin#2025';

    // Construct client (timeout in ms)
    const client = new RouterOSClient(host, port, 30000);

    const REVEAL_FULL_PASSWORD = false;

    console.log(
      `[${
        vessel.vesselName
      }] Connecting to ${host}:${port}… | user=${user}, pass=${mask(
        pass,
        REVEAL_FULL_PASSWORD
      )}`
    );

    try {
      await client.connect();
      await client.login(user, pass);
      console.log(`[${vessel.vesselName}] Connected & authenticated`);

      // Fetch data
      // Fetch data with full logging
      console.log(`[${vessel.vesselName}] Fetching active sessions...`);
      const sessions: any[] = await client.runQuery('/ip/hotspot/active/print');
      console.log(
        `[${vessel.vesselName}] Raw sessions response:`,
        JSON.stringify(sessions, null, 2)
      );

      console.log(`[${vessel.vesselName}] Fetching users...`);
      const users: any[] = await client.runQuery('/ip/hotspot/user/print');
      console.log(
        `[${vessel.vesselName}] Raw users response:`,
        JSON.stringify(users, null, 2)
      );

      console.log(
        `[${vessel.vesselName}] Active sessions: ${sessions.length}, users: ${users.length}`
      );
      console.dir(sessions.slice(0, 3), { depth: 5 });
      console.dir(users.slice(0, 3), { depth: 5 });

      // Build active map by username
      const activeMap: Record<string, any> = {};
      for (const s of sessions) {
        const username = s?.user as string;
        if (username) activeMap[username] = s;
      }

      // Map users by name for limits (unchanged)
      const userMap: Record<string, any> = {};
      for (const u of users) if (u?.name) userMap[u.name] = u;

      // Collect update tasks for all-time (unified for all users)
      console.log(`[${vessel.vesselName}] Collecting update tasks...`);
      const updateTasks: Array<{
        username: string;
        currRxMb: number;
        currTxMb: number;
        uptime: string;
        allowedMb: number;
      }> = [];

      for (const u of users) {
        const username = u?.name as string;

        if (!username) continue;

        // Get active session if exists
        const active = activeMap[username];
        console.log(
          `[${vessel.vesselName}] Active session for ${username}:`,
          active
        );

        // Profile totals (past sessions)
        const profileRxBytes =
          parseInt(String(u?.['bytes-in'] ?? '0'), 10) || 0;
        const profileTxBytes =
          parseInt(String(u?.['bytes-out'] ?? '0'), 10) || 0;

        // Current session bytes (0 if inactive)
        const sessionRxBytes = active
          ? parseInt(String(active?.['bytes-in'] ?? '0'), 10) || 0
          : 0;
        const sessionTxBytes = active
          ? parseInt(String(active?.['bytes-out'] ?? '0'), 10) || 0
          : 0;

        // Current TOTAL usage
        const totalRxBytes = profileRxBytes;
        const totalTxBytes = profileTxBytes;
        const currRxMb = Math.round(totalRxBytes / 1048576);
        const currTxMb = Math.round(totalTxBytes / 1048576);

        const limitBytes =
          parseInt(String(u?.['limit-bytes-total'] ?? '0'), 10) || 0;
        const allowedMb =
          limitBytes > 0 ? Math.floor(limitBytes / 1048576) : 5000;

        const uptime = active?.uptime || u?.uptime || '';

        console.log(
          `[${username}] Total calc: profileRx=${profileRxBytes}, sessionRx=${sessionRxBytes}, totalRx=${totalRxBytes}, allowedMb=${allowedMb}`
        ); // Optional debug

        updateTasks.push({
          username,
          currRxMb,
          currTxMb,
          uptime,
          allowedMb,
        });
      }

      // Handle session storage (only for active users)
      await db.transaction(async (tx) => {
        await tx
          .delete(mikrotikUsageSession)
          .where(eq(mikrotikUsageSession.vesselName, vessel.vesselName));

        for (const s of sessions) {
          const username = (s?.user as string) || '';
          if (!username) continue;

          const ipAddr = (s?.address as string) || '';
          const mac = (s?.['mac-address'] as string) || '';
          const uptime = (s?.uptime as string) || '';

          const rxBytes = parseInt(String(s?.['bytes-in'] ?? '0'), 10) || 0;
          const txBytes = parseInt(String(s?.['bytes-out'] ?? '0'), 10) || 0;
          const rxMb = Math.round(rxBytes / 1048576);
          const txMb = Math.round(txBytes / 1048576);

          const profile = userMap[username] || {};
          const limitBytes =
            parseInt(String(profile?.['limit-bytes-total'] ?? '0'), 10) || 0;
          const allowedMb =
            limitBytes > 0 ? Math.floor(limitBytes / 1048576) : 5000;

          // OPTIONAL FIX: Use total used for percentage (consistent with all-time)
          // If you want session-only percentage, revert to (rxBytes + txBytes)
          const u = profile; // User profile
          const profileRxBytes =
            parseInt(String(u?.['bytes-in'] ?? '0'), 10) || 0;
          const profileTxBytes =
            parseInt(String(u?.['bytes-out'] ?? '0'), 10) || 0;
          const totalUsedBytes =
            profileRxBytes + profileTxBytes + rxBytes + txBytes;
          const totalUsedMb = totalUsedBytes / 1048576;
          const percentageUsed =
            allowedMb > 0
              ? Math.round((totalUsedMb / allowedMb) * 100) / 100
              : 0;

          await tx.insert(mikrotikUsageSession).values({
            vesselName: vessel.vesselName,
            username,
            vesselId: vessel.id,
            ip: ipAddr,
            mac,
            uptime,
            rxMb,
            txMb,
            totalAllowedMb: allowedMb,
            percentageUsed: String(percentageUsed),
            lastUpdated: new Date(),
          });
        }
      });

      // Execute all-time usage updates AFTER transaction

      await Promise.all(
        updateTasks.map((t) =>
          this.updateAlltimeUsage(
            vessel.vesselName,
            t.username,
            vessel.id,
            t.currRxMb,
            t.currTxMb,
            t.uptime,
            t.allowedMb
          )
        )
      );

      // Wait for all background all-time usage updates to complete
      await new Promise((r) => setTimeout(r, 1000));
    } finally {
      try {
        await client.close();
        console.log(`[${vessel.vesselName}] Connection closed`);
      } catch {}
    }
  }
}
