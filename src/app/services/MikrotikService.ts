import RouterOSAPI from "node-routeros";

import { mikrotikVessels } from "../models/MikrotikVessel";
import {
  mikrotikUsageSession,

} from "../models/MikrotikUsageSession";
import { eq } from "drizzle-orm";
import * as net from "net";
import { db } from "../db/connection";

export class MikrotikService {
  private static async isPortReachable(
    host: string,
    port: number,
    timeout = 4000
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let isConnected = false;

      const onError = () => {
        socket.destroy();
        if (!isConnected) {
          resolve(false);
        }
      };

      socket.setTimeout(timeout);
      socket.once("error", onError);
      socket.once("timeout", onError);

      socket.connect(port, host, () => {
        isConnected = true;
        socket.end();
        resolve(true);
      });
    });
  }

  static async syncMikrotikUsage() {
    try {
      // Get all vessels with Mikrotik routers
      const vessels = await db.select().from(mikrotikVessels).execute();
      console.log("these are mikrotik vessels", vessels);

      for (const vessel of vessels) {
        if (!vessel.routerIp || !vessel.apiPort) continue;

        // Check if router is reachable
        const isReachable = await this.isPortReachable(
          vessel.routerIp,
          vessel.apiPort
        );
        if (!isReachable) {
          console.log(`[!] ${vessel.vesselName}: Vessel Offline`);
          continue;
        }

        if (vessel.routerIp && vessel.apiPort !== null) {
          try {
            await this.fetchAndStoreData({
              id: vessel.id,
              vesselName: vessel.vesselName,
              routerIp: vessel.routerIp,
              apiPort: vessel.apiPort,
            });
            console.log(`✅ ${vessel.vesselName}: Data stored`);
          } catch (error) {
            console.error(`[X] Error with ${vessel.vesselName}:`, error);
          }
        } else {
          console.log(
            `[!] ${vessel.vesselName}: Missing router IP or API port`
          );
        }

        // Small delay between routers
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Error in syncMikrotikUsage:", error);
      throw error;
    }
  }

  private static async fetchAndStoreData(vessel: {
    id: number;
    vesselName: string;
    routerIp: string;
    apiPort: number;
  }) {
    const conn = new RouterOSAPI({
      host: vessel.routerIp,
      user: "svcoreadmin",
      password: "V3ss3l@dmin#2025",
      port: vessel.apiPort,
      timeout: 10, // seconds
    });

    try {
      await new Promise<void>((resolve, reject) => {
        conn.on("error", reject);
        conn.connect();
        resolve();
      });

      // Get active sessions
      const sessions = await new Promise<any[]>((resolve, reject) => {
        conn.write("/ip/hotspot/active/print", (err, packets) => {
          if (err) return reject(err);
          resolve(packets || []);
        });
      });

      // Get hotspot users
      const hotspotUsers = await new Promise<Record<string, any>>(
        (resolve, reject) => {
          conn.write("/ip/hotspot/user/print", (err, packets) => {
            if (err) return reject(err);
            const users: Record<string, any> = {};
            (packets || []).forEach((user: any) => {
              if (user.name) {
                users[user.name] = user;
              }
            });
            resolve(users);
          });
        }
      );

      // Start a transaction
      await db.transaction(async (tx) => {
        // Delete existing sessions for this vessel
        await tx
          .delete(mikrotikUsageSession)
          .where(eq(mikrotikUsageSession.vesselName, vessel.vesselName));

        // Insert new sessions
        for (const session of sessions) {
          const username = session.user || "";
          if (!username) continue;

          const ipAddr = session.address || "";
          const mac = session["mac-address"] || "";
          const uptime = session.uptime || "";

          // Convert bytes to MB
          const rxBytes = parseInt(session["bytes-in"] || "0", 10);
          const txBytes = parseInt(session["bytes-out"] || "0", 10);
          const rxMb = Math.floor(rxBytes / 1048576);
          const txMb = Math.floor(txBytes / 1048576);

          const userProfile = hotspotUsers[username] || {};
          const limitBytes = parseInt(
            userProfile["limit-bytes-total"] || "0",
            10
          );
          const allowedMb =
            limitBytes > 0 ? Math.floor(limitBytes / 1048576) : 5000;
          const totalUsedMb = (rxBytes + txBytes) / 1048576;
          const percentageUsed =
            allowedMb > 0 ? Math.round((totalUsedMb / allowedMb) * 10) / 10 : 0;

          await tx.insert(mikrotikUsageSession).values({
            vesselName: vessel.vesselName,
            username,
            ip: ipAddr,
            mac,
            uptime,
            rxMb,
            txMb,
            totalAllowedMb: allowedMb,
            percentageUsed: percentageUsed.toString(),
            lastUpdated: new Date(),
          });
        }
      });

      conn.close();
    } catch (error) {
      conn.close();
      throw error;
    }
  }
}
