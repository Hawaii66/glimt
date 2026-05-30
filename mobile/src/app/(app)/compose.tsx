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
import { MOCK_FRIEND_GLIMTS } from "@/lib/glimt-mock-data";
import { useAppColors } from "@/lib/theme";
import { useCaptureStore } from "@/stores/captureStore";
import { useToastStore } from "@/stores/toastStore";

const CAPTION_MAX_LENGTH = 30;
const INPUT_LINE_HEIGHT = 22;
const INPUT_VERTICAL_PADDING = 12;
const INPUT_HEIGHT = INPUT_LINE_HEIGHT * 2 + INPUT_VERTICAL_PADDING * 2;
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
  const selectedFriendId = useCaptureStore((state) => state.selectedFriendId);
  const setSelectedFriendId = useCaptureStore((state) => state.setSelectedFriendId);
  const reset = useCaptureStore((state) => state.reset);
  const showToast = useToastStore((state) => state.show);
  const selectedFriend = MOCK_FRIEND_GLIMTS.find(
    (friend) => friend.id === selectedFriendId,
  );

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
    const recipientName = selectedFriend?.displayName.split(" ")[0];
    showToast(
      recipientName ? `Glimt sent to ${recipientName}` : "Glimt sent",
    );
    reset();
    router.replace(APP_HOME);
  };

  const handleAllPress = () => {
    setSelectedFriendId(null);
  };

  const handleFriendPress = (friendId: string) => {
    setSelectedFriendId(selectedFriendId === friendId ? null : friendId);
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
              autoCapitalize="sentences"
              autoCorrect
              multiline
              numberOfLines={2}
              placeholder="Add a caption..."
              placeholderTextColor={colors.textMuted}
              maxLength={CAPTION_MAX_LENGTH}
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
          <View style={styles.sendToOneSection}>
            <Text style={[styles.sendToOneLabel, { color: colors.textMuted }]}>
              Send to
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.friendPickerContent}
              keyboardShouldPersistTaps="handled"
            >
              <Pressable
                style={styles.friendOption}
                onPress={handleAllPress}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedFriendId === null }}
                accessibilityLabel="Send to all friends"
              >
                <View
                  style={[
                    styles.friendAvatarRing,
                    {
                      borderColor:
                        selectedFriendId === null
                          ? colors.text
                          : colors.surfaceBorder,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.allBubble,
                      { backgroundColor: colors.fill },
                    ]}
                  >
                    <Text
                      style={[
                        styles.allBubbleText,
                        {
                          color:
                            selectedFriendId === null
                              ? colors.text
                              : colors.textMuted,
                        },
                      ]}
                    >
                      All
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.friendOptionName,
                    {
                      color:
                        selectedFriendId === null
                          ? colors.text
                          : colors.textMuted,
                    },
                  ]}
                  numberOfLines={1}
                >
                  All
                </Text>
              </Pressable>

              {MOCK_FRIEND_GLIMTS.map((friend) => {
                const isSelected = friend.id === selectedFriendId;

                return (
                  <Pressable
                    key={friend.id}
                    style={styles.friendOption}
                    onPress={() => handleFriendPress(friend.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`Send to ${friend.displayName}`}
                  >
                    <View
                      style={[
                        styles.friendAvatarRing,
                        {
                          borderColor: isSelected
                            ? colors.text
                            : colors.surfaceBorder,
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: friend.avatarUrl }}
                        style={styles.friendAvatar}
                        contentFit="cover"
                      />
                    </View>
                    <Text
                      style={[
                        styles.friendOptionName,
                        {
                          color: isSelected ? colors.text : colors.textMuted,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {friend.displayName.split(" ")[0]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <Pressable style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>
              {selectedFriend
                ? `Send to ${selectedFriend.displayName.split(" ")[0]}`
                : "Send"}
            </Text>
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
    textAlignVertical: "top",
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 13,
  },
  sendBar: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 10,
  },
  sendToOneSection: {
    gap: 10,
  },
  sendToOneLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  friendPickerContent: {
    gap: 12,
    paddingRight: 4,
  },
  friendOption: {
    width: 64,
    alignItems: "center",
    gap: 6,
  },
  friendAvatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    padding: 2,
  },
  friendAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  allBubble: {
    flex: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  allBubbleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  friendOptionName: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
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
