'use strict';
// Supported Spotify embed types
const SPOTIFY_TYPES = new Set(['track', 'playlist', 'artist']);

// Extract a Spotify { type, id } from various formats
function extractSpotifyRef(input, forcedType) {
    if (!input)
        return null;
    const str = String(input).trim();

    // If caller forces a type, validate it
    const typeHint = forcedType && SPOTIFY_TYPES.has(forcedType) ? forcedType : null;

    // spotify:<type>:<id>
    const uriMatch = str.match(/^spotify:(track|playlist|artist):([a-zA-Z0-9]+)$/);
    if (uriMatch)
        return { type: uriMatch[1], id: uriMatch[2] };

    // https://open.spotify.com/<type>/<id>(?...)
    const urlMatch = str.match(/open\.spotify\.com\/(track|playlist|artist)\/([a-zA-Z0-9]+)/);
    if (urlMatch)
        return { type: urlMatch[1], id: urlMatch[2] };

    // https://open.spotify.com/embed/<type>/<id>(?...)
    const embedUrlMatch = str.match(/open\.spotify\.com\/embed\/(track|playlist|artist)\/([a-zA-Z0-9]+)/);
    if (embedUrlMatch)
        return { type: embedUrlMatch[1], id: embedUrlMatch[2] };

    // If only an ID is provided, require a type hint (default to track for backward compatibility)
    if (/^[a-zA-Z0-9]{8,32}$/.test(str))
        return { type: typeHint || 'track', id: str };

    return null;
}

// Build a normalized embed object
function buildSpotifyEmbedObject(raw, forcedType) {
    const ref = extractSpotifyRef(raw, forcedType);
    if (!ref)
        return null;

    // Extract type and ID
    const { type, id } = ref;

    // Construct URLs
    const embedUrl = `https://open.spotify.com/embed/${type}/${id}`,
        openUrl = `https://open.spotify.com/${type}/${id}`;

    // Spotify recommended sizing: tracks are compact; playlists/artists are taller
    const height = type === 'track' ? 80 : 352;

    // Return the embed object
    return { type, id, embedUrl, openUrl, height };
}

// Tag to embed Spotify inline in a post
hexo.extend.tag.register('spotify', function (args) {
    if (!args || !args.length)
        return '';

    // Optional explicit type as first arg: track|playlist|artist
    let forcedType = null,
        inputParts = args;

    if (SPOTIFY_TYPES.has(String(args[0]).toLowerCase())) {
        forcedType = String(args[0]).toLowerCase();
        inputParts = args.slice(1);
    }

    // Allow entire URL even if there are spaces
    const embed = buildSpotifyEmbedObject(inputParts.join(' '), forcedType);
    if (!embed)
        return '';

    // Build the HTML
    return [
        '<div class="spotify-embed-inline">',
        '  <iframe',
        '    src="' + embed.embedUrl + '"',
        '    width="100%"',
        '    height="' + embed.height + '"',
        '    frameborder="0"',
        '    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"',
        '    loading="lazy"',
        '  ></iframe>',
        '</div>'
    ].join('\n');
}, { ends: false });