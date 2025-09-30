import { db } from '../../../db/connection';
import { and, desc, eq, sql } from 'drizzle-orm';
import { mikrotikUsageSession } from '../../../models/MikrotikUsageSession';
import { mikrotikUsageAlltime } from '../../../models/MikrotikUsageAlltime';

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

export async function getMikrotikUsageByVesselId(params: {
  vesselId: number;
  mode: 'current-session' | 'all-time';
  username?: string;
  currentPage?: string | number;
  pageSize?: string | number;
}): Promise<PaginatedResult<any>> {
  const {
    vesselId,
    mode,
    username,
    currentPage = '1',
    pageSize = '10',
  } = params;

  const page = Number(currentPage) || 1;
  const limit = Number(pageSize) || 10;
  const offset = (page - 1) * limit;

  // Determine which table to query based on mode
  const isSession = mode === 'current-session';

  // Build conditions
  const conditions = [];

  if (isSession) {
    conditions.push(eq(mikrotikUsageSession.vesselId, vesselId));
    if (username && username !== 'None') {
      conditions.push(eq(mikrotikUsageSession.username, username));
    }
  } else {
    conditions.push(eq(mikrotikUsageAlltime.vesselId, vesselId));
    if (username && username !== 'None') {
      conditions.push(eq(mikrotikUsageAlltime.username, username));
    }
  }

  // Create where clause
  const whereClause =
    conditions.length > 1 ? and(...conditions) : conditions[0] || undefined;

  // Get total count
  let total = 0;
  let data: any[] = [];

  if (isSession) {
    // Get count for session data
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(mikrotikUsageSession)
      .where(whereClause);

    total = Number(countResult[0]?.count || 0);

    // Get paginated session data
    if (total > 0) {
      data = await db
        .select()
        .from(mikrotikUsageSession)
        .where(whereClause)
        .orderBy(desc(mikrotikUsageSession.lastUpdated))
        .limit(limit)
        .offset(offset);
    }
  } else {
    // Get count for all-time data
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(mikrotikUsageAlltime)
      .where(whereClause);

    total = Number(countResult[0]?.count || 0);

    // Get paginated all-time data
    if (total > 0) {
      data = await db
        .select()
        .from(mikrotikUsageAlltime)
        .where(whereClause)
        .orderBy(desc(mikrotikUsageAlltime.lastUpdated))
        .limit(limit)
        .offset(offset);
    }
  }

  return {
    data,
    pagination: {
      total,
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
