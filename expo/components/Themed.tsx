import { Text as DefaultText, View as DefaultView } from 'react-native';

import Colors, { type ThemeColorName } from '@/constants/Colors';

type ThemedTextProps = DefaultText['props'] & {
  color?: string;
  colorName?: ThemeColorName;
};

type ThemedViewProps = DefaultView['props'] & {
  backgroundColor?: string;
  colorName?: ThemeColorName;
};

export type TextProps = ThemedTextProps;
export type ViewProps = ThemedViewProps;

export function useThemeColor(colorName: ThemeColorName): string {
  return Colors[colorName];
}

export function Text({ style, color, colorName = 'text', ...otherProps }: TextProps) {
  return <DefaultText style={[{ color: color ?? Colors[colorName] }, style]} {...otherProps} />;
}

export function View({
  style,
  backgroundColor,
  colorName = 'background',
  ...otherProps
}: ViewProps) {
  return (
    <DefaultView
      style={[{ backgroundColor: backgroundColor ?? Colors[colorName] }, style]}
      {...otherProps}
    />
  );
}
