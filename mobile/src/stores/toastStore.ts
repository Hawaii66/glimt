import { create } from "zustand";

const TOAST_DURATION_MS = 3000;

type ToastState = {
  message: string | null;
  show: (message: string) => void;
  hide: () => void;
};

let hideTimeout: ReturnType<typeof setTimeout> | null = null;

function clearHideTimeout() {
  if (hideTimeout !== null) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    clearHideTimeout();
    set({ message });
    hideTimeout = setTimeout(() => {
      set({ message: null });
      hideTimeout = null;
    }, TOAST_DURATION_MS);
  },
  hide: () => {
    clearHideTimeout();
    set({ message: null });
  },
}));
