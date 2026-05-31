import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

const EXIT_MS = 200;

type UseAnimatedToastOptions = {
  message: string | null;
  visibleMs: number;
  onDismiss: () => void;
};

export function useAnimatedToast({
  message,
  visibleMs,
  onDismiss,
}: UseAnimatedToastOptions) {
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.5));
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current !== null) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const stopExitAnim = useCallback(() => {
    exitAnimRef.current?.stop();
    exitAnimRef.current = null;
  }, []);

  const runExitAnimation = useCallback(
    (onComplete?: () => void) => {
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
          onDismiss();
          setDisplayMessage(null);
          opacity.setValue(0);
          scale.setValue(0.5);
          onComplete?.();
        }
      });
    },
    [onDismiss, opacity, scale],
  );

  useEffect(() => {
    if (!message) {
      return;
    }

    clearDismissTimer();
    stopExitAnim();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- toast message follows external notification state
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
      runExitAnimation();
    }, visibleMs);

    return () => {
      clearDismissTimer();
      stopExitAnim();
    };
  }, [
    message,
    visibleMs,
    clearDismissTimer,
    stopExitAnim,
    runExitAnimation,
    opacity,
    scale,
  ]);

  return { opacity, scale, displayMessage, runExitAnimation };
}
