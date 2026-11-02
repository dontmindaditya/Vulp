import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createSignedDownloadUrl, deleteB2Object } from "@/lib/storage/b2";
import type { Track, TrackSourceType, UpdateTrackData } from "@/types/track";
import type { TrackOutput } from "../validators/track.schema";

export type { Track };

interface RawTrackRow {
    id: string;
    title: string;
    artist: string;
    audio_path: string | null;
    artwork_url: string | null;
    artwork_path: string | null;
    duration: number;
    source_type?: TrackSourceType;
    source_id?: string | null;
    source_url?: string | null;
    rights_status: "pending" | "authorized" | "rejected";
    rights_holder?: string | null;
    license_reference?: string | null;
    rights_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
    playlist_tracks?: Array<{
        playlist_id: string;
        position: number;
        playlists?: {
            id: string;
            slug: string;
            name: string;
            cover_url: string | null;
            cover_path: string | null;
        } | null;
    }> | {
        playlist_id: string;
        position: number;
        playlists?: {
            id: string;
            slug: string;
            name: string;
            cover_url: string | null;
            cover_path: string | null;
        } | null;
    } | null;
}

const TRACK_SELECT_FIELDS = `
    id,
    title,
    artist,
    audio_path,
    artwork_url,
    artwork_path,
    duration,
    source_type,
    source_id,
    source_url,
    rights_status,
    rights_holder,
    license_reference,
    rights_verified_at,
    created_at,
    updated_at
`;

async function mapTrackRow(
    row: RawTrackRow,
    fallbackSlug?: string
): Promise<Track> {
    const ptList = Array.isArray(row.playlist_tracks)
        ? row.playlist_tracks
        : row.playlist_tracks
        ? [row.playlist_tracks]
        : [];

    const primaryPt = ptList[0];
    const playlist = primaryPt?.playlists;
    const playlistSlug = playlist?.slug || fallbackSlug || "";
    const playlistName = playlist?.name || undefined;
    const playlistId = primaryPt?.playlist_id || undefined;
    const position = primaryPt?.position ?? 0;

    let audioUrl: string | null = null;
    if (row.audio_path) {
        try {
            audioUrl = await createSignedDownloadUrl(row.audio_path, 3600);
        } catch {
            audioUrl = row.audio_path.startsWith("/")
                ? row.audio_path
                : `/${row.audio_path}`;
        }
    }

    let artworkUrl: string | null = null;
    if (row.artwork_path) {
        try {
            artworkUrl = await createSignedDownloadUrl(row.artwork_path, 3600);
        } catch {
            artworkUrl = row.artwork_url || null;
        }
    } else if (row.artwork_url) {
        artworkUrl = row.artwork_url;
    } else if (playlist?.cover_path) {
        try {
            artworkUrl = await createSignedDownloadUrl(playlist.cover_path, 3600);
        } catch {
            artworkUrl = playlist.cover_url || "/images/cover.png";
        }
    } else if (playlist?.cover_url) {
        artworkUrl = playlist.cover_url;
    } else {
        artworkUrl = "/images/cover.png";
    }

    return {
        id: row.id,
        title: row.title,
        artist: row.artist,
        audioPath: row.audio_path ?? null,
        artworkPath: row.artwork_path ?? null,
        audioUrl,
        artworkUrl,
        duration: row.duration ?? 0,
        playlistSlug,
        playlistName,
        playlistId,
        playlistCount: ptList.length,
        sourceType: row.source_type || "upload",
        sourceId: row.source_id ?? null,
        sourceUrl: row.source_url ?? null,
        rightsStatus: row.rights_status,
        rightsHolder: row.rights_holder,
        licenseReference: row.license_reference,
        rightsVerifiedAt: row.rights_verified_at,
        position,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export async function getTracksByPlaylistSlug(
    playlistSlug: string
): Promise<Track[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("tracks")
        .select(`
            ${TRACK_SELECT_FIELDS},
            playlist_tracks!inner (
                playlist_id,
                position,
                playlists!inner (
                    id,
                    slug,
                    name,
                    cover_url,
                    cover_path
                )
            )
        `)
        .eq("playlist_tracks.playlists.slug", playlistSlug)
        .order("position", { referencedTable: "playlist_tracks", ascending: true });

    if (error || !data) {
        if (error) console.error("getTracksByPlaylistSlug error:", error.message);
        return [];
    }

    return Promise.all(
        (data as unknown as RawTrackRow[]).map((r) =>
            mapTrackRow(r, playlistSlug)
        )
    );
}

export async function getTracksByPlaylistId(
    playlistId: string
): Promise<Track[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("tracks")
        .select(`
            ${TRACK_SELECT_FIELDS},
            playlist_tracks!inner (
                playlist_id,
                position,
                playlists!inner (
                    id,
                    slug,
                    name,
                    cover_url,
                    cover_path
                )
            )
        `)
        .eq("playlist_tracks.playlist_id", playlistId)
        .order("position", { referencedTable: "playlist_tracks", ascending: true });

    if (error || !data) {
        if (error) console.error("getTracksByPlaylistId error:", error.message);
        return [];
    }

    return Promise.all(
        (data as unknown as RawTrackRow[]).map((r) => mapTrackRow(r))
    );
}

export async function getAllTracks(): Promise<Track[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("tracks")
        .select(`
            ${TRACK_SELECT_FIELDS},
            playlist_tracks (
                playlist_id,
                position,
                playlists (
                    id,
                    slug,
                    name,
                    cover_url,
                    cover_path
                )
            )
        `)
        .order("created_at", { ascending: false });

    if (error || !data) {
        if (error) console.error("getAllTracks error:", error.message);
        return [];
    }

    return Promise.all(
        (data as unknown as RawTrackRow[]).map((r) => mapTrackRow(r))
    );
}

export async function getTrackById(id: string): Promise<Track | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("tracks")
        .select(`
            ${TRACK_SELECT_FIELDS},
            playlist_tracks (
                playlist_id,
                position,
                playlists (
                    id,
                    slug,
                    name,
                    cover_url,
                    cover_path
                )
            )
        `)
        .eq("id", id)
        .maybeSingle();

    if (error || !data) {
        if (error) console.error("getTrackById error:", error.message);
        return null;
    }

    return mapTrackRow(data as unknown as RawTrackRow);
}

/**
 * Reusable track lookup by source identity (e.g. youtube video ID, spotify track ID).
 * Used for duplicate prevention before importing.
 */
export async function findTrackBySource(
    sourceType: TrackSourceType,
    sourceId: string
): Promise<Track | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("tracks")
        .select(`
            ${TRACK_SELECT_FIELDS},
            playlist_tracks (
                playlist_id,
                position,
                playlists (
                    id,
                    slug,
                    name,
                    cover_url,
                    cover_path
                )
            )
        `)
        .eq("source_type", sourceType)
        .eq("source_id", sourceId)
        .maybeSingle();

    if (error) {
        console.error("findTrackBySource database error:", error.message);
        throw new Error(`Database error looking up track by source: ${error.message}`);
    }

    if (!data) {
        return null;
    }

    return mapTrackRow(data as unknown as RawTrackRow);
}

