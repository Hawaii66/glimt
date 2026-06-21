import Constants from "expo-constants";
import { Directory, File, Paths } from "expo-file-system";

import { api } from "convex/_generated/api";
import { Asset } from "expo-asset";
import * as ImageManipulator from "expo-image-manipulator";
import {
  getAccentTheme,
  resolveAccentThemeId,
  type AccentThemeId,
} from "./accent-themes";
import { convex } from "./convex";
import { getInitials } from "./get-initials";
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
  overwrite = false,
): Promise<string | null> {
  const cacheDir = getWidgetCacheDirectory();
  if (!cacheDir) {
    return null;
  }

  const destination = new File(cacheDir, filename);
  if (destination.exists && !overwrite) {
    return destination.uri;
  }

  try {
    const shouldCopy = copy || url.startsWith("file://");
    if (shouldCopy) {
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
    console.warn(`[FriendGlimt] failed to cache ${url} ${filename}:`, error);
    return null;
  }
}

async function buildWidgetGlimts(): Promise<WidgetGlimtItem[]> {
  if (!convex) {
    console.warn("[FriendGlimt] no Convex client; skipping widget refresh");
    return [];
  }

  const rows = await convex.query(api.journals.listWidgetGlimts, {
    limit: 4,
  });

  const glimts = await Promise.all(
    rows.map(async ({ friendUserId, photoUrl, avatarUrl, displayName }) => {
      const test = ImageManipulator.ImageManipulator;

      const context = test.manipulate(photoUrl);
      context.resize({
        height: 50,
        width: 50,
      });
      const testRendered = await context.renderAsync();
      const result = await testRendered.saveAsync({
        format: ImageManipulator.SaveFormat.JPEG,
      });

      const photoUri = await cacheImageToAppGroup(
        result.uri,
        `photo-${friendUserId}.jpg`,
        true,
        true,
      );

      if (!photoUri) {
        return null;
      }

      const avatarUri = avatarUrl
        ? ((await cacheImageToAppGroup(
            avatarUrl,
            `avatar-${friendUserId}.jpg`,
            false,
            true,
          )) ?? "")
        : "";

      return {
        photoUri,
        avatarUri,
        avatarInitials: getInitials(displayName),
      };
    }),
  );

  return glimts.filter((item): item is WidgetGlimtItem => item !== null);
}

export async function refreshFriendGlimtWidget(
  accentThemeId?: AccentThemeId,
): Promise<void> {
  const glimts = await buildWidgetGlimts();

  if (glimts.length === 0) {
    console.warn("[FriendGlimt] no widget images cached; skipping update");
    return;
  }

  const whiteUrl = await getWhiteImageAssetUri();
  if (!whiteUrl) {
    console.warn("[FriendGlimt] failed to resolve white.png asset");
    return;
  }

  const whiteUri = await cacheImageToAppGroup(whiteUrl, "white.png", true);
  if (!whiteUri) {
    console.warn("[FriendGlimt] failed to cache white.png");
    return;
  }

  console.log(whiteUrl, whiteUri, glimts);

  FriendGlimtWidget.updateSnapshot({
    glimts,
    style: getWidgetTileStyle(accentThemeId),
    whiteUri,
  });
}

export function refreshCameraWidget(accentThemeId?: AccentThemeId): void {
  FriendGlimtCameraWidget.updateSnapshot({
    captureUrl: getCaptureDeepLinkUrl(),
    style: getWidgetTileStyle(accentThemeId),
  });
}
