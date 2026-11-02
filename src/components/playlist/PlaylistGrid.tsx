"use client";

import PlaylistCard from "./PlaylistCard";
import type { Playlist } from "@/types/playlist";

interface PlaylistGridProps {
  playlists: Playlist[];
  selectedSlug?: string;
  onSelectPlaylist?: (playlist: Playlist) => void;
}

export default function PlaylistGrid({
  playlists,
  selectedSlug,
  onSelectPlaylist,
}: PlaylistGridProps) {
  if (!playlists || playlists.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 0",
          color: "rgba(255,255,255,0.4)",
          fontFamily: "'Caveat', cursive",
          fontSize: "20px",
        }}
      >
        <p>No playlists found.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "12px",
        width: "100%",
      }}
    >
      {playlists.map((playlist, index) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          index={index}
          isSelected={selectedSlug === playlist.slug}
          onSelect={onSelectPlaylist}
        />
      ))}
    </div>
  );
}
