"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Music,
    Trash2,
    Play,
    Pause,
    Plus,
    X,
    ShieldCheck,
    ShieldAlert,
} from "lucide-react";
import MoonHeader from "@/components/ui/MoonHeader";
import type { Track } from "@/types/track";
import type { Playlist } from "@/types/playlist";
import {
    deleteTrackAction,
    updateTrackRightsAction,
} from "@/features/tracks/actions/track.actions";
import TrackUploadForm from "@/components/admin/TrackUploadForm";

interface Props {
    initialTracks: Track[];
    playlists: Playlist[];
}

function formatDuration(sec: number): string {
    const mins = Math.floor(sec / 60);
    const remainingSecs = Math.floor(sec % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
}

export default function TrackManagerClient({ initialTracks, playlists }: Props) {
    const [tracks, setTracks] = useState<Track[]>(initialTracks);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [updatingRightsId, setUpdatingRightsId] = useState<string | null>(null);

    // Filter
    const [filterRights, setFilterRights] = useState<"all" | "pending" | "authorized" | "rejected">("all");

    // Audio preview player
    const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
    const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

    const handlePlayPreview = (track: Track) => {
        if (!track.audioUrl) {
            alert("No audio stream available for preview.");
            return;
        }

        if (currentPlayingId === track.id) {
            audioPlayer?.pause();
            setCurrentPlayingId(null);
            return;
        }

        if (audioPlayer) {
            audioPlayer.pause();
        }

        const newAudio = new Audio(track.audioUrl);
        newAudio.play().catch((e) => console.error("Playback error:", e));
        newAudio.onended = () => setCurrentPlayingId(null);

        setAudioPlayer(newAudio);
        setCurrentPlayingId(track.id);
    };

    const handleToggleRights = async (
        trackId: string,
        newStatus: "pending" | "authorized" | "rejected"
    ) => {
        setUpdatingRightsId(trackId);
        try {
            const res = await updateTrackRightsAction({
                id: trackId,
                rightsStatus: newStatus,
            });

            if (!res.success) {
                throw new Error(res.message);
            }

            setTracks((prev) =>
                prev.map((t) => (t.id === trackId ? { ...t, rightsStatus: newStatus } : t))
            );
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Could not update rights.");
        } finally {
            setUpdatingRightsId(null);
        }
    };

    const handleDeleteTrack = async (trackId: string) => {
        if (
            !confirm(
                "Are you sure you want to permanently delete this track? This will remove the track from all playlists and delete the audio file from storage."
            )
        ) {
            return;
        }

        setDeletingId(trackId);
        try {
            const res = await deleteTrackAction(trackId);
            if (!res.success) {
                throw new Error(res.message);
            }
            setTracks((prev) => prev.filter((t) => t.id !== trackId));
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Could not delete track.");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredTracks = tracks.filter((t) => {
        if (filterRights === "all") return true;
        return t.rightsStatus === filterRights;
    });

    const pendingCount = tracks.filter((t) => t.rightsStatus === "pending").length;

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
                    maxWidth: "580px",
                    minHeight: "min(880px, calc(100vh - 48px))",
                    height: "auto",
                    gap: "18px",
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
                                fontSize: "32px",
                                fontWeight: 700,
                                color: "#ffffff",
                                lineHeight: "1.2",
                            }}
                        >
                            track library
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

                {/* Top Action Bar & Filter */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                >
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {(["all", "pending", "authorized", "rejected"] as const).map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => setFilterRights(status)}
                                style={{
                                    padding: "4px 8px",
                                    borderRadius: "8px",
                                    backgroundColor:
                                        filterRights === status
                                            ? "rgba(255, 255, 255, 0.18)"
                                            : "rgba(255, 255, 255, 0.05)",
                                    border:
                                        filterRights === status
                                            ? "1px solid rgba(255, 255, 255, 0.4)"
                                            : "1px solid rgba(225, 220, 205, 0.15)",
                                    fontSize: "11px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    color: filterRights === status ? "#ffffff" : "rgba(225, 220, 205, 0.6)",
                                    cursor: "pointer",
                                    textTransform: "capitalize",
                                }}
                            >
                                {status === "pending" && pendingCount > 0 ? `pending (${pendingCount})` : status}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 14px",
                            borderRadius: "12px",
                            backgroundColor: "#f2eee9",
                            color: "#0a0a0e",
                            fontWeight: 600,
                            fontSize: "12px",
                            fontFamily: "'JetBrains Mono', monospace",
                            border: "none",
                            cursor: "pointer",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                        }}
                    >
                        <Plus size={14} strokeWidth={2.5} />
                        Upload Track
                    </button>
                </div>

                {/* Track List */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        flex: 1,
                        overflowY: "auto",
                        maxHeight: "520px",
                        paddingRight: "2px",
                    }}
                >
                    {filteredTracks.length === 0 ? (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "40px 16px",
                                borderRadius: "16px",
                                border: "1px dashed rgba(225, 220, 205, 0.25)",
                                backgroundColor: "rgba(10, 10, 14, 0.4)",
                            }}
                        >
                            <Music
                                size={32}
                                color="rgba(225, 220, 205, 0.4)"
                                style={{ margin: "0 auto 10px" }}
                            />
                            <p style={{ color: "#cfc9bc", fontSize: "14px" }}>
                                No tracks match this filter.
                            </p>
                            <p
                                style={{
                                    color: "rgba(207, 201, 188, 0.5)",
                                    fontSize: "12px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    marginTop: "4px",
                                }}
                            >
                                Total tracks in database: {tracks.length}
                            </p>
                        </div>
                    ) : (
                        filteredTracks.map((track) => {
                            const isPlaying = currentPlayingId === track.id;
                            const isDeleting = deletingId === track.id;
                            const isUpdatingRights = updatingRightsId === track.id;

                            return (
                                <div
                                    key={track.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "10px 14px",
                                        borderRadius: "14px",
                                        backgroundColor: "rgba(12, 12, 16, 0.7)",
                                        border: "1px solid rgba(225, 220, 205, 0.15)",
                                        backdropFilter: "blur(8px)",
                                        gap: "12px",
                                    }}
                                >
                                    {/* Cover and Play button */}
                                    <div
                                        style={{
                                            position: "relative",
                                            width: "44px",
                                            height: "44px",
                                            borderRadius: "10px",
                                            overflow: "hidden",
                                            flexShrink: 0,
                                            border: "1px solid rgba(225, 220, 205, 0.2)",
                                        }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={track.artworkUrl || "/images/cover.png"}
                                            alt={track.title}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handlePlayPreview(track)}
                                            title={isPlaying ? "Pause preview" : "Play preview"}
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                backgroundColor: isPlaying
                                                    ? "rgba(0, 0, 0, 0.6)"
                                                    : "rgba(0, 0, 0, 0.35)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                border: "none",
                                                cursor: "pointer",
                                                color: "#ffffff",
                                                transition: "all 0.15s ease",
                                            }}
                                        >
                                            {isPlaying ? (
                                                <Pause size={18} fill="#ffffff" />
                                            ) : (
                                                <Play size={18} fill="#ffffff" style={{ marginLeft: "2px" }} />
                                            )}
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p
                                            style={{
                                                fontSize: "14px",
                                                fontWeight: 600,
                                                color: "#f2eee9",
                                                margin: 0,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {track.title}
                                        </p>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                marginTop: "2px",
                                                fontSize: "11px",
                                                fontFamily: "'JetBrains Mono', monospace",
                                                color: "rgba(225, 220, 205, 0.6)",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <span style={{ color: "#cfc9bc" }}>{track.artist}</span>
                                            {track.playlistName && (
                                                <span
                                                    style={{
                                                        padding: "1px 6px",
                                                        borderRadius: "6px",
                                                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                                                        color: "#cfc9bc",
                                                    }}
                                                >
                                                    {track.playlistName}
                                                </span>
                                            )}
                                            {track.duration > 0 && (
                                                <span>{formatDuration(track.duration)}</span>
                                            )}
                                            {/* Rights status badge */}
                                            <span
                                                style={{
                                                    fontSize: "10px",
                                                    padding: "1px 6px",
                                                    borderRadius: "4px",
                                                    backgroundColor:
                                                        track.rightsStatus === "authorized"
                                                            ? "rgba(134, 239, 172, 0.15)"
                                                            : track.rightsStatus === "rejected"
                                                            ? "rgba(239, 68, 68, 0.15)"
                                                            : "rgba(250, 204, 21, 0.15)",
                                                    color:
                                                        track.rightsStatus === "authorized"
                                                            ? "#86efac"
                                                            : track.rightsStatus === "rejected"
                                                            ? "#fca5a5"
                                                            : "#fde047",
                                                    border: `1px solid ${
                                                        track.rightsStatus === "authorized"
                                                            ? "rgba(134, 239, 172, 0.3)"
                                                            : track.rightsStatus === "rejected"
                                                            ? "rgba(239, 68, 68, 0.3)"
                                                            : "rgba(250, 204, 21, 0.3)"
                                                    }`,
                                                }}
                                            >
                                                {track.rightsStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rights Action Buttons */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        {track.rightsStatus !== "authorized" ? (
                                            <button
                                                type="button"
                                                disabled={isUpdatingRights}
                                                onClick={() => handleToggleRights(track.id, "authorized")}
                                                title="Authorize track for public playback"
                                                style={{
                                                    padding: "5px 8px",
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(134, 239, 172, 0.15)",
                                                    border: "1px solid rgba(134, 239, 172, 0.3)",
                                                    color: "#86efac",
                                                    fontSize: "11px",
                                                    fontFamily: "'JetBrains Mono', monospace",
                                                    cursor: isUpdatingRights ? "wait" : "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                }}
                                            >
                                                <ShieldCheck size={12} />
                                                Authorize
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={isUpdatingRights}
                                                onClick={() => handleToggleRights(track.id, "pending")}
                                                title="Revoke authorization (set pending)"
                                                style={{
                                                    padding: "5px 8px",
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(250, 204, 21, 0.1)",
                                                    border: "1px solid rgba(250, 204, 21, 0.3)",
                                                    color: "#fde047",
                                                    fontSize: "11px",
                                                    fontFamily: "'JetBrains Mono', monospace",
                                                    cursor: isUpdatingRights ? "wait" : "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                }}
                                            >
                                                <ShieldAlert size={12} />
                                                Revoke
                                            </button>
                                        )}

                                        {/* Delete action */}
                                        <button
                                            type="button"
                                            disabled={isDeleting}
                                            onClick={() => handleDeleteTrack(track.id)}
                                            title="Permanently delete track"
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: isDeleting
                                                    ? "rgba(239, 68, 68, 0.3)"
                                                    : "rgba(239, 68, 68, 0.65)",
                                                cursor: isDeleting ? "not-allowed" : "pointer",
                                                padding: "6px",
                                                borderRadius: "8px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Upload Modal */}
                {showUploadModal && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.75)",
                            backdropFilter: "blur(6px)",
                            zIndex: 100,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "16px",
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                maxWidth: "480px",
                                backgroundColor: "rgba(14, 14, 20, 0.95)",
                                border: "1.5px solid rgba(225, 220, 205, 0.3)",
                                borderRadius: "22px",
                                padding: "24px",
                                color: "#f2eee9",
                                position: "relative",
                                boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
                                maxHeight: "90vh",
                                overflowY: "auto",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "16px",
                                }}
                            >
                                <h2
                                    style={{
                                        fontFamily: "'Caveat', cursive",
                                        fontSize: "26px",
                                        margin: 0,
                                        fontWeight: 700,
                                    }}
                                >
                                    upload new track
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "#cfc9bc",
                                        cursor: "pointer",
                                        padding: "4px",
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <TrackUploadForm
                                playlists={playlists}
                                onSuccess={() => {
                                    setShowUploadModal(false);
                                    window.location.reload();
                                }}
                                onCancel={() => setShowUploadModal(false)}
                            />
                        </div>
                    </div>
                )}

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
                        href="/admin"
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
                        dashboard
                    </Link>

                    <Link
                        href="/admin/playlists"
                        style={{
                            fontSize: "11px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "rgba(207, 201, 188, 0.5)",
                            textDecoration: "none",
                        }}
                    >
                        PLAYLISTS
                    </Link>
                </div>
            </div>
        </main>
    );
}
