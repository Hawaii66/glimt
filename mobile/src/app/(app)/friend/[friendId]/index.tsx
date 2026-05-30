import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { DailyJourneyRow } from "@/components/journey/DailyJourneyRow";
import { ProfilePreview } from "@/components/onboarding/ProfilePreview";
import { useFriendGroupId } from "@/hooks/useFriendGroupId";
import { useFriendJourney } from "@/hooks/useFriendJourney";
import { useFriendProfile } from "@/hooks/useFriendProfile";
import {
  DEFAULT_ACCENT_THEME_ID,
  getAccentTheme,
} from "@/lib/accent-themes";
import { useAppColors } from "@/lib/theme";

const HORIZONTAL_PADDING = 24;
const PREVIEW_TILE_GAP = 12;

export default function FriendJourneyScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { friendId } = useLocalSearchParams<{ friendId: string }>();

  const { friend, isLoading } = useFriendProfile(friendId);
  const { groupId } = useFriendGroupId(friendId);
  const { journeys, isLoading: isJourneyLoading } = useFriendJourney(groupId);
  const gradientColors = getAccentTheme(
    friend?.accentId ?? DEFAULT_ACCENT_THEME_ID,
  ).gradientColors;

  const contentWidth = windowWidth - HORIZONTAL_PADDING * 2;
  const tileSize = (contentWidth - PREVIEW_TILE_GAP - 32) / 2;

  if (!isLoading && !friend) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.notFoundHeader}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
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
        <View style={styles.notFoundContent}>
          <Text style={[styles.notFoundTitle, { color: colors.text }]}>
            Friend not found
          </Text>
          <Text style={[styles.notFoundBody, { color: colors.textMuted }]}>
            This friend could not be found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <SymbolView
              name="chevron.left"
              size={20}
              tintColor="#FFFFFF"
              weight="semibold"
            />
          </Pressable>
        </View>

        <ProfilePreview
          embedded
          onGradientBackground
          profile={{
            displayName: friend?.displayName ?? "",
            username: friend?.username ?? "",
            avatarUri: friend?.avatarUrl ?? null,
          }}
        />

        <Text style={styles.sectionTitle}>Yours & theirs</Text>
      </SafeAreaView>

      <ScrollView
        style={styles.journeyScroll}
        contentContainerStyle={[
          styles.journeyContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {journeys.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No journeys yet
            </Text>
            <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
              Share a glimt to start collecting days together.
            </Text>
          </View>
        ) : (
          journeys.map((journey) => (
            <DailyJourneyRow
              key={journey.date}
              friendId={friendId!}
              friendAccentId={friend?.accentId ?? DEFAULT_ACCENT_THEME_ID}
              friendAvatarUrl={friend?.avatarUrl ?? ""}
              friendDisplayName={friend?.displayName ?? ""}
              date={journey.date}
              yours={journey.yours}
              theirs={journey.theirs}
              meetLock={journey.meetLock}
              unlockedAt={journey.unlockedAt}
              tileSize={tileSize}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    alignSelf: "flex-start",
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  journeyScroll: {
    flex: 1,
  },
  journeyContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 16,
  },
  emptyState: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyBody: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  notFoundHeader: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
  },
  notFoundContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 8,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  notFoundBody: {
    fontSize: 15,
    textAlign: "center",
  },
});
