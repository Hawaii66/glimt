import { create } from "zustand";

type OnboardingUser = {
  name?: string | null;
};

type OnboardingState = {
  displayName: string;
  username: string;
  localAvatarUri: string | null;
  setDisplayName: (displayName: string) => void;
  setUsername: (username: string) => void;
  setLocalAvatarUri: (localAvatarUri: string | null) => void;
  seedFromUser: (user: OnboardingUser | null | undefined) => void;
  reset: () => void;
};

const initialState = {
  displayName: "",
  username: "",
  localAvatarUri: null as string | null,
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,
  setDisplayName: (displayName) => set({ displayName }),
  setUsername: (username) => set({ username }),
  setLocalAvatarUri: (localAvatarUri) => set({ localAvatarUri }),
  seedFromUser: (user) => {
    const updates: Partial<typeof initialState> = {};

    if (!get().displayName.trim()) {
      const name = user?.name?.trim();
      if (name) {
        updates.displayName = name;
      }
    }

    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },
  reset: () => set(initialState),
}));
