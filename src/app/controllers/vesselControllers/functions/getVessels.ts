import { db } from '../../../db/connection'
import { vessels, vesselGroups } from '../../../db/schema'
import { eq, ilike, and } from 'drizzle-orm'

interface GetVesselsParams {
  reqObject: {
    user: any
  }
  query?: {
    name?: string
    groupId?: string
    subscriptionPlan?: string
  }
  pagination: {
    currentPage: number
    pageSize: number
    all: string
  }
}

export async function getVessels_func({ reqObject, query, pagination }: GetVesselsParams) {
  try {
    let whereConditions: any[] = []

    // Add filters based on query parameters
    if (query?.name) {
      whereConditions.push(ilike(vessels.name, `%${query.name}%`))
    }

    if (query?.groupId) {
      whereConditions.push(eq(vessels.groupId, parseInt(query.groupId)))
    }

    if (query?.subscriptionPlan) {
      whereConditions.push(ilike(vessels.subscriptionPlan, `%${query.subscriptionPlan}%`))
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

    if (pagination.all === "true") {
      // Get all vessels with their group information
      const allVessels = await db
        .select({
          id: vessels.id,
          vesselsKitNumber: vessels.vesselsKitNumber,
          name: vessels.name,
          subscriptionPlan: vessels.subscriptionPlan,
          groupId: vessels.groupId,
          deviceId: vessels.deviceId,
          createdAt: vessels.createdAt,
          updatedAt: vessels.updatedAt,
          groupName: vesselGroups.groupName
        })
        .from(vessels)
        .leftJoin(vesselGroups, eq(vessels.groupId, vesselGroups.id))
        .where(whereClause)
        .orderBy(vessels.name)

      return {
        success: true,
        message: 'All vessels fetched successfully',
        data: allVessels,
        pagination: {
          currentPage: 1,
          pageSize: allVessels.length,
          totalItems: allVessels.length,
          totalPages: 1
        }
      }
    } else {
      // Get paginated vessels
      const offset = (pagination.currentPage - 1) * pagination.pageSize

      const [paginatedVessels, totalCount] = await Promise.all([
        db
          .select({
            id: vessels.id,
            vesselsKitNumber: vessels.vesselsKitNumber,
            name: vessels.name,
            subscriptionPlan: vessels.subscriptionPlan,
            groupId: vessels.groupId,
            deviceId: vessels.deviceId,
            createdAt: vessels.createdAt,
            updatedAt: vessels.updatedAt,
            groupName: vesselGroups.groupName
          })
          .from(vessels)
          .leftJoin(vesselGroups, eq(vessels.groupId, vesselGroups.id))
          .where(whereClause)
          .limit(pagination.pageSize)
          .offset(offset)
          .orderBy(vessels.name),
        
        db
          .select({ count: vessels.id })
          .from(vessels)
          .where(whereClause)
      ])

      const totalPages = Math.ceil(totalCount.length / pagination.pageSize)

      return {
        success: true,
        message: 'Vessels fetched successfully',
        data: paginatedVessels,
        pagination: {
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          totalItems: totalCount.length,
          totalPages
        }
      }
    }
  } catch (error) {
    console.error('Error in getVessels_func:', error)
    return {
      success: false,
      message: 'Failed to fetch vessels',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}