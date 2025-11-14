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

  /**
   * Updates the all-time usage statistics for a user
   * Calculates delta from existing all-time (last known total) and adds to cumulative
   * This prevents data loss if the router resets
   */
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
      // ---- fetch existing all-time to use as prev ----
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

      const prevRxMb = existing.length > 0 ? existing[0].rxMb || 0 : 0;
      const prevTxMb = existing.length > 0 ? existing[0].txMb || 0 : 0;

      // ---- compute delta from existing all-time ----
      let deltaRxMb: number;
      let deltaTxMb: number;
      let isReset = false;

      if (currRxMb < prevRxMb || currTxMb < prevTxMb) {
        // router reset / wrap: treat current as fresh usage
        deltaRxMb = currRxMb;
        deltaTxMb = currTxMb;
        isReset = true;
      } else {
        // normal monotonic increase (equality => 0)
        deltaRxMb = currRxMb - prevRxMb;
        deltaTxMb = currTxMb - prevTxMb;
      }

      // ---- upsert all-time by adding deltas ----
      const now = new Date();
      const totalUsedMb = prevRxMb + prevTxMb + deltaRxMb + deltaTxMb;

      // keep semantics consistent (percent; 2 decimals here)
      const percentageUsed =
        totalAllowedMb > 0
          ? Math.round((totalUsedMb / totalAllowedMb) * 100)
          : 0;

      if (existing.length > 0) {
        await db
          .update(mikrotikUsageAlltime)
          .set({
            rxMb: sql`${mikrotikUsageAlltime.rxMb} + ${deltaRxMb}`,
            txMb: sql`${mikrotikUsageAlltime.txMb} + ${deltaTxMb}`,
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
      } else {
        const newRecord: NewMikrotikUsageAlltime = {
          vesselName,
          username,
          vesselId,
          rxMb: deltaRxMb,
          txMb: deltaTxMb,
          totalAllowedMb,
          percentageUsed: percentageUsed.toString(),
          uptime,
          lastUpdated: now,
        };
        await db.insert(mikrotikUsageAlltime).values(newRecord);
      }

      // optional focused logging

      console.log(`[${vesselName}] all-time update for ${username}`, {
        prevRxMb,
        prevTxMb,
        currRxMb,
        currTxMb,
        deltaRxMb,
        deltaTxMb,
        isReset,
        totalAllowedMb,
      });
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
        const totalRxBytes = profileRxBytes + sessionRxBytes;
        const totalTxBytes = profileTxBytes + sessionTxBytes;
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
