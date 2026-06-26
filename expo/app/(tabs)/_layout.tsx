import { Link, Redirect, Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useStoresHydrated } from '@/hooks/useStoresHydrated';
import { useAppColors } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

export default function TabLayout() {
  const colors = useAppColors();
  const hydrated = useStoresHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingComplete = useProfileStore((state) => state.onboardingComplete);

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

  if (!onboardingComplete) {
    return <Redirect href="/onboarding/setup" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tint,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tab One',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'chevron.left.forwardslash.chevron.right' }}
              tintColor={color}
              size={28}
            />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable style={{ marginRight: 15 }}>
                {({ pressed }) => (
                  <SymbolView
                    name={{ ios: 'info.circle' }}
                    size={25}
                    tintColor={Colors.text}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Tab Two',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'chevron.left.forwardslash.chevron.right' }}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
