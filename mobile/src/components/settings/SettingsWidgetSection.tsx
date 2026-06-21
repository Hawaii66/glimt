import { Switch, StyleSheet, Text, View } from "react-native";

import { useWidgetDisplayPreferences } from "@/hooks/useWidgetDisplayPreferences";
import { useAppColors } from "@/lib/theme";
import type { WidgetDisplayPreferences } from "convex/lib/widgetDisplayPreferences";

type PreferenceRowProps = {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function PreferenceRow({
  label,
  hint,
  value,
  onValueChange,
}: PreferenceRowProps) {
  const colors = useAppColors();

  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.rowHint, { color: colors.textMuted }]}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
      />
    </View>
  );
}

const PREFERENCE_ROWS: {
  key: keyof WidgetDisplayPreferences;
  label: string;
  hint: string;
}[] = [
  {
    key: "showWhiteBorder",
    label: "White border",
    hint: "Show the white frame around each photo.",
  },
  {
    key: "showRotation",
    label: "Rotation",
    hint: "Tilt photos slightly for a scrapbook look.",
  },
  {
    key: "showAvatar",
    label: "Avatar",
    hint: "Show the friend's avatar on each tile.",
  },
];

export function SettingsWidgetSection() {
  const colors = useAppColors();
  const { preferences, setPreference } = useWidgetDisplayPreferences();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Widgets
      </Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.fill,
            borderColor: colors.surfaceBorder,
          },
        ]}
      >
        {PREFERENCE_ROWS.map((row, index) => (
          <View key={row.key}>
            {index > 0 ? (
              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.surfaceBorder },
                ]}
              />
            ) : null}
            <PreferenceRow
              label={row.label}
              hint={row.hint}
              value={preferences[row.key]}
              onValueChange={(value) => setPreference(row.key, value)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  rowHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
});
