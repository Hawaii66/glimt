import type { TokenStorage } from '@convex-dev/auth/react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const secureStorage: TokenStorage | undefined =
  Platform.OS === 'web'
    ? undefined
    : {
        getItem: (key) => SecureStore.getItemAsync(key),
        setItem: (key, value) => SecureStore.setItemAsync(key, value),
        removeItem: (key) => SecureStore.deleteItemAsync(key),
      };
