import { db } from '../../../db/connection'
import { vessels } from '../../../models/Vessel'
import { inArray } from 'drizzle-orm'
import { isAdmin } from '../../../../utils/permissionUtils'

interface GetUniqueSubscriptionPlansParams {
  reqObject: {
    user: any
  }
}

export async function getUniqueSubscriptionPlans_func({ reqObject }: GetUniqueSubscriptionPlansParams) {
  try {
    // For non-admin users, only show subscription plans from permitted vessel groups
    if (!isAdmin(reqObject.user) && reqObject.user?.role?.permittedVesselGroups?.length) {
      const permittedGroupIds = reqObject.user.role.permittedVesselGroups

      // Get vessels that belong to permitted groups and have subscription plans
      const vesselsWithPlans = await db
        .select({ subscriptionPlan: vessels.subscriptionPlan })
        .from(vessels)
        .where(
          inArray(vessels.groupId, permittedGroupIds)
        )

      // Extract unique subscription plans and format as objects
      const uniquePlans = [...new Set(vesselsWithPlans.map(v => v.subscriptionPlan).filter(Boolean))]
        .filter((plan): plan is string => plan !== null)
        .map(plan => ({ name: plan, value: plan }))

      return {
        success: true,
        message: 'Unique subscription plans fetched successfully',
        data: uniquePlans.sort((a, b) => a.name.localeCompare(b.name))
      }
    } else if (!isAdmin(reqObject.user)) {
      // If user has no permitted vessel groups and is not admin, return empty result
      return {
        success: true,
        message: 'No subscription plans found for your account',
        data: []
      }
    }

    // For admin users, get all unique subscription plans
    const subscriptionPlans = await db
      .select({ subscriptionPlan: vessels.subscriptionPlan })
      .from(vessels)

    // Extract unique subscription plans and format as objects
    const uniquePlans = [...new Set(subscriptionPlans.map(v => v.subscriptionPlan).filter(Boolean))]
      .filter((plan): plan is string => plan !== null)
      .map(plan => ({ name: plan, value: plan }))

    return {
      success: true,
      message: 'Unique subscription plans fetched successfully',
      data: uniquePlans.sort((a, b) => a.name.localeCompare(b.name))
    }
  } catch (error) {
    console.error('Error in getUniqueSubscriptionPlans_func:', error)
    return {
      success: false,
      message: 'Failed to fetch unique subscription plans',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
