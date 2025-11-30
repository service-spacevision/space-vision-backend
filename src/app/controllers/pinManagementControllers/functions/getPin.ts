import { db } from '../../../db/connection';
import { mikrotikPermissions } from '../../../models/MikrotikPermission';
import { users } from '../../../models/User';
import { eq, sql, and, or } from 'drizzle-orm';
import { PinType } from '../../../../types/pin.types';

interface GetPinsParams {
  page?: number;
  pageSize?: number;
  type?: PinType;
  vessel_id?: number;
  username?: string;
  vessel_name?: string;
  limit_bytes_total?: string;
  assigned_by?: number;
  profile?: string;
  server?: string;
}

export async function getPins_func(params: GetPinsParams = {}) {
  try {
    const {
      page = 1,
      pageSize = 10,
      type,
      vessel_id,
      username,
      vessel_name,
      limit_bytes_total,
      assigned_by,
      profile,
      server,
    } = params;

    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [
      or(
        eq(mikrotikPermissions.type, 'crew'),
        eq(mikrotikPermissions.type, 'system')
      ),
    ];
    if (type) {
      conditions.push(eq(mikrotikPermissions.type, type));
    }
    if (vessel_id) {
      conditions.push(eq(mikrotikPermissions.vesselId, vessel_id));
    }
    if (username) {
      conditions.push(
        sql`LOWER(${
          mikrotikPermissions.username
        }) LIKE LOWER(${`%${username}%`})`
      );
    }
    if (vessel_name) {
      conditions.push(
        sql`LOWER(${
          mikrotikPermissions.vesselName
        }) LIKE LOWER(${`%${vessel_name}%`})`
      );
    }
    if (limit_bytes_total) {
      conditions.push(
        eq(mikrotikPermissions.limitBytesTotal, limit_bytes_total)
      );
    }
    if (assigned_by) {
      conditions.push(eq(mikrotikPermissions.assignedById, assigned_by));
    }
    if (profile) {
      conditions.push(eq(mikrotikPermissions.profile, profile));
    }
    if (server) {
      conditions.push(eq(mikrotikPermissions.server, server));
    }

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(mikrotikPermissions)
      .where(conditions.length ? and(...conditions) : undefined)
      .then((res) => ({ count: Number(res[0]?.count || 0) }));

    const total = totalResult.count;

    // Base query
    let query = db
      .select({
        id: mikrotikPermissions.id,
        type: mikrotikPermissions.type,
        username: mikrotikPermissions.username,
        password: mikrotikPermissions.password,
        kitp: sql<string>`''`,
        vessel_id: mikrotikPermissions.vesselId,
        vessel_name: mikrotikPermissions.vesselName,
        generated_by: users.email,
        limit_bytes_total: mikrotikPermissions.limitBytesTotal,
        assigned_by: mikrotikPermissions.assignedById,
        profile: mikrotikPermissions.profile,
        server: mikrotikPermissions.server,
        created_at: mikrotikPermissions.createdAt,
      })
      .from(mikrotikPermissions)
      .leftJoin(users, eq(mikrotikPermissions.assignedById, users.id))
      .$dynamic();

    // Apply conditions if any
    if (conditions.length) {
      query = query.where(and(...conditions));
    }

    // Get paginated results
    const allPins = await query
      .orderBy(mikrotikPermissions.createdAt)
      .limit(pageSize)
      .offset(offset);

    return {
      success: true,
      message: 'Pins retrieved successfully',
      data: allPins,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error('Error retrieving pins:', error);
    return {
      success: false,
      message: 'Failed to retrieve pins',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
