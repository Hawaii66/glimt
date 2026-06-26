import { create } from 'zustand';

import { DEFAULT_ACCENT_THEME_ID, type AccentThemeId } from '@/lib/accent-themes';

type OnboardingSeed = {
  name?: string | null;
};

type OnboardingState = {
  displayName: string;
  username: string;
  localAvatarUri: string | null;
  accentTheme: AccentThemeId;
  pushToken: string | null;
  setDisplayName: (displayName: string) => void;
  setUsername: (username: string) => void;
  setLocalAvatarUri: (localAvatarUri: string | null) => void;
  setPushToken: (pushToken: string | null) => void;
  seedFromUser: (user: OnboardingSeed | null | undefined) => void;
  reset: () => void;
};

const initialState = {
  displayName: '',
  username: '',
  localAvatarUri: null as string | null,
  accentTheme: DEFAULT_ACCENT_THEME_ID,
  pushToken: null as string | null,
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,
  setDisplayName: (displayName) => set({ displayName }),
  setUsername: (username) => set({ username }),
  setLocalAvatarUri: (localAvatarUri) => set({ localAvatarUri }),
  setPushToken: (pushToken) => set({ pushToken }),
  seedFromUser: (user) => {
    if (!get().displayName.trim()) {
      const name = user?.name?.trim();
      if (name) {
        set({ displayName: name });
      }
    }
  },
  reset: () => set(initialState),
}));
