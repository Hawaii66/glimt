import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAnimatedToast } from "@/hooks/useAnimatedToast";
import { useToastStore } from "@/stores/toastStore";

export function Toast() {
  const insets = useSafeAreaInsets();
  const message = useToastStore((state) => state.message);
  const hide = useToastStore((state) => state.hide);
  const { opacity, scale, displayMessage } = useAnimatedToast({
    message,
    visibleMs: 1600,
    onDismiss: hide,
  });

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
