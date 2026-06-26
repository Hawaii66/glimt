import { Redirect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { useStoresHydrated } from '@/hooks/useStoresHydrated';
import { APP_HOME } from '@/lib/routes';
import { useAppColors } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useProfileStore } from '@/stores/profileStore';

export default function NameScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const hydrated = useStoresHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authName = useAuthStore((state) => state.name);
  const onboardingComplete = useProfileStore((state) => state.onboardingComplete);
  const displayName = useOnboardingStore((state) => state.displayName);
  const setDisplayName = useOnboardingStore((state) => state.setDisplayName);
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

  const trimmedName = displayName.trim();
  const canContinue = trimmedName.length > 0;

  return (
    <OnboardingScreen
      nextDisabled={!canContinue}
      onNext={() => {
        setDisplayName(trimmedName);
        router.push('/onboarding/username');
      }}
    >
      <Text style={[styles.label, { color: colors.text }]}>Display name</Text>
      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        placeholder="Your name"
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.textMuted,
          },
        ]}
        value={displayName}
        onChangeText={setDisplayName}
      />
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Defaults from Apple. You can change it.
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
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  hint: {
    fontSize: 14,
  },
});
