import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useToastStore } from "@/stores/toastStore";

const VISIBLE_MS = 1600;
const EXIT_MS = 200;

export function Toast() {
  const insets = useSafeAreaInsets();
  const message = useToastStore((state) => state.message);
  const hide = useToastStore((state) => state.hide);
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!message) {
      return;
    }

    const clearDismissTimer = () => {
      if (dismissTimerRef.current !== null) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };

    const stopExitAnim = () => {
      exitAnimRef.current?.stop();
      exitAnimRef.current = null;
    };

    clearDismissTimer();
    stopExitAnim();
    setDisplayMessage(message);
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
          hide();
          setDisplayMessage(null);
        }
      });
    }, VISIBLE_MS);

    return () => {
      clearDismissTimer();
      stopExitAnim();
    };
  }, [message, hide, opacity, scale]);

  if (!displayMessage) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          bottom: Math.max(insets.bottom, 16) + 72,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Text style={styles.text}>{displayMessage}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "#22C55E",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: "88%",
    zIndex: 100,
    shadowColor: "#15803D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
});
