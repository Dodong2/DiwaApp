import { create } from "zustand";
import { Track } from "../hooks/use-music-library";

type PlayerActions = {
  playQueue: (tracks: Track[], startIndex: number) => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  stop: () => void;
  seekTo: (seconds: number) => void;
};

type PlayerState = {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isExpanded: boolean; // true = big Now Playing screen showing, false = mini-player only
  actions: PlayerActions | null;
  expand: () => void;
  minimize: () => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isExpanded: false,
  actions: null,
  expand: () => set({ isExpanded: true }),
  minimize: () => set({ isExpanded: false }),
}));

// Selective selector hooks — each component subscribes only to the slice it needs.
export const useCurrentTrack = () => usePlayerStore((s) => s.currentTrack);
export const useIsPlaying = () => usePlayerStore((s) => s.isPlaying);
export const useCurrentTime = () => usePlayerStore((s) => s.currentTime);
export const useDuration = () => usePlayerStore((s) => s.duration);
export const usePlayerActions = () => usePlayerStore((s) => s.actions);
export const useIsExpanded = () => usePlayerStore((s) => s.isExpanded);