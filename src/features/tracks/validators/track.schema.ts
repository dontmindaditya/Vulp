import { z } from "zod";

const audioPathSchema = z
    .string()
    .regex(/^audio\/[a-zA-Z0-9._-]+$/, "Invalid audio storage key.");

const artworkPathSchema = z
    .string()
    .regex(/^artwork\/[a-zA-Z0-9._-]+$/, "Invalid artwork storage key.")
    .optional()
    .or(z.literal(""));

export const trackSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(1, "Track title is required.")
            .max(120, "Track title cannot exceed 120 characters."),

        artist: z
            .string()
            .trim()
            .min(1, "Artist name is required.")
            .max(120, "Artist name cannot exceed 120 characters."),

        // Audio path in B2 (optional for streaming / embedded sources)
        audioPath: audioPathSchema.optional().or(z.literal("")).nullable(),

        artworkPath: artworkPathSchema,

        artworkUrl: z.string().optional().or(z.literal("")),

        // Source tracking & duplicate detection
        sourceType: z
            .enum(["upload", "youtube", "spotify", "direct_url"])
            .default("upload"),

        sourceId: z.string().trim().optional().or(z.literal("")).nullable(),

        sourceUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),

        duration: z.number().int().nonnegative().optional().default(0),

        playlistId: z.string().uuid("Please select a valid playlist."),

        position: z.number().int().nonnegative().optional().default(0),

        // Default to pending for strict rights compliance
        rightsStatus: z
            .enum(["pending", "authorized", "rejected"])
            .default("pending"),

        rightsHolder: z.string().trim().max(120).optional().or(z.literal("")),

        licenseReference: z.string().trim().max(200).optional().or(z.literal("")),
    })
    .refine(
        (data) => Boolean(data.audioPath?.trim() || data.sourceUrl?.trim()),
        {
            message: "A track must have either an uploaded audio file or a source link.",
            path: ["audioPath"],
        }
    );

export const updateTrackSchema = z.object({
    id: z.string().uuid(),
    title: z
        .string()
        .trim()
        .min(1, "Track title is required.")
        .max(120)
        .optional(),
    artist: z
        .string()
        .trim()
        .min(1, "Artist name is required.")
        .max(120)
        .optional(),
    sourceType: z
        .enum(["upload", "youtube", "spotify", "direct_url"])
        .optional(),
    sourceId: z.string().trim().optional().or(z.literal("")).nullable(),
    sourceUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),
    rightsStatus: z
        .enum(["pending", "authorized", "rejected"])
        .optional(),
    rightsHolder: z.string().trim().max(120).optional().or(z.literal("")),
    licenseReference: z.string().trim().max(200).optional().or(z.literal("")),
});

export const updateTrackRightsSchema = z.object({
    id: z.string().uuid(),
    rightsStatus: z.enum(["pending", "authorized", "rejected"]),
});

export const playlistTrackSchema = z.object({
    playlistId: z.string().uuid("Invalid playlist ID."),
    trackId: z.string().uuid("Invalid track ID."),
    position: z.number().int().nonnegative().optional(),
});

export const removePlaylistTrackSchema = z.object({
    playlistId: z.string().uuid("Invalid playlist ID."),
    trackId: z.string().uuid("Invalid track ID."),
});

export const deleteTrackSchema = z.object({
    id: z.string().uuid(),
});

export type TrackInput = z.input<typeof trackSchema>;
export type TrackOutput = z.output<typeof trackSchema>;
export type UpdateTrackInput = z.infer<typeof updateTrackSchema>;
export type UpdateTrackRightsInput = z.infer<typeof updateTrackRightsSchema>;
export type PlaylistTrackInput = z.infer<typeof playlistTrackSchema>;
export type RemovePlaylistTrackInput = z.infer<typeof removePlaylistTrackSchema>;
