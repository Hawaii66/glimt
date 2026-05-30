import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfilePreview } from "@/components/onboarding/ProfilePreview";
import { useCurrentUserAccentTheme } from "@/hooks/useCurrentUserAccentTheme";
import { getAccentTheme } from "@/lib/accent-themes";
import { useAppColors } from "@/lib/theme";

type OnboardingScreenProps = {
  children: ReactNode;
  actionLabel?: string;
  onNext?: () => void;
  nextDisabled?: boolean;
  loading?: boolean;
  showPreview?: boolean;
  header?: ReactNode;
};

export function OnboardingScreen({
  children,
  actionLabel = "Next",
  onNext,
  nextDisabled = false,
  loading = false,
  showPreview = true,
  header,
}: OnboardingScreenProps) {
  const colors = useAppColors();
  const { accentTheme } = useCurrentUserAccentTheme();
  const gradientColors = getAccentTheme(accentTheme).gradientColors;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {showPreview ? (
          <>
            <View style={styles.previewSection}>
              <LinearGradient
                colors={[...gradientColors]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.previewGradient}
              >
                <ProfilePreview onGradientBackground />
              </LinearGradient>
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.textMuted }]}
            />
          </>
        ) : header ? (
          <View style={styles.headerSection}>{header}</View>
        ) : null}

        <View style={styles.inputSection}>{children}</View>

        {onNext ? (
          <Pressable
            style={[
              styles.nextButton,
              {
                backgroundColor: nextDisabled ? colors.textMuted : colors.text,
              },
            ]}
            disabled={nextDisabled || loading}
            onPress={onNext}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.nextLabel, { color: colors.background }]}>
                {actionLabel}
              </Text>
            )}
          </Pressable>
        ) : null}
      </KeyboardAvoidingView>
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
  previewSection: {
    flex: 1,
    minHeight: 220,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  previewGradient: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  headerSection: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 24,
    gap: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.35,
    marginHorizontal: 24,
  },
  inputSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 16,
  },
  nextButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  nextLabel: {
    fontSize: 17,
    fontWeight: "600",
  },
});
