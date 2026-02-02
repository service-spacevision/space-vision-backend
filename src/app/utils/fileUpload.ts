/**
 * File upload utilities for handling base64 image data in Docker environments
 */

export interface Base64ImageInfo {
  data: string; // base64 data without data:image prefix
  mimeType: string;
  originalSize: number; // size in bytes
}

/**
 * Validates and processes base64 image data
 */
export function processBase64Image(base64String: string): Base64ImageInfo | null {
  try {
    // Validate format: data:image/jpeg;base64,actualBase64Data
    const matches = base64String.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/);

    if (!matches) {
      throw new Error('Invalid base64 image format');
    }

    const mimeType = `image/${matches[1]}`;
    const base64Data = matches[2];

    // Validate base64 data
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
      throw new Error('Invalid base64 data');
    }

    // Check if the base64 data has proper padding
    if (base64Data.length % 4 !== 0) {
      throw new Error('Invalid base64 padding');
    }

    // Calculate original size (rough estimate)
    const originalSize = Math.ceil((base64Data.length * 3) / 4);

    return {
      data: base64Data,
      mimeType,
      originalSize
    };
  } catch (error) {
    console.error('Error processing base64 image:', error);
    return null;
  }
}

/**
 * Validates image dimensions from base64 data (simplified version for server-side)
 * Note: In a production environment, you might want to use a library like 'image-size' or 'sharp'
 */
export async function validateImageDimensions(base64Data: string): Promise<{ width: number; height: number } | null> {
  try {
    // For server-side validation without canvas/image libraries,
    // we'll do basic size validation based on base64 length
    // In production, consider using 'sharp' or 'jimp' for proper image validation

    const imageInfo = processBase64Image(`data:image/jpeg;base64,${base64Data}`);
    if (!imageInfo) return null;

    // Basic heuristic: larger base64 usually means larger image
    // This is not accurate but provides basic validation
    const estimatedSize = imageInfo.originalSize;

    // Assume reasonable dimensions for different file sizes
    if (estimatedSize > 10 * 1024 * 1024) { // > 10MB
      return { width: 4000, height: 4000 }; // Assume large image
    } else if (estimatedSize > 2 * 1024 * 1024) { // > 2MB
      return { width: 2000, height: 2000 };
    } else {
      return { width: 1000, height: 1000 }; // Assume smaller image
    }
  } catch (error) {
    console.error('Error validating image dimensions:', error);
    return null;
  }
}

/**
 * Validates file size (in bytes)
 */
export function validateFileSize(base64Data: string, maxSizeInBytes: number = 5 * 1024 * 1024): boolean {
  // Base64 data is ~4/3 larger than original file
  const estimatedSize = Math.ceil((base64Data.length * 3) / 4);
  return estimatedSize <= maxSizeInBytes;
}

/**
 * Supported image formats
 */
export const SUPPORTED_IMAGE_FORMATS = ['jpeg', 'jpg', 'png', 'gif', 'webp'] as const;
export type SupportedImageFormat = typeof SUPPORTED_IMAGE_FORMATS[number];

/**
 * Validates image format
 */
export function validateImageFormat(mimeType: string): boolean {
  const format = mimeType.split('/')[1];
  return SUPPORTED_IMAGE_FORMATS.includes(format as SupportedImageFormat);
}

/**
 * Generates a unique logo ID
 */
export function generateLogoId(): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  return `logo_${timestamp}_${randomSuffix}`;
}

/**
 * Creates a data URL from base64 data and MIME type
 */
export function createDataUrl(base64Data: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64Data}`;
}
