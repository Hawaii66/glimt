import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useStoresHydrated } from '@/hooks/useStoresHydrated';
import { APP_HOME } from '@/lib/routes';
import { useAppColors } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

export default function Index() {
  const colors = useAppColors();
  const hydrated = useStoresHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingComplete = useProfileStore((state) => state.onboardingComplete);

  if (!hydrated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/onboarding/sign-in" />;
  }

  if (!onboardingComplete) {
    return <Redirect href="/onboarding/setup" />;
  }

  return <Redirect href={APP_HOME} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
