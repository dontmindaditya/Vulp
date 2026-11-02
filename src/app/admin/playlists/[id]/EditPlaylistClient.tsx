"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Image as ImageIcon, Check, Trash2 } from "lucide-react";
import MoonHeader from "@/components/ui/MoonHeader";
import type { Playlist } from "@/types/playlist";
import type { Track } from "@/types/track";
import {
    updatePlaylistAction,
    deletePlaylistAction,
} from "@/features/playlists/actions/playlist.actions";
import PlaylistTrackManager from "@/components/admin/PlaylistTrackManager";

const PRESET_COVERS = [
    { label: "Riverie", url: "/images/Reverie.png" },
    { label: "Indie Mood", url: "/images/indie-mood.png" },
    { label: "Shibuya", url: "/images/Shibuya.png" },
    { label: "Infatuation", url: "/images/Infatuation.png" },
    { label: "Pulse", url: "/images/Impulse.png" },
    { label: "Zephyr", url: "/images/Zephyr.png" },
];

interface Props {
    playlist: Playlist;
    initialTracks: Track[];
    availableLibraryTracks: Track[];
}

export default function EditPlaylistClient({
    playlist,
    initialTracks,
    availableLibraryTracks,
}: Props) {
    const router = useRouter();
    const [name, setName] = useState(playlist.name);
    const [slug, setSlug] = useState(playlist.slug);
    const [description, setDescription] = useState(playlist.description || "");
    const [coverUrl, setCoverUrl] = useState<string>(playlist.coverPath ? "" : playlist.coverUrl);
    const [coverPath, setCoverPath] = useState<string>(playlist.coverPath || "");
    const [isPublished, setIsPublished] = useState(playlist.isPublished);

    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSelectPreset = (url: string) => {
        setCoverUrl(url);
        setCoverPath("");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setMessage(null);
        setUploading(true);

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
                throw new Error(data.message || "Upload authorization failed.");
            }

            const uploadRes = await fetch(data.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": contentType },
                body: file,
            });

            if (!uploadRes.ok) {
                throw new Error("Failed to upload image to storage.");
            }

            setCoverPath(data.objectKey);
            setCoverUrl("");
        } catch (err: unknown) {
            setMessage({
                type: "error",
                text: err instanceof Error ? err.message : "Failed to upload artwork.",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSavePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setSaving(true);

        try {
            const res = await updatePlaylistAction(playlist.id, {
                name,
                slug,
                description,
                coverPath: coverPath || undefined,
                coverUrl: coverUrl || undefined,
                isPublished,
            });

            if (!res.success) {
                throw new Error(res.message || "Failed to update playlist.");
            }

            setMessage({ type: "success", text: "Playlist updated successfully." });
        } catch (err: unknown) {
            setMessage({
                type: "error",
                text: err instanceof Error ? err.message : "Error saving playlist.",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePlaylist = async () => {
        if (
            !confirm(
                "Are you sure you want to delete this playlist? Note: Playlists with tracks must have their tracks removed first."
            )
        ) {
            return;
        }

        setDeleting(true);
        try {
            const res = await deletePlaylistAction(playlist.id);
            if (!res.success) {
                throw new Error(res.message || "Failed to delete playlist.");
            }
            router.push("/admin/playlists");
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Error deleting playlist.");
            setDeleting(false);
        }
    };

    return (
        <main
            style={{
                minHeight: "100vh",
                backgroundColor: "transparent",
                color: "#f2eee9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px 16px",
                position: "relative",
            }}
        >
            <div
                className="phone-frame"
                style={{
                    maxWidth: "560px",
                    minHeight: "min(920px, calc(100vh - 48px))",
                    height: "auto",
                    gap: "20px",
                }}
            >
                {/* Background */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/images/cover.png"
                    alt=""
                    className="phone-frame-bg"
                />
                <div className="phone-frame-overlay" />

                {/* Header */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        userSelect: "none",
                    }}
                >
                    <div>
                        <p
                            style={{
                                fontFamily: "'Caveat', cursive",
                                fontSize: "18px",
                                color: "#cfc9bc",
                                letterSpacing: "0.5px",
                            }}
                        >
                            Control Panel
                        </p>
                        <h1
                            style={{
                                fontFamily: "'Caveat', cursive",
                                fontSize: "30px",
                                fontWeight: 700,
                                color: "#ffffff",
                                lineHeight: "1.2",
                            }}
                        >
                            edit playlist
                        </h1>

                        <svg
                            width="145"
                            height="16"
                            viewBox="0 0 145 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ marginTop: "2px", opacity: 0.8 }}
                        >
                            <path
                                d="M 2 8 Q 38 14, 75 7 T 142 8"
                                stroke="#cfc9bc"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </svg>
                    </div>

                    <MoonHeader size={52} />
                </div>

                {/* Playlist Details Form */}
                <form
                    onSubmit={handleSavePlaylist}
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                    }}
                >
                    {/* Name */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "11px",
                                fontFamily: "'JetBrains Mono', monospace",
                                letterSpacing: "0.8px",
                                color: "rgba(225, 220, 205, 0.65)",
                                marginBottom: "4px",
                                textTransform: "uppercase",
                            }}
                        >
                            Playlist Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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

                    {/* Slug */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "11px",
                                fontFamily: "'JetBrains Mono', monospace",
                                letterSpacing: "0.8px",
                                color: "rgba(225, 220, 205, 0.65)",
                                marginBottom: "4px",
                                textTransform: "uppercase",
                            }}
                        >
                            Slug (URL Identifier) *
                        </label>
                        <input
                            type="text"
                            required
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            style={{
                                width: "100%",
                                backgroundColor: "rgba(10, 10, 14, 0.75)",
                                border: "1.5px solid rgba(225, 220, 205, 0.35)",
                                borderRadius: "12px",
                                padding: "9px 12px",
                                fontSize: "12px",
                                fontFamily: "'JetBrains Mono', monospace",
                                color: "#cfc9bc",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "11px",
                                fontFamily: "'JetBrains Mono', monospace",
                                letterSpacing: "0.8px",
                                color: "rgba(225, 220, 205, 0.65)",
                                marginBottom: "4px",
                                textTransform: "uppercase",
                            }}
                        >
                            Description
                        </label>
                        <textarea
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{
                                width: "100%",
                                backgroundColor: "rgba(10, 10, 14, 0.75)",
                                border: "1.5px solid rgba(225, 220, 205, 0.35)",
                                borderRadius: "12px",
                                padding: "8px 12px",
                                fontSize: "12px",
                                color: "#f2eee9",
                                outline: "none",
                                resize: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {/* Artwork / Preset Selection */}
                    <div>
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "11px",
                                fontFamily: "'JetBrains Mono', monospace",
                                letterSpacing: "0.8px",
                                color: "rgba(225, 220, 205, 0.65)",
                                marginBottom: "6px",
                                textTransform: "uppercase",
                            }}
                        >
                            <ImageIcon size={13} />
                            Cover Artwork
                        </label>

                        {/* Presets Grid */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(6, 1fr)",
                                gap: "6px",
                                marginBottom: "8px",
                            }}
                        >
                            {PRESET_COVERS.map((preset) => {
                                const isSelected = !coverPath && coverUrl === preset.url;
                                return (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => handleSelectPreset(preset.url)}
                                        title={preset.label}
                                        style={{
                                            position: "relative",
                                            aspectRatio: "1",
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                            border: isSelected
                                                ? "2px solid #ffffff"
                                                : "1.5px solid rgba(225, 220, 205, 0.25)",
                                            padding: 0,
                                            background: "none",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={preset.url}
                                            alt={preset.label}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                        {isSelected && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    backgroundColor: "rgba(0, 0, 0, 0.45)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Check size={13} color="#ffffff" strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom upload */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <label
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "6px 12px",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(225, 220, 205, 0.3)",
                                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                                    fontSize: "11px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    cursor: uploading ? "wait" : "pointer",
                                    color: "#f2eee9",
                                }}
                            >
                                <Sparkles size={12} />
                                {uploading ? "Uploading to B2..." : "Upload custom artwork"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    style={{ display: "none" }}
                                />
                            </label>

                            {coverPath && (
                                <span
                                    style={{
                                        fontSize: "11px",
                                        fontFamily: "'JetBrains Mono', monospace",
                                        color: "#86efac",
                                    }}
                                >
                                    ✓ B2: {coverPath}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Publish status */}
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
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            style={{ accentColor: "#ffffff" }}
                        />
                        <span>Published (visible on homepage)</span>
                    </label>

                    {message && (
                        <div
                            style={{
                                padding: "8px 12px",
                                borderRadius: "10px",
                                backgroundColor:
                                    message.type === "success"
                                        ? "rgba(134, 239, 172, 0.15)"
                                        : "rgba(239, 68, 68, 0.15)",
                                border: `1px solid ${
                                    message.type === "success"
                                        ? "rgba(134, 239, 172, 0.4)"
                                        : "rgba(239, 68, 68, 0.4)"
                                }`,
                                fontSize: "12px",
                                color: message.type === "success" ? "#86efac" : "#fca5a5",
                                textAlign: "center",
                            }}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Buttons: Save & Delete */}
                    <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                flex: 2,
                                padding: "10px",
                                backgroundColor: saving ? "rgba(242, 238, 233, 0.6)" : "#f2eee9",
                                color: "#08080a",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "13px",
                                fontWeight: 600,
                                fontFamily: "'JetBrains Mono', monospace",
                                cursor: saving ? "not-allowed" : "pointer",
                            }}
                        >
                            {saving ? "Saving Changes..." : "Save Playlist Info"}
                        </button>

                        <button
                            type="button"
                            disabled={deleting}
                            onClick={handleDeletePlaylist}
                            style={{
                                padding: "10px 14px",
                                backgroundColor: "rgba(239, 68, 68, 0.15)",
                                color: "#fca5a5",
                                border: "1px solid rgba(239, 68, 68, 0.35)",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontFamily: "'JetBrains Mono', monospace",
                                cursor: deleting ? "not-allowed" : "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                </form>

                {/* Separator */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        borderTop: "1px solid rgba(225, 220, 205, 0.15)",
                        margin: "4px 0",
                    }}
                />

                {/* Playlist Tracks Section */}
                <div style={{ position: "relative", zIndex: 10 }}>
                    <p
                        style={{
                            fontFamily: "'Caveat', cursive",
                            fontSize: "22px",
                            color: "#ffffff",
                            margin: "0 0 10px 0",
                        }}
                    >
                        playlist tracks
                    </p>

                    <PlaylistTrackManager
                        playlist={playlist}
                        initialTracks={initialTracks}
                        availableLibraryTracks={availableLibraryTracks}
                    />
                </div>

                {/* Footer Navigation */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "12px",
                        borderTop: "1px solid rgba(225, 220, 205, 0.15)",
                        userSelect: "none",
                    }}
                >
                    <Link
                        href="/admin/playlists"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "14px",
                            fontFamily: "'Caveat', cursive",
                            color: "#cfc9bc",
                            textDecoration: "none",
                        }}
                    >
                        <ArrowLeft size={15} strokeWidth={2.2} />
                        back to playlists
                    </Link>

                    <Link
                        href="/admin"
                        style={{
                            fontSize: "11px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "rgba(207, 201, 188, 0.5)",
                            textDecoration: "none",
                        }}
                    >
                        DASHBOARD
                    </Link>
                </div>
            </div>
        </main>
    );
}
