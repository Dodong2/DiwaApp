import { create } from "zustand";

type ToastStore = {
  message: string | null;
  show: (message: string) => void;
};

let hideTimeout: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastStore>((set) => ({
  message: null,
  show: (message) => {
    if (hideTimeout) clearTimeout(hideTimeout);
    set({ message });
    hideTimeout = setTimeout(() => set({ message: null }), 1500);
  },
}));