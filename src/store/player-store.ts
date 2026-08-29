import { create } from "zustand";
import { Track } from "../hooks/use-music-library";

type PlayerActions = {
  playQueue: (tracks: Track[], startIndex: number) => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
};

type PlayerState = {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  actions: PlayerActions | null; // set once by PlayerProvider once the audio engine is ready
};

export const usePlayerStore = create<PlayerState>(() => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  actions: null,
}));

// Convenience hooks: components pick exactly the slice they need,
// so a component reading only `currentTrack` never re-renders on `currentTime` ticks.
export const useCurrentTrack = () => usePlayerStore((s) => s.currentTrack);
export const useIsPlaying = () => usePlayerStore((s) => s.isPlaying);
export const usePlaybackProgress = () =>
  usePlayerStore((s) => ({ currentTime: s.currentTime, duration: s.duration }));
export const usePlayerActions = () => usePlayerStore((s) => s.actions);
