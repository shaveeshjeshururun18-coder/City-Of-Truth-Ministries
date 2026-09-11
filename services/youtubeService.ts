/**
 * YouTube Safe Media Service
 * Provides sanitized, privacy-enhanced video embed URLs (youtube-nocookie.com),
 * robust video ID extraction, high-res thumbnail resolution with fallbacks,
 * and sermon playback helpers.
 */

export interface YouTubeVideoMeta {
    id: string;
    embedUrl: string;
    thumbnailUrl: string;
    thumbnailFallback: string;
}

/**
 * Extracts a valid 11-character YouTube video ID from various URL formats
 * (standard watch URLs, short URLs, embeds, shorts, or raw IDs).
 */
export function extractYouTubeId(urlOrId: string): string | null {
    if (!urlOrId) return null;

    const trimmed = urlOrId.trim();

    // If it's already a raw 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        return trimmed;
    }

    // RegEx covering youtu.be, youtube.com/watch?v=, youtube.com/embed/, youtube.com/shorts/
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = trimmed.match(regExp);

    return match ? match[1] : null;
}

/**
 * Constructs a privacy-enhanced, tracking-reduced embed URL.
 * Uses youtube-nocookie.com to protect user privacy.
 */
export function getSafeEmbedUrl(
    urlOrId: string,
    options: { autoplay?: boolean; mute?: boolean; rel?: boolean } = {}
): string | null {
    const videoId = extractYouTubeId(urlOrId);
    if (!videoId) return null;

    const params = new URLSearchParams({
        rel: options.rel ? '1' : '0',
        modestbranding: '1',
        playsinline: '1',
        enablejsapi: '1'
    });

    if (options.autoplay) {
        params.set('autoplay', '1');
    }
    if (options.mute) {
        params.set('mute', '1');
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Resolves the primary and fallback thumbnail URLs for a YouTube video.
 */
export function getYouTubeThumbnails(urlOrId: string): { maxRes: string; high: string; medium: string } | null {
    const videoId = extractYouTubeId(urlOrId);
    if (!videoId) return null;

    return {
        maxRes: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    };
}

/**
 * Validates and wraps a video item into a safe YouTubeVideoMeta object.
 */
export function createSafeYouTubeMeta(urlOrId: string): YouTubeVideoMeta | null {
    const id = extractYouTubeId(urlOrId);
    if (!id) return null;

    const thumbs = getYouTubeThumbnails(id);
    const embedUrl = getSafeEmbedUrl(id);

    if (!thumbs || !embedUrl) return null;

    return {
        id,
        embedUrl,
        thumbnailUrl: thumbs.high,
        thumbnailFallback: thumbs.medium
    };
}
