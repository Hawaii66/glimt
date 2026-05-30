import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { JourneyDayChat } from "@/components/journey/JourneyDayChat";
import { isJourneyLocked } from "@/lib/format-journey-date";
import { getFriendById } from "@/lib/glimt-mock-data";
import { getJourneyByDate } from "@/lib/journey-chat";
import { useAppColors } from "@/lib/theme";

export default function JourneyDayScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const { friendId, date } = useLocalSearchParams<{
    friendId: string;
    date: string;
  }>();

  const friend = friendId ? getFriendById(friendId) : undefined;
  const journey =
    friendId && date ? getJourneyByDate(friendId, date) : undefined;
  const locked = date ? isJourneyLocked(date, journey?.yours, journey?.theirs) : true;

  useEffect(() => {
    if (locked) {
      router.back();
    }
  }, [locked, router]);

  if (!friend || !journey || !date || locked) {
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        yours={journey.yours}
        theirs={journey.theirs}
        friendDisplayName={friend.displayName}
        friendAvatarUrl={friend.avatarUrl}
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
