import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandMMKVStorage } from "../lib/mmkv-storage";

type SettingsStore = {
  nowPlayingAlbumId: string | null;
  setNowPlayingAlbum: (albumId: string) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      nowPlayingAlbumId: null,
      setNowPlayingAlbum: (albumId) => set({ nowPlayingAlbumId: albumId }),
    }),
    {
      name: "diwa-settings",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);