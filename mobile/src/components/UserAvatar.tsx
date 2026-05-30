import { Image } from "expo-image";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { getInitials } from "@/lib/get-initials";
import { useAppColors } from "@/lib/theme";

type UserAvatarProps = {
  imageUri?: string | null;
  displayName: string;
  size: number;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  initialsColor?: string;
};

export function UserAvatar({
  imageUri,
  displayName,
  size,
  style,
  backgroundColor,
  borderColor,
  borderWidth = 0,
  initialsColor,
}: UserAvatarProps) {
  const colors = useAppColors();
  const radius = size / 2;
  const bg = backgroundColor ?? colors.fill;
  const initials = getInitials(displayName);
  const fontSize = Math.max(10, Math.round(size * 0.36));
  const textColor = initialsColor ?? colors.textMuted;

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    backgroundColor: bg,
    borderColor,
    borderWidth,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  };

  if (imageUri) {
    return (
      <View style={[containerStyle, style]}>
        <Image
          source={{ uri: imageUri }}
          style={{ width: size, height: size }}
          contentFit="cover"
        />
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      <Text
        style={[styles.initials, { fontSize, color: textColor, lineHeight: fontSize }]}
        numberOfLines={1}
        accessibilityLabel={`${displayName} initials`}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  initials: {
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
