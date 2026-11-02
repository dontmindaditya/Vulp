"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Image as ImageIcon, Check } from "lucide-react";
import MoonHeader from "@/components/ui/MoonHeader";
import { createPlaylistAction } from "@/features/playlists/actions/playlist.actions";

const PRESET_COVERS = [
    { label: "Riverie", url: "/images/Reverie.png" },
    { label: "Indie Mood", url: "/images/indie-mood.png" },
    { label: "Shibuya", url: "/images/Shibuya.png" },
    { label: "Infatuation", url: "/images/Infatuation.png" },
    { label: "Pulse", url: "/images/Impulse.png" },
    { label: "Zephyr", url: "/images/Zephyr.png" },
];

function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export default function NewPlaylistPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [coverUrl, setCoverUrl] = useState<string>("/images/Reverie.png");
    const [coverPath, setCoverPath] = useState<string>("");
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);
    const [isPublished, setIsPublished] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNameChange = (val: string) => {
        setName(val);
        setSlug(generateSlug(val));
    };

    const handleSelectPreset = (url: string) => {
        setCoverUrl(url);
        setCoverPath("");
        setUploadPreview(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setUploading(true);

        // Normalize mime type for both signing and upload headers
        const contentType = file.type && file.type.trim() ? file.type : "image/jpeg";

        try {
            // Local preview
            const previewUrl = URL.createObjectURL(file);
            setUploadPreview(previewUrl);

            // 1. Request presigned upload URL from server
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
                throw new Error(data.message || "Failed to get upload authorization.");
            }

            // 2. Upload file directly to Backblaze B2 bucket
            const uploadRes = await fetch(data.uploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": contentType,
                },
                body: file,
            });

            if (!uploadRes.ok) {
                throw new Error(
                    `Failed to upload image to storage (Status ${uploadRes.status}).`
                );
            }

            setCoverPath(data.objectKey);
            setCoverUrl("");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to upload image.";
            setError(msg);
            setUploadPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await createPlaylistAction({
                name,
                slug: slug || generateSlug(name),
                description,
                coverPath: coverPath || undefined,
                coverUrl: coverUrl || undefined,
                isPublished,
            });

            if (!res.success) {
                throw new Error(res.message || "Could not create playlist.");
            }

            router.push("/admin/playlists");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error creating playlist.";
            setError(msg);
            setLoading(false);
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
                    maxWidth: "520px",
                    minHeight: "min(860px, calc(100vh - 48px))",
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
                            create a playlist
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

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        flex: 1,
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
                                marginBottom: "5px",
                                textTransform: "uppercase",
                            }}
                        >
                            Playlist Name *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Midnight Reverie"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            style={{
                                width: "100%",
                                backgroundColor: "rgba(10, 10, 14, 0.75)",
                                border: "1.5px solid rgba(225, 220, 205, 0.35)",
                                borderRadius: "14px",
                                padding: "11px 14px",
                                fontSize: "14px",
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
                                marginBottom: "5px",
                                textTransform: "uppercase",
                            }}
                        >
                            Slug (URL Identifier) *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="midnight-reverie"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            style={{
                                width: "100%",
                                backgroundColor: "rgba(10, 10, 14, 0.75)",
                                border: "1.5px solid rgba(225, 220, 205, 0.35)",
                                borderRadius: "14px",
                                padding: "10px 14px",
                                fontSize: "13px",
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
                                marginBottom: "5px",
                                textTransform: "uppercase",
                            }}
                        >
                            Description
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Describe the mood or setting..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{
                                width: "100%",
                                backgroundColor: "rgba(10, 10, 14, 0.75)",
                                border: "1.5px solid rgba(225, 220, 205, 0.35)",
                                borderRadius: "14px",
                                padding: "10px 14px",
                                fontSize: "13px",
                                color: "#f2eee9",
                                outline: "none",
                                resize: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {/* Artwork / Cover selection */}
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
                                marginBottom: "8px",
                                textTransform: "uppercase",
                            }}
                        >
                            <ImageIcon size={13} />
                            Cover Artwork (Choose Preset or Upload to B2)
                        </label>

                        {/* Presets Grid */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(6, 1fr)",
                                gap: "6px",
                                marginBottom: "10px",
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
                                            borderRadius: "10px",
                                            overflow: "hidden",
                                            border: isSelected
                                                ? "2px solid #ffffff"
                                                : "1.5px solid rgba(225, 220, 205, 0.25)",
                                            padding: 0,
                                            background: "none",
                                            cursor: "pointer",
                                            boxShadow: isSelected
                                                ? "0 0 10px rgba(255, 255, 255, 0.4)"
                                                : "none",
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
                                                <Check size={14} color="#ffffff" strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom B2 File Upload */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                flexWrap: "wrap",
                            }}
                        >
                            <label
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "8px 14px",
                                    borderRadius: "12px",
                                    border: "1.5px solid rgba(225, 220, 205, 0.3)",
                                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                                    fontSize: "12px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    cursor: uploading ? "wait" : "pointer",
                                    color: "#f2eee9",
                                }}
                            >
                                <Sparkles size={13} />
                                {uploading ? "Uploading to B2..." : "Upload custom artwork"}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    style={{ display: "none" }}
                                />
                            </label>

                            {coverPath && (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    {uploadPreview && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={uploadPreview}
                                            alt="Preview"
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                borderRadius: "6px",
                                                objectFit: "cover",
                                                border: "1px solid #86efac",
                                            }}
                                        />
                                    )}
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            fontFamily: "'JetBrains Mono', monospace",
                                            color: "#86efac",
                                        }}
                                    >
                                        ✓ Uploaded to B2
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Publish Toggle */}
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            fontSize: "13px",
                            color: "#f2eee9",
                            cursor: "pointer",
                            userSelect: "none",
                            marginTop: "4px",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            style={{
                                width: "16px",
                                height: "16px",
                                accentColor: "#ffffff",
                                cursor: "pointer",
                            }}
                        />
                        <span>Publish immediately (visible on homepage)</span>
                    </label>

                    {/* Error display */}
                    {error && (
                        <div
                            role="alert"
                            style={{
                                backgroundColor: "rgba(239, 68, 68, 0.15)",
                                border: "1px solid rgba(239, 68, 68, 0.4)",
                                borderRadius: "12px",
                                padding: "10px 14px",
                                fontSize: "13px",
                                color: "#fca5a5",
                                textAlign: "center",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        style={{
                            marginTop: "10px",
                            width: "100%",
                            padding: "13px",
                            backgroundColor: loading ? "rgba(242, 238, 233, 0.6)" : "#f2eee9",
                            color: "#08080a",
                            border: "none",
                            borderRadius: "14px",
                            fontSize: "14px",
                            fontWeight: 600,
                            letterSpacing: "0.3px",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
                        }}
                    >
                        {loading ? "Creating Playlist..." : "Create Playlist"}
                    </button>
                </form>

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
