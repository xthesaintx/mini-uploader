/**
 * Mini Uploader - Journal Handler
 * Manages adding images as pages to a journal entry
 */

import { getSetting } from './settings.js';

const MODULE_ID = 'mini-uploader';

/**
 * Find or create the target journal entry
 * @returns {Promise<JournalEntry|null>} The journal entry, or null if not found/created
 */
export async function getOrCreateJournal() {
    const journalName = getSetting('targetJournal');
    const autoCreate = getSetting('createJournalIfMissing');

    let journal = game.journal.getName(journalName);

    if (!journal && autoCreate) {
        try {
            journal = await JournalEntry.create({
                name: journalName,
                ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER }
            });

            if (getSetting('showNotifications')) {
                ui.notifications.info(
                    game.i18n.format('MINI_UPLOADER.Notifications.JournalCreated', { name: journalName })
                );
            }
        } catch (error) {
            console.error('Mini Uploader: Failed to create journal', error);
            return null;
        }
    }

    return journal || null;
}

/**
 * Add an image as a new page to the target journal
 * @param {string} imagePath - Path to the uploaded image
 * @param {string} imageName - Name for the journal page
 * @param {Object} options - Additional options
 * @param {number} options.width - Image width in pixels
 * @param {number} options.height - Image height in pixels
 * @returns {Promise<JournalEntryPage|null>} The created page, or null on failure
 */
export async function addImagePageToJournal(imagePath, imageName, options = {}) {
    const journal = await getOrCreateJournal();

    if (!journal) {
        if (getSetting('showNotifications')) {
            ui.notifications.error(
                game.i18n.localize('MINI_UPLOADER.Notifications.JournalNotFound')
            );
        }
        return null;
    }

    try {
        const pageData = {
            name: imageName,
            type: 'image',
            src: imagePath,
            image: {
                caption: ''
            }
        };

        if (options.width && options.height) {
            pageData.image.width = options.width;
            pageData.image.height = options.height;
        }

        const [page] = await journal.createEmbeddedDocuments('JournalEntryPage', [pageData]);

        if (getSetting('showNotifications')) {
            ui.notifications.info(
                game.i18n.format('MINI_UPLOADER.Notifications.UploadSuccess', { name: imageName })
            );
        }

        return page;
    } catch (error) {
        console.error('Mini Uploader: Failed to create journal page', error);

        if (getSetting('showNotifications')) {
            ui.notifications.error(
                game.i18n.format('MINI_UPLOADER.Notifications.UploadError', {
                    name: imageName,
                    error: error.message
                })
            );
        }

        return null;
    }
}
