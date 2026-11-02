"use client";

import { usePlayer } from "@/components/providers/PlayerProvider";

export function useAudioPlayer() {
    const player = usePlayer();

    return {
        tracks: player.tracks,
        currentTrack: player.currentTrack,
        currentIndex: player.currentIndex,
        isPlaying: player.isPlaying,
        isLoading: player.isLoading,
        error: player.error,

        play: player.play,
        pause: player.pause,
        togglePlay: player.togglePlay,
        playNext: player.playNext,
        playPrevious: player.playPrevious,
        loadPlaylist: player.loadPlaylist,
    };
}