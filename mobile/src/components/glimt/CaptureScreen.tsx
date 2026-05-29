import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { APP_CAPTURE_COMPOSE } from "@/lib/routes";
import { useAppColors } from "@/lib/theme";
import { useCaptureStore } from "@/stores/captureStore";

export function CaptureScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const setLocalPhotoUri = useCaptureStore((state) => state.setLocalPhotoUri);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    return () => {
      setCameraReady(false);
    };
  }, []);

  const handleCapture = async () => {
    if (!cameraReady || capturing) {
      return;
    }

    setCapturing(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setLocalPhotoUri(photo.uri);
        router.replace(APP_CAPTURE_COMPOSE);
      }
    } finally {
      setCapturing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionBlock}>
        <Text style={[styles.permissionText, { color: colors.textMuted }]}>
          Camera access is needed to take a glimt.
        </Text>
        <Pressable
          style={styles.captureButton}
          onPress={() => {
            void requestPermission();
          }}
        >
          <Text style={styles.captureButtonText}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <View style={styles.previewContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.preview}
          facing="back"
          active
          onCameraReady={() => setCameraReady(true)}
        />
      </View>
      <Pressable
        style={[
          styles.captureButton,
          (!cameraReady || capturing) && styles.captureButtonDisabled,
        ]}
        disabled={!cameraReady || capturing}
        onPress={() => {
          void handleCapture();
        }}
      >
        {capturing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.captureButtonText}>Take picture</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
  },
  previewContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111111",
  },
  preview: {
    flex: 1,
  },
  captureButton: {
    backgroundColor: "#111111",
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
