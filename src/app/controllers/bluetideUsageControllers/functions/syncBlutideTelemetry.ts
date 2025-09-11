import { db } from "../../../../app/db/connection";
import { bluetideTelemetry } from "../../../../app/models/BluetideTelemetry";
import { eq, and } from "drizzle-orm";
import axios from "axios";
import { AuthUser } from "../../../../app/utils/types";
import { getSyncCursor, upsertSyncCursor } from "../../../../app/utils/syncState";

interface BluetideTelemetryResponse {
  data: Array<{
    accountNumber: string;
    deviceId: string;
    timestamp: string;
    downlinkThroughputMbps: number;
    uplinkThroughputMbps: number;
    pingDropRateAvg: number;
    pingLatencyMsAvg: number;
    obstructionPercentTime: number;
    uptimeSeconds: number;
    signalQualityPercent: number;
    h3CellId: string;
    latitude: number;
    longitude: number;
    secondsUntilSwupdateRebootPossible: number;
    runningSoftwareVersion: string;
    activeAlertCount: number;
  }>;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

interface SyncBluetideTelemetryParams {
  reqObject: {
    user: AuthUser;
  };
  deviceId?: string;
  maxPagesPerRun?: number;
}

const API_BASE_URL = process.env.BLUETIDE_API_URL;
const PAGE_SIZE = 100; // Maximum allowed by the API
const DELAY_BETWEEN_REQUESTS = 600; // ms to avoid rate limiting
console.log("API_BASE_URL", API_BASE_URL);

async function fetchPage(pageIndex: number, deviceId?: string) {
  const url = new URL(API_BASE_URL || "");
  url.searchParams.append("pageIndex", pageIndex.toString());
  url.searchParams.append("pageSize", PAGE_SIZE.toString());

  if (deviceId) {
    url.searchParams.append("deviceId", deviceId);
  }

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-api-key": process.env.BLUETIDE_API_KEY?.replace(/^"|"$/g, ""),
  } as const;

  const maxRetries = 3;
  const baseDelay = 800; // ms

  let attempt = 0;
  while (true) {
    try {
      console.log(`Fetching page ${pageIndex} (attempt ${attempt + 1}) from:`, url.toString());
      const response = await axios.get<BluetideTelemetryResponse>(url.toString(), {
        timeout: 30000,
        headers,
        validateStatus: (status) => status < 500 || status === 502 || status === 503 || status === 504,
      });

      if (response.status === 200) {
        return response.data;
      }

      if ([429, 502, 503, 504].includes(response.status)) {
        attempt++;
        if (attempt > maxRetries) {
          throw new Error(`API request failed after retries with status ${response.status}`);
        }
        const backoff = baseDelay * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 200);
        console.warn(`Transient API status ${response.status}. Retrying in ${backoff}ms...`);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      console.error("API Error:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        attempt++;
        if (attempt > maxRetries) {
          console.error("Axios Error (final):", { message: error.message, code: error.code });
          throw error;
        }
        const backoff = baseDelay * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 200);
        console.warn(`Axios error ${error.code || error.message}. Retrying in ${backoff}ms...`);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      } else {
        console.error("Unexpected error in fetchPage:", error);
        throw error;
      }
    }
  }
}

async function processRecords(records: any[]) {
  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let maxTimestamp: Date | null = null;

  for (const record of records) {
    try {
      const newData = {
        account_number: record.accountNumber,
        device_id: record.deviceId,
        timestamp: new Date(record.timestamp),
        downlink_throughput_mbps: record.downlinkThroughputMbps,
        uplink_throughput_mbps: record.uplinkThroughputMbps,
        ping_drop_rate_avg: record.pingDropRateAvg,
        ping_latency_ms_avg: record.pingLatencyMsAvg,
        obstruction_percent_time: record.obstructionPercentTime,
        uptime_seconds: record.uptimeSeconds,
        signal_quality_percent: record.signalQualityPercent,
        h3_cell_id: record.h3CellId,
        latitude: record.latitude,
        longitude: record.longitude,
        seconds_until_swupdate_reboot_possible:
          record.secondsUntilSwupdateRebootPossible,
        running_software_version: record.runningSoftwareVersion,
        active_alert_count: record.activeAlertCount,
        updated_at: new Date(),
      };

      // Use upsert to handle both insert and update in one operation
      await db
        .insert(bluetideTelemetry)
        .values({
          ...newData,
          created_at: new Date(),
        })
        .onConflictDoUpdate({
          target: [bluetideTelemetry.device_id, bluetideTelemetry.timestamp],
          set: newData,
        });

      // Track max timestamp seen
      if (!maxTimestamp || newData.timestamp > maxTimestamp) {
        maxTimestamp = newData.timestamp as Date;
      }

      // We cannot reliably distinguish insert vs update here without RETURNING
      // Keep conservative count in insertedCount
      insertedCount++;
    } catch (error) {
      console.error("Error processing record:", error);
      skippedCount++;
    }
  }

  return { insertedCount, updatedCount, skippedCount, maxTimestamp };
}

