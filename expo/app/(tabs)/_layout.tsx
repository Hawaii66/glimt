import { SymbolView } from 'expo-symbols';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';

export default function TabLayout() {
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
