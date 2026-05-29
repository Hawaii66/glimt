import { BottomSheet } from "@expo/ui";
import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/lib/theme";

type CaptureSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
  onPhotoCaptured: (uri: string) => void;
};

export function CaptureSheet({
  isPresented,
  onDismiss,
  onPhotoCaptured,
}: CaptureSheetProps) {
  const colors = useAppColors();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (!isPresented) {
      setCameraReady(false);
      setFacing("back");
    }
  }, [isPresented]);

  const handleFlipCamera = () => {
    setCameraReady(false);
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleCapture = async () => {
    if (!cameraReady || capturing) {
      return;
    }

    setCapturing(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        onPhotoCaptured(photo.uri);
      }
    } finally {
      setCapturing(false);
    }
  };

  return (
    <BottomSheet isPresented={isPresented} onDismiss={onDismiss}>
      <View style={styles.content}>
        {!permission ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.text} />
          </View>
        ) : !permission.granted ? (
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
        ) : isPresented ? (
          <>
            <View style={styles.previewContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.preview}
                facing={facing}
                active={isPresented}
                onCameraReady={() => setCameraReady(true)}
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
          </>
        ) : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 16,
  },
  centered: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionBlock: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 24,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
  },
  previewContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111111",
  },
  preview: {
    flex: 1,
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
