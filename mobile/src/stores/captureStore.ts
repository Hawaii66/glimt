import type { CameraType } from "expo-camera";
import { create } from "zustand";

export type LocalGlimt = {
  id: string;
  photoUri: string;
  caption: string;
  capturedAt: number;
};

type CaptureState = {
  localPhotoUri: string | null;
  caption: string;
  cameraFacing: CameraType;
  glimts: LocalGlimt[];
  setLocalPhotoUri: (localPhotoUri: string | null) => void;
  setCaption: (caption: string) => void;
  setCameraFacing: (cameraFacing: CameraType) => void;
  saveGlimt: () => void;
  reset: () => void;
};

const initialState = {
  localPhotoUri: null as string | null,
  caption: "",
  cameraFacing: "back" as CameraType,
  glimts: [] as LocalGlimt[],
};

export const useCaptureStore = create<CaptureState>((set, get) => ({
  ...initialState,
  setLocalPhotoUri: (localPhotoUri) => set({ localPhotoUri }),
  setCaption: (caption) => set({ caption }),
  setCameraFacing: (cameraFacing) => set({ cameraFacing }),
  saveGlimt: () => {
    const { localPhotoUri, caption } = get();
    if (!localPhotoUri) {
      return;
    }

    set((state) => ({
      glimts: [
        {
          id: `${Date.now()}`,
          photoUri: localPhotoUri,
          caption: caption.trim(),
          capturedAt: Date.now(),
        },
        ...state.glimts,
      ],
      localPhotoUri: null,
      caption: "",
    }));
  },
  reset: () =>
    set((state) => ({
      ...initialState,
      glimts: state.glimts,
      cameraFacing: state.cameraFacing,
    })),
}));
