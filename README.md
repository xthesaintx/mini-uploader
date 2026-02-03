# Mini Uploader (Foundry VTT v13)

**Mini Uploader** is a lean, native-HTML Foundry VTT v13 module that streamlines your asset workflow. Drag images directly from your computer (Finder/Explorer) onto the Foundry window to automatically convert them to WebP, upload them to your server, and add them as pages to a journal.

## Features

  **Auto-WebP Conversion**: Converts PNG, JPEG, GIF, and other formats to WebP.
- **World-Specific Organization**: Automatically organizes uploads into `uploads/{worldId}/webp-images/` to keep your storage clean.
- **Instant Journaling**: Adds every uploaded image as a new page in a selected journal (defaults to "mini-uploader").
- **Batch Processing**: Drop multiple images at once..
- **Forge VTT Support**: Built-in detection for The Forge.


## Usage

1. **Drag and Drop**: Simply drag one or more image files from your computer and drop them anywhere on the Foundry VTT window.
2. **Watch it Work**: You'll see progress notifications as images are converted and uploaded.
3. **View Results**: Open the "mini-uploader" journal to see your new image pages.

## Settings

- **Upload Folder**: Change the target path. Use `{worldId}` as a placeholder for the current world ID.
- **Target Journal**: Specify which journal entry should receive the images.
- **WebP Quality**: Adjust the compression level (0.1 to 1.0).
- **Auto-Create Journal**: If enabled, the module will create the target journal if it doesn't already exist.

**Discord**: https://discord.gg/fycwH79s2y

**Website**: www.wgtngm.com

**Patreon**: www.patreon.com/wgtngm

**Ko-fi**: www.ko-fi.com/wgtngm
