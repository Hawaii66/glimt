import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

function isWidgetRefreshNotification(
  data: Record<string, unknown> | undefined,
): boolean {
  return data?.type === "widget_refresh";
}

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data as
      | Record<string, unknown>
      | undefined;

    if (isWidgetRefreshNotification(data)) {
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      };
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export type PushNotificationData = {
  type?: "friend_request" | "widget_refresh";
  friendUserId?: string;
  photoId?: string;
  seed?: string;
};

export function getPushPlatform(): "ios" | "android" | null {
  if (Platform.OS === "ios") {
    return "ios";
  }
  if (Platform.OS === "android") {
    return "android";
  }
  return null;
}

async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  const platform = getPushPlatform();
  if (!platform || !Device.isDevice) {
    return null;
  }

  await ensureAndroidNotificationChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    return null;
  }

  const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
  return pushToken.data;
}

export function parsePushNotificationData(
  data: Record<string, unknown> | undefined,
): PushNotificationData {
  if (!data) {
    return {};
  }

  const type = data.type;
  const friendUserId = data.friendUserId;
  const photoId = data.photoId;
  const seed = data.seed;

  return {
    type:
      type === "friend_request" || type === "widget_refresh" ? type : undefined,
    friendUserId: typeof friendUserId === "string" ? friendUserId : undefined,
    photoId: typeof photoId === "string" ? photoId : undefined,
    seed: typeof seed === "string" ? seed : undefined,
  };
}
