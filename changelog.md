# 1.2
- v14 checks
- pass through uploads for .webm .avi .mp4 .mp3

# 1.1

- Switched drag/drop handling from document listeners to Foundry `dropCanvasData` hook.
- Removed custom `document` `drop` and `dragover` listeners.
- Added guard logic so processing only runs for GM file drops with empty Foundry drag payload.
- Kept image filtering so only supported image files are processed.
- Updated drop handler to return `false` for valid image file drops to prevent other canvas drop handlers from also processing them.
- Added hook-priority logic so Mini Uploader’s `dropCanvasData` handler runs first.
