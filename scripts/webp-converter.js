/**
 * Mini Uploader - WebP Converter
 * Converts image files to WebP format using Canvas API
 */

/**
 * Supported image MIME types for conversion
 */
const SUPPORTED_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/webp' 
];

/**
 * Check if a file is a supported image type
 * @param {File} file - The file to check
 * @returns {boolean} True if this is a supported image type
 */
export function isSupportedImage(file) {
    return SUPPORTED_TYPES.includes(file.type) ||
        /\.(png|jpe?g|gif|bmp|tiff?|webp)$/i.test(file.name);
}

/**
 * Convert an image file to WebP format
 * @param {File|Blob} file - The image file to convert
 * @param {number} quality - WebP quality (0.0 to 1.0)
 * @returns {Promise<{blob: Blob, width: number, height: number}>} The converted WebP blob and dimensions
 */
export async function convertToWebP(file, quality = 0.85) {
    
    const imageBitmap = await createImageBitmap(file);

    
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');

    
    ctx.drawImage(imageBitmap, 0, 0);

    
    imageBitmap.close();

    
    const webpBlob = await canvas.convertToBlob({
        type: 'image/webp',
        quality: quality
    });

    return {
        blob: webpBlob,
        width: canvas.width,
        height: canvas.height
    };
}

/**
 * Generate a WebP filename from the original filename
 * @param {string} originalName - Original filename
 * @returns {string} Filename with .webp extension
 */
export function generateWebPFilename(originalName) {
    
    const baseName = originalName.replace(/\.[^.]+$/, '');
    
    const sanitized = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    const timestamp = Date.now();
    return `${sanitized}_${timestamp}.webp`;
}
