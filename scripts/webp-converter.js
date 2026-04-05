/**
 * Mini Uploader - WebP Converter
 * Converts image files to WebP format using Canvas API
 */

/**
 * Fallback image MIME types when Foundry extension maps are unavailable.
 */
const FALLBACK_IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/webp' 
];

const FALLBACK_IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|gif|bmp|tiff?|webp)$/i;

function getExtension(filename = '') {
    const match = /\.([^.]+)$/.exec(filename);
    return match ? match[1].toLowerCase() : '';
}

function getConstExtensionMap(mapName) {
    if (typeof CONST === 'undefined' || !CONST[mapName]) return {};
    return CONST[mapName];
}

function hasExtension(extensionMap, extension) {
    return Boolean(
        extension &&
        Object.prototype.hasOwnProperty.call(extensionMap, extension)
    );
}

function hasMimeType(extensionMap, mimeType) {
    return Boolean(mimeType && Object.values(extensionMap).includes(mimeType));
}

/**
 * Check if a file is a supported image type
 * @param {File} file - The file to check
 * @returns {boolean} True if this is a supported image type
 */
export function isSupportedImage(file) {
    const imageExtensions = getConstExtensionMap('IMAGE_FILE_EXTENSIONS');
    const extension = getExtension(file.name);

    return hasExtension(imageExtensions, extension) ||
        hasMimeType(imageExtensions, file.type) ||
        FALLBACK_IMAGE_TYPES.includes(file.type) ||
        FALLBACK_IMAGE_EXTENSION_PATTERN.test(file.name);
}

/**
 * Check if a file should bypass conversion and upload as-is
 * @param {File} file - The file to check
 * @returns {boolean} True if this is a passthrough media file
 */
export function isPassthroughUpload(file) {
    const passthroughExtensions = {
        ...getConstExtensionMap('VIDEO_FILE_EXTENSIONS'),
        ...getConstExtensionMap('AUDIO_FILE_EXTENSIONS')
    };
    const extension = getExtension(file.name);

    return hasExtension(passthroughExtensions, extension) ||
        hasMimeType(passthroughExtensions, file.type);
}

/**
 * Check if a file can be handled by this module
 * @param {File} file - The file to check
 * @returns {boolean} True for supported image files or passthrough uploads
 */
export function isSupportedUpload(file) {
    return isSupportedImage(file) || isPassthroughUpload(file);
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
