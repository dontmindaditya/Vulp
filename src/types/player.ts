import type { Track } from "./track";

export interface PlayerState {
    playlistId: string | null;
    tracks: Track[];
    currentIndex: number;
    currentTrack: Track | null;

    isPlaying: boolean;
    isLoading: boolean;

    currentTime: number;
    duration: number;

    error: string | null;
}

export type PlayerAction =
    | "play"
    | "pause"
    | "next"
    | "previous"
    | "seek";

export interface PlayerContextValue extends PlayerState {
    play: () => Promise<void>;
    pause: () => void;
    togglePlay: () => void;
    playNext: () => void;
    playPrevious: () => void;
    seek: (time: number) => void;
}