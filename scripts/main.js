/**
 * Mini Uploader - Main Entry Point
 * Intercepts image drops and coordinates conversion, upload, and journal creation
 */

import { registerSettings, getSetting } from './settings.js';
import { convertToWebP, isSupportedImage, generateWebPFilename } from './webp-converter.js';
import { uploadWebP } from './uploader.js';
import { addImagePageToJournal } from './journal-handler.js';

const MODULE_ID = 'mini-uploader';

/**
 * Process a dropped image file
 * @param {File} file - The dropped image file
 * @returns {Promise<{success: boolean, name: string, path?: string, error?: string}>}
 */
async function processDroppedImage(file) {
    const quality = getSetting('webpQuality');

    try {
        
        const { blob, width, height } = await convertToWebP(file, quality);

        
        const filename = generateWebPFilename(file.name);
        const uploadedPath = await uploadWebP(blob, filename);

        
        const pageName = file.name.replace(/\.[^.]+$/, ''); 
        await addImagePageToJournal(uploadedPath, pageName, { width, height });

        return { success: true, name: file.name, path: uploadedPath };

    } catch (error) {
        console.error(`Mini Uploader: Error processing ${file.name}`, error);
        return { success: false, name: file.name, error: error.message };
    }
}

/**
 * Process multiple files with progress tracking
 * @param {File[]} files - Array of files to process
 */
async function processBatch(files) {
    const total = files.length;
    const showNotifications = getSetting('showNotifications');
    const results = { success: 0, failed: 0, errors: [] };

    
    if (showNotifications && total > 1) {
        ui.notifications.info(`Mini Uploader: Processing ${total} images...`);
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        
        if (showNotifications && total > 1) {
            ui.notifications.info(`Uploading ${i + 1}/${total}: ${file.name}`, { permanent: false });
        }

        const result = await processDroppedImage(file);

        if (result.success) {
            results.success++;
            
            if (showNotifications && total === 1) {
                ui.notifications.info(
                    game.i18n.format('MINI_UPLOADER.Notifications.UploadSuccess', { name: file.name })
                );
            }
        } else {
            results.failed++;
            results.errors.push(result.name);
        }
    }

    
    if (showNotifications && total > 1) {
        if (results.failed === 0) {
            ui.notifications.info(`Mini Uploader: Successfully uploaded ${results.success} images`);
        } else {
            ui.notifications.warn(
                `Mini Uploader: Uploaded ${results.success}/${total} images. Failed: ${results.errors.join(', ')}`
            );
        }
    } else if (showNotifications && results.failed > 0) {
        ui.notifications.error(
            game.i18n.format('MINI_UPLOADER.Notifications.ConversionError', { name: results.errors[0] })
        );
    }

    return results;
}

/**
 * Handle drop events on the document
 * @param {DragEvent} event - The drop event
 */
async function handleDrop(event) {
    
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer?.files?.length) return;

    
    const imageFiles = Array.from(dataTransfer.files).filter(isSupportedImage);

    if (imageFiles.length === 0) return;

    
    event.preventDefault();
    event.stopPropagation();

    
    await processBatch(imageFiles);
}

/**
 * Setup the drop event listener
 */
function setupDropListener() {
    
    document.addEventListener('drop', handleDrop, { capture: true });

    
    document.addEventListener('dragover', (event) => {
        const dataTransfer = event.dataTransfer;

        
        if (dataTransfer?.types?.includes('Files')) {
            
            event.preventDefault();
        }
    }, { capture: true });

    console.log('Mini Uploader: Drop listener initialized');
}

/**
 * Initialize the module
 */
Hooks.once('init', () => {
    console.log('Mini Uploader: Initializing...');
    registerSettings();
});

/**
 * Setup when Foundry is ready
 */
Hooks.once('ready', () => {
    console.log('Mini Uploader: Ready');
    setupDropListener();
});
