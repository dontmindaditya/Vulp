import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import MoonHeader from "@/components/ui/MoonHeader";
import { requireAdmin } from "@/features/auth/services/auth.service";
import { getAllPlaylists } from "@/features/playlists/services/playlist.service";

export default async function AdminPlaylistsPage() {
    await requireAdmin();
    const playlists = await getAllPlaylists();

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
                    minHeight: "min(850px, calc(100vh - 48px))",
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
                            Library
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
                            your playlists
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

                {/* Actions & List */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        flex: 1,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "11px",
                                fontFamily: "'JetBrains Mono', monospace",
                                letterSpacing: "1px",
                                color: "rgba(225, 220, 205, 0.55)",
                            }}
                        >
                            {playlists.length} PLAYLISTS TOTAL
                        </span>

                        <Link
                            href="/admin/playlists/new"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "7px 14px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(225, 220, 205, 0.15)",
                                border: "1px solid rgba(225, 220, 205, 0.35)",
                                color: "#f2eee9",
                                textDecoration: "none",
                                fontSize: "12px",
                                fontWeight: 600,
                            }}
                        >
                            <Plus size={14} />
                            Create New
                        </Link>
                    </div>

                    {/* Playlist Items Scrollable Container */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            maxHeight: "440px",
                            overflowY: "auto",
                            paddingRight: "4px",
                        }}
                    >
                        {playlists.map((playlist) => (
                            <div
                                key={playlist.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "10px 14px",
                                    borderRadius: "14px",
                                    backgroundColor: "rgba(12, 12, 16, 0.75)",
                                    border: "1px solid rgba(225, 220, 205, 0.2)",
                                    backdropFilter: "blur(6px)",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={playlist.coverUrl || "/images/cover.png"}
                                        alt=""
                                        style={{
                                            width: "42px",
                                            height: "42px",
                                            borderRadius: "10px",
                                            objectFit: "cover",
                                            border: "1px solid rgba(225, 220, 205, 0.25)",
                                        }}
                                    />
                                    <div>
                                        <p
                                            style={{
                                                fontSize: "15px",
                                                fontFamily: "'Caveat', cursive",
                                                fontWeight: 700,
                                                color: "#ffffff",
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {playlist.name}
                                        </p>
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                fontFamily: "'JetBrains Mono', monospace",
                                                color: "rgba(225, 220, 205, 0.5)",
                                            }}
                                        >
                                            /{playlist.slug} · {playlist.trackCount} tracks
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span
                                        style={{
                                            fontSize: "10px",
                                            fontFamily: "'JetBrains Mono', monospace",
                                            letterSpacing: "0.5px",
                                            padding: "3px 8px",
                                            borderRadius: "8px",
                                            border: playlist.isPublished
                                                ? "1px solid rgba(134, 239, 172, 0.4)"
                                                : "1px solid rgba(251, 191, 36, 0.4)",
                                            backgroundColor: playlist.isPublished
                                                ? "rgba(134, 239, 172, 0.1)"
                                                : "rgba(251, 191, 36, 0.1)",
                                            color: playlist.isPublished ? "#86efac" : "#fbbf24",
                                        }}
                                    >
                                        {playlist.isPublished ? "PUBLISHED" : "DRAFT"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
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
                        back to dashboard
                    </Link>

                    <Link
                        href="/"
                        style={{
                            fontSize: "11px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "rgba(207, 201, 188, 0.5)",
                            textDecoration: "none",
                        }}
                    >
                        MUSIC PLAYER
                    </Link>
                </div>
            </div>
        </main>
    );
}
