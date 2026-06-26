import { useEffect, type MutableRefObject } from "react";

type UseSettingsScrollFocusOptions = {
  active: boolean;
  sectionYRef: MutableRefObject<number>;
  onScroll: () => void;
  onComplete: () => void;
};

export function useSettingsScrollFocus({
  active,
  sectionYRef,
  onScroll,
  onComplete,
}: UseSettingsScrollFocusOptions): void {
  useEffect(() => {
    if (!active) {
      return;
    }

    const attemptScroll = () => {
      if (sectionYRef.current > 0) {
        onScroll();
        onComplete();
        return true;
      }
      return false;
    };

    if (attemptScroll()) {
      return;
    }

    const timer = setTimeout(() => {
      attemptScroll();
      onComplete();
    }, 150);

    return () => clearTimeout(timer);
  }, [active, sectionYRef, onScroll, onComplete]);
}
