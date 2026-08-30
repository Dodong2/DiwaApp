import { create } from "zustand";

type SettingsStore = {
  nowPlayingAlbumId: string | null;
  setNowPlayingAlbum: (albumId: string) => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  nowPlayingAlbumId: null,
  setNowPlayingAlbum: (albumId) => set({ nowPlayingAlbumId: albumId }),
}));