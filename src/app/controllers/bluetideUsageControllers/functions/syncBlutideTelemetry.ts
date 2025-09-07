import { db } from "../../../../app/db/connection";
import { bluetideTelemetry } from "../../../../app/models/BluetideTelemetry";
import { eq, and } from "drizzle-orm";
import axios from "axios";
import { AuthUser } from "../../../../app/utils/types";

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
}

const API_BASE_URL = process.env.BLUETIDE_API_URL;
const PAGE_SIZE = 100; // Maximum allowed by the API
const DELAY_BETWEEN_REQUESTS = 600; // ms to avoid rate limiting
console.log("API_BASE_URL", API_BASE_URL);

async function fetchPage(pageIndex: number, deviceId?: string) {
  try {
    const url = new URL(API_BASE_URL || "");
    url.searchParams.append("pageIndex", pageIndex.toString());
    url.searchParams.append("pageSize", PAGE_SIZE.toString());

    if (deviceId) {
      url.searchParams.append("deviceId", deviceId);
    }

    console.log(`Fetching page ${pageIndex} from:`, url.toString());

    const response = await axios.get<BluetideTelemetryResponse>(
      url.toString(),
      {
        timeout: 30000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-api-key": process.env.BLUETIDE_API_KEY?.replace(/^"|"$/g, ""),
        },
        validateStatus: (status) => status < 500, // Don't throw for 4xx errors
      }
    );

    console.log(`Response status for page ${pageIndex}:`, response.status);
    console.log(`Response data for page ${pageIndex}:`, response.data);

    if (response.status !== 200) {
      console.error("API Error:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });
      throw new Error(
        `API request failed with status ${response.status}: ${response.statusText}`
      );
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          params: error.config?.params,
        },
      });
    } else {
      console.error("Unexpected error in fetchPage:", error);
    }
    throw error;
  }
}

async function processRecords(records: any[]) {
  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

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

      insertedCount++;
    } catch (error) {
      console.error("Error processing record:", error);
      skippedCount++;
    }
  }

  return { insertedCount, updatedCount, skippedCount };
}

export async function syncBluetideTelemetry_func({
  reqObject,
  deviceId,
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
    const firstPageResult = await processRecords(firstPage.data || []);
    let totalInserted = firstPageResult.insertedCount;
    let totalSkipped = firstPageResult.skippedCount;

    // Process remaining pages
    for (let pageIndex = 1; pageIndex < totalPages; pageIndex++) {
      try {
        // Add delay between requests to avoid rate limiting
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_REQUESTS)
        );

        console.log(`Processing page ${pageIndex + 1} of ${totalPages}...`);
        const pageData = await fetchPage(pageIndex, deviceId);
        const pageResult = await processRecords(pageData.data);

        totalInserted += pageResult.insertedCount;
        totalSkipped += pageResult.skippedCount;
      } catch (error) {
        console.error(`Error processing page ${pageIndex + 1}:`, error);
        // Continue with next page even if one fails
      }
    }

    return {
      success: true,
      message: `Successfully synced ${totalInserted} records (${totalSkipped} skipped)`,
      data: {
        totalRecords: firstPage.totalCount,
        pagesProcessed: totalPages,
        inserted: totalInserted,
        skipped: totalSkipped,
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
