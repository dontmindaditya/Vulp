import { requireAdmin } from "@/features/auth/services/auth.service";
import { getAllPlaylists } from "@/features/playlists/services/playlist.service";
import { signOutAction } from "@/features/auth/actions/auth.actions";
import Link from "next/link";
import MoonHeader from "@/components/ui/MoonHeader";

const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "18px",
    borderRadius: "16px",
    border: "1px solid rgba(225, 220, 205, 0.22)",
    background: "rgba(12, 12, 16, 0.72)",
    color: "#f2eee9",
    textDecoration: "none",
    backdropFilter: "blur(8px)",
};

const labelStyle: React.CSSProperties = {
    color: "rgba(225, 220, 205, 0.55)",
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "1px",
};

export default async function AdminDashboardPage() {
    const admin = await requireAdmin();

    const playlists = await getAllPlaylists();

    const totalPlaylists = playlists.length;
    const publishedPlaylists = playlists.filter(
        (playlist) => playlist.isPublished
    ).length;
    const draftPlaylists = totalPlaylists - publishedPlaylists;
    const totalTracks = playlists.reduce(
        (total, playlist) => total + playlist.trackCount,
        0
    );

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
                    gap: "24px",
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
                    }}
                >
                    <div>
                        <p
                            style={{
                                fontFamily: "'Caveat', cursive",
                                fontSize: "18px",
                                color: "#cfc9bc",
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
                            vulp administration
                        </h1>

                        <p
                            style={{
                                fontSize: "11px",
                                fontFamily: "'JetBrains Mono', monospace",
                                color: "rgba(225, 220, 205, 0.6)",
                                marginTop: "6px",
                                overflowWrap: "anywhere",
                            }}
                        >
                            Signed in as {admin.email}
                        </p>
                    </div>

                    <MoonHeader size={52} />
                </div>

                {/* Dashboard */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                    }}
                >
                    <div
                        style={{
                            padding: "18px",
                            borderRadius: "16px",
                            border: "1px solid rgba(225, 220, 205, 0.25)",
                            backgroundColor: "rgba(12, 12, 16, 0.78)",
                            backdropFilter: "blur(8px)",
                        }}
                    >
                        <h2
                            style={{
                                fontFamily: "'Caveat', cursive",
                                fontSize: "23px",
                                color: "#ffffff",
                                marginBottom: "5px",
                            }}
                        >
                            Welcome Back
                        </h2>

                        <p
                            style={{
                                fontSize: "13px",
                                color: "rgba(225, 220, 205, 0.75)",
                                lineHeight: "1.5",
                            }}
                        >
                            Your little corner of music. Manage your
                            playlists, recordings and artwork from here.
                        </p>
                    </div>

                    {/* Statistics */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: "10px",
                        }}
                    >
                        {[
                            { label: "PLAYLISTS", value: totalPlaylists },
                            { label: "PUBLISHED", value: publishedPlaylists },
                            { label: "DRAFTS", value: draftPlaylists },
                            { label: "TRACKS", value: totalTracks },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                style={{
                                    ...cardStyle,
                                    padding: "14px",
                                    gap: "5px",
                                }}
                            >
                                <span style={labelStyle}>{stat.label}</span>
                                <strong
                                    style={{
                                        fontSize: "27px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {stat.value}
                                </strong>
                            </div>
                        ))}
                    </div>

                    {/* Management links */}
                    <div>
                        <p
                            style={{
                                ...labelStyle,
                                marginBottom: "10px",
                            }}
                        >
                            LIBRARY MANAGEMENT
                        </p>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                gap: "10px",
                            }}
                        >
                            <Link href="/admin/playlists" style={cardStyle}>
                                <span style={{ fontSize: "23px" }}>◉</span>
                                <strong>Playlists</strong>
                                <span
                                    style={{
                                        fontSize: "11px",
                                        color: "rgba(225, 220, 205, 0.55)",
                                    }}
                                >
                                    Create, edit and publish
                                </span>
                                <span style={{ fontSize: "12px" }}>
                                    Manage playlists →
                                </span>
                            </Link>

                            <Link href="/admin/tracks" style={cardStyle}>
                                <span style={{ fontSize: "23px" }}>♫</span>
                                <strong>Tracks</strong>
                                <span
                                    style={{
                                        fontSize: "11px",
                                        color: "rgba(225, 220, 205, 0.55)",
                                    }}
                                >
                                    Upload and organize music
                                </span>
                                <span style={{ fontSize: "12px" }}>
                                    Manage tracks →
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                        }}
                    >
                        <Link
                            href="/admin/playlists/new"
                            style={{
                                display: "block",
                                textAlign: "center",
                                padding: "13px",
                                borderRadius: "14px",
                                border: "1px solid rgba(225, 220, 205, 0.4)",
                                background: "rgba(225, 220, 205, 0.12)",
                                color: "#f2eee9",
                                textDecoration: "none",
                                fontSize: "14px",
                                fontWeight: 600,
                            }}
                        >
                            + Create a playlist
                        </Link>

                        <Link
                            href="/"
                            style={{
                                display: "block",
                                textAlign: "center",
                                padding: "12px",
                                borderRadius: "14px",
                                border: "1px solid rgba(225, 220, 205, 0.25)",
                                background: "rgba(255, 255, 255, 0.04)",
                                color: "#f2eee9",
                                textDecoration: "none",
                                fontSize: "13px",
                            }}
                        >
                            Go to Music Player
                        </Link>

                        <form action={signOutAction}>
                            <button
                                type="submit"
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    borderRadius: "14px",
                                    border: "1px solid rgba(239, 68, 68, 0.35)",
                                    background: "rgba(239, 68, 68, 0.12)",
                                    color: "#fca5a5",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                }}
                            >
                                Sign out
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "12px",
                        borderTop: "1px solid rgba(225, 220, 205, 0.15)",
                    }}
                >
                    <span style={labelStyle}>STATUS: AUTHORIZED</span>
                    <span style={labelStyle}>VULP · ADMIN</span>
                </div>
            </div>
        </main>
    );
}
