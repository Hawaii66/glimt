import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  DEFAULT_ACCENT_THEME_ID,
  type AccentThemeId,
} from "@/lib/accent-themes";

type AccentThemeState = {
  accentId: AccentThemeId;
  setAccentId: (accentId: AccentThemeId) => void;
};

export const useAccentThemeStore = create<AccentThemeState>()(
  persist(
    (set) => ({
      accentId: DEFAULT_ACCENT_THEME_ID,
      setAccentId: (accentId) => set({ accentId }),
    }),
    {
      name: "glimt-accent-theme",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
