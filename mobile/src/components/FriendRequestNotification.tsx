import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { APP_SETTINGS } from "@/lib/routes";
import { useSettingsFocusStore } from "@/stores/settingsFocusStore";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

type ActiveNotification = {
  requestId: Id<"friendRequests">;
  message: string;
};

const VISIBLE_MS = 8000;
const EXIT_MS = 200;

export function FriendRequestNotification() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const incomingRequests = useQuery(api.friends.listIncomingRequests);
  const requestFriendRequestsFocus = useSettingsFocusStore(
    (state) => state.requestFriendRequestsFocus,
  );
  const seenRequestIdsRef = useRef<Set<Id<"friendRequests">> | null>(null);
  const [activeNotification, setActiveNotification] =
    useState<ActiveNotification | null>(null);
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (incomingRequests === undefined) {
      return;
    }

    if (seenRequestIdsRef.current === null) {
      seenRequestIdsRef.current = new Set(
        incomingRequests.map((request) => request.requestId),
      );
      return;
    }

    const newRequests = incomingRequests.filter(
      (request) => !seenRequestIdsRef.current!.has(request.requestId),
    );

    for (const request of newRequests) {
      seenRequestIdsRef.current.add(request.requestId);
    }

    if (newRequests.length === 0) {
      return;
    }

    const message =
      newRequests.length === 1
        ? `${newRequests[0]!.displayName} sent you a friend request`
        : `You have ${newRequests.length} new friend requests`;

    setActiveNotification({
      requestId: newRequests[newRequests.length - 1]!.requestId,
      message,
    });
  }, [incomingRequests]);

  useEffect(() => {
    if (
      activeNotification &&
      incomingRequests !== undefined &&
      !incomingRequests.some(
        (request) => request.requestId === activeNotification.requestId,
      )
    ) {
      setActiveNotification(null);
    }
  }, [incomingRequests, activeNotification]);

  const dismiss = () => {
    if (dismissTimerRef.current !== null) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    exitAnimRef.current?.stop();
    exitAnimRef.current = null;
    setActiveNotification(null);
    setDisplayMessage(null);
    opacity.setValue(0);
    scale.setValue(0.5);
  };

  const runExitAnimation = (onComplete?: () => void) => {
    exitAnimRef.current = Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.88,
        duration: EXIT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: EXIT_MS,
        useNativeDriver: true,
      }),
    ]);
    exitAnimRef.current.start(({ finished }) => {
      exitAnimRef.current = null;
      if (finished) {
        dismiss();
        onComplete?.();
      }
    });
  };

  useEffect(() => {
    if (!activeNotification) {
      return;
    }

    const clearDismissTimer = () => {
      if (dismissTimerRef.current !== null) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };

    clearDismissTimer();
    exitAnimRef.current?.stop();
    exitAnimRef.current = null;
    setDisplayMessage(activeNotification.message);
    opacity.setValue(0);
    scale.setValue(0.5);

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        speed: 36,
        bounciness: 20,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    dismissTimerRef.current = setTimeout(() => {
      dismissTimerRef.current = null;
      runExitAnimation();
    }, VISIBLE_MS);

    return () => {
      clearDismissTimer();
      exitAnimRef.current?.stop();
      exitAnimRef.current = null;
    };
  }, [activeNotification, opacity, scale]);

  const handlePress = () => {
    if (!activeNotification) {
      return;
    }

    requestFriendRequestsFocus();
    runExitAnimation(() => {
      router.push(APP_SETTINGS);
    });
  };

  if (!displayMessage) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: Math.max(insets.bottom, 16) + 72,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="View friend requests in settings"
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        <Text style={styles.text}>{displayMessage}</Text>
        <Text style={styles.hint}>Tap to view in settings</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignSelf: "center",
    maxWidth: "88%",
    zIndex: 101,
  },
  pressable: {
    backgroundColor: "#22C55E",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 2,
    shadowColor: "#15803D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  pressed: {
    opacity: 0.9,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  hint: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
