import { db } from '../../../db/connection'
import { NewOrganization, organizations } from '../../../models/Organization'
import { processBase64Image, validateImageFormat, validateFileSize, validateImageDimensions, SUPPORTED_IMAGE_FORMATS } from '../../../utils/fileUpload'

interface Params { data: NewOrganization }

export async function createOrganization_func({ data }: Params) {
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

      // Validate file size (5MB limit)
      if (!validateFileSize(imageInfo.data, 5 * 1024 * 1024)) {
        return {
          success: false,
          message: 'Image file is too large. Maximum allowed: 5MB'
        };
      }

      // Basic dimension validation (heuristic based)
      const dimensions = await validateImageDimensions(imageInfo.data);
      if (!dimensions || dimensions.width > 2000 || dimensions.height > 2000) {
        return {
          success: false,
          message: 'Image dimensions are too large. Maximum allowed: 2000x2000 pixels'
        };
      }
    }

    const [created] = await db.insert(organizations).values(data).returning()
    return { success: true, message: 'Organization created successfully', data: created }
  } catch (error: any) {
    if (error?.code === '23505') {
      return { success: false, message: 'Organization name already exists' }
    }
    console.error('Error creating organization:', error)
    return { success: false, message: 'Failed to create organization' }
  }
}

