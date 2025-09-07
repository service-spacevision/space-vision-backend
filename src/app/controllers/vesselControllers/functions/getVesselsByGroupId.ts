import { db } from '../../../db/connection'
import { vessels } from '../../../db/schema'
import { eq } from 'drizzle-orm'

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

    const vesselsList = await db
      .select()
      .from(vessels)
      .where(eq(vessels.groupId, groupId))

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
