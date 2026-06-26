import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppleSignInButton } from '@/components/AppleSignInButton';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { useSession } from '@/hooks/useSession';
import { APP_HOME } from '@/lib/routes';
import { useAppColors } from '@/lib/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function SignInScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { isReady, isAuthenticated, onboardingComplete, user } = useSession();
  const seedFromUser = useOnboardingStore((state) => state.seedFromUser);
  const reset = useOnboardingStore((state) => state.reset);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    if (onboardingComplete) {
      reset();
      router.replace(APP_HOME);
      return;
    }

    seedFromUser({ name: user?.name ?? null });
    router.replace('/onboarding/setup');
  }, [
    isReady,
    isAuthenticated,
    onboardingComplete,
    user?.name,
    seedFromUser,
    reset,
    router,
  ]);

  if (!isReady) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (isAuthenticated && onboardingComplete) {
    return <Redirect href={APP_HOME} />;
  }

  if (isAuthenticated) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  return (
    <OnboardingScreen
      showPreview={false}
      header={
        <>
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome to Glimt
          </Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>
            Sign in to see glimts from your friends' lives and collect your
            journals together.
          </Text>
        </>
      }
    >
      <View style={styles.actions}>
        <AppleSignInButton onError={setError} />
        {error ? (
          <Text style={[styles.error, { color: '#ef4444' }]}>{error}</Text>
        ) : null}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 16,
    paddingBottom: 8,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
});
