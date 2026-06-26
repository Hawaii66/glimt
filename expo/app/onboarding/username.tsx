import { Redirect, useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useQuery } from 'convex/react';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSession } from '@/hooks/useSession';
import { APP_HOME } from '@/lib/routes';
import { useAppColors } from '@/lib/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { api } from 'convex/_generated/api';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const USERNAME_CHECK_DEBOUNCE_MS = 400;

function normalizeUsernameInput(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9_]/g, '');
}

export default function UsernameScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { isReady, isAuthenticated, onboardingComplete } = useSession();
  const username = useOnboardingStore((state) => state.username);
  const setUsername = useOnboardingStore((state) => state.setUsername);
  const displayName = useOnboardingStore((state) => state.displayName);

  const normalizedUsername = normalizeUsernameInput(username);
  const debouncedUsername = useDebouncedValue(
    normalizedUsername,
    USERNAME_CHECK_DEBOUNCE_MS,
  );
  const isDebouncing = normalizedUsername !== debouncedUsername;
  const hasValidFormat = USERNAME_PATTERN.test(normalizedUsername);
  const shouldCheckAvailability =
    isAuthenticated && hasValidFormat && !isDebouncing && debouncedUsername.length > 0;
  const isAvailable = useQuery(
    api.users.isUsernameAvailable,
    shouldCheckAvailability ? { username: debouncedUsername } : 'skip',
  );

  const validationMessage = useMemo(() => {
    if (!normalizedUsername || isDebouncing) {
      return null;
    }
    if (!hasValidFormat) {
      return 'Use 3–20 lowercase letters, numbers, or underscores.';
    }
    if (isAvailable === false) {
      return 'That username is already taken.';
    }
    return null;
  }, [normalizedUsername, hasValidFormat, isDebouncing, isAvailable]);

  if (!isReady) {
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

  const canContinue =
    hasValidFormat &&
    !isDebouncing &&
    !validationMessage &&
    isAvailable === true;

  return (
    <OnboardingScreen
      nextDisabled={!canContinue}
      onNext={() => {
        setUsername(debouncedUsername);
        router.push('/onboarding/photo');
      }}
    >
      <Text style={[styles.label, { color: colors.text }]}>Username</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="username"
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: validationMessage ? '#ef4444' : colors.textMuted,
          },
        ]}
        value={username}
        onChangeText={(text) => setUsername(normalizeUsernameInput(text))}
      />
      {validationMessage ? (
        <Text style={[styles.error, { color: '#ef4444' }]}>
          {validationMessage}
        </Text>
      ) : isDebouncing || (shouldCheckAvailability && isAvailable === undefined) ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Checking...
        </Text>
      ) : (
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          This is how friends will find you.
        </Text>
      )}
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
  error: {
    fontSize: 14,
  },
});
