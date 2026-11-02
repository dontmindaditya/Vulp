import type { TrackSourceType } from "@/types/track";

type DetectedSource = {
    sourceType: Exclude<TrackSourceType, "upload">;
    sourceId: string;
    sourceUrl: string;
};

const YOUTUBE_HOSTS = new Set([
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtu.be",
]);

const SPOTIFY_HOSTS = new Set([
    "open.spotify.com",
]);

export function detectTrackSource(input: string): DetectedSource {
    let url: URL;

    try {
        url = new URL(input.trim());
    } catch {
        throw new Error("Please enter a valid URL.");
    }

    if (
        !["https:", "http:"].includes(url.protocol) ||
        url.username ||
        url.password
    ) {
        throw new Error("This URL is not supported.");
    }

    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    // YouTube
    if (
        YOUTUBE_HOSTS.has(url.hostname.toLowerCase()) ||
        hostname === "youtube.com"
    ) {
        let videoId: string | null = null;

        if (hostname === "youtu.be") {
            videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
        } else if (url.pathname === "/watch") {
            videoId = url.searchParams.get("v");
        } else {
            const match = url.pathname.match(
                /^\/(shorts|embed|live)\/([a-zA-Z0-9_-]{11})/
            );

            videoId = match?.[2] ?? null;
        }

        if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
            throw new Error("Could not identify a YouTube video from this link.");
        }

        return {
            sourceType: "youtube",
            sourceId: videoId,
            sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
        };
    }

    // Spotify track
    if (SPOTIFY_HOSTS.has(url.hostname.toLowerCase())) {
        const match = url.pathname.match(
            /\/track\/([a-zA-Z0-9]{22})/
        );

        if (!match) {
            throw new Error("Please provide a Spotify track link, not an album or playlist.");
        }

        return {
            sourceType: "spotify",
            sourceId: match[1],
            sourceUrl: `https://open.spotify.com/track/${match[1]}`,
        };
    }

    // Direct audio file URL
    const audioExtensions = /\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i;

    if (audioExtensions.test(url.pathname)) {
        return {
            sourceType: "direct_url",
            sourceId: url.href,
            sourceUrl: url.href,
        };
    }

    throw new Error(
        "Unsupported link. Use a YouTube video, Spotify track, or direct audio file URL."
    );
}

