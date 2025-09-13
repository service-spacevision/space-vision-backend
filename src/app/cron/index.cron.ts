import { syncBluetideTelemetry_func } from "../controllers/bluetideUsageControllers/functions/syncBlutideTelemetry";
import { AuthUser } from "../utils/types";
import cron from "node-cron";

let bluetideTask: any | null = null;
let bluetideRunning = false;

function getEnvNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function startCrons() {
  // Cron expression for schedule (default: every 5 minutes)
  const expression = process.env.BLUETIDE_CRON || "*/5 * * * *";
  const maxPagesPerRun = getEnvNumber("BLUETIDE_MAX_PAGES_PER_RUN", 100);

  // Minimal system user context for background job
  const systemUser: AuthUser = {
    id: "system",
    email: "system@internal",
    role: "admin",
    fullName: "System Job",
  };

  if (bluetideTask) bluetideTask.stop();

  bluetideTask = cron.schedule(
    expression,
    async () => {
      if (bluetideRunning) {
        console.log("Bluetide sync is already running; skipping this tick.");
        return;
      }

      bluetideRunning = true;
      const startedAt = new Date();
      console.log(
        `[CRON] Starting Bluetide telemetry sync at ${startedAt.toISOString()}`
      );

      try {
        const result = await syncBluetideTelemetry_func({
          reqObject: { user: systemUser },
          maxPagesPerRun,
        });

        console.log("[CRON] Bluetide sync result:", result);
      } catch (error) {
        console.error("[CRON] Bluetide sync error:", error);
      } finally {
        bluetideRunning = false;
        console.log(
          `[CRON] Finished Bluetide sync at ${new Date().toISOString()}`
        );
      }
    },
    {
      scheduled: true,
      timezone: process.env.TZ || "UTC",
    }
  );

  console.log(
    `⏱️  Bluetide sync cron started: '${expression}', maxPagesPerRun=${maxPagesPerRun}`
  );
}

export function stopCrons() {
  if (bluetideTask) {
    bluetideTask.stop();
    bluetideTask = null;
  }
}
