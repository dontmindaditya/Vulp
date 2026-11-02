import { create } from "zustand";
import type { Track } from "@/types/track";

interface PlayerStore {
    playlistId: string | null;
    tracks: Track[];
    currentIndex: number;
    currentTrack: Track | null;

    isPlaying: boolean;
    isLoading: boolean;
    currentTime: number;
    duration: number;
    error: string | null;

    setPlaylist: (playlistId: string, tracks: Track[]) => void;
    setCurrentTrack: (index: number) => void;
    setPlaying: (playing: boolean) => void;
    setLoading: (loading: boolean) => void;
    setProgress: (currentTime: number, duration: number) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

const initialState = {
    playlistId: null,
    tracks: [],
    currentIndex: 0,
    currentTrack: null,
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    error: null,
};

export const usePlayerStore = create<PlayerStore>((set) => ({
    ...initialState,

    setPlaylist: (playlistId, tracks) =>
        set({
            playlistId,
            tracks,
            currentIndex: 0,
            currentTrack: tracks[0] ?? null,
            isPlaying: false,
            isLoading: false,
            currentTime: 0,
            duration: 0,
            error: null,
        }),

    setCurrentTrack: (index) =>
        set((state) => ({
            currentIndex: index,
            currentTrack: state.tracks[index] ?? null,
            currentTime: 0,
            duration: 0,
            error: null,
        })),

    setPlaying: (isPlaying) => set({ isPlaying }),

    setLoading: (isLoading) => set({ isLoading }),

    setProgress: (currentTime, duration) =>
        set({ currentTime, duration }),

    setError: (error) => set({ error }),

    reset: () => set(initialState),
}));