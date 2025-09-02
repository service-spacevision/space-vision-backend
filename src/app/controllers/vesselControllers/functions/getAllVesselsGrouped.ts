import { db } from '../../../db/connection'
import { vesselGroups, vessels } from '../../../db/schema'
import { eq } from 'drizzle-orm'

interface GetAllVesselsGroupedParams {
  reqObject: {
    user: any
  }
  query?: any
}

export async function getAllVesselsGrouped_func({ reqObject, query }: GetAllVesselsGroupedParams) {
  try {
    // First, get all vessel groups
    const allVesselGroups = await db
      .select()
      .from(vesselGroups)
      .orderBy(vesselGroups.groupName)

    // Then, for each group, get its vessels
    const vesselsGroupedData = await Promise.all(
      allVesselGroups.map(async (group) => {
        const groupVessels = await db
          .select()
          .from(vessels)
          .where(eq(vessels.groupId, group.id))
          .orderBy(vessels.name)

        return {
          id: group.id,
          groupName: group.groupName,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
          vessels: groupVessels
        }
      })
    )

    return {
      success: true,
      message: 'Vessels grouped by groups fetched successfully',
      data: vesselsGroupedData
    }
  } catch (error) {
    console.error('Error in getAllVesselsGrouped_func:', error)
    return {
      success: false,
      message: 'Failed to fetch vessels grouped by groups',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}