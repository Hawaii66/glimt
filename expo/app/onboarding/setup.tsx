import { Redirect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { useStoresHydrated } from '@/hooks/useStoresHydrated';
import { APP_HOME } from '@/lib/routes';
import { useAppColors } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useProfileStore } from '@/stores/profileStore';

export default function SetupScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const hydrated = useStoresHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authName = useAuthStore((state) => state.name);
  const onboardingComplete = useProfileStore((state) => state.onboardingComplete);
  const seedFromUser = useOnboardingStore((state) => state.seedFromUser);

  useEffect(() => {
    if (authName) {
      seedFromUser({ name: authName });
    }
  }, [authName, seedFromUser]);

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

  return (
    <OnboardingScreen
      actionLabel="Start"
      onNext={() => {
        router.push('/onboarding/name');
      }}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Let's set up your account
      </Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>
        Add a name, username, and photo so friends know it's you.
      </Text>
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
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
});
