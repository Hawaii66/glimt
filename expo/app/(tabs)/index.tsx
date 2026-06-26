import { useQuery } from 'convex/react';
import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { convex } from '@/lib/convex';
import { api } from 'convex/_generated/api';

export default function TabOneScreen() {
  const message = useQuery(api.messages.hello);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Glimt</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {convex ? (
        <Text style={styles.subtitle}>
          {message === undefined ? 'Loading from Convex…' : message}
        </Text>
      ) : (
        <Text style={styles.subtitle}>
          Set EXPO_PUBLIC_CONVEX_URL in Doppler (dev config) to connect Convex.
        </Text>
      )}
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
