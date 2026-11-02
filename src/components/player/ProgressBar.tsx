"use client";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function ProgressBar({
  currentTime,
  duration,
  onSeek,
}: ProgressBarProps) {
  const safeDuration = Math.max(1, duration || 258);
  const safeCurrent = Math.min(Math.max(0, currentTime), safeDuration);
  const progressPercent = (safeCurrent / safeDuration) * 100;

  return (
    <div style={{ width: "100%", userSelect: "none" }}>
      {/* Slider Container with Custom Track & Thumb */}
      <div className="player-slider">
        <input
          type="range"
          min={0}
          max={safeDuration}
          step={0.5}
          value={safeCurrent}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="Seek track"
          style={{
            background: `linear-gradient(to right, #f5f0e6 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
          }}
        />
      </div>

      {/* Timestamps */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          color: "#8a857c",
          fontFamily: "'JetBrains Mono', monospace",
          padding: "2px 2px 0",
        }}
      >
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration || 258)}</span>
      </div>
    </div>
  );
}
