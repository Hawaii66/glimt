import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSession } from '@/hooks/useSession';
import { APP_HOME } from '@/lib/routes';
import { useAppColors } from '@/lib/theme';

export default function Index() {
  const colors = useAppColors();
  const { isReady, isAuthenticated, onboardingComplete } = useSession();

  if (!isReady) {
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
