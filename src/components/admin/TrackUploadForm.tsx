"use client";

import { useState } from "react";
import { UploadCloud, Sparkles } from "lucide-react";
import type { Playlist } from "@/types/playlist";
import { createTrackAction, importTrackAction } from "@/features/tracks/actions/track.actions";

interface TrackUploadFormProps {
    playlists: Playlist[];
    defaultPlaylistId?: string;
    onSuccess?: (trackId: string) => void;
    onCancel?: () => void;
}

export default function TrackUploadForm({
    playlists,
    defaultPlaylistId,
    onSuccess,
    onCancel,
}: TrackUploadFormProps) {
    const [inputMode, setInputMode] = useState<"upload" | "link">("upload");
    const [sourceUrl, setSourceUrl] = useState("");
    const [importMessage, setImportMessage] = useState<string | null>(null);

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioPath, setAudioPath] = useState("");
    const [duration, setDuration] = useState(0);
    const [audioUploading, setAudioUploading] = useState(false);

    const [artworkPath, setArtworkPath] = useState("");
    const [artworkUploading, setArtworkUploading] = useState(false);

    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(
        defaultPlaylistId || playlists[0]?.id || ""
    );

    // Default rights to "pending" for strict rights compliance
    const [rightsStatus, setRightsStatus] = useState<"pending" | "authorized" | "rejected">(
        "pending"
    );
    const [rightsHolder, setRightsHolder] = useState("");
    const [licenseReference, setLicenseReference] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setAudioUploading(true);
        setAudioFile(file);

        // Derive title from filename if not yet filled
        const cleanName = file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]/g, " ")
            .trim();
        if (!title) {
            setTitle(cleanName);
        }

        // Calculate audio duration in browser
        try {
            const objectUrl = URL.createObjectURL(file);
            const tempAudio = new Audio(objectUrl);
            tempAudio.addEventListener("loadedmetadata", () => {
                if (tempAudio.duration && !isNaN(tempAudio.duration)) {
                    setDuration(Math.round(tempAudio.duration));
                }
                URL.revokeObjectURL(objectUrl);
            });
        } catch {
            // Best effort
        }

        const contentType = file.type && file.type.trim() ? file.type : "audio/mpeg";

        try {
            // 1. Get presigned upload URL
            const res = await fetch("/api/uploads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    kind: "audio",
                    fileName: file.name,
                    contentType,
                    fileSize: file.size,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to authorize audio upload.");
            }

            // 2. Direct upload to B2
            const uploadRes = await fetch(data.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": contentType },
                body: file,
            });

            if (!uploadRes.ok) {
                throw new Error(`Storage upload failed (Status ${uploadRes.status}).`);
            }

            setAudioPath(data.objectKey);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Audio upload failed.");
            setAudioFile(null);
        } finally {
            setAudioUploading(false);
        }
    };

    const handleArtworkSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setArtworkUploading(true);

        const contentType = file.type && file.type.trim() ? file.type : "image/jpeg";

        try {
            const res = await fetch("/api/uploads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    kind: "artwork",
                    fileName: file.name,
                    contentType,
                    fileSize: file.size,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to authorize artwork upload.");
            }

            const uploadRes = await fetch(data.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": contentType },
                body: file,
            });

            if (!uploadRes.ok) {
                throw new Error("Failed to upload artwork to storage.");
            }

            setArtworkPath(data.objectKey);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Artwork upload failed.");
        } finally {
            setArtworkUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPlaylistId) {
            setError("Please choose a target playlist.");
            return;
        }

        if (inputMode === "link") {
            if (!sourceUrl.trim()) {
                setError("Please paste a YouTube, Spotify, or direct audio URL.");
                return;
            }

            setError(null);
            setImportMessage(null);
            setSubmitting(true);

            try {
                const result = await importTrackAction({
                    url: sourceUrl.trim(),
                    playlistId: selectedPlaylistId,
                });

                if (!result.success) {
                    throw new Error(result.message || "Unable to process this link.");
                }

                if (result.status === "reused" || result.status === "already_exists") {
                    setImportMessage(result.message);
                    if (result.trackId) onSuccess?.(result.trackId);
                    return;
                }

                setImportMessage(
                    "Link recognized successfully. This is a new source; metadata import is the next step."
                );
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Unable to process this link.");
            } finally {
                setSubmitting(false);
            }
            return;
        }

        if (!audioPath) {
            setError("Please upload an audio file first.");
            return;
        }
        if (!selectedPlaylistId) {
            setError("Please choose a target playlist.");
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            const res = await createTrackAction({
                title,
                artist: artist || "Unknown Artist",
                audioPath,
                artworkPath: artworkPath || undefined,
                duration,
                playlistId: selectedPlaylistId,
                rightsStatus,
                rightsHolder: rightsHolder || undefined,
                licenseReference: licenseReference || undefined,
            });

            if (!res.success) {
                throw new Error(res.message || "Could not create track.");
            }

            onSuccess?.(res.trackId!);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error creating track.");
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
            }}
        >
            {/* Input mode switch */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "4px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(225,220,205,0.12)" }}>
                {(["upload", "link"] as const).map((mode) => (
                    <button
                        key={mode}
                        type="button"
                        onClick={() => {
                            setInputMode(mode);
                            setError(null);
                            setImportMessage(null);
                        }}
                        style={{
                            padding: "9px 10px",
                            border: "none",
                            borderRadius: "9px",
                            background: inputMode === mode ? "rgba(225,220,205,0.14)" : "transparent",
                            color: inputMode === mode ? "#f2eee9" : "rgba(225,220,205,0.55)",
                            fontSize: "12px",
                            fontFamily: "'JetBrains Mono', monospace",
                            cursor: "pointer",
                        }}
                    >
                        {mode === "upload" ? "Upload file" : "Import link"}
                    </button>
                ))}
            </div>

            {inputMode === "link" ? (
                <div>
                    <label style={{
                        display: "block",
                        fontSize: "11px",
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: "0.8px",
                        color: "rgba(225, 220, 205, 0.7)",
                        marginBottom: "5px",
                    }}>
                        YOUTUBE / SPOTIFY / DIRECT AUDIO URL *
                    </label>
                    <input
                        type="url"
                        required
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="Paste a YouTube, Spotify, or audio URL..."
                        style={{
                            width: "100%",
                            backgroundColor: "rgba(10, 10, 14, 0.75)",
                            border: "1.5px solid rgba(225, 220, 205, 0.35)",
                            borderRadius: "12px",
                            padding: "11px 12px",
                            fontSize: "13px",
                            color: "#f2eee9",
                            outline: "none",
                            boxSizing: "border-box",
                        }}
                    />
                    <p style={{ fontSize: "11px", color: "rgba(225,220,205,0.45)", margin: "7px 0 0" }}>
                        VULP will identify the source and check your library for duplicates.
                    </p>
                </div>
            ) : (
                <>
                    {/* Audio File Input */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "11px",
                                fontFamily: "'JetBrains Mono', monospace",
                                letterSpacing: "0.8px",
                                color: "rgba(225, 220, 205, 0.7)",
                                marginBottom: "5px",
                            }}
                        >
                            AUDIO FILE (MP3, WAV, FLAC, AAC) *
                        </label>
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                padding: "12px",
                                borderRadius: "12px",
                                border: audioPath
                                    ? "1.5px solid #86efac"
                                    : "1.5px dashed rgba(225, 220, 205, 0.3)",
                                backgroundColor: "rgba(255, 255, 255, 0.04)",
                                cursor: audioUploading ? "wait" : "pointer",
                                fontSize: "12px",
                                fontFamily: "'JetBrains Mono', monospace",
                                color: audioPath ? "#86efac" : "#f2eee9",
                                textAlign: "center",
                            }}
                        >
                            <UploadCloud size={16} />
                            {audioUploading
                                ? "Uploading to B2 storage..."
                                : audioPath
                                    ? `✓ Ready: ${audioFile?.name || "Uploaded"}`
                                    : "Select and upload audio file"}
                            <input
                                type="file"
                                accept="audio/*"
                                disabled={audioUploading}
                                onChange={handleAudioSelect}
                                style={{ display: "none" }}
                            />
                        </label>
                    </div>

                    {/* Title & Artist */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "11px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    letterSpacing: "0.8px",
                                    color: "rgba(225, 220, 205, 0.7)",
                                    marginBottom: "5px",
                                }}
                            >
                                TRACK TITLE *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Midnight Reverie"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{
                                    width: "100%",
                                    backgroundColor: "rgba(10, 10, 14, 0.75)",
                                    border: "1.5px solid rgba(225, 220, 205, 0.35)",
                                    borderRadius: "12px",
                                    padding: "9px 12px",
                                    fontSize: "13px",
                                    color: "#f2eee9",
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "11px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    letterSpacing: "0.8px",
                                    color: "rgba(225, 220, 205, 0.7)",
                                    marginBottom: "5px",
                                }}
                            >
                                ARTIST *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. bow tie"
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                style={{
                                    width: "100%",
                                    backgroundColor: "rgba(10, 10, 14, 0.75)",
                                    border: "1.5px solid rgba(225, 220, 205, 0.35)",
                                    borderRadius: "12px",
                                    padding: "9px 12px",
                                    fontSize: "13px",
                                    color: "#f2eee9",
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                    </div>

                </>
            )}

            {/* Target Playlist */}
            <div>
                <label
                    style={{
                        display: "block",
                        fontSize: "11px",
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: "0.8px",
                        color: "rgba(225, 220, 205, 0.7)",
                        marginBottom: "5px",
                    }}
                >
                    INITIAL PLAYLIST *
                </label>
                <select
                    value={selectedPlaylistId}
                    onChange={(e) => setSelectedPlaylistId(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        backgroundColor: "rgba(10, 10, 14, 0.85)",
                        border: "1.5px solid rgba(225, 220, 205, 0.35)",
                        borderRadius: "12px",
                        padding: "9px 12px",
                        fontSize: "13px",
                        color: "#f2eee9",
                        outline: "none",
                        boxSizing: "border-box",
                    }}
                >
                    {playlists.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name} ({p.slug})
                        </option>
                    ))}
                </select>
            </div>

            {inputMode === "upload" && (
                <>
                    {/* Optional Custom Artwork */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "11px",
                                fontFamily: "'JetBrains Mono', monospace",
                                letterSpacing: "0.8px",
                                color: "rgba(225, 220, 205, 0.7)",
                                marginBottom: "5px",
                            }}
                        >
                            CUSTOM TRACK ARTWORK (OPTIONAL)
                        </label>
                        <label
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "7px 12px",
                                borderRadius: "10px",
                                border: "1px solid rgba(225, 220, 205, 0.3)",
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                fontSize: "11px",
                                fontFamily: "'JetBrains Mono', monospace",
                                cursor: artworkUploading ? "wait" : "pointer",
                                color: artworkPath ? "#86efac" : "#cfc9bc",
                            }}
                        >
                            <Sparkles size={12} />
                            {artworkUploading
                                ? "Uploading artwork..."
                                : artworkPath
                                    ? "✓ Custom Artwork Uploaded"
                                    : "Upload track artwork"}
                            <input
                                type="file"
                                accept="image/*"
                                disabled={artworkUploading}
                                onChange={handleArtworkSelect}
                                style={{ display: "none" }}
                            />
                        </label>
                    </div>

                    {/* Rights & Licensing Section */}
                    <div
                        style={{
                            padding: "10px 12px",
                            borderRadius: "12px",
                            border: "1px solid rgba(225, 220, 205, 0.15)",
                            backgroundColor: "rgba(10, 10, 14, 0.5)",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "11px",
                                fontFamily: "'JetBrains Mono', monospace",
                                color: "rgba(225, 220, 205, 0.7)",
                                margin: "0 0 8px 0",
                                textTransform: "uppercase",
                            }}
                        >
                            Rights Verification
                        </p>

                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "12px",
                                color: "#f2eee9",
                                cursor: "pointer",
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={rightsStatus === "authorized"}
                                onChange={(e) =>
                                    setRightsStatus(e.target.checked ? "authorized" : "pending")
                                }
                                style={{ accentColor: "#86efac" }}
                            />
                            <span>Authorize for immediate public streaming</span>
                        </label>

                        <p
                            style={{
                                fontSize: "11px",
                                color: "rgba(225, 220, 205, 0.45)",
                                margin: "4px 0 10px 24px",
                            }}
                        >
                            {rightsStatus === "authorized"
                                ? "Track will be visible and playable on public playlist pages immediately."
                                : "Track will default to pending rights (safe mode until explicitly approved)."}
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "10px",
                                        fontFamily: "'JetBrains Mono', monospace",
                                        color: "rgba(225, 220, 205, 0.6)",
                                        marginBottom: "3px",
                                    }}
                                >
                                    RIGHTS HOLDER (OPTIONAL)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Label / Artist"
                                    value={rightsHolder}
                                    onChange={(e) => setRightsHolder(e.target.value)}
                                    style={{
                                        width: "100%",
                                        backgroundColor: "rgba(10, 10, 14, 0.75)",
                                        border: "1px solid rgba(225, 220, 205, 0.25)",
                                        borderRadius: "8px",
                                        padding: "6px 8px",
                                        fontSize: "11px",
                                        color: "#f2eee9",
                                        outline: "none",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "10px",
                                        fontFamily: "'JetBrains Mono', monospace",
                                        color: "rgba(225, 220, 205, 0.6)",
                                        marginBottom: "3px",
                                    }}
                                >
                                    LICENSE REFERENCE (OPTIONAL)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. CC-BY 4.0 / Direct"
                                    value={licenseReference}
                                    onChange={(e) => setLicenseReference(e.target.value)}
                                    style={{
                                        width: "100%",
                                        backgroundColor: "rgba(10, 10, 14, 0.75)",
                                        border: "1px solid rgba(225, 220, 205, 0.25)",
                                        borderRadius: "8px",
                                        padding: "6px 8px",
                                        fontSize: "11px",
                                        color: "#f2eee9",
                                        outline: "none",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                </>
            )}

            {importMessage && (
                <div style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(134, 239, 172, 0.08)",
                    border: "1px solid rgba(134, 239, 172, 0.25)",
                    fontSize: "12px",
                    color: "#bbf7d0",
                    textAlign: "center",
                }}>
                    {importMessage}
                </div>
            )}

            {error && (
                <div
                    style={{
                        padding: "8px 12px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        fontSize: "12px",
                        color: "#fca5a5",
                        textAlign: "center",
                    }}
                >
                    {error}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: "11px",
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                            color: "#cfc9bc",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "13px",
                            fontFamily: "'JetBrains Mono', monospace",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="submit"
                    disabled={submitting || audioUploading || artworkUploading || (inputMode === "upload" && !audioPath)}
                    style={{
                        flex: 2,
                        padding: "11px",
                        backgroundColor:
                            submitting || audioUploading || artworkUploading || (inputMode === "upload" && !audioPath)
                                ? "rgba(242, 238, 233, 0.5)"
                                : "#f2eee9",
                        color: "#0a0a0e",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: 600,
                        fontFamily: "'JetBrains Mono', monospace",
                        cursor:
                            submitting || audioUploading || artworkUploading || (inputMode === "upload" && !audioPath)
                                ? "not-allowed"
                                : "pointer",
                    }}
                >
                    {submitting
                        ? inputMode === "link" ? "Checking link..." : "Adding Track..."
                        : inputMode === "link" ? "Check link" : "Add Track to Library"}
                </button>
            </div>
        </form>
    );
}
