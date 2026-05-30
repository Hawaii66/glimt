import { create } from "zustand";

type SettingsFocus = "friend-requests" | null;

type SettingsFocusState = {
  focus: SettingsFocus;
  requestFriendRequestsFocus: () => void;
  clearFocus: () => void;
};

export const useSettingsFocusStore = create<SettingsFocusState>((set) => ({
  focus: null,
  requestFriendRequestsFocus: () => set({ focus: "friend-requests" }),
  clearFocus: () => set({ focus: null }),
}));
