import { create } from "zustand";

type MockUnlockState = {
  unlockedDates: Record<string, string[]>;
  unlockDay: (friendId: string, isoDate: string) => void;
  isUnlocked: (friendId: string, isoDate: string) => boolean;
};

export const useMockUnlockStore = create<MockUnlockState>((set, get) => ({
  unlockedDates: {},
  unlockDay: (friendId, isoDate) => {
    set((state) => {
      const existing = state.unlockedDates[friendId] ?? [];
      if (existing.includes(isoDate)) {
        return state;
      }
      return {
        unlockedDates: {
          ...state.unlockedDates,
          [friendId]: [...existing, isoDate],
        },
      };
    });
  },
  isUnlocked: (friendId, isoDate) => {
    return (get().unlockedDates[friendId] ?? []).includes(isoDate);
  },
}));
