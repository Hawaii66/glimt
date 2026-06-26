import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AccentThemeId } from '@/lib/accent-themes';
import { DEFAULT_ACCENT_THEME_ID } from '@/lib/accent-themes';

export type UserProfile = {
  displayName: string;
  username: string;
  localAvatarUri: string | null;
  accentTheme: AccentThemeId;
  onboardingComplete: boolean;
  pushToken: string | null;
};

type ProfileState = UserProfile & {
  hydrated: boolean;
  completeOnboarding: (profile: Omit<UserProfile, 'onboardingComplete' | 'pushToken'> & {
    pushToken?: string | null;
  }) => void;
  reset: () => void;
};

const initialProfile: UserProfile = {
  displayName: '',
  username: '',
  localAvatarUri: null,
  accentTheme: DEFAULT_ACCENT_THEME_ID,
  onboardingComplete: false,
  pushToken: null,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...initialProfile,
      hydrated: false,
      completeOnboarding: (profile) =>
        set({
          ...profile,
          accentTheme: DEFAULT_ACCENT_THEME_ID,
          onboardingComplete: true,
          pushToken: profile.pushToken ?? null,
        }),
      reset: () => set({ ...initialProfile, hydrated: true }),
    }),
    {
      name: 'glimt-profile',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useProfileStore.setState({ hydrated: true });
      },
      partialize: (state) => ({
        displayName: state.displayName,
        username: state.username,
        localAvatarUri: state.localAvatarUri,
        accentTheme: state.accentTheme,
        onboardingComplete: state.onboardingComplete,
        pushToken: state.pushToken,
      }),
    },
  ),
);
