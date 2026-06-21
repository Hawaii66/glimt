import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";

export function useAvatarPicker() {
  const [error, setError] = useState<string | null>(null);

  const pickImage = useCallback(
    async (useCamera: boolean): Promise<string | null> => {
      setError(null);

      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError(
          useCamera
            ? "Camera permission is required to take a photo."
            : "Photo library permission is required to choose a photo.",
        );
        return null;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]?.uri) {
        return result.assets[0].uri;
      }

      return null;
    },
    [],
  );

  return { pickImage, error, clearError: () => setError(null) };
}
