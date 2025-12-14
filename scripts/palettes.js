'use strict';
const fs = require('fs'),
    path = require('path');

// Get merged options with defaults
function getOptions(themeConfig) {
    const cfg = (themeConfig && themeConfig.palette_selector) || {};
    return {
        enabled: cfg.enabled !== false,
        default: cfg.default || 'blood-red',
        palette_folder: cfg.palette_folder || 'css/palettes'
    };
}

// Returns a list of available palettes
hexo.extend.helper.register('palette_list', function () {
    const ctx = this,
        options = getOptions(ctx.theme.config);

    if (!options.enabled)
        return [];

    // e.g. "css" or "css/palettes"
    const folderAbs = path.join(hexo.theme_dir, 'source', (options.palette_folder || 'css/palettes').replace(/^\/+/, '').replace(/\/+$/, ''));

    // Read all files in the palette folder
    let files;
    try {
        files = fs.readdirSync(folderAbs);
    } catch (err) {
        // Folder missing or unreadable
        hexo.log.warn('[palette_list] Palette folder not found:', folderAbs);
        return [];
    }

    return files
        .filter(f => /^.*\.css$/.test(f)) // Only .css files
        .map(f => {
            const key = f
                .replace(/^palette-/, '')   // palette-default.css -> default.css
                .replace(/\.css$/, ''),    // default.css -> default
                name = key
                    .split(/[-_]/)
                    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                    .join(' ');
            return {
                file: f,   // "blood-red.css"
                key,       // "blood-red"
                name       // "Blood Red"
            };
        });
});