/**
 * Reusable track lookup by URL.
 */
export async function findTrackBySourceUrl(
    sourceUrl: string
): Promise<Track | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("tracks")
        .select(`
            ${TRACK_SELECT_FIELDS},
            playlist_tracks (
                playlist_id,
                position,
                playlists (
                    id,
                    slug,
                    name,
                    cover_url,
                    cover_path
                )
            )
        `)
        .eq("source_url", sourceUrl)
        .maybeSingle();

    if (error) {
        console.error("findTrackBySourceUrl database error:", error.message);
        throw new Error(`Database error looking up track by URL: ${error.message}`);
    }

    if (!data) {
        return null;
    }

    return mapTrackRow(data as unknown as RawTrackRow);
}

export async function createTrack(input: TrackOutput) {
    const supabase = await createClient();

    const rightsStatus = input.rightsStatus || "pending";
    const rightsVerifiedAt =
        rightsStatus === "authorized" ? new Date().toISOString() : null;

    // 1. Insert into public.tracks
    const { data: track, error: trackError } = await supabase
        .from("tracks")
        .insert({
            title: input.title,
            artist: input.artist,
            audio_path: input.audioPath || null,
            artwork_path: input.artworkPath || null,
            artwork_url: input.artworkUrl || null,
            duration: input.duration || 0,
            source_type: input.sourceType || "upload",
            source_id: input.sourceId || null,
            source_url: input.sourceUrl || null,
            rights_status: rightsStatus,
            rights_holder: input.rightsHolder || null,
            license_reference: input.licenseReference || null,
            rights_verified_at: rightsVerifiedAt,
        })
        .select("id")
        .single();

    if (trackError || !track) {
        console.error("createTrack DB error:", trackError?.message);
        throw new Error(
            trackError?.code === "23505"
                ? "A track with this source or audio file already exists in the library."
                : "Unable to create track record."
        );
    }

    // 2. Determine position in playlist
    let position = input.position;
    if (!position || position <= 0) {
        const { count } = await supabase
            .from("playlist_tracks")
            .select("id", { count: "exact", head: true })
            .eq("playlist_id", input.playlistId);

        position = (count ?? 0) + 1;
    }

    // 3. Link to playlist_tracks with rollback on error
    const { error: linkError } = await supabase
        .from("playlist_tracks")
        .insert({
            playlist_id: input.playlistId,
            track_id: track.id,
            position,
        });

    if (linkError) {
        console.error("Link track error, rolling back track insert:", linkError.message);
        await supabase.from("tracks").delete().eq("id", track.id);
        throw new Error("Failed to link track to playlist. Rolled back changes.");
    }

    return track;
}

