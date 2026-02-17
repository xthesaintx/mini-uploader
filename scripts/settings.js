/**
 * Mini Uploader - Settings Registration
 * Registers all module settings for configuration
 */

const MODULE_ID = 'mini-uploader';

/**
 * Register all module settings
 */
export function registerSettings() {
    
    game.settings.register(MODULE_ID, 'uploadFolder', {
        name: game.i18n.localize('MINI_UPLOADER.Settings.UploadFolder.Name'),
        hint: game.i18n.localize('MINI_UPLOADER.Settings.UploadFolder.Hint'),
        scope: 'world',
        config: true,
        type: String,
        filePicker: "folder",
        default: 'uploads/{worldId}/webp-images',
        requiresReload: false
    });

    
    game.settings.register(MODULE_ID, 'targetJournal', {
        name: game.i18n.localize('MINI_UPLOADER.Settings.TargetJournal.Name'),
        hint: game.i18n.localize('MINI_UPLOADER.Settings.TargetJournal.Hint'),
        scope: 'world',
        config: true,
        type: String,
        default: 'mini-uploader',
        requiresReload: false
    });

    
    game.settings.register(MODULE_ID, 'webpQuality', {
        name: game.i18n.localize('MINI_UPLOADER.Settings.WebPQuality.Name'),
        hint: game.i18n.localize('MINI_UPLOADER.Settings.WebPQuality.Hint'),
        scope: 'world',
        config: true,
        type: Number,
        default: 0.85,
        range: {
            min: 0.1,
            max: 1.0,
            step: 0.05
        },
        requiresReload: false
    });

    
    game.settings.register(MODULE_ID, 'showNotifications', {
        name: game.i18n.localize('MINI_UPLOADER.Settings.ShowNotifications.Name'),
        hint: game.i18n.localize('MINI_UPLOADER.Settings.ShowNotifications.Hint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        requiresReload: false
    });

    
    game.settings.register(MODULE_ID, 'createJournalIfMissing', {
        name: game.i18n.localize('MINI_UPLOADER.Settings.CreateJournalIfMissing.Name'),
        hint: game.i18n.localize('MINI_UPLOADER.Settings.CreateJournalIfMissing.Hint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        requiresReload: false
    });
}

/**
 * Get a setting value
 * @param {string} key - Setting key
 * @returns {*} Setting value
 */
export function getSetting(key) {
    return game.settings.get(MODULE_ID, key);
}

/**
 * Set a setting value
 * @param {string} key - Setting key
 * @param {*} value - Value to set
 */
export async function setSetting(key, value) {
    return game.settings.set(MODULE_ID, key, value);
}
