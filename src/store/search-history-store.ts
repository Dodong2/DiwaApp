import { create } from "zustand";

type SearchHistoryStore = {
  history: string[];
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
      // remove duplicate if it already exists, then put it at the front
      const withoutDupe = state.history.filter(
        (h) => h.toLowerCase() !== trimmed.toLowerCase()
      );
      return { history: [trimmed, ...withoutDupe].slice(0, MAX_HISTORY) };
    }),
  clearHistory: () => set({ history: [] }),
}));