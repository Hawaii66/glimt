import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  MeetDayInfoButton,
  MeetDayInfoModal,
} from "@/components/journey/MeetDayInfoModal";
import { UnlockQrCode } from "@/components/journey/UnlockQrCode";
import { formatJourneyDate } from "@/lib/format-journey-date";
import { getFriendById } from "@/lib/glimt-mock-data";
import { MEET_DAY_UNLOCK_SCREEN_TITLE } from "@/lib/meet-day";
import {
  recordMockUnlockScan,
  refreshMockUnlockSession,
  startMockUnlockSession,
} from "@/lib/mock-unlock-session";
import { useAppColors } from "@/lib/theme";
import { useMockUnlockStore } from "@/stores/mockUnlockStore";

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
  const friend = getFriendById(friendId);
  const unlockDay = useMockUnlockStore((s) => s.unlockDay);

  const [mode, setMode] = useState<Mode>("choose");
  const [infoVisible, setInfoVisible] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

  const friendFirstName = friend?.displayName.split(" ")[0] ?? "friend";
  const formattedDate = formatJourneyDate(date);

  const finishUnlock = useCallback(() => {
    unlockDay(friendId, date);
    setMode("success");
    setTimeout(() => router.back(), 1200);
  }, [date, friendId, router, unlockDay]);

  useEffect(() => {
    if (mode !== "show" || !qrToken) {
      return;
    }
    const interval = setInterval(() => {
      const refreshed = refreshMockUnlockSession();
      if (refreshed) {
        setQrToken(refreshed.token);
      }
    }, 12_000);
    return () => clearInterval(interval);
  }, [mode, qrToken]);

  const handleShowCode = () => {
    setError(null);
    const session = startMockUnlockSession(friendId, date);
    setQrToken(session.token);
    setMode("show");
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
      const result = recordMockUnlockScan(data);
      if (!result || result.friendId !== friendId || result.isoDate !== date) {
        setError("That code didn't work. Ask your friend to show a fresh code.");
        return;
      }
      scannedRef.current = true;
      finishUnlock();
    },
    [date, finishUnlock, friendId],
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
            onPress={handleShowCode}
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
            onPress={handleScanCode}
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
          <Pressable
            style={[
              styles.mockCompleteButton,
              { borderColor: colors.surfaceBorder },
            ]}
            onPress={finishUnlock}
            accessibilityRole="button"
            accessibilityLabel="Simulate scan for preview"
          >
            <Text style={[styles.mockCompleteText, { color: colors.textMuted }]}>
              Preview: simulate successful scan
            </Text>
          </Pressable>
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
  mockCompleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  mockCompleteText: {
    fontSize: 13,
    textAlign: "center",
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
