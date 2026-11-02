"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/features/auth/services/auth.service";
import { objectExists } from "@/lib/storage/b2";
import {
    trackSchema,
    updateTrackSchema,
    updateTrackRightsSchema,
    playlistTrackSchema,
    removePlaylistTrackSchema,
    deleteTrackSchema,
    type TrackInput,
    type UpdateTrackInput,
    type UpdateTrackRightsInput,
    type PlaylistTrackInput,
    type RemovePlaylistTrackInput,
} from "../validators/track.schema";
import {
    createTrack,
    updateTrack,
    updateTrackRights,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    deleteTrack,
    findTrackBySource,
} from "../services/track.service";
import { detectTrackSource } from "../services/source-detector";

async function authorizeAdmin() {
    const admin = await getAdminUser();
    return Boolean(admin);
}

function refreshAllTrackPaths(playlistId?: string) {
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/tracks");
    revalidatePath("/admin/playlists");
    if (playlistId) {
        revalidatePath(`/admin/playlists/${playlistId}`);
    }
}

export async function createTrackAction(input: TrackInput) {
    if (!(await authorizeAdmin())) {
        return { success: false, message: "Unauthorized. Admin session required." };
    }

    const validation = trackSchema.safeParse(input);

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid track information.",
            errors: validation.error.flatten().fieldErrors,
        };
    }

    // Storage verification
    try {
        if (validation.data.audioPath) {
            const audioInStorage = await objectExists(validation.data.audioPath);
            if (!audioInStorage) {
                return {
                    success: false,
                    message: "The uploaded audio file could not be verified in storage.",
                };
            }
        }

        if (validation.data.artworkPath) {
            const artworkInStorage = await objectExists(validation.data.artworkPath);
            if (!artworkInStorage) {
                return {
                    success: false,
                    message: "The uploaded artwork could not be verified in storage.",
                };
            }
        }
    } catch (storageErr) {
        console.error("Storage verification error:", storageErr);
        return {
            success: false,
            message: "Failed to verify storage files. Please retry the upload.",
        };
    }

    try {
        const track = await createTrack(validation.data);
        refreshAllTrackPaths(validation.data.playlistId);

        return {
            success: true,
            message: "Track created successfully.",
            trackId: track.id,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unable to create track.",
        };
    }
}

export async function updateTrackAction(input: UpdateTrackInput) {
    if (!(await authorizeAdmin())) {
        return { success: false, message: "Unauthorized." };
    }

    const validation = updateTrackSchema.safeParse(input);

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid track data.",
            errors: validation.error.flatten().fieldErrors,
        };
    }

    try {
        const { id, ...data } = validation.data;
        await updateTrack(id, data);
        refreshAllTrackPaths();

        return {
            success: true,
            message: "Track updated successfully.",
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unable to update track.",
        };
    }
}

export async function updateTrackRightsAction(input: UpdateTrackRightsInput) {
    if (!(await authorizeAdmin())) {
        return { success: false, message: "Unauthorized." };
    }

    const validation = updateTrackRightsSchema.safeParse(input);

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid rights status.",
        };
    }

    try {
        await updateTrackRights(validation.data.id, validation.data.rightsStatus);
        refreshAllTrackPaths();

        return {
            success: true,
            message: `Track rights updated to ${validation.data.rightsStatus}.`,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unable to change rights.",
        };
    }
}

export async function addTrackToPlaylistAction(input: PlaylistTrackInput) {
    if (!(await authorizeAdmin())) {
        return { success: false, message: "Unauthorized." };
    }

    const validation = playlistTrackSchema.safeParse(input);

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid playlist or track selection.",
        };
    }

    try {
        await addTrackToPlaylist(
            validation.data.playlistId,
            validation.data.trackId,
            validation.data.position
        );
        refreshAllTrackPaths(validation.data.playlistId);

        return {
            success: true,
            message: "Track added to playlist.",
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unable to add track to playlist.",
        };
    }
}

export async function removeTrackFromPlaylistAction(input: RemovePlaylistTrackInput) {
    if (!(await authorizeAdmin())) {
        return { success: false, message: "Unauthorized." };
    }

    const validation = removePlaylistTrackSchema.safeParse(input);

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid playlist or track specification.",
        };
    }

    try {
        await removeTrackFromPlaylist(
            validation.data.playlistId,
            validation.data.trackId
        );
        refreshAllTrackPaths(validation.data.playlistId);

        return {
            success: true,
            message: "Track removed from playlist.",
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unable to remove track.",
        };
    }
}

export async function deleteTrackAction(id: string) {
    if (!(await authorizeAdmin())) {
        return { success: false, message: "Unauthorized." };
    }

    const validation = deleteTrackSchema.safeParse({ id });

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid track ID.",
        };
    }

    try {
        await deleteTrack(validation.data.id);
        refreshAllTrackPaths();

        return {
            success: true,
            message: "Track permanently deleted.",
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unable to delete track.",
        };
    }
}

export async function importTrackAction(input: {
    url: string;
    playlistId: string;
}) {
    if (!(await authorizeAdmin())) {
        return {
            success: false,
            message: "Unauthorized. Admin session required.",
        };
    }

    if (
        typeof input.url !== "string" ||
        input.url.length > 2048 ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            input.playlistId
        )
    ) {
        return {
            success: false,
            message: "Invalid URL or playlist selection.",
        };
    }

    try {
        // 1. Detect the source
        const source = detectTrackSource(input.url);

        // 2. Search for an existing track
        const existingTrack = await findTrackBySource(
            source.sourceType,
            source.sourceId
        );

        // 3. Reuse an existing track
        if (existingTrack) {
            try {
                await addTrackToPlaylist(
                    input.playlistId,
                    existingTrack.id
                );
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.message.includes("already in the playlist")
                ) {
                    return {
                        success: true,
                        status: "already_exists",
                        message: "This track is already in the selected playlist.",
                        trackId: existingTrack.id,
                    };
                }

                throw error;
            }

            refreshAllTrackPaths(input.playlistId);

            return {
                success: true,
                status: "reused",
                message: "Existing track added to the playlist.",
                trackId: existingTrack.id,
            };
        }

        // 4. New source: metadata import comes next
        return {
            success: true,
            status: "new_source",
            message: "New source detected. Metadata import is required.",
            source,
        };

    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to process this link.",
        };
    }
}
