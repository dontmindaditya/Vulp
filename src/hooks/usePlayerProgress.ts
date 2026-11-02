"use client";

import { usePlayer } from "@/components/providers/PlayerProvider";

export function usePlayerProgress() {
    const { currentTime, duration, seek } = usePlayer();

    const progress =
        duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

    const formatTime = (seconds: number) => {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return "0:00";
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
    };

    return {
        currentTime,
        duration,
        progress,
        currentTimeFormatted: formatTime(currentTime),
        durationFormatted: formatTime(duration),
        seek,
    };
}