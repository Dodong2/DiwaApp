import { createMMKV, MMKV } from "react-native-mmkv";
import { StateStorage } from "zustand/middleware";

export const storage = createMMKV();

// Zustand's persist middleware expects this exact shape (getItem/setItem/removeItem).
// MMKV itself is synchronous, but we still return values directly — Zustand's
// createJSONStorage handles both sync and async storage adapters fine.
export const zustandMMKVStorage: StateStorage = {
  setItem: (name, value) => {
    storage.set(name, value);
  },
  getItem: (name) => {
    return storage.getString(name) ?? null;
  },
  removeItem: (name) => {
    storage.remove(name);
  },
};