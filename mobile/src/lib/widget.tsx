import { createWidget, type WidgetEnvironment } from "expo-widgets";

import { FriendGlimtContent } from "./widget/FriendGlimtContent";
import type { FriendGlimtProps } from "./widget/types";

const FriendGlimt = (
  props: FriendGlimtProps,
  environment: WidgetEnvironment,
) => {
  "widget";
  return (
    <FriendGlimtContent
      glimts={props.glimts}
      widgetFamily={environment.widgetFamily}
    />
  );
};

export const FriendGlimtWidget = createWidget("FriendGlimt", FriendGlimt);
export { FriendGlimtProps, WidgetGlimtItem } from "./widget/types";
