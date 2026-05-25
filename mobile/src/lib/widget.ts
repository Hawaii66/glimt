import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

type MyWidgetProps = {
  count: number;
};

const MyWidget = (props: MyWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  return (
    <VStack>
      <Text>
        Count: {props.count}
      </Text>
      <Text>Family: {environment.widgetFamily}</Text>
    </VStack>
  );
};

export default function CreateWidget(){
    return createWidget('FriendGlimt', MyWidget);
}