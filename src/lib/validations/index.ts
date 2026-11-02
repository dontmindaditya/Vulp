import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const slugSchema = z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const uploadRequestSchema = z.object({
    fileName: z.string().trim().min(1).max(180),
    contentType: z.string().min(1),
    fileSize: z.number().int().positive(),
    folder: z.enum(["audio", "artwork"]),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;