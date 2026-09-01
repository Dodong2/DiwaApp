import { create } from "zustand";
import { Track } from "../hooks/use-music-library";

export type RepeatMode = "off" | "all" | "one";

type PlayerActions = {
  playQueue: (tracks: Track[], startIndex: number) => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  stop: () => void;
  seekTo: (seconds: number) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
};

type PlayerState = {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isExpanded: boolean;
  isShuffled: boolean;
  repeatMode: RepeatMode;
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
  isShuffled: false,
  repeatMode: "all", // matches the playlist's default loop mode
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
export const useIsShuffled = () => usePlayerStore((s) => s.isShuffled);
export const useRepeatMode = () => usePlayerStore((s) => s.repeatMode);