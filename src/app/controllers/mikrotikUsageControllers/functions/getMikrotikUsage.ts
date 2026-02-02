import { db } from "../../../db/connection";
import { mikrotikUsageSession } from "../../../models/MikrotikUsageSession";
import { and, eq, sql } from "drizzle-orm";

export async function getMikrotikUsage(params: {
  vesselName?: string;
  username?: string;
  currentPage?: string | number;
  pageSize?: string | number;
}) {
  const { vesselName, username, currentPage = "1", pageSize = "10" } = params;

  const page = Number(currentPage) || 1;
  const limit = Number(pageSize) || 10;
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof eq>[] = [];
  if (vesselName) {
    conditions.push(eq(mikrotikUsageSession.vesselName, vesselName));
  }
  if (username) {
    conditions.push(eq(mikrotikUsageSession.username, username));
  }

  const [data, total] = await Promise.all([
    db.query.mikrotikUsageSession.findMany({
      where: (session, { and }) => and(...conditions),
      limit,
      offset,
      orderBy: (session, { desc }) => [desc(session.lastUpdated)],
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(mikrotikUsageSession)
      .where(conditions.length ? and(...conditions) : undefined)
      .then((res) => Number(res[0]?.count || 0)),
  ]);

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
