import { create } from "zustand";
import { Track } from "../hooks/use-music-library";

export type RepeatMode = "off" | "all" | "one";

type PlayerActions = {
  playQueue: (tracks: Track[], startIndex: number, sourceFolderId?: string) => void;
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
  isExpanded: boolean; // NowPlayingModal visibility
  isShuffled: boolean;
  repeatMode: RepeatMode;
  currentSourceFolderId: string | null; // which album/folder (if any) the current queue came from
  openAlbumPlayerFolderId: string | null; // which folder's AlbumPlayerModal should show (null = closed)
  actions: PlayerActions | null;
  expand: () => void;
  minimize: () => void;
  openAlbumPlayer: (folderId: string) => void;
  closeAlbumPlayer: () => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isExpanded: false,
  isShuffled: false,
  repeatMode: "all",
  currentSourceFolderId: null,
  openAlbumPlayerFolderId: null,
  actions: null,
  expand: () => set({ isExpanded: true }),
  minimize: () => set({ isExpanded: false }),
  openAlbumPlayer: (folderId) => set({ openAlbumPlayerFolderId: folderId, isExpanded: false }),
  closeAlbumPlayer: () => set({ openAlbumPlayerFolderId: null }),
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
export const useCurrentSourceFolderId = () => usePlayerStore((s) => s.currentSourceFolderId);
export const useOpenAlbumPlayerFolderId = () => usePlayerStore((s) => s.openAlbumPlayerFolderId);