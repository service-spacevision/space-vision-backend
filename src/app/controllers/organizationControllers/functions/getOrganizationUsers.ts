import { users, userPublicColumns } from '../../../../app/models/User';
import { eq, sql, and } from 'drizzle-orm';
import { db } from '../../../db/connection';

export interface GetOrganizationUsersParams {
  organizationId: number;
  pagination?: {
    currentPage?: number;
    pageSize?: number;
    all?: string | boolean;
  };
  search?: string;
}

export async function getOrganizationUsers_func({
  organizationId,
  pagination = {},
  search = '',
}: GetOrganizationUsersParams) {
  try {
    const { currentPage = 1, pageSize = 10, all = 'false' } = pagination;
    const offset =
      all === 'true' || all === true ? 0 : (currentPage - 1) * pageSize;
    const limit = all === 'true' || all === true ? 1000 : pageSize;

    // Build conditions array
    const conditions = [eq(users.organizationId, organizationId)];

    // Add search condition if provided
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        sql`LOWER(${users.email}::text) LIKE LOWER(${searchTerm}::text) OR 
        LOWER(${users.fullName}::text) LIKE LOWER(${searchTerm}::text) OR 
        LOWER(${users.username}::text) LIKE LOWER(${searchTerm}::text)`
      );
    }

    // Create query with all conditions
    let query = db
      .select(userPublicColumns)
      .from(users)
      .where(and(...conditions));

    // Get total count for pagination
    const totalCount = (await query).length;

    // Apply pagination
    const usersList = await query.limit(limit).offset(offset);

    return {
      success: true,
      data: usersList,
      pagination: {
        total: totalCount,
        currentPage: all ? 1 : currentPage,
        pageSize: all ? totalCount : pageSize,
        totalPages: all ? 1 : Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error('Error fetching organization users:', error);
    return {
      success: false,
      message: 'Failed to fetch organization users',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default getOrganizationUsers_func;
