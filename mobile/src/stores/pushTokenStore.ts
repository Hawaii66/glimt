import { create } from "zustand";

type PushTokenStore = {
  token: string | null;
  setToken: (token: string | null) => void;
};

export const usePushTokenStore = create<PushTokenStore>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
}));
