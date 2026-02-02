import { db } from '../../../db/connection'
import { organizations } from '../../../models/Organization'
import { eq } from 'drizzle-orm'
import { hasSystemRole } from '../../../utils/roleHelpers'

interface Params { 
  organizationId: string | number; 
  data: Partial<{ 
    description: string; 
    logo: string; 
    subscription_id: string; 
    parent_org_name: string;
    permittedVesselGroups: number[];
  }>;
  userId?: string | number;
}

export async function updateOrganizationByAdmin_func({ organizationId, data, userId }: Params) {
  try {
    // Check if user has system role (admin access)
    if (!userId) {
      return { success: false, message: 'User authentication required for admin operations' }
    }

    const isSystemUser = await hasSystemRole(userId)
    if (!isSystemUser) {
      return { 
        success: false, 
        message: 'Only users with system roles can perform admin operations' 
      }
    }

    // Validate organizationId
    const orgId = Number(organizationId)
    if (isNaN(orgId) || !Number.isInteger(orgId) || orgId <= 0) {
      return {
        success: false,
        message: 'Invalid organization ID. Must be a positive integer.'
      }
    }

    // Admin users can update all fields including permittedVesselGroups
    const updateData: any = {
      description: data.description,
      logo: data.logo,
      subscription_id: data.subscription_id,
      parent_org_name: data.parent_org_name,
      permittedVesselGroups: data.permittedVesselGroups,
      updatedAt: new Date()
    }

    const [updated] = await db.update(organizations)
      .set(updateData)
      .where(eq(organizations.id, orgId))
      .returning()

    if (!updated) return { success: false, message: 'Organization not found' }
    return { success: true, message: 'Organization updated successfully by admin', data: updated }
  } catch (error) {
    console.error('Error updating organization by admin:', error)
    return { success: false, message: 'Failed to update organization' }
  }
}