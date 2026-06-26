import type { Href } from "expo-router";
import * as Linking from "expo-linking";

export const APP_HOME = "/(app)/" as Href;
export const APP_CAPTURE = "/(app)/capture" as Href;
export const APP_CAPTURE_COMPOSE = "/(app)/compose" as Href;
export const APP_SETTINGS = "/(app)/settings" as Href;

export function appFriendJourney(friendId: string): Href {
  return `/(app)/friend/${friendId}` as Href;
}

export function appFriendSettings(friendId: string): Href {
  return `/(app)/friend/${friendId}/settings` as Href;
}

export function appFriendJourneyDay(friendId: string, date: string): Href {
  return `/(app)/friend/${friendId}/day/${date}` as Href;
}

export function appFriendTogetherDayUnlock(
  friendId: string,
  date: string,
): Href {
  return `/(app)/friend/${friendId}/unlock/${date}` as Href;
}

export function getCaptureDeepLinkUrl(): string {
  return Linking.createURL("/capture");
}
