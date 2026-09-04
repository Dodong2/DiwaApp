import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";

const storage = createMMKV();
const HAS_ONBOARDED_KEY = "diwa.hasOnboarded";

type OnboardingState = {
  hasOnboarded: boolean;
  complete: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasOnboarded: storage.getBoolean(HAS_ONBOARDED_KEY) ?? false,
  complete: () => {
    storage.set(HAS_ONBOARDED_KEY, true);
    set({ hasOnboarded: true });
  },
}));