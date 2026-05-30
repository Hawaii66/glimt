import { useLocalSearchParams } from "expo-router";

import { TogetherDayUnlockScreen } from "@/components/journey/TogetherDayUnlockScreen";

export default function TogetherDayUnlockRoute() {
  const { friendId, date } = useLocalSearchParams<{
    friendId: string;
    date: string;
  }>();

  if (!friendId || !date) {
    return null;
  }

  return <TogetherDayUnlockScreen friendId={friendId} date={date} />;
}
