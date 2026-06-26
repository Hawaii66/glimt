import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { useStoresHydrated } from '@/hooks/useStoresHydrated';
import { APP_HOME } from '@/lib/routes';
import { useAppColors } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useProfileStore } from '@/stores/profileStore';

export default function ConfirmScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const hydrated = useStoresHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingComplete = useProfileStore((state) => state.onboardingComplete);
  const completeOnboarding = useProfileStore((state) => state.completeOnboarding);
  const displayName = useOnboardingStore((state) => state.displayName);
  const username = useOnboardingStore((state) => state.username);
  const localAvatarUri = useOnboardingStore((state) => state.localAvatarUri);
  const accentTheme = useOnboardingStore((state) => state.accentTheme);
  const pushToken = useOnboardingStore((state) => state.pushToken);
  const reset = useOnboardingStore((state) => state.reset);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setError(null);
    setLoading(true);

    try {
      completeOnboarding({
        displayName: displayName.trim(),
        username: username.trim(),
        localAvatarUri,
        accentTheme,
        pushToken: pushToken ?? null,
      });

      reset();
      router.replace(APP_HOME);
    } catch (completeError) {
      const message =
        completeError instanceof Error
          ? completeError.message
          : 'Could not complete onboarding.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/onboarding/sign-in" />;
  }

  if (onboardingComplete) {
    return <Redirect href={APP_HOME} />;
  }

  if (!displayName.trim()) {
    return <Redirect href="/onboarding/setup" />;
  }

  if (!username.trim()) {
    return <Redirect href="/onboarding/username" />;
  }

  return (
    <OnboardingScreen
      actionLabel="Get started"
      loading={loading}
      onNext={() => {
        void handleComplete();
      }}
    >
      <Text style={[styles.label, { color: colors.text }]}>
        Confirm your profile
      </Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Everything looks good? You can always change this later.
      </Text>
      {error ? (
        <Text style={[styles.error, { color: '#ef4444' }]}>{error}</Text>
      ) : null}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
  },
  error: {
    fontSize: 14,
  },
});