export async function syncBluetideTelemetry_func({
  reqObject,
  deviceId,
  maxPagesPerRun = 100,
}: SyncBluetideTelemetryParams) {
  const { user } = reqObject;
  console.log("Starting Bluetide telemetry sync");
  console.log("Environment:", {
    API_BASE_URL: API_BASE_URL ? "Set" : "Not set",
    HAS_API_KEY: process.env.BLUETIDE_API_KEY ? "Yes" : "No",
    deviceId: deviceId || "Not specified (full sync)",
  });

  console.log("Requested by:", user.email);

  try {
    // Load last sync cursor (timestamp) for this source/partition
    const source = "bluetide_telemetry";
    const partitionKey = deviceId || "all";
    const cursor = await getSyncCursor({ source, partitionKey });
    const lastCursorTimestamp = cursor?.cursor_value
      ? new Date(cursor.cursor_value)
      : null;
    console.log("Sync cursor:", {
      source,
      partitionKey,
      lastCursor: lastCursorTimestamp?.toISOString() || null,
    });

    // Guard: ensure API configuration is present
    if (!API_BASE_URL || !process.env.BLUETIDE_API_KEY) {
      return {
        success: false,
        message: "Bluetide API config missing (BLUETIDE_API_URL or BLUETIDE_API_KEY)",
      };
    }

    console.log("Fetching first page...");
    const firstPage = await fetchPage(0, deviceId);

    if (!firstPage || !firstPage.totalCount) {
      console.log("No data found or invalid response format:", firstPage);
      return {
        success: true,
        message: "No data found to sync",
        totalInserted: 0,
        totalUpdated: 0,
        totalSkipped: 0,
        totalPages: 0,
      };
    }

    const totalPages = Math.ceil(firstPage.totalCount / PAGE_SIZE);
    console.log(
      `Found ${firstPage.totalCount} total records (${totalPages} pages)`
    );

    // Process first page
    console.log("Processing first page...");
    const firstPageData = firstPage.data || [];
    const firstPageResult = await processRecords(firstPageData);
    let totalInserted = firstPageResult.insertedCount;
    let totalSkipped = firstPageResult.skippedCount;
    let maxTimestampSeen: Date | null = firstPageResult.maxTimestamp || null;
    let pagesProcessed = 1;

    // If we have a cursor and the entire first page is older/equal than cursor, we can early exit
    if (
      lastCursorTimestamp &&
      firstPageData.length > 0 &&
      firstPageData.every((r) => new Date(r.timestamp) <= lastCursorTimestamp)
    ) {
      console.log(
        "All records on first page are older or equal to last cursor. Early exit."
      );
      return {
        success: true,
        message: `No new data to sync since ${lastCursorTimestamp.toISOString()}`,
        data: {
          totalRecords: firstPage.totalCount,
          pagesProcessed: 1,
          inserted: totalInserted,
          skipped: totalSkipped,
          lastCursor: lastCursorTimestamp.toISOString(),
        },
      };
    }

    // Process remaining pages
    const maxPages = typeof maxPagesPerRun === 'number' && maxPagesPerRun > 0 ? maxPagesPerRun : Number.POSITIVE_INFINITY;
    for (let pageIndex = 1; pageIndex < totalPages; pageIndex++) {
      try {
        // Add delay between requests to avoid rate limiting
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_REQUESTS)
        );

        console.log(`Processing page ${pageIndex + 1} of ${totalPages}...`);
        const pageData = await fetchPage(pageIndex, deviceId);
        const records = pageData.data || [];

        // If we have a cursor and this page is entirely older/equal, we can stop
        if (
          lastCursorTimestamp &&
          records.length > 0 &&
          records.every((r) => new Date(r.timestamp) <= lastCursorTimestamp)
        ) {
          console.log(
            `Page ${pageIndex + 1} contains only records <= last cursor. Stopping pagination early.`
          );
          break;
        }

        const pageResult = await processRecords(records);

        totalInserted += pageResult.insertedCount;
        totalSkipped += pageResult.skippedCount;
        pagesProcessed++;

        if (pageResult.maxTimestamp) {
          if (!maxTimestampSeen || pageResult.maxTimestamp > maxTimestampSeen) {
            maxTimestampSeen = pageResult.maxTimestamp;
          }
        }
        // Respect max pages per run (includes first page already processed)
        if (pagesProcessed >= maxPages) {
          console.log(`Reached maxPagesPerRun=${maxPages}. Stopping this run.`);
          break;
        }
      } catch (error: any) {
        console.error(`Error processing page ${pageIndex + 1}:`, error.message);
        // Continue with next page even if one fails
      }
    }

    // Update sync cursor if we saw newer data
    if (maxTimestampSeen) {
      await upsertSyncCursor({
        source,
        partitionKey,
        cursorType: "timestamp",
        cursorValue: maxTimestampSeen.toISOString(),
        lastSyncedAt: new Date(),
      });
    }

    return {
      success: true,
      message: `Successfully synced ${totalInserted} records (${totalSkipped} skipped)`,
      data: {
        totalRecords: firstPage.totalCount,
        pagesProcessed,
        inserted: totalInserted,
        skipped: totalSkipped,
        newCursor: maxTimestampSeen?.toISOString() || null,
      },
    };
  } catch (error) {
    console.error("Error in syncBluetideTelemetry:", error);

    let errorMessage = "Failed to sync Bluetide telemetry data";
    if (axios.isAxiosError(error)) {
      errorMessage = `API Error: ${error.response?.status} - ${error.response?.statusText}`;
      console.error("API Error Details:", error.response?.data);
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
