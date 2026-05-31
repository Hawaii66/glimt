import { StyleSheet, Text, View } from "react-native";

import { formatTimezoneLabel } from "@/lib/format-timezone";
import { useAppColors } from "@/lib/theme";

type TimezoneInfoRowProps = {
  label: string;
  timezone: string;
  hint?: string;
};

export function TimezoneInfoRow({
  label,
  timezone,
  hint,
}: TimezoneInfoRowProps) {
  const colors = useAppColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View
        style={[
          styles.valueCard,
          {
            backgroundColor: colors.fill,
            borderColor: colors.surfaceBorder,
          },
        ]}
      >
        <Text style={[styles.value, { color: colors.text }]}>
          {formatTimezoneLabel(timezone)}
        </Text>
        {hint ? (
          <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  valueCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
});
