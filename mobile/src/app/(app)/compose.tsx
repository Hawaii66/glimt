import { Image } from "expo-image";
import { Redirect, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

const CAPTION_MAX_LENGTH = 30;
const INPUT_LINE_HEIGHT = 22;
const INPUT_VERTICAL_PADDING = 12;
const INPUT_HEIGHT = INPUT_LINE_HEIGHT + INPUT_VERTICAL_PADDING * 2;
const COMPACT_PREVIEW_HEIGHT = 120;

export default function ComposeScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const captionInputRef = useRef<TextInput>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const localPhotoUri = useCaptureStore((state) => state.localPhotoUri);
  const caption = useCaptureStore((state) => state.caption);
  const setCaption = useCaptureStore((state) => state.setCaption);
  const setLocalPhotoUri = useCaptureStore((state) => state.setLocalPhotoUri);
  const saveGlimt = useCaptureStore((state) => state.saveGlimt);
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
    if (sending) {
      return;
    }
    setLocalPhotoUri(null);
    router.back();
  };

  const handleSend = () => {
    if (sending) {
      return;
    }

    setSending(true);

    try {
      saveGlimt();
      reset();
      router.replace(APP_HOME);
    } finally {
      setSending(false);
    }
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

          <View style={styles.captionSection}>
            <TextInput
              ref={captionInputRef}
              autoCapitalize="sentences"
              autoCorrect
              editable={!sending}
              placeholder="Add a caption..."
              placeholderTextColor={colors.textMuted}
              maxLength={CAPTION_MAX_LENGTH}
              returnKeyType="done"
              blurOnSubmit
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.fill,
                  borderColor: colors.surfaceBorder,
                },
              ]}
              value={caption}
              onChangeText={setCaption}
              onFocus={scrollToCaption}
              onSubmitEditing={() => {
                captionInputRef.current?.blur();
                Keyboard.dismiss();
              }}
            />
            <Text style={[styles.charCount, { color: colors.textMuted }]}>
              {caption.length}/{CAPTION_MAX_LENGTH}
            </Text>
          </View>
        </ScrollView>

        <View
          style={[
            styles.sendBar,
            {
              paddingBottom: keyboardVisible ? 8 : Math.max(insets.bottom, 16),
            },
          ]}
        >
          <Pressable
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Pressable
        onPress={handleBack}
        hitSlop={8}
        disabled={sending}
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
  captionSection: {
    gap: 6,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: INPUT_VERTICAL_PADDING,
    fontSize: 16,
    lineHeight: INPUT_LINE_HEIGHT,
    height: INPUT_HEIGHT,
    textAlignVertical: "center",
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 13,
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
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
