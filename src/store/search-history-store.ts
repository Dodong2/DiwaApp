import { create } from "zustand";

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

// Factory so we can create separate, independent history stores for
// different search "domains" (music, photo albums, etc.) without
// duplicating this logic each time.
function createSearchHistoryStore() {
  return create<SearchHistoryStore>((set) => ({
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
  }));
}

export const useMusicSearchHistoryStore = createSearchHistoryStore();
export const useAlbumSearchHistoryStore = createSearchHistoryStore();