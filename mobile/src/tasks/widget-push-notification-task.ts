import * as Notifications from "expo-notifications";
import {
  BackgroundNotificationTaskResult,
  type NotificationTaskPayload,
} from "expo-notifications";
import * as TaskManager from "expo-task-manager";

import { ensureConvexAuthForBackground } from "@/lib/convex-auth-background";
import { parsePushNotificationData } from "@/lib/push-notifications";
import { refreshFriendGlimtWidgetFromPush } from "@/lib/widget-refresh";

export const WIDGET_PUSH_NOTIFICATION_TASK = "glimt-widget-push-notification";

function parseTaskPayload(
  taskPayload: NotificationTaskPayload,
): ReturnType<typeof parsePushNotificationData> {
  if ("actionIdentifier" in taskPayload) {
    return parsePushNotificationData(
      taskPayload.notification.request.content.data as
        | Record<string, unknown>
        | undefined,
    );
  }

  const dataString = taskPayload.data?.dataString;
  if (typeof dataString === "string") {
    try {
      return parsePushNotificationData(
        JSON.parse(dataString) as Record<string, unknown>,
      );
    } catch {
      return {};
    }
  }

  return parsePushNotificationData(
    taskPayload.data as Record<string, unknown> | undefined,
  );
}

TaskManager.defineTask<NotificationTaskPayload>(
  WIDGET_PUSH_NOTIFICATION_TASK,
  async ({ data: taskPayload, error }) => {
    if (error || !taskPayload) {
      return BackgroundNotificationTaskResult.Failed;
    }

    if ("actionIdentifier" in taskPayload) {
      return BackgroundNotificationTaskResult.NoData;
    }

    const data = parseTaskPayload(taskPayload);
    if (data.type !== "widget_refresh") {
      return BackgroundNotificationTaskResult.NoData;
    }

    try {
      const authenticated = await ensureConvexAuthForBackground();
      if (!authenticated) {
        return BackgroundNotificationTaskResult.Failed;
      }

      await refreshFriendGlimtWidgetFromPush({
        seed: data.seed,
        photoId: data.photoId,
      });
      return BackgroundNotificationTaskResult.NewData;
    } catch (refreshError) {
      console.error(
        "[FriendGlimt] widget push notification task failed:",
        refreshError,
      );
      return BackgroundNotificationTaskResult.Failed;
    }
  },
);

export async function registerWidgetPushNotificationTask(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    WIDGET_PUSH_NOTIFICATION_TASK,
  );
  if (isRegistered) {
    return;
  }

  await Notifications.registerTaskAsync(WIDGET_PUSH_NOTIFICATION_TASK);
}
