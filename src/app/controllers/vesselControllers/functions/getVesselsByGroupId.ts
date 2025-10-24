import { db } from '../../../db/connection'
import { vessels } from '../../../db/schema'
import { eq, and, SQL } from 'drizzle-orm'
import { hasSystemRole } from '../../../utils/roleHelpers'

export const getVesselsByGroupId_func = async ({
  groupId,
  user
}: {
  groupId: number
  user: any
}) => {
  try {
    if (!groupId) {
      return {
        success: false,
        message: 'Group ID is required'
      }
    }

    // For non-system users, only show active vessels
    let whereCondition: SQL | undefined = eq(vessels.groupId, groupId)
    if (user) {
      const isSystemUser = await hasSystemRole(user.id)
      if (!isSystemUser) {
        whereCondition = and(
          eq(vessels.groupId, groupId),
          eq(vessels.isActive, true)
        )
      }
    }

    const vesselsList = await db
      .select()
      .from(vessels)
      .where(whereCondition)

    return {
      success: true,
      data: vesselsList
    }
  } catch (error) {
    console.error('Error fetching vessels by group ID:', error)
    return {
      success: false,
      message: 'Failed to fetch vessels by group ID'
    }
  }
}
