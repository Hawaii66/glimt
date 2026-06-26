import { create } from "zustand";

type SettingsFocus = "friend-requests" | "add-friend" | null;

type SettingsFocusState = {
  focus: SettingsFocus;
  requestFriendRequestsFocus: () => void;
  requestAddFriendFocus: () => void;
  clearFocus: () => void;
};

export const useSettingsFocusStore = create<SettingsFocusState>((set) => ({
  focus: null,
  requestFriendRequestsFocus: () => set({ focus: "friend-requests" }),
  requestAddFriendFocus: () => set({ focus: "add-friend" }),
  clearFocus: () => set({ focus: null }),
}));
