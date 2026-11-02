"use client";

import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

import Artwork from "./Artwork";
import ProgressBar from "./ProgressBar";
import PlayerControls from "./PlayerControls";
import Waveform from "@/components/ui/Waveform";
import SakuraBranch from "@/components/ui/SakuraBranch";
import StarsBackground from "@/components/ui/StarsBackground";

import { usePlayer } from "@/components/providers/PlayerProvider";

interface MusicPlayerProps {
  playlistSlug: string;
  playlistName?: string;
  showBackLink?: boolean;
  onBackClick?: () => void;
}

export default function MusicPlayer({
  playlistSlug,
  playlistName,
  showBackLink = true,
  onBackClick,
}: MusicPlayerProps) {
  const {
    tracks,
    currentTrack,
    currentIndex,
    currentTime,
    duration,
    isPlaying,
    loadPlaylist,
    togglePlay,
    playNext,
    playPrevious,
    seek,
  } = usePlayer();

  useEffect(() => {
    let active = true;

    async function initializePlaylist() {
      try {
        const res = await fetch(
          `/api/tracks?playlistSlug=${encodeURIComponent(playlistSlug)}`
        );
        if (res.ok) {
          const json = await res.json();
          if (active && json.data && Array.isArray(json.data)) {
            loadPlaylist(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load playlist tracks:", err);
      }
    }

    void initializePlaylist();

    return () => {
      active = false;
    };
  }, [playlistSlug, loadPlaylist]);

  const displayName = playlistName || playlistSlug.replace(/-/g, " ");

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Background Image: music-player.png */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/music-player.png"
        alt="Music player background"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Subtle vignette overlay so controls and vinyl are crisp */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(5,5,7,0.4) 0%, rgba(5,5,7,0.15) 50%, rgba(5,5,7,0.6) 100%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Celestial Stars & Sakura Blossoms */}
      <StarsBackground />
      <SakuraBranch />

      {/* Top Header: Back Arrow + Playlist Name */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        {showBackLink ? (
          <button
            type="button"
            onClick={onBackClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "transparent",
              border: "none",
              color: "#f2eee9",
              fontFamily: "'Caveat', cursive",
              fontSize: "26px",
              letterSpacing: "0.5px",
              cursor: "pointer",
              padding: 0,
              textShadow: "0 2px 6px rgba(0,0,0,0.85)",
            }}
            aria-label="Back to playlists"
          >
            <ArrowLeft size={22} strokeWidth={2} />
            <span>{displayName}</span>
          </button>
        ) : (
          <span
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "26px",
              color: "#f2eee9",
              letterSpacing: "0.5px",
              textShadow: "0 2px 6px rgba(0,0,0,0.8)",
            }}
          >
            {displayName}
          </span>
        )}
      </div>

      {/* Center: Vinyl Record with Spinning Artwork */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px 0",
          flex: 1,
        }}
      >
        <Artwork
          src={currentTrack?.artworkUrl || "/images/cover.png"}
          alt={`${currentTrack?.title || displayName} Vinyl`}
          isPlaying={isPlaying}
        />
      </div>

      {/* Bottom: Player Controls Box */}
      <div className="player-controls-box">
        {/* Waveform */}
        <Waveform isPlaying={isPlaying} />

        {/* Progress Bar & Timestamps */}
        <ProgressBar
          currentTime={currentTime}
          duration={duration || currentTrack?.duration || 258}
          onSeek={seek}
        />

        {/* Previous / Play-Pause / Next Controls */}
        <PlayerControls
          isPlaying={isPlaying}
          canGoPrevious={currentIndex > 0}
          canGoNext={currentIndex < tracks.length - 1}
          onPlayPause={togglePlay}
          onPrevious={playPrevious}
          onNext={playNext}
        />
      </div>
    </div>
  );
}
