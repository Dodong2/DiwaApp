import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandMMKVStorage } from "../lib/mmkv-storage";

export type SearchHistoryEntry = {
  term: string;
  timestamp: number;
};

type SearchHistoryStore = {
  history: SearchHistoryEntry[];
  addSearch: (query: string) => void;
  clearHistory: () => void;
};

const MAX_HISTORY = 20;

// Factory takes a unique `storageName` so each domain (music vs album search)
// persists to its own separate MMKV key — otherwise they'd overwrite each other.
function createSearchHistoryStore(storageName: string) {
  return create<SearchHistoryStore>()(
    persist(
      (set) => ({
        history: [],
        addSearch: (query) =>
          set((state) => {
            const trimmed = query.trim();
            if (!trimmed) return state;

            const withoutDupe = state.history.filter(
              (h) => h.term.toLowerCase() !== trimmed.toLowerCase()
            );

            return {
              history: [{ term: trimmed, timestamp: Date.now() }, ...withoutDupe].slice(
                0,
                MAX_HISTORY
              ),
            };
          }),
        clearHistory: () => set({ history: [] }),
      }),
      {
        name: storageName,
        storage: createJSONStorage(() => zustandMMKVStorage),
      }
    )
  );
}

export const useMusicSearchHistoryStore = createSearchHistoryStore("diwa-search-history-music");
export const useAlbumSearchHistoryStore = createSearchHistoryStore("diwa-search-history-album");