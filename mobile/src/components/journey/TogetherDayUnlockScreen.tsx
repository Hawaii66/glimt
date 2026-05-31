import { CameraView, useCameraPermissions } from "expo-camera";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { api } from "convex/_generated/api";

import {
  MeetDayInfoButton,
  MeetDayInfoModal,
} from "@/components/journey/MeetDayInfoModal";
import { UnlockQrCode } from "@/components/journey/UnlockQrCode";
import { useFriendGroupId } from "@/hooks/useFriendGroupId";
import { useFriendProfile } from "@/hooks/useFriendProfile";
import { useJournalContext } from "@/hooks/useJournalContext";
import { formatJourneyDate } from "@/lib/format-journey-date";
import { MEET_DAY_UNLOCK_SCREEN_TITLE } from "@/lib/meet-day";
import { useAppColors } from "@/lib/theme";

type Mode = "choose" | "show" | "scan" | "success";

type TogetherDayUnlockScreenProps = {
  friendId: string;
  date: string;
};

export function TogetherDayUnlockScreen({
  friendId,
  date,
}: TogetherDayUnlockScreenProps) {
  const colors = useAppColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { friend } = useFriendProfile(friendId);
  const { friendContext } = useJournalContext(friendId);
  const journalToday = friendContext?.today ?? "";
  const { groupId } = useFriendGroupId(friendId);
  const startSession = useMutation(api.meetUnlock.startMeetUnlockSession);
  const refreshSession = useMutation(api.meetUnlock.refreshMeetUnlockSession);
  const completeUnlock = useMutation(api.meetUnlock.completeMeetUnlock);

  const [mode, setMode] = useState<Mode>("choose");
  const [infoVisible, setInfoVisible] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

  const friendFirstName = friend?.displayName.split(" ")[0] ?? "friend";
  const formattedDate = journalToday
    ? formatJourneyDate(date, journalToday)
    : date;

  const finishUnlock = useCallback(() => {
    setMode("success");
    setTimeout(() => router.back(), 1200);
  }, [router]);

  useEffect(() => {
    if (mode !== "show" || !sessionId) {
      return;
    }

    const interval = setInterval(() => {
      void refreshSession({ sessionId })
        .then((result) => {
          setQrToken(result.token);
        })
        .catch(() => {
          setError("Unlock session expired. Show a new code.");
          setMode("choose");
          setQrToken(null);
          setSessionId(null);
        });
    }, 12_000);

    return () => clearInterval(interval);
  }, [mode, refreshSession, sessionId]);

  const handleShowCode = async () => {
    if (!groupId) {
      setError("Could not find your shared journey.");
      return;
    }

    setError(null);

    try {
      const session = await startSession({ groupId, date });
      setQrToken(session.token);
      setSessionId(session.sessionId);
      setMode("show");
    } catch {
      setError("Could not start unlock session. Try again.");
    }
  };

  const handleScanCode = async () => {
    setError(null);
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setError("Camera access is needed to scan your friend's code.");
        return;
      }
    }
    scannedRef.current = false;
    setMode("scan");
  };

  const handleBarcode = useCallback(
    ({ data }: { data: string }) => {
      if (scannedRef.current) {
        return;
      }

      scannedRef.current = true;

      void completeUnlock({ token: data })
        .then((result) => {
          if (result.date !== date) {
            setError("That code didn't work. Ask your friend to show a fresh code.");
            scannedRef.current = false;
            return;
          }
          finishUnlock();
        })
        .catch(() => {
          setError("That code didn't work. Ask your friend to show a fresh code.");
          scannedRef.current = false;
        });
    },
    [completeUnlock, date, finishUnlock],
  );

  if (!friend) {
    return null;
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 8 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <SymbolView
            name="chevron.left"
            size={20}
            tintColor={colors.textMuted}
            weight="semibold"
          />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {MEET_DAY_UNLOCK_SCREEN_TITLE}
        </Text>
        <MeetDayInfoButton onPress={() => setInfoVisible(true)} />
      </View>

      <MeetDayInfoModal
        visible={infoVisible}
        onClose={() => setInfoVisible(false)}
      />

      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {formattedDate} with {friendFirstName}
      </Text>

      {mode === "choose" ? (
        <View style={styles.chooseBody}>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Hold your phones together — one shows a code, the other scans it.
          </Text>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.text }]}
            onPress={() => void handleShowCode()}
            accessibilityRole="button"
            accessibilityLabel="Show my code"
          >
            <SymbolView name="qrcode" size={20} tintColor={colors.background} />
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>
              Show my code
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.secondaryButton,
              {
                borderColor: colors.surfaceBorder,
                backgroundColor: colors.fill,
              },
            ]}
            onPress={() => void handleScanCode()}
            accessibilityRole="button"
            accessibilityLabel={`Scan ${friendFirstName}'s code`}
          >
            <SymbolView name="camera.fill" size={20} tintColor={colors.text} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Scan {friendFirstName}&apos;s code
            </Text>
          </Pressable>
        </View>
      ) : null}

      {mode === "show" && qrToken ? (
        <View style={styles.showBody}>
          <View
            style={[
              styles.qrFrame,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <UnlockQrCode key={qrToken} value={qrToken} />
          </View>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Ask {friendFirstName} to scan this code. It refreshes every few
            seconds.
          </Text>
        </View>
      ) : null}

      {mode === "scan" ? (
        <View style={styles.scanBody}>
          <View style={styles.cameraFrame}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={handleBarcode}
            />
          </View>
          {error ? (
            <Text style={[styles.errorText, { color: "#C62828" }]}>{error}</Text>
          ) : (
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Point your camera at {friendFirstName}&apos;s screen
            </Text>
          )}
        </View>
      ) : null}

      {mode === "success" ? (
        <View style={styles.successBody}>
          <SymbolView name="checkmark.circle.fill" size={56} tintColor="#2E7D32" />
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Day unlocked!
          </Text>
        </View>
      ) : null}

      {mode === "choose" && error ? (
        <Text style={[styles.errorText, { color: "#C62828" }]}>{error}</Text>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginHorizontal: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
  },
  chooseBody: {
    flex: 1,
    gap: 16,
    justifyContent: "center",
  },
  hint: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 8,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  showBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  qrFrame: {
    padding: 16,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  scanBody: {
    flex: 1,
    gap: 16,
  },
  cameraFrame: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    minHeight: 280,
  },
  successBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});
