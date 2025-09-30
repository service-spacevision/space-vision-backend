import { db } from '../../../db/connection';
import { pins } from '../../../models/Pin';
import { users } from '../../../models/User';
import { vessels } from '../../../models/Vessel';
import { eq, sql, and } from 'drizzle-orm';
import { PinType } from '../../../../types/pin.types';

interface GetPinsParams {
  page?: number;
  pageSize?: number;
  type?: PinType;
  vessel_id?: number;
}

export async function getPins_func(params: GetPinsParams = {}) {
  try {
    const {
      page = 1,
      pageSize = 10,
      type,
      vessel_id,
    } = params;

    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [];
    if (type) {
      conditions.push(eq(pins.type, type));
    }
    if (vessel_id) {
      conditions.push(eq(pins.vessel_id, vessel_id));
    }

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(pins)
      .where(conditions.length ? and(...conditions) : undefined)
      .then((res) => ({ count: Number(res[0]?.count || 0) }));

    const total = totalResult.count;

    // Base query
    let query = db
      .select({
        id: pins.id,
        type: pins.type,
        username: pins.username,
        password: pins.password,
        kitp: pins.kitp,
        vessel_id: pins.vessel_id,
        vessel_name: pins.vessel_name,
        generated_by: users.email,
        created_at: pins.created_at,
      })
      .from(pins)
      .leftJoin(users, eq(pins.generated_by, users.id))
      .$dynamic();

    // Apply conditions if any
    if (conditions.length) {
      query = query.where(and(...conditions));
    }

    // Get paginated results
    const allPins = await query
      .orderBy(pins.created_at)
      .limit(pageSize)
      .offset(offset);

    // Decode the usernames and passwords
    const decodedPins = allPins.map((pin) => ({
      ...pin,
      username: Buffer.from(pin.username, 'base64').toString('utf-8'),
      password: Buffer.from(pin.password, 'base64').toString('utf-8'),
      
    }));

    return {
      success: true,
      message: 'Pins retrieved successfully',
      data: decodedPins,
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
