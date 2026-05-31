import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AccentThemePicker } from "@/components/settings/AccentThemePicker";
import {
  SettingsAccountProfile,
  SettingsSignOutButton,
} from "@/components/settings/SettingsAccountSection";
import { SettingsAddFriendSection } from "@/components/settings/SettingsAddFriendSection";
import { SettingsFriendRequestsSection } from "@/components/settings/SettingsFriendRequestsSection";
import { SettingsFriendsListSection } from "@/components/settings/SettingsFriendsListSection";
import { TimezoneInfoRow } from "@/components/settings/TimezoneInfoRow";
import { useSettingsScrollFocus } from "@/components/settings/useSettingsScrollFocus";
import { useCurrentUserAccentTheme } from "@/hooks/useCurrentUserAccentTheme";
import { getDeviceTimezone } from "@/lib/format-timezone";
import { useAppColors } from "@/lib/theme";
import { useSettingsFocusStore } from "@/stores/settingsFocusStore";
import { api } from "convex/_generated/api";

type SettingsContentProps = {
  scrollMaxHeight?: number;
};

export function SettingsContent({ scrollMaxHeight }: SettingsContentProps) {
  const colors = useAppColors();
  const user = useQuery(api.users.current);
  const incomingRequests = useQuery(api.friends.listIncomingRequests);
  const outgoingRequests = useQuery(api.friends.listOutgoingRequests);
  const { accentTheme, setAccentTheme } = useCurrentUserAccentTheme();
  const settingsFocus = useSettingsFocusStore((state) => state.focus);
  const clearSettingsFocus = useSettingsFocusStore((state) => state.clearFocus);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const addFriendSectionY = useRef(0);
  const friendRequestsSectionY = useRef(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const scrollToAddFriend = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, addFriendSectionY.current - 16),
        animated: true,
      });
    });
  };

  const scrollToFriendRequests = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, friendRequestsSectionY.current - 16),
        animated: true,
      });
    });
  };

  useEffect(() => {
    if (settingsFocus !== "friend-requests" || incomingRequests === undefined) {
      return;
    }

    if (incomingRequests.length === 0) {
      clearSettingsFocus();
    }
  }, [settingsFocus, incomingRequests, clearSettingsFocus]);

  useSettingsScrollFocus({
    active:
      settingsFocus === "friend-requests" &&
      incomingRequests !== undefined &&
      incomingRequests.length > 0,
    sectionYRef: friendRequestsSectionY,
    onScroll: scrollToFriendRequests,
    onComplete: clearSettingsFocus,
  });

  useSettingsScrollFocus({
    active: settingsFocus === "add-friend",
    sectionYRef: addFriendSectionY,
    onScroll: scrollToAddFriend,
    onComplete: clearSettingsFocus,
  });

  const hasPendingOutgoingRequests =
    outgoingRequests !== undefined && outgoingRequests.length > 0;

  return (
    <KeyboardAvoidingView
      style={[
        styles.keyboardAvoid,
        scrollMaxHeight != null && { maxHeight: scrollMaxHeight },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          scrollMaxHeight == null && styles.scrollContentGrow,
          { paddingBottom: 32 + keyboardHeight },
        ]}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>Settings</Text>

        <SettingsAccountProfile />

        <SettingsAddFriendSection
          onLayout={(event) => {
            addFriendSectionY.current = event.nativeEvent.layout.y;
          }}
          onInputFocus={scrollToAddFriend}
        />

        <SettingsFriendRequestsSection
          incomingRequests={incomingRequests}
          outgoingRequests={outgoingRequests}
          onIncomingSectionLayout={(event) => {
            friendRequestsSectionY.current = event.nativeEvent.layout.y;
          }}
        />

        <SettingsFriendsListSection
          hasPendingOutgoingRequests={hasPendingOutgoingRequests}
        />

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            Theme
          </Text>
          <AccentThemePicker
            selectedId={accentTheme}
            onSelect={setAccentTheme}
          />
        </View>

        <View style={styles.section}>
          <TimezoneInfoRow
            label="Your timezone"
            timezone={user?.timezone ?? getDeviceTimezone()}
            hint={
              user?.timezone
                ? "Used for notifications. Updates when you open the app."
                : "Syncs from your device when you open the app."
            }
          />
        </View>

        <SettingsSignOutButton />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 24,
  },
  scrollContentGrow: {
    flexGrow: 1,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
