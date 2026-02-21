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
 * Handle file drops on the canvas hook
 * @param {Canvas} canvas - Foundry canvas instance
 * @param {object} point - Canvas drop point
 * @param {DragEvent} event - Native drop event
 */
function handleCanvasDrop(canvas, point, event) {
    if (
        !game.user.isGM ||
        !event.dataTransfer?.files?.length ||
        !foundry.utils.isEmpty(foundry.applications.ux.TextEditor.implementation.getDragEventData(event))
    ) {
        return;
    }

    const imageFiles = Array.from(event.dataTransfer.files).filter(isSupportedImage);
    if (!imageFiles.length) return;

    event.preventDefault();
    event.stopPropagation();

    processBatch(imageFiles).catch((error) => {
        console.error('Mini Uploader: Batch processing failed', error);
    });

    return false;
}

/**
 * Ensure Mini Uploader drop hook executes first so returning false can short-circuit other handlers.
 */
function prioritizeMiniUploaderDropHook() {
    const hookStore = Hooks.events?.dropCanvasData;
    if (!hookStore) return;

    if (Array.isArray(hookStore)) {
        const idx = hookStore.findIndex((entry) => (entry?.fn ?? entry) === handleCanvasDrop);
        if (idx > 0) {
            const [entry] = hookStore.splice(idx, 1);
            hookStore.unshift(entry);
        }
        return;
    }

    if (hookStore instanceof Set) {
        let target = null;
        const others = [];
        for (const entry of hookStore) {
            if (!target && (entry?.fn ?? entry) === handleCanvasDrop) target = entry;
            else others.push(entry);
        }
        if (target) Hooks.events.dropCanvasData = new Set([target, ...others]);
        return;
    }

    if (hookStore instanceof Map) {
        let targetKey = null;
        let targetValue = null;
        const others = [];
        for (const [key, value] of hookStore.entries()) {
            if (targetKey == null && (value?.fn ?? value) === handleCanvasDrop) {
                targetKey = key;
                targetValue = value;
            } else {
                others.push([key, value]);
            }
        }
        if (targetKey != null) Hooks.events.dropCanvasData = new Map([[targetKey, targetValue], ...others]);
        return;
    }

    if (typeof hookStore === 'object') {
        let targetKey = null;
        let targetValue = null;
        const others = {};
        for (const [key, value] of Object.entries(hookStore)) {
            if (targetKey == null && (value?.fn ?? value) === handleCanvasDrop) {
                targetKey = key;
                targetValue = value;
            } else {
                others[key] = value;
            }
        }
        if (targetKey != null) Hooks.events.dropCanvasData = { [targetKey]: targetValue, ...others };
    }
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
    Hooks.on('dropCanvasData', handleCanvasDrop);
    prioritizeMiniUploaderDropHook();
    console.log('Mini Uploader: dropCanvasData hook initialized');
    setTimeout(() => {
        prioritizeMiniUploaderDropHook();
    }, 250);
});

Hooks.on('canvasReady', () => {
    prioritizeMiniUploaderDropHook();
});
