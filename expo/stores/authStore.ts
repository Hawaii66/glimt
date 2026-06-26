import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthState = {
  isAuthenticated: boolean;
  name: string | null;
  hydrated: boolean;
  signIn: (name?: string | null) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      name: null,
      hydrated: false,
      signIn: (name) =>
        set({
          isAuthenticated: true,
          name: name?.trim() || null,
        }),
      signOut: () =>
        set({
          isAuthenticated: false,
          name: null,
        }),
    }),
    {
      name: 'glimt-auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hydrated: true });
      },
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        name: state.name,
      }),
    },
  ),
);
