import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ACCENT_THEMES,
  type AccentThemeId,
} from "@/lib/accent-themes";
import { useAppColors } from "@/lib/theme";

type AccentThemePickerProps = {
  selectedId: AccentThemeId;
  onSelect: (accentId: AccentThemeId) => void;
};

const THEME_PREVIEW_SIZE = 52;

export function AccentThemePicker({
  selectedId,
  onSelect,
}: AccentThemePickerProps) {
  const colors = useAppColors();

  return (
    <View style={styles.themeGrid}>
      {ACCENT_THEMES.map((theme) => {
        const selected = selectedId === theme.id;
        return (
          <Pressable
            key={theme.id}
            style={styles.themeOption}
            onPress={() => onSelect(theme.id)}
            accessibilityRole="button"
            accessibilityLabel={`${theme.label} theme`}
            accessibilityState={{ selected }}
          >
            <View
              style={[
                styles.themePreview,
                {
                  borderColor: selected ? colors.text : colors.surfaceBorder,
                },
              ]}
            >
              <LinearGradient
                colors={[...theme.gradientColors]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.themePreviewGradient}
              />
            </View>
            <Text
              style={[
                styles.themeLabel,
                {
                  color: selected ? colors.text : colors.textMuted,
                  fontWeight: selected ? "600" : "400",
                },
              ]}
            >
              {theme.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  themeOption: {
    alignItems: "center",
    gap: 6,
    width: THEME_PREVIEW_SIZE + 8,
  },
  themePreview: {
    width: THEME_PREVIEW_SIZE,
    height: THEME_PREVIEW_SIZE,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
  },
  themePreviewGradient: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 12,
  },
});
