"use client";

import VinylRecord from "@/components/ui/VinylRecord";

interface ArtworkProps {
  src?: string;
  alt?: string;
  isPlaying?: boolean;
}

export default function Artwork({
  src,
  alt = "Vinyl Record",
  isPlaying = false,
}: ArtworkProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 0",
      }}
      title={alt}
    >
      <VinylRecord
        isPlaying={isPlaying}
        centerImageUrl={src || "/images/cover.png"}
        size={220}
      />
    </div>
  );
}
