import { Image } from "expo-image";
import { Redirect, useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APP_HOME } from "@/lib/routes";
import { useAppColors } from "@/lib/theme";
import { useCaptureStore } from "@/stores/captureStore";

const CAPTION_MAX_LENGTH = 280;

export default function ComposeScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const localPhotoUri = useCaptureStore((state) => state.localPhotoUri);
  const caption = useCaptureStore((state) => state.caption);
  const setCaption = useCaptureStore((state) => state.setCaption);
  const reset = useCaptureStore((state) => state.reset);

  if (!localPhotoUri) {
    return <Redirect href={APP_HOME} />;
  }

  const handleCancel = () => {
    reset();
    router.replace(APP_HOME);
  };

  const handleSend = () => {
    reset();
    router.replace(APP_HOME);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={handleCancel} hitSlop={8}>
            <Text style={[styles.cancelText, { color: colors.textMuted }]}>
              Cancel
            </Text>
          </Pressable>
        </View>

        <View style={styles.previewSection}>
          <Image
            source={{ uri: localPhotoUri }}
            style={styles.preview}
            contentFit="cover"
          />
        </View>

        <View style={styles.inputSection}>
          <TextInput
            autoCapitalize="sentences"
            autoCorrect
            multiline
            placeholder="Add a caption..."
            placeholderTextColor={colors.textMuted}
            maxLength={CAPTION_MAX_LENGTH}
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.textMuted,
              },
            ]}
            value={caption}
            onChangeText={setCaption}
          />
        </View>

        <Pressable style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
  previewSection: {
    paddingHorizontal: 24,
  },
  preview: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
  },
  inputSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  sendButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: "#111111",
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
