import { Text, VStack } from "@expo/ui/swift-ui";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

type FriendGlimtProps = {
  count: number;
};

const FriendGlimt = (props: FriendGlimtProps, environment: WidgetEnvironment) => {
  "widget";
  return (
    <VStack>
      <Text>Count: {props.count}</Text>
      <Text>Family: {environment.widgetFamily}</Text>
    </VStack>
  );
};

export default createWidget("FriendGlimt", FriendGlimt);
