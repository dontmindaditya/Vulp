"use client";

import { useState } from "react";
import {
    Music,
    Play,
    Pause,
    Plus,
    MinusCircle,
    UploadCloud,
    X,
} from "lucide-react";
import type { Playlist } from "@/types/playlist";
import type { Track } from "@/types/track";
import {
    addTrackToPlaylistAction,
    removeTrackFromPlaylistAction,
} from "@/features/tracks/actions/track.actions";
import TrackUploadForm from "./TrackUploadForm";

interface PlaylistTrackManagerProps {
    playlist: Playlist;
    initialTracks: Track[];
    availableLibraryTracks?: Track[];
}

function formatDuration(sec: number): string {
    const mins = Math.floor(sec / 60);
    const remainingSecs = Math.floor(sec % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
}

export default function PlaylistTrackManager({
    playlist,
    initialTracks,
    availableLibraryTracks = [],
}: PlaylistTrackManagerProps) {
    const [tracks, setTracks] = useState<Track[]>(initialTracks);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [selectedTrackToAdd, setSelectedTrackToAdd] = useState("");
    const [addingTrack, setAddingTrack] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);

    // Audio preview
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

    const handleRemoveFromPlaylist = async (trackId: string) => {
        if (
            !confirm(
                "Remove this track from this playlist? (The audio file and track record will remain safe in your library)."
            )
        ) {
            return;
        }

        setRemovingId(trackId);
        try {
            const res = await removeTrackFromPlaylistAction({
                playlistId: playlist.id,
                trackId,
            });

            if (!res.success) {
                throw new Error(res.message);
            }

            setTracks((prev) => prev.filter((t) => t.id !== trackId));
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Could not remove track.");
        } finally {
            setRemovingId(null);
        }
    };

    const handleAddExistingTrack = async () => {
        if (!selectedTrackToAdd) return;

        setAddingTrack(true);
        try {
            const res = await addTrackToPlaylistAction({
                playlistId: playlist.id,
                trackId: selectedTrackToAdd,
            });

            if (!res.success) {
                throw new Error(res.message);
            }

            setShowLibraryModal(false);
            setSelectedTrackToAdd("");
            window.location.reload();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Could not add track.");
        } finally {
            setAddingTrack(false);
        }
    };

    // Filter library tracks not already in this playlist
    const existingTrackIds = new Set(tracks.map((t) => t.id));
    const eligibleTracks = availableLibraryTracks.filter(
        (t) => !existingTrackIds.has(t.id)
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            {/* Header / Actions bar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "8px",
                    borderBottom: "1px solid rgba(225, 220, 205, 0.15)",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                        style={{
                            fontSize: "12px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "rgba(225, 220, 205, 0.7)",
                        }}
                    >
                        {tracks.length} {tracks.length === 1 ? "track" : "tracks"} in playlist
                    </span>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                    {eligibleTracks.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowLibraryModal(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "6px 10px",
                                borderRadius: "10px",
                                backgroundColor: "rgba(255, 255, 255, 0.08)",
                                color: "#cfc9bc",
                                border: "1px solid rgba(225, 220, 205, 0.2)",
                                fontSize: "11px",
                                fontFamily: "'JetBrains Mono', monospace",
                                cursor: "pointer",
                            }}
                        >
                            <Plus size={13} />
                            Add from Library
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 12px",
                            borderRadius: "10px",
                            backgroundColor: "#f2eee9",
                            color: "#0a0a0e",
                            fontWeight: 600,
                            fontSize: "11px",
                            fontFamily: "'JetBrains Mono', monospace",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        <UploadCloud size={13} strokeWidth={2.5} />
                        Upload Track
                    </button>
                </div>
            </div>

            {/* Tracks List */}
            {tracks.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "30px 16px",
                        borderRadius: "14px",
                        border: "1px dashed rgba(225, 220, 205, 0.25)",
                        backgroundColor: "rgba(10, 10, 14, 0.4)",
                    }}
                >
                    <Music
                        size={28}
                        color="rgba(225, 220, 205, 0.4)"
                        style={{ margin: "0 auto 8px" }}
                    />
                    <p style={{ color: "#cfc9bc", fontSize: "13px", margin: 0 }}>
                        This playlist has no tracks yet.
                    </p>
                    <p
                        style={{
                            color: "rgba(207, 201, 188, 0.5)",
                            fontSize: "11px",
                            fontFamily: "'JetBrains Mono', monospace",
                            marginTop: "4px",
                        }}
                    >
                        Upload a new track or attach one from your library above.
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {tracks.map((track, i) => {
                        const isPlaying = currentPlayingId === track.id;
                        const isRemoving = removingId === track.id;

                        return (
                            <div
                                key={track.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "8px 12px",
                                    borderRadius: "12px",
                                    backgroundColor: "rgba(12, 12, 16, 0.7)",
                                    border: "1px solid rgba(225, 220, 205, 0.15)",
                                    gap: "10px",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "11px",
                                        fontFamily: "'JetBrains Mono', monospace",
                                        color: "rgba(225, 220, 205, 0.4)",
                                        width: "16px",
                                    }}
                                >
                                    {i + 1}
                                </span>

                                {/* Thumbnail & Play */}
                                <div
                                    style={{
                                        position: "relative",
                                        width: "38px",
                                        height: "38px",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        flexShrink: 0,
                                        border: "1px solid rgba(225, 220, 205, 0.2)",
                                    }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={track.artworkUrl || playlist.coverUrl || "/images/cover.png"}
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
                                        }}
                                    >
                                        {isPlaying ? (
                                            <Pause size={14} fill="#ffffff" />
                                        ) : (
                                            <Play size={14} fill="#ffffff" style={{ marginLeft: "2px" }} />
                                        )}
                                    </button>
                                </div>

                                {/* Track Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p
                                        style={{
                                            fontSize: "13px",
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
                                            fontSize: "11px",
                                            fontFamily: "'JetBrains Mono', monospace",
                                            color: "rgba(225, 220, 205, 0.6)",
                                            marginTop: "1px",
                                        }}
                                    >
                                        <span>{track.artist}</span>
                                        {track.duration > 0 && (
                                            <span>{formatDuration(track.duration)}</span>
                                        )}
                                        {/* Rights pill */}
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                padding: "1px 5px",
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
                                            }}
                                        >
                                            {track.rightsStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Remove association */}
                                <button
                                    type="button"
                                    disabled={isRemoving}
                                    onClick={() => handleRemoveFromPlaylist(track.id)}
                                    title="Remove track from this playlist"
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: isRemoving
                                            ? "rgba(239, 68, 68, 0.3)"
                                            : "rgba(239, 68, 68, 0.7)",
                                        cursor: isRemoving ? "not-allowed" : "pointer",
                                        padding: "4px",
                                        borderRadius: "6px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <MinusCircle size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal: Add Track from Library */}
            {showLibraryModal && (
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
                            maxWidth: "440px",
                            backgroundColor: "rgba(14, 14, 20, 0.95)",
                            border: "1.5px solid rgba(225, 220, 205, 0.3)",
                            borderRadius: "20px",
                            padding: "20px",
                            color: "#f2eee9",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "14px",
                            }}
                        >
                            <h3
                                style={{
                                    fontFamily: "'Caveat', cursive",
                                    fontSize: "24px",
                                    margin: 0,
                                }}
                            >
                                add from track library
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowLibraryModal(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#cfc9bc",
                                    cursor: "pointer",
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p
                            style={{
                                fontSize: "12px",
                                color: "rgba(225, 220, 205, 0.6)",
                                margin: "0 0 12px 0",
                            }}
                        >
                            Select an existing track to associate with &quot;{playlist.name}&quot;:
                        </p>

                        <select
                            value={selectedTrackToAdd}
                            onChange={(e) => setSelectedTrackToAdd(e.target.value)}
                            style={{
                                width: "100%",
                                backgroundColor: "rgba(10, 10, 14, 0.85)",
                                border: "1.5px solid rgba(225, 220, 205, 0.35)",
                                borderRadius: "12px",
                                padding: "10px 12px",
                                fontSize: "13px",
                                color: "#f2eee9",
                                outline: "none",
                                marginBottom: "16px",
                            }}
                        >
                            <option value="">-- Choose a track --</option>
                            {eligibleTracks.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.title} — {t.artist} ({t.rightsStatus})
                                </option>
                            ))}
                        </select>

                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                type="button"
                                onClick={() => setShowLibraryModal(false)}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                                    color: "#cfc9bc",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "12px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={addingTrack || !selectedTrackToAdd}
                                onClick={handleAddExistingTrack}
                                style={{
                                    flex: 2,
                                    padding: "10px",
                                    backgroundColor: "#f2eee9",
                                    color: "#0a0a0e",
                                    fontWeight: 600,
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "12px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    cursor:
                                        addingTrack || !selectedTrackToAdd
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                            >
                                {addingTrack ? "Adding..." : "Add to Playlist"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Direct Upload to this Playlist */}
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
                            maxWidth: "460px",
                            backgroundColor: "rgba(14, 14, 20, 0.95)",
                            border: "1.5px solid rgba(225, 220, 205, 0.3)",
                            borderRadius: "20px",
                            padding: "22px",
                            color: "#f2eee9",
                            maxHeight: "90vh",
                            overflowY: "auto",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "14px",
                            }}
                        >
                            <h3
                                style={{
                                    fontFamily: "'Caveat', cursive",
                                    fontSize: "26px",
                                    margin: 0,
                                }}
                            >
                                upload track to {playlist.name}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowUploadModal(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#cfc9bc",
                                    cursor: "pointer",
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <TrackUploadForm
                            playlists={[playlist]}
                            defaultPlaylistId={playlist.id}
                            onSuccess={() => {
                                setShowUploadModal(false);
                                window.location.reload();
                            }}
                            onCancel={() => setShowUploadModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
