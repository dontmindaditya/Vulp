"use client";

import { useState, useEffect } from "react";
import MoonHeader from "@/components/ui/MoonHeader";
import PlaylistGrid from "@/components/playlist/PlaylistGrid";
import MusicPlayer from "@/components/player/MusicPlayer";
import { createClient } from "@/lib/supabase/client";
import type { Playlist } from "@/types/playlist";

export default function HomePage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  // Controls whether the player is open
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  // On mobile screens (< 920px), toggle between grid view and player view
  const [mobileView, setMobileView] = useState<"grid" | "player">("grid");

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const res = await fetch("/api/playlists");
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            setPlaylists(json.data);
            setSelectedPlaylist((prev) => {
              if (!prev) return json.data[0] || null;
              const matching = json.data.find((p: Playlist) => p.id === prev.id || p.slug === prev.slug);
              return matching || prev;
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch playlists:", err);
      }
    }

    void fetchPlaylists();

    // Supabase Realtime channel subscription
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel("realtime-playlists")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "playlists",
          },
          () => {
            void fetchPlaylists();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Supabase Realtime not initialized:", err);
    }

    return () => {
      if (channel) {
        const supabase = createClient();
        void supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setIsPlayerOpen(true);
    setMobileView("player");
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setMobileView("grid");
  };

  // Default to first playlist for smooth initial mount
  const activePlaylist = selectedPlaylist || (playlists.length > 0 ? playlists[0] : null);

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
      {/* 
        Stage:
        - When closed: centers the single playlist frame (width: 440px)
        - When opened: smoothly widens to accommodate both frames (width: 908px)
      */}
      <div
        className="main-stage"
        style={{
          maxWidth: isPlayerOpen ? "908px" : "440px",
        }}
      >
        {/* ================= LEFT FRAME: Playlists Screen ================= */}
        <div
          style={{
            display: mobileView === "player" && isPlayerOpen ? undefined : "block",
            width: "440px",
            maxWidth: "100%",
            flexShrink: 0,
          }}
          className={mobileView === "player" && isPlayerOpen ? "hidden-mobile" : "visible-frame"}
        >
          <div className="phone-frame">
            {/* Header: Title + Scribble Underline + Crescent Moon */}
            <div
              style={{
                position: "relative",
                zIndex: 10,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "16px",
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
                    textShadow: "0 2px 6px rgba(0,0,0,0.85)",
                  }}
                >
                  Hello welcome to
                </p>
                <h1
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "30px",
                    color: "#ffffff",
                    letterSpacing: "0.5px",
                    marginTop: "2px",
                    lineHeight: 1.1,
                    textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                  }}
                >
                  bow tie&apos;s music player
                </h1>

                {/* Hand-drawn Underline Scribble under 'bow tie's' */}
                <svg
                  style={{
                    width: "120px",
                    height: "10px",
                    marginTop: "4px",
                    color: "rgba(255, 255, 255, 0.55)",
                  }}
                  viewBox="0 0 120 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 2 5 Q 30 1 60 6 T 118 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Crescent Moon */}
              <MoonHeader size={52} />
            </div>

            {/* 6 Playlists Grid (2 cols x 3 rows) */}
            <div
              style={{
                position: "relative",
                zIndex: 10,
                flex: 1,
                display: "flex",
                alignItems: "center",
                padding: "4px 0",
              }}
            >
              <PlaylistGrid
                playlists={playlists}
                selectedSlug={isPlayerOpen ? activePlaylist?.slug : undefined}
                onSelectPlaylist={handleSelectPlaylist}
              />
            </div>

            {/* Footer Prompt */}
            <div
              style={{
                position: "relative",
                zIndex: 10,
                textAlign: "center",
                paddingTop: "12px",
                userSelect: "none",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.4)",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  fontFamily: "'JetBrains Mono', monospace",
                  textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                }}
              >
                Click any playlist to listen
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT FRAME: Music Player with Smooth Slide Animation ================= */}
        {/* On Desktop: Smooth width & transform expansion from the right */}
        <div
          className={`player-desktop-wrapper ${
            isPlayerOpen ? "open" : "closed"
          } ${mobileView === "grid" ? "hidden-mobile" : "visible-frame"}`}
        >
          <div className="phone-frame">
            {activePlaylist && (
              <MusicPlayer
                playlistSlug={activePlaylist.slug}
                playlistName={activePlaylist.name}
                showBackLink={true}
                onBackClick={handleClosePlayer}
              />
            )}
          </div>
        </div>
      </div>

      {/* Responsive media query helper for mobile screen toggle */}
      <style jsx global>{`
        @media (max-width: 919px) {
          .hidden-mobile {
            display: none !important;
          }
          .visible-frame {
            display: block !important;
          }
          .player-desktop-wrapper {
            margin-left: 0 !important;
            transition: none !important;
          }
          .player-desktop-wrapper.open {
            width: 100% !important;
            max-width: 440px !important;
          }
        }
        @media (min-width: 920px) {
          .hidden-mobile {
            display: block !important;
          }
          .visible-frame {
            display: block !important;
          }
        }
      `}</style>
    </main>
  );
}
