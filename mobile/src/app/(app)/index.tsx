import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useQuery } from "convex/react";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { GlimtTile } from "@/components/glimt/GlimtTile";
import { UserAvatar } from "@/components/UserAvatar";
import { useCurrentUserAccentTheme } from "@/hooks/useCurrentUserAccentTheme";
import { useWidgetDisplayPreferences } from "@/hooks/useWidgetDisplayPreferences";
import { getAccentTheme } from "@/lib/accent-themes";
import { getMobileEnvironment } from "@/lib/environment";
import { APP_CAPTURE, APP_SETTINGS, appFriendJourney } from "@/lib/routes";
import { refreshFriendGlimtWidget } from "@/lib/widget-refresh";
import { api } from "convex/_generated/api";

const HORIZONTAL_PADDING = 24;
const showWidgetRefreshButton = getMobileEnvironment() !== "prod";
const NUM_COLUMNS = 2;
const TILE_HORIZONTAL_GAP = 16;
const TILE_VERTICAL_GAP = 24;
const BOTTOM_BAR_PADDING = 24;

export default function HomeScreen() {
  const router = useRouter();
  const [refreshingWidget, setRefreshingWidget] = useState(false);
  const homeData = useQuery(api.journals.listHomeFriends);
  const friends = useQuery(api.friends.listFriends);
  const todayMeetLocks = useQuery(api.journals.getTodayMeetLocksForFriends);
  const meetLockedByFriendId = new Map(
    (todayMeetLocks ?? []).map((row) => [row.friendUserId, row.meetLocked]),
  );
  const { accentTheme } = useCurrentUserAccentTheme();
  const { preferences: widgetDisplayPreferences } = useWidgetDisplayPreferences();
  const gradientColors = getAccentTheme(accentTheme).gradientColors;
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = windowWidth - HORIZONTAL_PADDING * 2;
  const tileSize =
    (contentWidth - TILE_HORIZONTAL_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  const tiles = homeData?.tiles ?? [];
  const showEmptyState = homeData !== undefined && tiles.length === 0;
  const hasNoFriends = homeData?.totalFriendCount === 0;
  const hasFriendsButNothingToday =
    showEmptyState && (homeData?.totalFriendCount ?? 0) > 0;

  async function handleRefreshWidget() {
    if (refreshingWidget) {
      return;
    }

    setRefreshingWidget(true);
    try {
      await refreshFriendGlimtWidget(accentTheme, widgetDisplayPreferences);
    } finally {
      setRefreshingWidget(false);
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Pressable
        style={[styles.menuButton, { top: insets.top + 8 }]}
        onPress={() => router.push(APP_SETTINGS)}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
      >
        <SymbolView
          name="line.3.horizontal"
          size={20}
          tintColor="#FFFFFF"
          weight="semibold"
        />
      </Pressable>

      <FlashList
        data={tiles}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <Text style={styles.title}>Glimt</Text>
            <Text style={styles.tagline}>Small everyday moments</Text>
            {showWidgetRefreshButton ? (
              <Pressable
                style={styles.widgetRefreshButton}
                onPress={() => void handleRefreshWidget()}
                disabled={refreshingWidget}
                accessibilityRole="button"
                accessibilityLabel="Refresh home screen widget"
              >
                {refreshingWidget ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.widgetRefreshButtonText}>
                    Refresh widget
                  </Text>
                )}
              </Pressable>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          showEmptyState ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {hasNoFriends ? "No friends yet" : "Nothing new today"}
              </Text>
              <Text style={styles.emptyBody}>
                {hasNoFriends
                  ? "Add friends in settings to start sharing glimts together."
                  : hasFriendsButNothingToday
                    ? "When a friend sends you a glimt today, they'll show up here."
                    : ""}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <Pressable
            style={[
              styles.listItem,
              index % NUM_COLUMNS === 0 && styles.listItemLeft,
            ]}
            onPress={() => router.push(appFriendJourney(item.id))}
            accessibilityRole="button"
            accessibilityLabel={`Open journey with ${item.displayName}`}
          >
            <GlimtTile
              photoUrl={item.previewPhotoUrl}
              avatarUrl={item.avatarUrl}
              displayName={item.displayName}
              index={index}
              size={tileSize}
              showMeetDayBadge={meetLockedByFriendId.get(item.id) === true}
              displayPreferences={widgetDisplayPreferences}
            />
          </Pressable>
        )}
        ListFooterComponent={
          friends !== undefined && friends.length > 0 ? (
            <View style={styles.friendsSection}>
              <Text style={styles.friendsSectionLabel}>Friends</Text>
              <View style={styles.friendsList}>
                {friends.map((friend, index) => (
                  <Pressable
                    key={friend.id}
                    onPress={() => router.push(appFriendJourney(friend.id))}
                    style={({ pressed }) => [
                      styles.friendRow,
                      index < friends.length - 1 && styles.friendRowBorder,
                      pressed && styles.friendRowPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Open journey with ${friend.displayName}`}
                  >
                    <UserAvatar
                      imageUri={friend.avatarUrl || null}
                      displayName={friend.displayName}
                      size={44}
                      style={styles.friendAvatar}
                      backgroundColor="rgba(255, 255, 255, 0.2)"
                      borderColor="rgba(255, 255, 255, 0.35)"
                      borderWidth={StyleSheet.hairlineWidth}
                      initialsColor="rgba(255, 255, 255, 0.9)"
                    />
                    <Text style={styles.friendName} numberOfLines={1}>
                      {friend.displayName}
                    </Text>
                    <SymbolView
                      name="chevron.right"
                      size={14}
                      tintColor="rgba(255, 255, 255, 0.55)"
                      weight="semibold"
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      <SafeAreaView
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + BOTTOM_BAR_PADDING },
        ]}
        edges={[]}
      >
        <Pressable
          style={styles.captureButton}
          onPress={() => router.push(APP_CAPTURE)}
        >
          <Text style={styles.captureButtonText}>Take a picture</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuButton: {
    position: "absolute",
    right: HORIZONTAL_PADDING,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 120,
  },
  header: {
    paddingBottom: 28,
    paddingRight: 52,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    color: "rgba(255, 255, 255, 0.92)",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  widgetRefreshButton: {
    alignSelf: "flex-start",
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    minHeight: 36,
    justifyContent: "center",
  },
  widgetRefreshButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  listItem: {
    marginBottom: TILE_VERTICAL_GAP,
    alignItems: "center",
  },
  listItemLeft: {
    marginRight: TILE_HORIZONTAL_GAP,
  },
  emptyState: {
    paddingTop: 48,
    paddingHorizontal: 16,
    gap: 8,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyBody: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  friendsSection: {
    marginTop: 8,
    paddingTop: 24,
    gap: 12,
  },
  friendsSectionLabel: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  friendsList: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  friendRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.15)",
  },
  friendRowPressed: {
    opacity: 0.7,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  friendName: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: BOTTOM_BAR_PADDING,
  },
  captureButton: {
    backgroundColor: "#111111",
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
