import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { JourneyDayChat } from "@/components/journey/JourneyDayChat";
import { useFriendProfile } from "@/hooks/useFriendProfile";
import { useJournalContext } from "@/hooks/useJournalContext";
import { toJourneyDay } from "@/lib/journal-adapters";
import { resolveJourneyLockState } from "@/lib/journey-lock";
import { useAppColors } from "@/lib/theme";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export default function JourneyDayScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const { friendId, date } = useLocalSearchParams<{
    friendId: string;
    date: string;
  }>();

  const { friend, isLoading: friendLoading } = useFriendProfile(friendId);
  const { friendContext } = useJournalContext(friendId);
  const journalToday = friendContext?.today ?? "";
  const apiDay = useQuery(
    api.journals.getDayForFriend,
    friendId && date
      ? {
          friendUserId: friendId as Id<"users">,
          date,
        }
      : "skip",
  );

  const journey = useMemo(
    () => (apiDay ? toJourneyDay(apiDay) : undefined),
    [apiDay],
  );

  const blocked =
    journey && friendId && date && journalToday
      ? !resolveJourneyLockState(journey, journalToday).canNavigateToDay
      : true;

  useEffect(() => {
    if (blocked && apiDay !== undefined) {
      router.back();
    }
  }, [blocked, router, apiDay]);

  const isLoading = friendLoading || apiDay === undefined;

  if (isLoading || !friend || !journey || !date || blocked) {
    if (isLoading) {
      return null;
    }

    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.notFoundContent}>
          <Text style={[styles.notFoundTitle, { color: colors.text }]}>
            Day not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.fill }]}>
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 8 }]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={[styles.backButton, { backgroundColor: colors.fill }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <SymbolView
              name="chevron.left"
              size={20}
              tintColor={colors.textMuted}
              weight="semibold"
            />
          </Pressable>
        </View>
      </SafeAreaView>

      <JourneyDayChat
        date={date}
        journalToday={journalToday}
        yours={journey.yours}
        theirs={journey.theirs}
        friendDisplayName={friend.displayName}
        friendAvatarUrl={friend.avatarUrl}
        friendAccentId={friend.accentId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSafeArea: {
    paddingHorizontal: 16,
  },
  header: {
    paddingBottom: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  safeArea: {
    flex: 1,
  },
  notFoundContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
});