export async function updateTrack(id: string, input: UpdateTrackData) {
    const supabase = await createClient();

    const updates: Record<string, unknown> = {};
    if (input.title !== undefined) updates.title = input.title;
    if (input.artist !== undefined) updates.artist = input.artist;
    if (input.sourceType !== undefined) updates.source_type = input.sourceType;
    if (input.sourceId !== undefined) updates.source_id = input.sourceId || null;
    if (input.sourceUrl !== undefined) updates.source_url = input.sourceUrl || null;
    if (input.rightsHolder !== undefined) updates.rights_holder = input.rightsHolder || null;
    if (input.licenseReference !== undefined) updates.license_reference = input.licenseReference || null;
    if (input.rightsStatus !== undefined) {
        updates.rights_status = input.rightsStatus;
        updates.rights_verified_at =
            input.rightsStatus === "authorized" ? new Date().toISOString() : null;
    }

    const { error } = await supabase
        .from("tracks")
        .update(updates)
        .eq("id", id);

    if (error) {
        console.error("updateTrack error:", error.message);
        throw new Error("Unable to update track details.");
    }
}

export async function updateTrackRights(
    id: string,
    rightsStatus: "pending" | "authorized" | "rejected"
) {
    const supabase = await createClient();

    const rightsVerifiedAt =
        rightsStatus === "authorized" ? new Date().toISOString() : null;

    const { error } = await supabase
        .from("tracks")
        .update({
            rights_status: rightsStatus,
            rights_verified_at: rightsVerifiedAt,
        })
        .eq("id", id);

    if (error) {
        console.error("updateTrackRights error:", error.message);
        throw new Error("Unable to update track rights status.");
    }
}

export async function addTrackToPlaylist(
    playlistId: string,
    trackId: string,
    position?: number
) {
    const supabase = await createClient();

    let targetPosition = position;
    if (!targetPosition || targetPosition <= 0) {
        const { count } = await supabase
            .from("playlist_tracks")
            .select("id", { count: "exact", head: true })
            .eq("playlist_id", playlistId);

        targetPosition = (count ?? 0) + 1;
    }

    const { error } = await supabase
        .from("playlist_tracks")
        .insert({
            playlist_id: playlistId,
            track_id: trackId,
            position: targetPosition,
        });

    if (error) {
        console.error("addTrackToPlaylist error:", error.message);
        throw new Error(
            error.code === "23505"
                ? "This track is already in the playlist."
                : "Unable to add track to playlist."
        );
    }
}

export async function removeTrackFromPlaylist(
    playlistId: string,
    trackId: string
) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("playlist_tracks")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("track_id", trackId);

    if (error) {
        console.error("removeTrackFromPlaylist error:", error.message);
        throw new Error("Unable to remove track from playlist.");
    }
}

export async function deleteTrack(id: string) {
    const supabase = await createClient();

    // 1. Fetch track data to get audio and artwork paths
    const { data: track, error: fetchError } = await supabase
        .from("tracks")
        .select("audio_path, artwork_path")
        .eq("id", id)
        .maybeSingle();

    if (fetchError || !track) {
        console.error("deleteTrack fetch error:", fetchError?.message);
        throw new Error("Track not found.");
    }

    // 2. Check whether this track is still associated with other playlists
    const { count: playlistCount, error: countError } = await supabase
        .from("playlist_tracks")
        .select("id", { count: "exact", head: true })
        .eq("track_id", id);

    if (countError) {
        console.error("deleteTrack count error:", countError.message);
        throw new Error("Unable to check track playlist associations.");
    }

    if ((playlistCount ?? 0) > 0) {
        throw new Error(
            `This track is still associated with ${playlistCount} ${
                playlistCount === 1 ? "playlist" : "playlists"
            }. Remove it from the playlist first before deleting it permanently.`
        );
    }

    // 3. Delete track record from database
    const { error: deleteError } = await supabase
        .from("tracks")
        .delete()
        .eq("id", id);

    if (deleteError) {
        console.error("deleteTrack error:", deleteError.message);
        throw new Error("Unable to delete track record.");
    }

    // 4. Check whether audio or artwork files are shared by any other track before deleting from B2
    if (track.audio_path && track.audio_path.startsWith("audio/")) {
        const { count: sharedAudioCount } = await supabase
            .from("tracks")
            .select("id", { count: "exact", head: true })
            .eq("audio_path", track.audio_path);

        if (!sharedAudioCount || sharedAudioCount === 0) {
            try {
                await deleteB2Object(track.audio_path);
            } catch (err) {
                console.warn("deleteTrack audio B2 cleanup error:", err);
            }
        }
    }

    if (track.artwork_path && track.artwork_path.startsWith("artwork/")) {
        const { count: sharedArtworkCount } = await supabase
            .from("tracks")
            .select("id", { count: "exact", head: true })
            .eq("artwork_path", track.artwork_path);

        if (!sharedArtworkCount || sharedArtworkCount === 0) {
            try {
                await deleteB2Object(track.artwork_path);
            } catch (err) {
                console.warn("deleteTrack artwork B2 cleanup error:", err);
            }
        }
    }
}
