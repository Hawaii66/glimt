import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfilePreview } from '@/components/onboarding/ProfilePreview';
import { getAccentTheme } from '@/lib/accent-themes';
import { useAppColors } from '@/lib/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';

const PREVIEW_HEIGHT_COMPACT = 200;

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
  actionLabel = 'Next',
  onNext,
  nextDisabled = false,
  loading = false,
  showPreview = true,
  header,
}: OnboardingScreenProps) {
  const colors = useAppColors();
  const accentTheme = useOnboardingStore((state) => state.accentTheme);
  const gradientColors = getAccentTheme(accentTheme).gradientColors;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

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

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          showsVerticalScrollIndicator={false}
        >
          {showPreview ? (
            <>
              <View
                style={[
                  styles.previewSection,
                  keyboardVisible
                    ? styles.previewSectionCompact
                    : styles.previewSectionExpanded,
                ]}
              >
                <LinearGradient
                  colors={[...gradientColors]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.previewGradient}
                >
                  <ProfilePreview
                    onGradientBackground
                    embedded={keyboardVisible}
                  />
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
        </ScrollView>

        {onNext ? (
          <Pressable
            style={[
              styles.nextButton,
              keyboardVisible && styles.nextButtonKeyboard,
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
  scrollContent: {
    flexGrow: 1,
  },
  previewSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  previewSectionExpanded: {
    flex: 1,
    minHeight: 220,
  },
  previewSectionCompact: {
    height: PREVIEW_HEIGHT_COMPACT,
  },
  previewGradient: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSection: {
    flexGrow: 1,
    justifyContent: 'center',
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
    marginTop: 'auto',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonKeyboard: {
    marginBottom: 12,
  },
  nextLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
});
