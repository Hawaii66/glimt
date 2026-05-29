import { create } from "zustand";

import type { CameraType } from "expo-camera";

type CaptureState = {
  localPhotoUri: string | null;
  caption: string;
  cameraFacing: CameraType;
  setLocalPhotoUri: (localPhotoUri: string | null) => void;
  setCaption: (caption: string) => void;
  setCameraFacing: (cameraFacing: CameraType) => void;
  reset: () => void;
};

const initialState = {
  localPhotoUri: null as string | null,
  caption: "",
  cameraFacing: "back" as CameraType,
};

export const useCaptureStore = create<CaptureState>((set) => ({
  ...initialState,
  setLocalPhotoUri: (localPhotoUri) => set({ localPhotoUri }),
  setCaption: (caption) => set({ caption }),
  setCameraFacing: (cameraFacing) => set({ cameraFacing }),
  reset: () => set(initialState),
}));
