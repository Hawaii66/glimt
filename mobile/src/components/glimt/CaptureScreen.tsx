import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { APP_CAPTURE_COMPOSE } from "@/lib/routes";
import { useAppColors } from "@/lib/theme";
import { useCaptureStore } from "@/stores/captureStore";

const HORIZONTAL_PADDING = 24;

export function CaptureScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const previewSize = windowWidth - HORIZONTAL_PADDING * 2;
  const setLocalPhotoUri = useCaptureStore((state) => state.setLocalPhotoUri);
  const setCameraFacing = useCaptureStore((state) => state.setCameraFacing);
  const facing = useCaptureStore((state) => state.cameraFacing);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const lastPreviewTapRef = useRef(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFrontCamera = facing === "front";

  useEffect(() => {
    return () => {
      setCameraReady(false);
    };
  }, []);

  const handleFlipCamera = () => {
    setError(null);
    setCameraReady(false);
    setCameraFacing(facing === "back" ? "front" : "back");
  };

  const handlePreviewPress = () => {
    const now = Date.now();
    if (now - lastPreviewTapRef.current <= 300) {
      handleFlipCamera();
      lastPreviewTapRef.current = 0;
      return;
    }
    lastPreviewTapRef.current = now;
  };

  const handleCapture = useCallback(async () => {
    if (capturing) {
      return;
    }

    setError(null);
    setCapturing(true);

    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
        mirror: isFrontCamera,
      });

      if (!photo?.uri) {
        throw new Error("Could not capture photo. Please try again.");
      }

      setLocalPhotoUri(photo.uri);
      router.push(APP_CAPTURE_COMPOSE);
    } catch (captureError) {
      const message =
        captureError instanceof Error
          ? captureError.message
          : "Could not capture photo. Please try again.";
      setError(message);
    } finally {
      setCapturing(false);
    }
  }, [capturing, isFrontCamera, router, setLocalPhotoUri]);

  if (!permission) {
    return (
      <View style={styles.content}>
        <View
          style={[styles.centered, { width: previewSize, height: previewSize }]}
        >
          <ActivityIndicator color={colors.text} />
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.content}>
        <View style={styles.permissionBlock}>
          <Text style={[styles.permissionText, { color: colors.textMuted }]}>
            Camera access is needed to take a glimt.
          </Text>
          <Pressable
            style={[styles.captureButton, { width: previewSize }]}
            onPress={() => {
              void requestPermission();
            }}
          >
            <Text style={styles.captureButtonText}>Allow camera</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <View style={styles.controls}>
        <View
          style={[
            styles.previewContainer,
            { width: previewSize, height: previewSize },
          ]}
        >
          <CameraView
            ref={cameraRef}
            style={styles.preview}
            facing={facing}
            mode="picture"
            mirror={isFrontCamera}
            active
            ratio={Platform.OS === "android" ? "1:1" : undefined}
            onCameraReady={() => setCameraReady(true)}
            onMountError={({ message }) => {
              setCameraReady(false);
              setError(message);
            }}
          />
          <View style={styles.previewOverlay} pointerEvents="box-none">
            <Pressable
              style={styles.previewTapTarget}
              onPress={handlePreviewPress}
              accessibilityRole="button"
              accessibilityLabel="Double tap to flip camera"
            />
            <Pressable
              style={styles.flipButton}
              onPress={handleFlipCamera}
              accessibilityRole="button"
              accessibilityLabel="Flip camera"
            >
              <SymbolView
                name="arrow.triangle.2.circlepath.camera"
                size={20}
                tintColor="#FFFFFF"
                weight="semibold"
              />
            </Pressable>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={[
            styles.captureButton,
            { width: previewSize },
            capturing && styles.captureButtonDisabled,
          ]}
          disabled={capturing}
          onPress={() => {
            void handleCapture();
          }}
        >
          {capturing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.captureButtonText}>
              {cameraReady ? "Take picture" : "Preparing camera..."}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  controls: {
    alignItems: "center",
    gap: 16,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  permissionBlock: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
  },
  previewContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111111",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  previewOverlay: {
    ...StyleSheet.absoluteFill,
  },
  previewTapTarget: {
    ...StyleSheet.absoluteFill,
  },
  flipButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 8,
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
