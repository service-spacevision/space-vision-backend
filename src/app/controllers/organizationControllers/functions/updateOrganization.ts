import { db } from '../../../db/connection'
import { organizations } from '../../../models/Organization'
import { eq } from 'drizzle-orm'
import { hasSystemRole } from '../../../utils/roleHelpers'
import { processBase64Image, validateImageFormat, SUPPORTED_IMAGE_FORMATS } from '../../../utils/fileUpload'

interface Params { 
  name: string;
  data: Partial<{ 
    description: string; 
    logo: string; // Now accepts base64 data URLs
    subscription_id: string; 
    parent_org_name: string;
    permittedVesselGroups: number[];
  }>;
  userId?: string | number;
}

export async function updateOrganization_func({ name, data, userId }: Params) {
  try {
    // Validate logo data if provided
    if (data.logo) {
      // Check if it's a valid base64 image
      const imageInfo = processBase64Image(data.logo);
      if (!imageInfo) {
        return {
          success: false,
          message: 'Invalid logo format. Logo must be a valid base64 encoded image (data:image/jpeg;base64,...)'
        };
      }

      // Validate image format
      if (!validateImageFormat(imageInfo.mimeType)) {
        return {
          success: false,
          message: `Unsupported image format. Supported formats: ${SUPPORTED_IMAGE_FORMATS.join(', ')}` 
        };
      }
    }

    // Check if user is trying to update permittedVesselGroups
    if (data.permittedVesselGroups !== undefined) {
      if (!userId) {
        return { success: false, message: 'User authentication required to update vessel groups' }
      }

      const isSystemUser = await hasSystemRole(userId)
      if (!isSystemUser) {
        return { 
          success: false, 
          message: 'Only users with system roles can modify permitted vessel groups' 
        }
      }
    }

    // Prepare update data, excluding permittedVesselGroups if user doesn't have system role
    const updateData: any = {
      description: data.description,
      logo: data.logo, // Store the full base64 data URL
      subscription_id: data.subscription_id,
      parent_org_name: data.parent_org_name,
      updatedAt: new Date()
    }

    // Only include permittedVesselGroups if user has system role
    if (data.permittedVesselGroups !== undefined && userId) {
      const isSystemUser = await hasSystemRole(userId)
      if (isSystemUser) {
        updateData.permittedVesselGroups = data.permittedVesselGroups
      }
    }

    const [updated] = await db.update(organizations)
      .set(updateData)
      .where(eq(organizations.name, name))
      .returning()

    if (!updated) return { success: false, message: 'Organization not found' }
    return { success: true, message: 'Organization updated successfully', data: updated }
  } catch (error) {
    console.error('Error updating organization:', error)
    return { success: false, message: 'Failed to update organization' }
  }
}

