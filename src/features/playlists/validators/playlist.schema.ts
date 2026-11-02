import { z } from "zod";

const coverPathSchema = z
    .string()
    .regex(
        /^artwork\/[a-zA-Z0-9._-]+$/,
        "Invalid artwork object key."
    )
    .optional()
    .or(z.literal(""));

export const playlistSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Playlist name must contain at least 2 characters.")
        .max(60, "Playlist name cannot exceed 60 characters."),

    slug: z
        .string()
        .trim()
        .min(2, "Slug must contain at least 2 characters.")
        .max(80)
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Use lowercase letters, numbers and hyphens."
        ),

    description: z
        .string()
        .trim()
        .max(200, "Description cannot exceed 200 characters.")
        .optional()
        .default(""),

    coverPath: coverPathSchema,

    coverUrl: z.string().optional().or(z.literal("")),

    isPublished: z.boolean().default(false),
});

export const updatePlaylistSchema = z.object({
    id: z.string().uuid(),
    input: playlistSchema,
});

export const playlistStatusSchema = z.object({
    id: z.string().uuid(),
    isPublished: z.boolean(),
});

export const deletePlaylistSchema = z.object({
    id: z.string().uuid(),
});

export type PlaylistInput = z.infer<typeof playlistSchema>;
