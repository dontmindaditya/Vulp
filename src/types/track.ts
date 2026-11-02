export type TrackSourceType =
    | "upload"
    | "youtube"
    | "spotify"
    | "direct_url";

export interface Track {
    id: string;
    title: string;
    artist: string;

    // Backblaze B2 object keys
    audioPath: string | null;
    artworkPath: string | null;

    // Playback URL (null for tracks using embedded playback)
    audioUrl: string | null;
    artworkUrl: string | null;

    duration: number;
    playlistSlug: string;
    playlistName?: string;
    playlistId?: string;
    playlistCount?: number;

    // Source tracking & duplicate detection
    sourceType?: TrackSourceType;
    sourceId?: string | null;
    sourceUrl?: string | null;

    // Recording rights
    rightsStatus: "pending" | "authorized" | "rejected";
    rightsHolder?: string | null;
    licenseReference?: string | null;
    rightsVerifiedAt?: string | null;

    position: number;

    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTrackInput {
    title: string;
    artist: string;

    // B2 object keys
    audioPath?: string | null;
    artworkPath?: string | null;
    artworkUrl?: string | null;

    // Source tracking
    sourceType?: TrackSourceType;
    sourceId?: string | null;
    sourceUrl?: string | null;

    duration?: number;
    playlistId: string;
    position?: number;

    // Rights default to pending
    rightsStatus?: "pending" | "authorized" | "rejected";
    rightsHolder?: string | null;
    licenseReference?: string | null;
}

export interface UpdateTrackData {
    title?: string;
    artist?: string;
    sourceType?: TrackSourceType;
    sourceId?: string | null;
    sourceUrl?: string | null;
    rightsStatus?: "pending" | "authorized" | "rejected";
    rightsHolder?: string | null;
    licenseReference?: string | null;
}
