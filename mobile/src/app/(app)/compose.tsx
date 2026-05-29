import { Image } from "expo-image";
import { Redirect, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { APP_HOME } from "@/lib/routes";
import { useAppColors } from "@/lib/theme";
import { useCaptureStore } from "@/stores/captureStore";

const CAPTION_MAX_LENGTH = 280;
const COMPACT_PREVIEW_HEIGHT = 120;

export default function ComposeScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const localPhotoUri = useCaptureStore((state) => state.localPhotoUri);
  const caption = useCaptureStore((state) => state.caption);
  const setCaption = useCaptureStore((state) => state.setCaption);
  const setLocalPhotoUri = useCaptureStore((state) => state.setLocalPhotoUri);
  const reset = useCaptureStore((state) => state.reset);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (!localPhotoUri) {
    return <Redirect href={APP_HOME} />;
  }

  const handleBack = () => {
    setLocalPhotoUri(null);
    router.back();
  };

  const handleSend = () => {
    reset();
    router.replace(APP_HOME);
  };

  const scrollToCaption = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 8, gap: keyboardVisible ? 12 : 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={{ uri: localPhotoUri }}
            style={[styles.preview, keyboardVisible && styles.previewCompact]}
            contentFit="cover"
          />

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
            onFocus={scrollToCaption}
          />
        </ScrollView>

        <View
          style={[
            styles.sendBar,
            {
              paddingBottom: keyboardVisible ? 8 : Math.max(insets.bottom, 16),
            },
          ]}
        >
          <Pressable style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Pressable
        onPress={handleBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={[styles.backButton, { top: insets.top + 4 }]}
      >
        <SymbolView
          name="chevron.left"
          size={20}
          tintColor={colors.textMuted}
          weight="semibold"
        />
      </Pressable>
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
  backButton: {
    position: "absolute",
    left: 14,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  preview: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    marginTop: 48,
  },
  previewCompact: {
    alignSelf: "center",
    width: COMPACT_PREVIEW_HEIGHT,
    height: COMPACT_PREVIEW_HEIGHT,
    aspectRatio: undefined,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },
  sendBar: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  sendButton: {
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
