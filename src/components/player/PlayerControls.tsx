"use client";

import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function PlayerControls({
  isPlaying,
  canGoPrevious,
  canGoNext,
  onPlayPause,
  onPrevious,
  onNext,
}: PlayerControlsProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "28px",
        paddingTop: "4px",
        userSelect: "none",
      }}
    >
      {/* Previous Track */}
      <button
        type="button"
        className="ctrl-btn btn-sm"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        aria-label="Previous track"
      >
        <SkipBack size={18} strokeWidth={1.8} fill="currentColor" />
      </button>

      {/* Play / Pause */}
      <button
        type="button"
        className="ctrl-btn btn-lg"
        onClick={onPlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause size={24} strokeWidth={2.4} />
        ) : (
          <Play
            size={24}
            strokeWidth={2.4}
            fill="currentColor"
            style={{ marginLeft: "2px" }}
          />
        )}
      </button>

      {/* Next Track */}
      <button
        type="button"
        className="ctrl-btn btn-sm"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next track"
      >
        <SkipForward size={18} strokeWidth={1.8} fill="currentColor" />
      </button>
    </div>
  );
}
