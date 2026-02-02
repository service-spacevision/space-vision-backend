import { syncBluetideTelemetry_func } from '../controllers/bluetideUsageControllers/functions/syncBlutideTelemetry';
import { syncStarlinkUsage_func } from '../controllers/starlinkUsageControllers/functions/syncStarlinkUsage';
import { MikrotikService } from '../services/MikrotikService';
import { AuthUser } from '../utils/types';
import cron from 'node-cron';

let bluetideTask: any | null = null;
let bluetideRunning = false;
let starlinkTask: any | null = null;
let starlinkRunning = false;
let mikrotikTask: any | null = null;
let mikrotikRunning = false;

function getEnvNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function getCurrentDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function startCrons() {
  // Cron expression for schedule (default: every 5 minutes)
  const expression = process.env.BLUETIDE_CRON || '*/5 * * * *';
  const maxPagesPerRun = getEnvNumber('BLUETIDE_MAX_PAGES_PER_RUN', 100);

  // Starlink cron expression (default: every 15 minutes)
  const starlinkExpression = process.env.STARLINK_CRON || '*/15 * * * *';

  // Mikrotik cron expression (default: every 15 minutes)
  const mikrotikExpression = process.env.MIKROTIK_CRON || '*/15 * * * *';

  // Minimal system user context for background job
  const systemUser: AuthUser = {
    id: 'system',
    email: 'system@internal',
    role: 'admin' as any, // Using any to bypass type checking for system user
    fullName: 'System Job',
    sessionInfo: {
      mfaEnabled: false,
      mfaVerified: false,
    },
  };

  // if (bluetideTask) bluetideTask.stop();

  // bluetideTask = cron.schedule(
  //   expression,
  //   async () => {
  //     if (bluetideRunning) {
  //       console.log("Bluetide sync is already running; skipping this tick.");
  //       return;
  //     }

  //     bluetideRunning = true;
  //     const startedAt = new Date();
  //     console.log(
  //       `[CRON] Starting Bluetide telemetry sync at ${startedAt.toISOString()}`
  //     );

  //     try {
  //       const result = await syncBluetideTelemetry_func({
  //         reqObject: { user: systemUser },
  //         maxPagesPerRun,
  //       });

  //       console.log("[CRON] Bluetide sync result:", result);
  //     } catch (error) {
  //       console.error("[CRON] Bluetide sync error:", error);
  //     } finally {
  //       bluetideRunning = false;
  //       console.log(
  //         `[CRON] Finished Bluetide sync at ${new Date().toISOString()}`
  //       );
  //     }
  //   },
  //   {
  //     scheduled: true,
  //     timezone: process.env.TZ || "UTC",
  //   }
  // );

  if (starlinkTask) starlinkTask.stop();

  starlinkTask = cron.schedule(
    starlinkExpression,
    async () => {
      if (starlinkRunning) {
        console.log('Starlink sync is already running; skipping this tick.');
        return;
      }

      starlinkRunning = true;
      const startedAt = new Date();
      const currentDateKey = getCurrentDateKey();
      console.log(
        `[CRON] Starting Starlink usage sync at ${startedAt.toISOString()} with datekey: ${currentDateKey}`
      );

      try {
        const result = await syncStarlinkUsage_func({
          reqObject: { user: systemUser },
          datekey: Number(currentDateKey),
        });

        console.log('[CRON] Starlink sync result:', result);
      } catch (error) {
        console.error('[CRON] Starlink sync error:', error);
      } finally {
        starlinkRunning = false;
        console.log(
          `[CRON] Finished Starlink sync at ${new Date().toISOString()}`
        );
      }
    },
    {
      scheduled: true,
      timezone: process.env.TZ || 'UTC',
    }
  );

  if (mikrotikTask) mikrotikTask.stop();

  mikrotikTask = cron.schedule(
    mikrotikExpression,
    async () => {
      if (mikrotikRunning) {
        console.log('Mikrotik sync is already running; skipping this tick.');
        return;
      }

      mikrotikRunning = true;
      const startedAt = new Date();
      console.log(
        `[CRON] Starting Mikrotik usage sync at ${startedAt.toISOString()}`
      );

      try {
        await MikrotikService.syncMikrotikUsage();
        console.log('[CRON] Mikrotik sync completed successfully');
      } catch (error) {
        console.error('[CRON] Mikrotik sync error:', error);
      } finally {
        mikrotikRunning = false;
        console.log(
          `[CRON] Finished Mikrotik sync at ${new Date().toISOString()}`
        );
      }
    },
    {
      scheduled: true,
      timezone: process.env.TZ || 'UTC',
    }
  );

  console.log(
    `⏱️  Bluetide sync cron started: '${expression}', maxPagesPerRun=${maxPagesPerRun}`
  );
  console.log(`⏱️  Starlink sync cron started: '${starlinkExpression}'`);
  console.log(`⏱️  Mikrotik sync cron started: '${mikrotikExpression}'`);
}

export function stopCrons() {
  // if (bluetideTask) {
  //   bluetideTask.stop();
  //   bluetideTask = null;
  // }
  if (starlinkTask) {
    starlinkTask.stop();
    starlinkTask = null;
  }
  if (mikrotikTask) {
    mikrotikTask.stop();
    mikrotikTask = null;
  }
}
