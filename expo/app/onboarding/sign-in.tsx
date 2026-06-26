import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppleSignInButton } from '@/components/AppleSignInButton';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { useSession } from '@/hooks/useSession';
import { APP_HOME } from '@/lib/routes';
import { useAppColors } from '@/lib/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { convex } from '@/lib/convex';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';

export default function SignInScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const seedFromUser = useOnboardingStore((state) => state.seedFromUser);
  const reset = useOnboardingStore((state) => state.reset);
  const [error, setError] = useState<string | null>(null);
  const [awaitingUser, setAwaitingUser] = useState(false);
  const convexAuth = useConvexAuth();
  
  const canGetCurrentUser = convexAuth.isAuthenticated && !convexAuth.isLoading;
  const user = useQuery(api.users.current, canGetCurrentUser? {} : 'skip');

  console.log(canGetCurrentUser,user);

  useEffect(() => {
    if (convexAuth.isLoading
    ) {
      console.log("loading convex auth");
      return
    }

    if (!convexAuth.isAuthenticated) {
      console.log("convex auth not authenticated")
      return
    }

    console.log("convex auth ready")


  }, [convexAuth.isAuthenticated, convexAuth.isLoading]);

  if (awaitingUser) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (convexAuth.isAuthenticated && user?.onboardingComplete) {
    return <Redirect href={APP_HOME} />;
  }

  if (convexAuth.isAuthenticated) {
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
        <AppleSignInButton
          onError={setError}
          onSuccess={() => {
            setAwaitingUser(true);
          }}
        />
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
