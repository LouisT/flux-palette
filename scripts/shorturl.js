'use strict';
const crypto = require('crypto');

// Compute a short hash for the post based on its slug/path/title
function makeShortHash(post, length) {
    return (crypto.createHash('md5').update(post.slug ||
        post.path ||
        post.permalink ||
        String(post.title || '')).digest('hex')).slice(0, length);
}

// Returns the full short URL, e.g. "https://example.com/s/abc123"
hexo.extend.helper.register('short_url', function (post) {
    const ctx = this,
        theme = ctx.theme.config || {},
        cfg = theme.short_url || {};

    const enabled = cfg.enabled !== false; // default: true
    if (!enabled)
        return '';

    const prefix = cfg.prefix || 's',
        length = typeof cfg.length === 'number' && cfg.length > 0 ? cfg.length : 6;

    if (!post)
        post = ctx.page;
    if (!post)
        return '';

    const siteUrl = (ctx.config.url || '').replace(/\/$/, '');
    if (!siteUrl)
        return '';

    return `${siteUrl}/${prefix}/${makeShortHash(post, length)}`;
});

// Returns just the short hash portion, e.g. "abc123"
hexo.extend.helper.register('short_hash', function (post) {
    const ctx = this,
        theme = ctx.theme.config || {},
        cfg = theme.short_url || {};

    const enabled = cfg.enabled !== false;
    if (!enabled)
        return '';

    const length = typeof cfg.length === 'number' && cfg.length > 0 ? cfg.length : 6;

    if (!post)
        post = ctx.page;
    if (!post)
        return '';

    return makeShortHash(post, length);
});

// Generate short URL redirect files
hexo.extend.generator.register('theme_short_url', function (locals) {
    const theme = this.theme.config || {},
        cfg = theme.short_url || {};

    const enabled = cfg.enabled !== false; // default: true
    if (!enabled)
        return [];

    const prefix = cfg.prefix || 's',
        length = typeof cfg.length === 'number' && cfg.length > 0 ? cfg.length : 6;

    // Warn if site URL is not set
    const siteUrl = (this.config.url || '').replace(/\/$/, '');
    if (!siteUrl)
        this.log.warn('theme_short_url: config.url is not set; short URLs may be invalid.');

    const urlFor = this.extend.helper.get('url_for').bind(this),
        files = [];

    locals.posts.forEach(post => {
        // Only create short URLs for published posts
        if (!post.published)
            return;

        // Store hash on the post object in case templates want it directly
        post.short_hash = makeShortHash(post, length);

        // Target URL of the post
        const targetPath = urlFor(post.path),
            targetUrl = siteUrl + targetPath;

        // Create redirect HTML file
        files.push({
            path: `${prefix}/${post.short_hash}/index.html`,
            data: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${post.title || ''}</title>
  <meta http-equiv="refresh" content="0; url=${targetUrl}">
  <link rel="canonical" href="${targetUrl}">
</head>
<body>
  <p>Redirecting to <a href="${targetUrl}">${targetUrl}</a>…</p>
</body>
</html>`,
        });
    });

    return files;
});

