import { create } from "zustand";

import {
  DEFAULT_ACCENT_THEME_ID,
  resolveAccentThemeId,
  type AccentThemeId,
} from "@/lib/accent-themes";

type OnboardingUser = {
  name?: string | null;
  accentTheme?: AccentThemeId | null;
};

type OnboardingState = {
  displayName: string;
  username: string;
  localAvatarUri: string | null;
  accentTheme: AccentThemeId;
  setDisplayName: (displayName: string) => void;
  setUsername: (username: string) => void;
  setLocalAvatarUri: (localAvatarUri: string | null) => void;
  setAccentTheme: (accentTheme: AccentThemeId) => void;
  seedFromUser: (user: OnboardingUser | null | undefined) => void;
  reset: () => void;
};

const initialState = {
  displayName: "",
  username: "",
  localAvatarUri: null as string | null,
  accentTheme: DEFAULT_ACCENT_THEME_ID,
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,
  setDisplayName: (displayName) => set({ displayName }),
  setUsername: (username) => set({ username }),
  setLocalAvatarUri: (localAvatarUri) => set({ localAvatarUri }),
  setAccentTheme: (accentTheme) => set({ accentTheme }),
  seedFromUser: (user) => {
    const updates: Partial<typeof initialState> = {};

    if (!get().displayName.trim()) {
      const name = user?.name?.trim();
      if (name) {
        updates.displayName = name;
      }
    }

    if (get().accentTheme === DEFAULT_ACCENT_THEME_ID && user?.accentTheme) {
      updates.accentTheme = resolveAccentThemeId(user.accentTheme);
    }

    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },
  reset: () => set(initialState),
}));
