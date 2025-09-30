import { count, eq } from 'drizzle-orm';
import { db } from '../../../db/connection';
import { users, userPublicColumns } from '../../../models/User';
import { userRoles } from '../../../models/UserRole';
import { IPagination, ReqObjectType } from '../../../utils/types';

export const getAllUsers_func = async ({
  reqObject,
  pagination,
}: {
  reqObject: ReqObjectType;
  pagination?: IPagination;
}) => {
  try {
    if (pagination?.all === 'true' || pagination?.all === '1') {
      const result = await db
        .select({
          ...userPublicColumns,
          roleName: userRoles.name,
          roleDisplayName: userRoles.displayName,
        })
        .from(users)
        .leftJoin(userRoles, eq(users.roleId, userRoles.id));

      return {
        success: result.length > 0,
        message:
          result.length > 0 ? 'Users fetched successfully' : 'No users found',
        data: result.map((user) => ({
          ...user,
          role: user.roleId
            ? {
                id: user.roleId,
                name: user.roleName,
                displayName: user.roleDisplayName,
              }
            : null,
          // Remove the temporary fields we added for the role
          roleName: undefined,
          roleDisplayName: undefined,
        })),
        pagination: {
          total: result.length,
          page: 1,
          pageSize: result.length,
        },
      };
    }
    // Default pagination values
    const page = pagination?.currentPage || 1;
    const pageSize = pagination?.pageSize || 10;
    const offset = (page - 1) * pageSize;
    const [resultCount] = await db.select({ count: count() }).from(users);
    const total = resultCount.count;

    const result = await db
      .select({
        ...userPublicColumns,
        roleName: userRoles.name,
        roleDisplayName: userRoles.displayName,
      })
      .from(users)
      .leftJoin(userRoles, eq(users.roleId, userRoles.id))
      .limit(pageSize)
      .offset(offset);

    return {
      success: result.length > 0,
      message:
        result.length > 0 ? 'Users fetched successfully' : 'No users found',
      data: result.map((user) => ({
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
      })),
      pagination: {
        total,
        page,
        pageSize,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Internal server error while fetching users',
    };
  }
};
