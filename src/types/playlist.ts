import type { Track } from "./track";

export interface Playlist {
    id: string;
    name: string;
    slug: string;
    description: string;
    coverUrl: string;
    coverPath?: string | null;

    trackCount: number;
    isPublished: boolean;

    createdAt?: string;
    updatedAt?: string;
}

export interface PlaylistWithTracks extends Playlist {
    tracks: Track[];
}

export interface CreatePlaylistInput {
    name: string;
    slug: string;
    description?: string;
    coverUrl?: string;
    coverPath?: string;
    isPublished?: boolean;
}
