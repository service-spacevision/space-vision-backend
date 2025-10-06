import { count, eq, or, ilike, and } from 'drizzle-orm';
import { db } from '../../../db/connection';
import { users, userPublicColumns } from '../../../models/User';
import { userRoles } from '../../../models/UserRole';
import { IPagination, ReqObjectType } from '../../../utils/types';

export const getAllUsers_func = async ({
  reqObject,
  pagination,
  searchQuery = '',
}: {
  reqObject: ReqObjectType;
  pagination?: IPagination;
  searchQuery?: string;
}) => {
  try {
    // Build where conditions for search
    const whereConditions = [];
    if (searchQuery) {
      const searchTerm = `%${searchQuery}%`;
      whereConditions.push(
        or(
          ilike(users.fullName, searchTerm),
          ilike(users.email, searchTerm),
          ilike(users.username, searchTerm)
        )
      );
    }

    // Get total count with search conditions
    const [resultCount] = await db
      .select({ count: count() })
      .from(users)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = Number(resultCount.count);

    // If all results are requested
    if (pagination?.all === 'true' || pagination?.all === '1') {
      const result = await db
        .select({
          ...userPublicColumns,
          roleName: userRoles.name,
          roleDisplayName: userRoles.displayName,
        })
        .from(users)
        .leftJoin(userRoles, eq(users.roleId, userRoles.id))
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        );

      return {
        success: result.length > 0,
        message:
          result.length > 0 ? 'Users fetched successfully' : 'No users found',
        data: formatUserResult(result),
        pagination: {
          total,
          page: 1,
          pageSize: total,
          totalPages: 1,
        },
      };
    }
    // Pagination values
    const page = Math.max(1, Number(pagination?.currentPage) || 1);
    const pageSize = Math.max(1, Number(pagination?.pageSize) || 10);
    const offset = (page - 1) * pageSize;
    const totalPages = Math.ceil(total / pageSize);

    const result = await db
      .select({
        ...userPublicColumns,
        roleName: userRoles.name,
        roleDisplayName: userRoles.displayName,
      })
      .from(users)
      .leftJoin(userRoles, eq(users.roleId, userRoles.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(users.id)
      .limit(pageSize)
      .offset(offset);

    return {
      success: result.length > 0,
      message:
        result.length > 0 ? 'Users fetched successfully' : 'No users found',
      data: formatUserResult(result),
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (error: any) {
    console.error('Error in getAllUsers_func:', error);
    return {
      success: false,
      message: error.message || 'Internal server error while fetching users',
    };
  }
};
// Helper function to format user results
const formatUserResult = (users: any[]) => {
  return users.map((user) => ({
    ...user,
    role: user.roleId
      ? {
          id: user.roleId,
          name: user.roleName,
          displayName: user.roleDisplayName,
        }
      : null,
    roleName: undefined,
    roleDisplayName: undefined,
  }));
};
