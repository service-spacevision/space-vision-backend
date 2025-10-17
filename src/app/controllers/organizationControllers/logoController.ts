import { CustomContext } from '../../utils/types';
import {
  processBase64Image,
  validateImageDimensions,
  validateFileSize,
  validateImageFormat,
  SUPPORTED_IMAGE_FORMATS,
  generateLogoId,
  createDataUrl
} from '../../utils/fileUpload';

interface Base64UploadResult {
  success: boolean;
  message: string;
  data?: {
    logoUrl: string;
    logoData: string;
    mimeType?: string;
  };
}

interface LogoUploadBody {
  logo: string; // base64 encoded image data
  organizationName?: string; // optional, for direct organization update
}

/**
 * Validates base64 image data
 */
function isValidBase64Image(base64String: string): boolean {
  // Use the utility function for validation
  return processBase64Image(base64String) !== null;
}

/**
 * Extracts MIME type from base64 data URL
 */
function getMimeTypeFromBase64(base64String: string): string | null {
  const imageInfo = processBase64Image(base64String);
  return imageInfo?.mimeType || null;
}

export class LogoController {
  static async uploadLogo(ctx: CustomContext): Promise<Base64UploadResult> {
    try {
      const body = ctx.body as LogoUploadBody;

      if (!body.logo) {
        ctx.set.status = 400;
        return {
          success: false,
          message: 'Logo data is required'
        };
      }

      // Validate base64 format
      if (!isValidBase64Image(body.logo)) {
        ctx.set.status = 400;
        return {
          success: false,
          message: 'Invalid base64 image format. Expected format: data:image/jpeg;base64,actualBase64Data'
        };
      }

      const imageInfo = processBase64Image(body.logo);
      if (!imageInfo) {
        ctx.set.status = 400;
        return {
          success: false,
          message: 'Failed to process image data'
        };
      }

      // Validate file size (5MB limit)
      if (!validateFileSize(imageInfo.data, 5 * 1024 * 1024)) {
        ctx.set.status = 400;
        return {
          success: false,
          message: 'Image file is too large. Maximum allowed: 5MB'
        };
      }

      // Validate image format
      if (!validateImageFormat(imageInfo.mimeType)) {
        ctx.set.status = 400;
        return {
          success: false,
          message: `Unsupported image format. Supported formats: ${SUPPORTED_IMAGE_FORMATS.join(', ')}`
        };
      }

      // Basic dimension validation (heuristic based)
      const dimensions = await validateImageDimensions(imageInfo.data);
      if (!dimensions || dimensions.width > 2000 || dimensions.height > 2000) {
        ctx.set.status = 400;
        return {
          success: false,
          message: 'Image dimensions are too large. Maximum allowed: 2000x2000 pixels'
        };
      }

      // Generate a unique identifier for the logo
      const logoId = generateLogoId();

      // For Docker environments, we store the base64 data directly
      const result = {
        logoUrl: logoId, // This serves as a reference/ID for the logo
        logoData: body.logo, // The full base64 data URL
        mimeType: imageInfo.mimeType
      };

      ctx.set.status = 200;
      return {
        success: true,
        message: 'Logo uploaded successfully',
        data: result
      };

    } catch (error) {
      console.error('Error uploading logo:', error);
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error while uploading logo'
      };
    }
  }

  static async getLogo(ctx: CustomContext) {
    try {
      const { logoId } = ctx.query as { logoId: string };

      if (!logoId) {
        ctx.set.status = 400;
        return {
          success: false,
          message: 'Logo ID is required'
        };
      }

      // In a real implementation with base64 storage in database,
      // you would fetch the logo data from the organizations table
      // For now, we'll return a placeholder or indicate not found
      // This would need to be implemented based on your storage strategy

      ctx.set.status = 404;
      return {
        success: false,
        message: 'Logo retrieval not implemented in base64 storage mode. Use direct database query.'
      };

    } catch (error) {
      console.error('Error retrieving logo:', error);
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error while retrieving logo'
      };
    }
  }
}
