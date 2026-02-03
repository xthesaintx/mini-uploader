/**
 * Mini Uploader - File Uploader
 * Handles uploading WebP files to Foundry/Forge VTT
 */

import { getSetting } from './settings.js';


const FilePicker = foundry.applications.apps.FilePicker.implementation;

/**
 * Check if we're running on The Forge
 * @returns {boolean} True if running on Forge VTT
 */
export function isForgeEnvironment() {
    
    return typeof ForgeVTT !== 'undefined' ||
        (game.modules?.get('forge-vtt')?.active) ||
        window.location.hostname.includes('forge-vtt.com');
}

/**
 * Ensure the upload directory exists
 * @param {string} folderPath - The folder path to create
 * @returns {Promise<boolean>} True if folder exists or was created
 */
async function ensureDirectoryExists(folderPath) {
    try {
        
        const result = await FilePicker.browse('data', folderPath);
        return true;
    } catch (error) {
        
        try {
            await FilePicker.createDirectory('data', folderPath);
            return true;
        } catch (createError) {
            
            const parts = folderPath.split('/');
            let currentPath = '';

            for (const part of parts) {
                if (!part) continue;
                currentPath = currentPath ? `${currentPath}/${part}` : part;

                try {
                    await FilePicker.browse('data', currentPath);
                } catch {
                    try {
                        await FilePicker.createDirectory('data', currentPath);
                    } catch (e) {
                        console.error(`Mini Uploader: Failed to create directory ${currentPath}`, e);
                        return false;
                    }
                }
            }
            return true;
        }
    }
}

/**
 * Upload a WebP blob to Foundry's data storage
 * @param {Blob} blob - The WebP blob to upload
 * @param {string} filename - Desired filename
 * @param {string} folderPath - Target folder path
 * @returns {Promise<string>} The path to the uploaded file
 */
export async function uploadWebP(blob, filename, folderPath = null) {
    
    let targetFolder = folderPath || getSetting('uploadFolder');

    
    if (targetFolder.includes('{worldId}')) {
        targetFolder = targetFolder.replace('{worldId}', game.world.id);
    }

    
    const dirExists = await ensureDirectoryExists(targetFolder);
    if (!dirExists) {
        throw new Error(`Could not create upload directory: ${targetFolder}`);
    }

    
    const file = new File([blob], filename, { type: 'image/webp' });

    
    
    const source = isForgeEnvironment() && typeof ForgeVTT !== 'undefined'
        ? 'forgevtt'
        : 'data';

    try {
        
        const response = await FilePicker.upload(source, targetFolder, file, {});

        if (response.path) {
            return response.path;
        } else {
            throw new Error('Upload returned no path');
        }
    } catch (error) {
        
        if (source === 'forgevtt') {
            console.warn('Mini Uploader: Forge upload failed, trying data source');
            const fallbackResponse = await FilePicker.upload('data', targetFolder, file, {});
            if (fallbackResponse.path) {
                return fallbackResponse.path;
            }
        }
        throw error;
    }
}
