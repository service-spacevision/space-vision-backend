import { count, eq } from "drizzle-orm"
import { db } from "../../../db/connection"
import { users } from "../../../models/User"
import { IPagination, ReqObjectType } from "../../../utils/types"

export const getAllUsersUnderOrg_func = async ({
  reqObject,
  pagination
}: {
  reqObject: ReqObjectType,
  pagination?: IPagination
}) => {
  try {
    if (pagination?.all === 'true' || pagination?.all === '1') {
      const result = await db.select().from(users).where(eq(users.organizationId, Number(reqObject.user.organizationId)))
      return {
        success: result?.length > 0,
        message: result?.length > 0 ? 'Users fetched successfully' : 'No users found',
        data: result,
        pagination: {
          total: result.length,
          page: 1,
          pageSize: result.length
        }
      }
    }
    // Default pagination values
    const page = pagination?.currentPage || 1
    const pageSize = pagination?.pageSize || 10
    const offset = (page - 1) * pageSize
    const [resultCount] = await db.select({ count: count() }).from(users).where(eq(users.organizationId, Number(reqObject?.user?.organizationId)))
    const total = resultCount.count
    const [result] = await db
      .select()
      .from(users)
      .limit(pageSize)
      .offset(offset)
      .where(eq(users.organizationId, Number(reqObject.user.organizationId)))

    return {
      success: true,
      message: 'Users fetched successfully',
      data: result,
      pagination: {
        total,
        page,
        pageSize
      }
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message
    }
  }
}