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

export const useSearchHistoryStore = create<SearchHistoryStore>((set) => ({
  history: [],
  addSearch: (query) =>
    set((state) => {
      const trimmed = query.trim();
      if (!trimmed) return state;

      // remove duplicate if it already exists (case-insensitive), then
      // re-add it at the front with a fresh timestamp — re-searching
      // something counts as "now", so it should show as most recent.
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