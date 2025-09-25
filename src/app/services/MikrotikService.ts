// MikrotikService.ts
import * as net from "net";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/connection";
import { mikrotikVessels } from "../models/MikrotikVessel";
import { mikrotikUsageSession } from "../models/MikrotikUsageSession";
import {
  mikrotikUsageAlltime,
  type MikrotikUsageAlltime,
  type NewMikrotikUsageAlltime,
} from "../models/MikrotikUsageAlltime";
import { RouterOSClient } from "mikro-routeros";

// ---- helper for safe logging
function mask(val?: string, revealAll = false) {
  if (!val) return "(empty)";
  if (revealAll) return val;
  if (val.length <= 4) return val[0] + "***";
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
      socket.once("connect", () => done(true));
      socket.once("timeout", () => done(false));
      socket.once("error", () => done(false));
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
   */
  private static async updateAlltimeUsage(
    vesselName: string,
    username: string,
    vesselId: number,
    newRxMb: number,
    newTxMb: number,
    uptime: string,
    totalAllowedMb: number
  ): Promise<void> {
    try {
      // Try to find existing all-time record
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

      const now = new Date();
      const percentageUsed =
        totalAllowedMb > 0
          ? Math.round(((newRxMb + newTxMb) / totalAllowedMb) * 1000) / 10
          : 0;

      if (existing.length > 0) {
        // Update existing record
        await db
          .update(mikrotikUsageAlltime)
          .set({
            rxMb: sql`${mikrotikUsageAlltime.rxMb} + ${newRxMb}`,
            txMb: sql`${mikrotikUsageAlltime.txMb} + ${newTxMb}`,
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
        // Insert new record
        const newRecord: NewMikrotikUsageAlltime = {
          vesselName,
          username,
          vesselId,
          rxMb: newRxMb,
          txMb: newTxMb,
          totalAllowedMb,
          percentageUsed: percentageUsed.toString(),
          uptime,
          lastUpdated: now,
        };
        await db.insert(mikrotikUsageAlltime).values(newRecord);
      }
      console.log(`[${vesselName}] Updated all-time usage for ${username}`);
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
    const user = process.env.MT_USER || "svcoreadmin";
    const pass = process.env.MT_PASS || "V3ss3l@dmin#2025";

    // Construct client (timeout in ms)
    const client = new RouterOSClient(host, port, 30000);

    // Optional: event hooks for deeper debugging
    // client.on('close', () => console.log(`[${vessel.vesselName}] <close>`));
    // client.on('error', (e) => console.error(`[${vessel.vesselName}] <error>`, e));
    // client.on('trap',  (t) => console.error(`[${vessel.vesselName}] <trap>`, t));

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
      const sessions: any[] = await client.runQuery("/ip/hotspot/active/print");
      const users: any[] = await client.runQuery("/ip/hotspot/user/print");

      console.log(
        `[${vessel.vesselName}] Active sessions: ${sessions.length}, users: ${users.length}`
      );
      console.dir(sessions.slice(0, 3), { depth: 5 });
      console.dir(users.slice(0, 3), { depth: 5 });

      // Map users by name for limits
      const userMap: Record<string, any> = {};
      for (const u of users) if (u?.name) userMap[u.name] = u;

      // DB write
      await db.transaction(async (tx) => {
        await tx
          .delete(mikrotikUsageSession)
          .where(eq(mikrotikUsageSession.vesselName, vessel.vesselName));

        for (const s of sessions) {
          const username = (s?.user as string) || "";
          if (!username) continue;

          const ipAddr = (s?.address as string) || "";
          const mac = (s?.["mac-address"] as string) || "";
          const uptime = (s?.uptime as string) || "";

          const rxBytes = parseInt(String(s?.["bytes-in"] ?? "0"), 10) || 0;
          const txBytes = parseInt(String(s?.["bytes-out"] ?? "0"), 10) || 0;
          const rxMb = Math.floor(rxBytes / 1048576);
          const txMb = Math.floor(txBytes / 1048576);

          const profile = userMap[username] || {};
          const limitBytes =
            parseInt(String(profile?.["limit-bytes-total"] ?? "0"), 10) || 0;
          const allowedMb =
            limitBytes > 0 ? Math.floor(limitBytes / 1048576) : 5000;

          const totalUsedMb = (rxBytes + txBytes) / 1048576;
          const percentageUsed =
            allowedMb > 0 ? Math.round((totalUsedMb / allowedMb) * 10) / 10 : 0;

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

          // Update all-time usage in the background
          this.updateAlltimeUsage(
            vessel.vesselName,
            username,
            vessel.id,
            rxMb,
            txMb,
            uptime,
            allowedMb
          ).catch(console.error);
        }
      });
    } finally {
      try {
        await client.close();
        console.log(`[${vessel.vesselName}] Connection closed`);
      } catch {}
    }
  }
}
