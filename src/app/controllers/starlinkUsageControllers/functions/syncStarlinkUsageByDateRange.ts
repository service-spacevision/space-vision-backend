import { syncStarlinkUsage_func } from './syncStarlinkUsage';
import { AuthUser } from '../../../utils/types';

interface SyncStarlinkUsageByDateRangeParams {
  reqObject: {
    user: AuthUser;
  };
  startDate: string;
  endDate: string;
}

export async function syncStarlinkUsageByDateRange_func({
  reqObject,
  startDate,
  endDate,
}: SyncStarlinkUsageByDateRangeParams) {
  try {
    const { user } = reqObject;
    console.log('requestedBy', user);

    // Validate date format (YYYYMMDD)
    const dateRegex = /^\d{8}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return {
        success: false,
        message:
          'Invalid date format. Please use YYYYMMDD format (e.g., 20251013)',
      };
    }

    // Convert to numbers for comparison
    const start = parseInt(startDate);
    const end = parseInt(endDate);

    if (start > end) {
      return {
        success: false,
        message: 'Start date must be before or equal to end date',
      };
    }

    // Generate all dates in range (inclusive)
    const dates: number[] = [];
    for (let date = start; date <= end; date++) {
      dates.push(date);
    }

    console.log(
      `[RANGE SYNC] Starting background sync for ${dates.length} dates from ${startDate} to ${endDate}`
    );

    // Start background processing and return immediately
    processDatesInBackground(dates, user).catch((error) => {
      console.error('[RANGE SYNC] Background process failed:', error);
    });

    return {
      success: true,
      message: `Starlink usage sync started for ${dates.length} dates (${startDate} to ${endDate}). Process running in background with rate limiting.`,
      data: {
        totalDates: dates.length,
        dateRange: { start: startDate, end: endDate },
        status: 'background_processing',
        rateLimit: '2 second delay between requests',
        estimatedCompletion: 'Check logs for completion status',
      },
    };
  } catch (error: any) {
    console.error('Error in syncStarlinkUsageByDateRange_func:', error);

    return {
      success: false,
      message: 'Failed to start Starlink usage sync for date range',
      error: error.message,
    };
  }
}

// Background processing function with rate limiting
async function processDatesInBackground(dates: number[], user: AuthUser) {
  const RATE_LIMIT_DELAY = 5000; // 2 seconds between requests

  for (let i = 0; i < dates.length; i++) {
    const dateKey = dates[i];

    try {
      console.log(
        `[RANGE SYNC] Processing date ${dateKey} (${i + 1}/${dates.length})`
      );

      const result = await syncStarlinkUsage_func({
        reqObject: { user },
        datekey: dateKey,
      });

      console.log(
        `[RANGE SYNC] Date ${dateKey} completed:`,
        result.success ? 'SUCCESS' : 'FAILED'
      );

      // Add rate limiting delay (except for the last request)
      if (i < dates.length - 1) {
        console.log(
          `[RANGE SYNC] Waiting ${RATE_LIMIT_DELAY}ms before next request...`
        );
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    } catch (error: any) {
      console.error(`[RANGE SYNC] Date ${dateKey} failed:`, error);

      // Add rate limiting delay even after errors (except for the last request)
      if (i < dates.length - 1) {
        console.log(
          `[RANGE SYNC] Waiting ${RATE_LIMIT_DELAY}ms before next request after error...`
        );
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    }
  }

  console.log(
    `[RANGE SYNC] Background processing completed for ${dates.length} dates`
  );
}
