export function cn(
    ...classes: Array<string | false | null | undefined>
) {
    return classes.filter(Boolean).join(" ");
}

export function formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function createSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function isValidAudioType(contentType: string): boolean {
    return [
        "audio/mpeg",
        "audio/mp4",
        "audio/aac",
        "audio/ogg",
        "audio/wav",
        "audio/flac",
    ].includes(contentType);
}

export function isValidImageType(contentType: string): boolean {
    return [
        "image/jpeg",
        "image/png",
        "image/webp",
    ].includes(contentType);
}