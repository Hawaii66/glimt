import { create } from "zustand";

type CaptureState = {
  localPhotoUri: string | null;
  caption: string;
  setLocalPhotoUri: (localPhotoUri: string | null) => void;
  setCaption: (caption: string) => void;
  reset: () => void;
};

const initialState = {
  localPhotoUri: null as string | null,
  caption: "",
};

export const useCaptureStore = create<CaptureState>((set) => ({
  ...initialState,
  setLocalPhotoUri: (localPhotoUri) => set({ localPhotoUri }),
  setCaption: (caption) => set({ caption }),
  reset: () => set(initialState),
}));
