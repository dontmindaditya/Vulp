import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createSignedDownloadUrl } from "@/lib/storage/b2";
import { getTracksByPlaylistId } from "@/features/tracks/services/track.service";
import type { Playlist } from "@/types/playlist";
import type { Track } from "@/types/track";

export type { Playlist };

interface PlaylistRow {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    cover_url: string | null;
    cover_path: string | null;
    is_published: boolean;
    created_at?: string;
    updated_at?: string;
    playlist_tracks?: { count: number }[];
}

export function resolveCoverUrl(
    name: string,
    slug: string,
    coverUrl?: string | null
): string {
    if (coverUrl?.trim()) return coverUrl;

    const n = (name || "").toLowerCase();
    const s = (slug || "").toLowerCase();

    if (n.includes("reverie") || n.includes("riverie") ||
        s.includes("reverie") || s.includes("riverie")) {
        return "/images/Reverie.png";
    }

    if (n.includes("indie") || s.includes("indie")) {
        return "/images/indie-mood.png";
    }

    if (n.includes("shibuya") || s.includes("shibuya")) {
        return "/images/Shibuya.png";
    }

    if (n.includes("infatuation") || n.includes("infactuation") ||
        s.includes("infatuation") || s.includes("melancholy")) {
        return "/images/Infatuation.png";
    }

    if (n.includes("pulse") || n.includes("impulse") ||
        s.includes("pulse") || s.includes("late-night")) {
        return "/images/Impulse.png";
    }

    if (n.includes("zephyr") || s.includes("zephyr") ||
        s.includes("nostalgia")) {
        return "/images/Zephyr.png";
    }

    return "/images/cover.png";
}

async function mapPlaylist(row: PlaylistRow): Promise<Playlist> {
    let coverUrl = resolveCoverUrl(row.name, row.slug, row.cover_url);

    if (row.cover_path) {
        try {
            coverUrl = await createSignedDownloadUrl(row.cover_path);
        } catch (err) {
            console.error("mapPlaylist signed URL error:", err);
        }
    }

    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description ?? "",
        coverUrl,
        coverPath: row.cover_path,
        trackCount: row.playlist_tracks?.[0]?.count ?? 0,
        isPublished: row.is_published,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

const PLAYLIST_SELECT = `
    id,
    name,
    slug,
    description,
    cover_url,
    cover_path,
    is_published,
    created_at,
    updated_at,
    playlist_tracks(count)
`;

export async function getPublishedPlaylists(): Promise<Playlist[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("playlists")
        .select(PLAYLIST_SELECT)
        .eq("is_published", true)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("getPublishedPlaylists:", error.message);
        throw new Error("Unable to load playlists.");
    }

    return Promise.all(
        (data as unknown as PlaylistRow[]).map(mapPlaylist)
    );
}

export async function getAllPlaylists(): Promise<Playlist[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("playlists")
        .select(PLAYLIST_SELECT)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getAllPlaylists:", error.message);
        throw new Error("Unable to load playlists.");
    }

    return Promise.all(
        (data as unknown as PlaylistRow[]).map(mapPlaylist)
    );
}

export async function getPlaylistBySlug(
    slug: string
): Promise<Playlist | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("playlists")
        .select(PLAYLIST_SELECT)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

    if (error) {
        console.error("getPlaylistBySlug:", error.message);
        throw new Error("Unable to load playlist.");
    }

    return data
        ? mapPlaylist(data as unknown as PlaylistRow)
        : null;
}

export async function getPlaylistById(
    id: string
): Promise<Playlist | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("playlists")
        .select(PLAYLIST_SELECT)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        console.error("getPlaylistById:", error.message);
        throw new Error("Unable to load playlist.");
    }

    return data
        ? mapPlaylist(data as unknown as PlaylistRow)
        : null;
}

export async function getPlaylistWithTracks(
    id: string
): Promise<{ playlist: Playlist; tracks: Track[] } | null> {
    const playlist = await getPlaylistById(id);
    if (!playlist) return null;

    const tracks = await getTracksByPlaylistId(id);
    return { playlist, tracks };
}

export interface PlaylistRecordInput {
    name: string;
    slug: string;
    description: string;
    coverPath?: string | null;
    coverUrl?: string | null;
    isPublished: boolean;
}

export async function createPlaylist(input: PlaylistRecordInput) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("playlists")
        .insert({
            name: input.name,
            slug: input.slug,
            description: input.description,
            cover_path: input.coverPath || null,
            cover_url: input.coverUrl || null,
            is_published: input.isPublished,
        })
        .select("id")
        .single();

    if (error) {
        console.error("createPlaylist:", error.message);
        throw new Error(
            error.code === "23505"
                ? "A playlist with this slug already exists."
                : "Unable to create playlist."
        );
    }

    return data;
}

export async function updatePlaylist(
    id: string,
    input: PlaylistRecordInput
) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("playlists")
        .update({
            name: input.name,
            slug: input.slug,
            description: input.description,
            cover_path: input.coverPath || null,
            cover_url: input.coverUrl || null,
            is_published: input.isPublished,
        })
        .eq("id", id);

    if (error) {
        console.error("updatePlaylist:", error.message);
        throw new Error(
            error.code === "23505"
                ? "A playlist with this slug already exists."
                : "Unable to update playlist."
        );
    }
}

export async function setPlaylistPublished(
    id: string,
    isPublished: boolean
) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("playlists")
        .update({ is_published: isPublished })
        .eq("id", id);

    if (error) {
        console.error("setPlaylistPublished:", error.message);
        throw new Error("Unable to update publication status.");
    }
}

export async function deletePlaylist(id: string) {
    const supabase = await createClient();

    // Don't silently delete a playlist that still contains tracks.
    const { count, error: countError } = await supabase
        .from("playlist_tracks")
        .select("id", { count: "exact", head: true })
        .eq("playlist_id", id);

    if (countError) {
        console.error("deletePlaylist count:", countError.message);
        throw new Error("Unable to check playlist tracks.");
    }

    if ((count ?? 0) > 0) {
        throw new Error(
            "This playlist still contains tracks. Remove its tracks before deleting it."
        );
    }

    const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("deletePlaylist:", error.message);
        throw new Error("Unable to delete playlist.");
    }
}
