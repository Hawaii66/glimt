import { DarkTheme } from 'expo-router';

import Colors from '@/constants/Colors';

export const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.tint,
    background: Colors.background,
    card: Colors.backgroundSecondary,
    text: Colors.text,
    border: Colors.separator,
    notification: Colors.accent,
  },
} as const;
