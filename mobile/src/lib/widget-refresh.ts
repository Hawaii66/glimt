import Constants from "expo-constants";
import { Directory, File, Paths } from "expo-file-system";

import { FriendGlimtWidget, WidgetGlimtItem } from "./widget";

const MOCK_GLIMTS = [
  {
    photoUrl: "https://picsum.photos/seed/glimt-widget-1/400/400",
    avatarUrl: "https://i.pravatar.cc/128?u=glimt-friend-1",
  },
  {
    photoUrl: "https://picsum.photos/seed/glimt-widget-2/400/400",
    avatarUrl: "https://i.pravatar.cc/128?u=glimt-friend-2",
  },
  {
    photoUrl: "https://picsum.photos/seed/glimt-widget-3/400/400",
    avatarUrl: "https://i.pravatar.cc/128?u=glimt-friend-3",
  },
  {
    photoUrl: "https://picsum.photos/seed/glimt-widget-4/400/400",
    avatarUrl: "https://i.pravatar.cc/128?u=glimt-friend-4",
  },
] as const;

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

async function cacheImageToAppGroup(
  url: string,
  filename: string,
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
    const downloaded = await File.downloadFileAsync(url, destination, {
      idempotent: true,
    });
    return downloaded.uri;
  } catch (error) {
    console.warn(`[FriendGlimt] failed to cache ${filename}:`, error);
    return null;
  }
}

async function buildMockWidgetGlimts(): Promise<WidgetGlimtItem[]> {
  const glimts = await Promise.all(
    MOCK_GLIMTS.map(async ({ photoUrl, avatarUrl }, index) => {
      const [photoUri, avatarUri] = await Promise.all([
        cacheImageToAppGroup(photoUrl, `photo-${index}.jpg`),
        cacheImageToAppGroup(avatarUrl, `avatar-${index}.jpg`),
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

export async function refreshFriendGlimtWidget(): Promise<void> {
  const glimts = await buildMockWidgetGlimts();
  console.log("WIDGET", glimts);

  if (glimts.length === 0) {
    console.warn("[FriendGlimt] no widget images cached; skipping update");
    return;
  }

  FriendGlimtWidget.updateSnapshot({ glimts });
}
