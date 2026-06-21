import Constants from "expo-constants";
import { Directory, File, Paths } from "expo-file-system";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
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
  tileRotationDegrees,
} from "./glimt-tile-styles";
import {
  resolveWidgetDisplayPreferences,
  type WidgetDisplayPreferences,
} from "convex/lib/widgetDisplayPreferences";
import { getCaptureDeepLinkUrl } from "./routes";
import {
  FriendGlimtCameraWidget,
  FriendGlimtWidget,
  WidgetGlimtItem,
  type WidgetTileStyle,
} from "./widget";

const WIDGET_PHOTO_SIZE = 250;
const WIDGET_AVATAR_SIZE = 100;

export type WidgetRefreshOptions = {
  seed?: number;
  pinnedPhotoId?: Id<"journalEntries">;
};

export function getHourlyWidgetSeed(now = Date.now()): number {
  return Math.floor(now / (60 * 60 * 1000));
}

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
    systemSmallTileScale: TILE_SCALE * 0.85,
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

async function resizeWidgetImage(
  sourceUri: string,
  width: number,
  height: number,
): Promise<string | null> {
  try {
    const context = ImageManipulator.ImageManipulator.manipulate(sourceUri);
    context.resize({ width, height });
    const rendered = await context.renderAsync();
    const result = await rendered.saveAsync({
      format: ImageManipulator.SaveFormat.JPEG,
    });

    return result.uri;
  } catch (error) {
    console.warn(`[FriendGlimt] failed to resize image ${sourceUri}:`, error);
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

async function buildWidgetGlimts(
  displayPreferences: WidgetDisplayPreferences,
  refreshOptions?: WidgetRefreshOptions,
): Promise<WidgetGlimtItem[]> {
  if (!convex) {
    console.warn("[FriendGlimt] no Convex client; skipping widget refresh");
    return [];
  }

  const rows = await convex.query(api.journals.listWidgetGlimts, {
    limit: 4,
    seed: refreshOptions?.seed ?? getHourlyWidgetSeed(),
    pinnedPhotoId: refreshOptions?.pinnedPhotoId,
  });

  const glimts = await Promise.all(
    rows.map(async ({ friendUserId, photoId, photoUrl, avatarUrl, displayName }, index) => {
      const resizedPhotoUri = await resizeWidgetImage(
        photoUrl,
        WIDGET_PHOTO_SIZE,
        WIDGET_PHOTO_SIZE,
      );
      if (!resizedPhotoUri) {
        return null;
      }

      const photoUri = await cacheImageToAppGroup(
        resizedPhotoUri,
        `photo-${friendUserId}-${photoId}.jpg`,
        true,
        true,
      );

      if (!photoUri) {
        return null;
      }

      let avatarUri = "";
      if (avatarUrl) {
        const resizedAvatarUri = await resizeWidgetImage(
          avatarUrl,
          WIDGET_AVATAR_SIZE,
          WIDGET_AVATAR_SIZE,
        );
        if (resizedAvatarUri) {
          avatarUri =
            (await cacheImageToAppGroup(
              resizedAvatarUri,
              `avatar-${friendUserId}.jpg`,
              true,
              true,
            )) ?? "";
        }
      }

      return {
        photoUri,
        avatarUri,
        avatarInitials: getInitials(displayName),
        rotationDegrees: tileRotationDegrees(
          index,
          displayPreferences.showRotation,
        ),
      };
    }),
  );

  return glimts.filter((item): item is WidgetGlimtItem => item !== null);
}

export async function refreshFriendGlimtWidget(
  accentThemeId?: AccentThemeId,
  displayPreferencesInput?: WidgetDisplayPreferences,
  refreshOptions?: WidgetRefreshOptions,
): Promise<void> {
  const displayPreferences = resolveWidgetDisplayPreferences(
    displayPreferencesInput,
  );
  const glimts = await buildWidgetGlimts(displayPreferences, refreshOptions);

  if (glimts.length === 0) {
    console.warn("[FriendGlimt] no widget images cached; skipping update");
    return;
  }

  let whiteUri = "";
  if (displayPreferences.showWhiteBorder) {
    const whiteUrl = await getWhiteImageAssetUri();
    if (!whiteUrl) {
      console.warn("[FriendGlimt] failed to resolve white.png asset");
      return;
    }

    const cachedWhiteUri = await cacheImageToAppGroup(whiteUrl, "white.png", true);
    if (!cachedWhiteUri) {
      console.warn("[FriendGlimt] failed to cache white.png");
      return;
    }

    whiteUri = cachedWhiteUri;
  }

  FriendGlimtWidget.updateSnapshot({
    glimts,
    style: getWidgetTileStyle(accentThemeId),
    whiteUri,
    display: displayPreferences,
  });
}

export function refreshCameraWidget(accentThemeId?: AccentThemeId): void {
  FriendGlimtCameraWidget.updateSnapshot({
    captureUrl: getCaptureDeepLinkUrl(),
    style: getWidgetTileStyle(accentThemeId),
  });
}

export async function refreshFriendGlimtWidgetFromPush(data?: {
  seed?: string;
  photoId?: string;
}): Promise<void> {
  if (!convex) {
    return;
  }

  const user = await convex.query(api.users.current);
  if (!user) {
    return;
  }

  const accentTheme = resolveAccentThemeId(
    user.accentTheme as AccentThemeId | undefined,
  );
  const displayPreferences = resolveWidgetDisplayPreferences(
    user.widgetDisplayPreferences,
  );
  const seed = data?.seed ? Number(data.seed) : getHourlyWidgetSeed();
  const pinnedPhotoId = data?.photoId as Id<"journalEntries"> | undefined;

  await refreshFriendGlimtWidget(accentTheme, displayPreferences, {
    seed: Number.isFinite(seed) ? seed : getHourlyWidgetSeed(),
    pinnedPhotoId,
  });
}
