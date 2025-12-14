'use strict';

const { stripHTML } = require('hexo-util');

const xmlEscape = (str) => {
    if (!str)
        return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

hexo.extend.generator.register('theme_rss', function (locals) {
    const { config, theme } = this,
        urlFor = this.extend.helper.get('url_for').bind(this);

    // Merge defaults with theme config for cleaner access
    const themeRss = theme.rss || {},
        feedCfg = {
            path: themeRss.path || 'rss.xml',
            limit: typeof themeRss.limit === 'number' ? themeRss.limit : 20,
            include_drafts: themeRss.include_drafts || false,
            include_future: themeRss.include_future || false,
            mark_encrypted_in_title: themeRss.mark_encrypted_in_title !== false,
            add_encrypted_element: themeRss.add_encrypted_element !== false,
        };

    const siteUrl = (config.url || '').replace(/\/$/, '');
    if (!siteUrl)
        this.log.warn('theme-encrypted-rss: config.url is not set; feed links may be incorrect.');

    // Filter Posts
    const now = Date.now(); // Calculate time once
    let posts = locals.posts.sort('-date').filter(post => {
        if (!post.published)
            return false;
        if (!feedCfg.include_drafts && post.draft)
            return false;
        if (!feedCfg.include_future && post.date && post.date.valueOf() > now)
            return false;
        return true;
    });

    if (feedCfg.limit > 0)
        posts = posts.limit(feedCfg.limit);

    // Generate Items XML
    const itemsXml = posts.map(post => {
        // Detect encryption via common plugin front-matter keys
        const isEncrypted = Boolean('password' in post ? post.password : post.encrypted);

        // Handle Title
        let title = post.title || post.slug || '';
        if (isEncrypted && feedCfg.mark_encrypted_in_title)
            title = `[Encrypted] ${title}`;

        // Handle URL
        const postUrl = siteUrl + urlFor(post.path),
            pubDate = post.date ? new Date(post.date).toUTCString() : '';

        // Handle Description
        let description = '';
        if (isEncrypted) {
            description = 'This post has been password protected.';
        } else {
            const raw = stripHTML(post.excerpt || post.content || '');
            description = raw.length > 300
                ? `${raw.substring(0, 297).trimEnd()}…`
                : raw;
        }

        // Handle Custom <encrypted> tag
        const encryptedTag = (isEncrypted && feedCfg.add_encrypted_element) ? '      <encrypted>true</encrypted>\n' : '';

        // Return Item Block
        return `
    <item>
      <title>${xmlEscape(title)}</title>
      <link>${xmlEscape(postUrl)}</link>
      <guid>${xmlEscape(postUrl)}</guid>
      <pubDate>${xmlEscape(pubDate)}</pubDate>
      <description>${xmlEscape(description)}</description>
${encryptedTag}    </item>`;
    }).join('');

    // 4. Construct Final Feed
    const rss = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(config.title || '')}</title>
    <link>${siteUrl || ''}/</link>
    <description>${xmlEscape(config.description || '')}</description>
    <generator>theme-flux-palette</generator>
${itemsXml}
  </channel>
</rss>`;

    return {
        path: feedCfg.path,
        data: rss
    };
});