import Constants from "expo-constants";
import { Directory, File, Paths } from "expo-file-system";

import { Asset } from "expo-asset";
import { Alert } from "react-native";
import {
  getAccentTheme,
  resolveAccentThemeId,
  type AccentThemeId,
} from "./accent-themes";
import { MOCK_FRIEND_GLIMTS } from "./glimt-mock-data";
import {
  AVATAR_OFFSET,
  AVATAR_SIZE,
  PHOTO_BORDER_COLOR,
  TILE_BORDER_WIDTH,
  TILE_CORNER_RADIUS,
  TILE_SCALE,
} from "./glimt-tile-styles";
import { getCaptureDeepLinkUrl } from "./routes";
import {
  FriendGlimtCameraWidget,
  FriendGlimtWidget,
  WidgetGlimtItem,
  type WidgetTileStyle,
} from "./widget";

function getWidgetTileStyle(accentThemeId?: AccentThemeId): WidgetTileStyle {
  const gradientColors = getAccentTheme(
    resolveAccentThemeId(accentThemeId),
  ).gradientColors;

  return {
    gradientColors: [...gradientColors] as [string, string, string],
    photoBorderColor: PHOTO_BORDER_COLOR,
    tileCornerRadius: TILE_CORNER_RADIUS,
    tileBorderWidth: TILE_BORDER_WIDTH,
    avatarSize: AVATAR_SIZE,
    avatarOffset: AVATAR_OFFSET,
    tileScale: TILE_SCALE,
  };
}

function getAppGroupDirectory(): Directory | null {
  const bundleIdentifier = Constants.expoConfig?.ios?.bundleIdentifier;
  if (!bundleIdentifier) {
    return null;
  }

  return Paths.appleSharedContainers[`group.${bundleIdentifier}`] ?? null;
}

function getWidgetCacheDirectory(): Directory | null {
  const appGroup = getAppGroupDirectory();
  if (!appGroup) {
    return null;
  }

  const cacheDir = new Directory(appGroup, "widget-cache");
  if (!cacheDir.exists) {
    cacheDir.create({ idempotent: true });
  }

  return cacheDir;
}

async function getWhiteImageAssetUri(): Promise<string | null> {
  try {
    const asset = Asset.fromModule(require("../../assets/white.png"));

    await asset.downloadAsync();

    return asset.localUri;
  } catch (error) {
    console.error("Failed to resolve white.png asset:", error);
    return null;
  }
}

async function cacheImageToAppGroup(
  url: string,
  filename: string,
  copy: boolean,
): Promise<string | null> {
  const cacheDir = getWidgetCacheDirectory();
  if (!cacheDir) {
    return null;
  }

  const destination = new File(cacheDir, filename);
  if (destination.exists) {
    return destination.uri;
  }

  try {
    if (copy) {
      const sourceFile = new File(url);
      sourceFile.copy(destination);
      return destination.uri;
    } else {
      const downloaded = await File.downloadFileAsync(url, destination, {
        idempotent: true,
      });
      return downloaded.uri;
    }
  } catch (error) {
    console.warn(`[FriendGlimt] failed to cache ${filename}:`, error);
    return null;
  }
}

async function buildMockWidgetGlimts(): Promise<WidgetGlimtItem[]> {
  const glimts = await Promise.all(
    MOCK_FRIEND_GLIMTS.map(async ({ photoUrl, avatarUrl }, index) => {
      const [photoUri, avatarUri] = await Promise.all([
        cacheImageToAppGroup(photoUrl, `photo-${index}.jpg`, false),
        cacheImageToAppGroup(avatarUrl, `avatar-${index}.jpg`, false),
      ]);

      if (!photoUri) {
        return null;
      }

      return {
        photoUri,
        avatarUri: avatarUri ?? "",
      };
    }),
  );

  return glimts.filter((item): item is WidgetGlimtItem => item !== null);
}

export async function refreshFriendGlimtWidget(
  accentThemeId?: AccentThemeId,
): Promise<void> {
  const glimts = await buildMockWidgetGlimts();

  if (glimts.length === 0) {
    console.warn("[FriendGlimt] no widget images cached; skipping update");
    return;
  }

  const whiteUrl = await getWhiteImageAssetUri();
  if (!whiteUrl) {
    Alert.alert("No white");
    return;
  }
  const whiteUri = await cacheImageToAppGroup(whiteUrl, "white.png", true);
  if (!whiteUri) {
    Alert.alert("No white uri");
    return;
  }

  FriendGlimtWidget.updateSnapshot({
    glimts,
    style: getWidgetTileStyle(accentThemeId),
    whiteUri,
  });
  FriendGlimtWidget.reload();
}

export function refreshCameraWidget(accentThemeId?: AccentThemeId): void {
  FriendGlimtCameraWidget.updateSnapshot({
    captureUrl: getCaptureDeepLinkUrl(),
    style: getWidgetTileStyle(accentThemeId),
  });
  FriendGlimtCameraWidget.reload();
}
