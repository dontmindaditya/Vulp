"use client";

interface VinylRecordProps {
  isPlaying?: boolean;
  centerImageUrl?: string;
  size?: number;
}

export default function VinylRecord({
  isPlaying = false,
  centerImageUrl = "/images/cover.png",
  size = 220,
}: VinylRecordProps) {
  const centerSize = Math.round(size * 0.38);
  const holeSize = Math.max(10, Math.round(size * 0.045));

  return (
    <div
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        margin: "0 auto",
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {/* Vinyl Disc Body */}
      <div
        className={`spin-vinyl ${isPlaying ? "" : "spin-paused"}`}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          borderRadius: "50%",
          overflow: "hidden",
          background:
            "radial-gradient(circle, #1a1a1c 0%, #0c0d10 65%, #050507 100%)",
          boxShadow: "0 14px 40px rgba(0, 0, 0, 0.95)",
        }}
      >
        {/* Concentric Circular Grooves */}
        <div style={{ position: "absolute", inset: "6px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: "14px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: "24px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: "34px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: "46px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: "58px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: "70px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        {/* Realistic Specular Reflection (Classic Vinyl Sheen) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.16) 45deg, transparent 90deg, transparent 180deg, rgba(255,255,255,0.16) 225deg, transparent 270deg)",
            mixBlendMode: "screen",
            opacity: 0.4,
            pointerEvents: "none",
          }}
        />

        {/* Center Circular Paper Label */}
        <div
          style={{
            width: `${centerSize}px`,
            height: `${centerSize}px`,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid #2a2a2a",
            boxShadow: "inset 0 0 8px rgba(0,0,0,0.8)",
            zIndex: 5,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={centerImageUrl}
            alt="Vinyl label artwork"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {/* Center Spindle Hole */}
        <div
          style={{
            width: `${holeSize}px`,
            height: `${holeSize}px`,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            backgroundColor: "#050507",
            border: "1px solid #333333",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.9)",
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
}
