"use server";

import { revalidatePath } from "next/cache";

import { getAdminUser } from "@/features/auth/services/auth.service";

import {
    playlistSchema,
    updatePlaylistSchema,
    playlistStatusSchema,
    deletePlaylistSchema,
    type PlaylistInput,
} from "../validators/playlist.schema";

import {
    createPlaylist,
    updatePlaylist,
    setPlaylistPublished,
    deletePlaylist,
} from "../services/playlist.service";

async function authorizeAdmin() {
    const admin = await getAdminUser();

    if (!admin) {
        return false;
    }

    return true;
}

function refreshPlaylistPages() {
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/playlists");
    revalidatePath("/admin/tracks");
}

export async function createPlaylistAction(input: PlaylistInput) {
    if (!(await authorizeAdmin())) {
        return { success: false, message: "Unauthorized." };
    }

    const validation = playlistSchema.safeParse(input);

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid playlist information.",
            errors: validation.error.flatten().fieldErrors,
        };
    }

    try {
        const playlist = await createPlaylist(validation.data);

        refreshPlaylistPages();

        return {
            success: true,
            message: "Playlist created successfully.",
            playlistId: playlist.id,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error
                ? error.message
                : "Unable to create playlist.",
        };
    }
}

export async function updatePlaylistAction(
    id: string,
    input: PlaylistInput
) {
    if (!(await authorizeAdmin())) {
        return { success: false, message: "Unauthorized." };
    }

    const validation = updatePlaylistSchema.safeParse({ id, input });

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid playlist information.",
            errors: validation.error.flatten().fieldErrors,
        };
    }

    try {
        await updatePlaylist(id, validation.data.input);

        refreshPlaylistPages();
        revalidatePath(`/admin/playlists/${id}`);

        return {
            success: true,
            message: "Playlist updated successfully.",
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error
                ? error.message
                : "Unable to update playlist.",
        };
    }
}

export async function setPlaylistPublishedAction(
    id: string,
    isPublished: boolean
) {
    if (!(await authorizeAdmin())) {
        return { success: false, message: "Unauthorized." };
    }

    const validation = playlistStatusSchema.safeParse({
        id,
        isPublished,
    });

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid publication details.",
        };
    }

    try {
        await setPlaylistPublished(id, isPublished);

        refreshPlaylistPages();

        return {
            success: true,
            message: isPublished
                ? "Playlist published."
                : "Playlist unpublished.",
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error
                ? error.message
                : "Unable to change publication status.",
        };
    }
}

export async function deletePlaylistAction(id: string) {
    if (!(await authorizeAdmin())) {
        return { success: false, message: "Unauthorized." };
    }

    const validation = deletePlaylistSchema.safeParse({ id });

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid playlist ID.",
        };
    }

    try {
        await deletePlaylist(id);

        refreshPlaylistPages();

        return {
            success: true,
            message: "Playlist deleted successfully.",
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error
                ? error.message
                : "Unable to delete playlist.",
        };
    }
}
