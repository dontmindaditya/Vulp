import {
    createObjectKey,
    createPresignedUploadUrl,
} from "@/lib/storage/b2";

export interface UploadRequest {
    fileName: string;
    contentType: string;
    fileSize: number;
}

export type UploadFolder = "audio" | "artwork";

const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_AUDIO_TYPES = [
    "audio/mpeg",
    "audio/mp4",
    "audio/aac",
    "audio/ogg",
    "audio/wav",
    "audio/flac",
];

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

export function validateAudioUpload(file: UploadRequest) {
    if (!ALLOWED_AUDIO_TYPES.includes(file.contentType)) {
        throw new Error("Unsupported audio format.");
    }

    if (
        !Number.isSafeInteger(file.fileSize) ||
        file.fileSize <= 0 ||
        file.fileSize > MAX_AUDIO_SIZE
    ) {
        throw new Error("Audio file must be smaller than 100 MB.");
    }
}

export function validateArtworkUpload(file: UploadRequest) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.contentType)) {
        throw new Error("Unsupported image format.");
    }

    if (
        !Number.isSafeInteger(file.fileSize) ||
        file.fileSize <= 0 ||
        file.fileSize > MAX_IMAGE_SIZE
    ) {
        throw new Error("Artwork must be smaller than 10 MB.");
    }
}

export async function createUploadUrl(
    folder: UploadFolder,
    file: UploadRequest
) {
    if (
        !file.fileName ||
        file.fileName.length > 180 ||
        file.fileName.includes("/") ||
        file.fileName.includes("\\")
    ) {
        throw new Error("Invalid file name.");
    }

    if (folder === "audio") {
        validateAudioUpload(file);
    } else {
        validateArtworkUpload(file);
    }

    const objectKey = createObjectKey(folder, file.fileName);

    return createPresignedUploadUrl(objectKey, file.contentType);
}
