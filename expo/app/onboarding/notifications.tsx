import { Redirect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { useSession } from '@/hooks/useSession';
import {
  getPushPlatform,
  registerForPushNotificationsAsync,
} from '@/lib/push-notifications';
import { APP_HOME } from '@/lib/routes';
import { useAppColors } from '@/lib/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function NotificationsScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { isReady, isAuthenticated, onboardingComplete } = useSession();
  const displayName = useOnboardingStore((state) => state.displayName);
  const username = useOnboardingStore((state) => state.username);
  const setPushToken = useOnboardingStore((state) => state.setPushToken);
  const [loading, setLoading] = useState(false);

  const goToConfirm = () => {
    router.push('/onboarding/confirm');
  };

  const registerTokenIfGranted = async () => {
    const platform = getPushPlatform();
    if (!platform) {
      return;
    }

    const token = await registerForPushNotificationsAsync();
    if (token) {
      setPushToken(token);
    }
  };

  const handleEnable = async () => {
    setLoading(true);

    try {
      await registerTokenIfGranted();
    } finally {
      setLoading(false);
      goToConfirm();
    }
  };

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

  if (!username.trim()) {
    return <Redirect href="/onboarding/username" />;
  }

  return (
    <OnboardingScreen
      showPreview={false}
      actionLabel="Enable notifications"
      loading={loading}
      onNext={() => {
        void handleEnable();
      }}
      header={
        <>
          <SymbolView
            name="bell.badge.fill"
            size={56}
            tintColor={colors.text}
            style={styles.icon}
          />
          <Text style={[styles.title, { color: colors.text }]}>
            Stay in the loop
          </Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>
            Glimt uses notifications for friend requests, new glimts, daily
            reminders, and to keep your home screen widgets up to date.
          </Text>
        </>
      }
    >
      <Pressable
        disabled={loading}
        onPress={goToConfirm}
        style={styles.skipButton}
      >
        <Text style={[styles.skip, { color: colors.textMuted }]}>Not now</Text>
      </Pressable>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    alignSelf: 'center',
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
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skip: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
