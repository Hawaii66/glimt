import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { getConvexErrorMessage } from "@/lib/convexError";
import { useAppColors } from "@/lib/theme";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

type JournalTimezoneSettingsProps = {
  friendUserId: string;
};

function formatTimezoneLabel(timezone: string): string {
  return timezone.replace(/_/g, " ");
}

export function JournalTimezoneSettings({
  friendUserId,
}: JournalTimezoneSettingsProps) {
  const colors = useAppColors();
  const settings = useQuery(api.journals.getJournalTimezoneForFriend, {
    friendUserId: friendUserId as Id<"users">,
  });
  const setJournalTimezone = useMutation(api.journals.setJournalTimezone);
  const [savingTimezone, setSavingTimezone] = useState<string | null>(null);

  if (settings === undefined || settings === null) {
    return null;
  }

  if (!settings.canChangeJournalTimezone) {
    return null;
  }

  const options = [...new Set(settings.memberTimezones as [string, string])];

  const handleSelect = async (timezone: string) => {
    if (timezone === settings.effectiveTimezone && !settings.scheduledChange) {
      return;
    }

    setSavingTimezone(timezone);
    try {
      const result = await setJournalTimezone({
        groupId: settings.groupId,
        timezone,
      });
      Alert.alert(
        "Journal timezone updated",
        `Your shared journal day will use ${formatTimezoneLabel(timezone)} starting ${result.scheduledJournalTimezoneFrom}.`,
      );
    } catch (error) {
      Alert.alert(
        "Could not update timezone",
        getConvexErrorMessage(error, "Try again in a moment."),
      );
    } finally {
      setSavingTimezone(null);
    }
  };

  return (
    <View style={[styles.container, { borderColor: colors.surfaceBorder }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Shared journal day
      </Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>
        You and your friend are in different timezones. Choose which timezone
        defines when a shared day starts and ends.
      </Text>
      {settings.scheduledChange ? (
        <Text style={[styles.pending, { color: colors.textMuted }]}>
          Changes to {formatTimezoneLabel(settings.scheduledChange.timezone)} on{" "}
          {settings.scheduledChange.effectiveFrom}.
        </Text>
      ) : null}
      <View style={styles.options}>
        {options.map((timezone) => {
          const isActive =
            timezone === settings.effectiveTimezone &&
            !settings.scheduledChange;
          const isPending =
            settings.scheduledChange?.timezone === timezone;
          const isSaving = savingTimezone === timezone;

          return (
            <Pressable
              key={timezone}
              style={[
                styles.option,
                {
                  backgroundColor: isActive ? colors.fill : "transparent",
                  borderColor: colors.surfaceBorder,
                },
              ]}
              disabled={isSaving}
              onPress={() => void handleSelect(timezone)}
              accessibilityRole="button"
              accessibilityLabel={`Use ${formatTimezoneLabel(timezone)} for shared journal days`}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>
                {formatTimezoneLabel(timezone)}
              </Text>
              {isActive ? (
                <Text style={[styles.optionMeta, { color: colors.textMuted }]}>
                  Current
                </Text>
              ) : null}
              {isPending ? (
                <Text style={[styles.optionMeta, { color: colors.textMuted }]}>
                  Scheduled
                </Text>
              ) : null}
              {isSaving ? (
                <Text style={[styles.optionMeta, { color: colors.textMuted }]}>
                  Saving...
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  pending: {
    fontSize: 13,
    lineHeight: 18,
  },
  options: {
    gap: 8,
  },
  option: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  optionMeta: {
    fontSize: 12,
    fontWeight: "600",
  },
});
