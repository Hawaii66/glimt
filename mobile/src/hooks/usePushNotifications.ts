import { useMutation } from "convex/react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

import {
  getPushPlatform,
  parsePushNotificationData,
  registerForPushNotificationsAsync,
} from "@/lib/push-notifications";
import { APP_SETTINGS } from "@/lib/routes";
import { usePushTokenStore } from "@/stores/pushTokenStore";
import { useSettingsFocusStore } from "@/stores/settingsFocusStore";
import { registerWidgetPushNotificationTask } from "@/tasks/widget-push-notification-task";
import { api } from "convex/_generated/api";

function handleNotificationNavigation(
  data: ReturnType<typeof parsePushNotificationData>,
  router: ReturnType<typeof useRouter>,
  requestFriendRequestsFocus: () => void,
) {
  if (data.type === "friend_request") {
    requestFriendRequestsFocus();
    router.push(APP_SETTINGS);
  }
}

export function usePushNotifications(enabled: boolean) {
  const router = useRouter();
  const registerPushToken = useMutation(api.pushTokens.registerPushToken);
  const setStoredToken = usePushTokenStore((state) => state.setToken);
  const requestFriendRequestsFocus = useSettingsFocusStore(
    (state) => state.requestFriendRequestsFocus,
  );
  const lastRegisteredToken = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isMounted = true;
    let responseSubscription: Notifications.EventSubscription | undefined;

    void registerWidgetPushNotificationTask().catch((error) => {
      console.error("[push] failed to register background notification task:", error);
    });

    const registerToken = async () => {
      const platform = getPushPlatform();
      if (!platform) {
        return;
      }

      const token = await registerForPushNotificationsAsync();
      if (!isMounted || !token || lastRegisteredToken.current === token) {
        return;
      }

      lastRegisteredToken.current = token;
      setStoredToken(token);

      try {
        await registerPushToken({ token, platform });
      } catch {
        lastRegisteredToken.current = null;
        setStoredToken(null);
      }
    };

    void registerToken();

    responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = parsePushNotificationData(
          response.notification.request.content.data as
            | Record<string, unknown>
            | undefined,
        );
        handleNotificationNavigation(
          data,
          router,
          requestFriendRequestsFocus,
        );
      });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) {
        return;
      }

      const data = parsePushNotificationData(
        response.notification.request.content.data as
          | Record<string, unknown>
          | undefined,
      );
      handleNotificationNavigation(
        data,
        router,
        requestFriendRequestsFocus,
      );
    });

    return () => {
      isMounted = false;
      responseSubscription?.remove();
    };
  }, [
    enabled,
    registerPushToken,
    requestFriendRequestsFocus,
    router,
    setStoredToken,
  ]);
}
