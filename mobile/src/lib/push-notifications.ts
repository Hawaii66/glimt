import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  shouldShowAlert: true,
  shouldPlaySound: true,
  shouldSetBadge: false,
  shouldShowBanner: true,
  shouldShowList: true,
});

export type PushNotificationData = {
  type?: "friend_request" | "glimt";
  friendUserId?: string;
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

  return {
    type:
      type === "friend_request" || type === "glimt" ? type : undefined,
    friendUserId: typeof friendUserId === "string" ? friendUserId : undefined,
  };
}
