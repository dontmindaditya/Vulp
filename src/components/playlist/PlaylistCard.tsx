"use client";

import { ArrowRight } from "lucide-react";
import type { Playlist } from "@/types/playlist";

interface PlaylistCardProps {
  playlist: Playlist;
  index?: number;
  isSelected?: boolean;
  onSelect?: (playlist: Playlist) => void;
}

export default function PlaylistCard({
  playlist,
  isSelected = false,
  onSelect,
}: PlaylistCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(playlist)}
      style={{
        display: "block",
        width: "100%",
        padding: 0,
        margin: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div
        className={`playlist-card-container ${isSelected ? "active" : ""}`}
      >
        {/* Cover Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={playlist.coverUrl}
          alt={`${playlist.name} cover`}
          className="playlist-card-img"
        />

        {/* Bottom Dark Vignette */}
        <div className="playlist-card-overlay" />

        {/* Card Footer: Playlist Title & Arrow */}
        <div className="playlist-card-footer">
          <span className="playlist-card-title">
            {playlist.name}
          </span>
          <span className="playlist-card-arrow">
            <ArrowRight size={17} strokeWidth={1.8} />
          </span>
        </div>
      </div>
    </button>
  );
}
