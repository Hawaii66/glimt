import {
  HStack,
  Image,
  Rectangle,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  aspectRatio,
  border,
  clipShape,
  containerRelativeFrame,
  foregroundStyle,
  frame,
  offset,
  padding,
  resizable,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

export type WidgetGlimtItem = {
  photoUri: string;
  avatarUri: string;
};

export type FriendGlimtProps = {
  glimts: WidgetGlimtItem[];
};

const FriendGlimt = (
  props: FriendGlimtProps,
  environment: WidgetEnvironment,
) => {
  "use no memo";
  "widget";

  const photoBorderColor = "#FFFFFF";
  const widgetGradient = {
    colors: ["#FF6B35", "#FFB347", "#FF8C42"],
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 1, y: 1 },
  };

  function glimtCountForFamily(family: string): number {
    switch (family) {
      case "systemSmall":
        return 1;
      case "systemMedium":
        return 2;
      case "systemLarge":
        return 4;
      default:
        return 1;
    }
  }

  function tileMetricsForFamily(family: string) {
    switch (family) {
      case "systemSmall":
        return {
          outerPadding: 10,
          cornerRadius: 14,
          borderWidth: 2.5,
          avatarSize: 28,
          tileGap: 0,
        };
      case "systemMedium":
        return {
          outerPadding: 8,
          cornerRadius: 12,
          borderWidth: 2,
          avatarSize: 22,
          tileGap: 6,
        };
      case "systemLarge":
        return {
          outerPadding: 6,
          cornerRadius: 10,
          borderWidth: 2,
          avatarSize: 18,
          tileGap: 5,
        };
      default:
        return {
          outerPadding: 10,
          cornerRadius: 14,
          borderWidth: 2.5,
          avatarSize: 28,
          tileGap: 0,
        };
    }
  }

  function renderWidgetBackground() {
    return (
      <Rectangle
        modifiers={[
          frame({ maxWidth: 10_000, maxHeight: 10_000 }),
          foregroundStyle({
            type: "linearGradient",
            colors: [...widgetGradient.colors],
            startPoint: widgetGradient.startPoint,
            endPoint: widgetGradient.endPoint,
          }),
        ]}
      />
    );
  }

  function renderGlimtImageTile(
    photoUri: string,
    avatarUri: string,
    metrics: ReturnType<typeof tileMetricsForFamily>,
    tileModifiers: import("@expo/ui/swift-ui/modifiers").ViewModifier[] = [],
  ) {
    const { cornerRadius, borderWidth, avatarSize } = metrics;
    const avatarOffset = avatarSize / 2;

    return (
      <ZStack
        alignment="bottomTrailing"
        modifiers={[
          padding({ trailing: avatarOffset, bottom: avatarOffset }),
          ...tileModifiers,
        ]}
      >
        <Image
          uiImage={photoUri}
          modifiers={[
            resizable(),
            aspectRatio({ contentMode: "fill", ratio: 1 }),
            clipShape("roundedRectangle", cornerRadius),
            border({ color: photoBorderColor, width: borderWidth }),
          ]}
        />
        {avatarUri ? (
          <Image
            uiImage={avatarUri}
            modifiers={[
              frame({ width: avatarSize, height: avatarSize }),
              clipShape("circle"),
              border({ color: photoBorderColor, width: 1.5 }),
              offset({ x: avatarOffset, y: avatarOffset }),
            ]}
          />
        ) : (
          <Image
            systemName="person.circle.fill"
            size={avatarSize}
            color={photoBorderColor}
            modifiers={[offset({ x: avatarOffset, y: avatarOffset })]}
          />
        )}
      </ZStack>
    );
  }

  function renderTileRow(
    items: WidgetGlimtItem[],
    metrics: ReturnType<typeof tileMetricsForFamily>,
    columns: number,
  ) {
    return (
      <HStack spacing={metrics.tileGap}>
        {items.map((item) =>
          renderGlimtImageTile(item.photoUri, item.avatarUri, metrics, [
            containerRelativeFrame({
              axes: "horizontal",
              count: columns,
              span: 1,
              spacing: metrics.tileGap,
            }),
          ]),
        )}
      </HStack>
    );
  }

  const widgetFamily = environment.widgetFamily;
  const metrics = tileMetricsForFamily(widgetFamily);
  const visibleGlimts = props.glimts.slice(0, glimtCountForFamily(widgetFamily));

  if (visibleGlimts.length === 0) {
    return (
      <ZStack>
        {renderWidgetBackground()}
      </ZStack>
    );
  }

  if (widgetFamily === "systemSmall") {
    const item = visibleGlimts[0];
    return (
      <ZStack>
        {renderWidgetBackground()}
        <VStack modifiers={[padding({ all: metrics.outerPadding })]}>
          {renderGlimtImageTile(item.photoUri, item.avatarUri, metrics)}
        </VStack>
      </ZStack>
    );
  }

  if (widgetFamily === "systemMedium") {
    return (
      <ZStack>
        {renderWidgetBackground()}
        <VStack modifiers={[padding({ all: metrics.outerPadding })]}>
          {renderTileRow(visibleGlimts, metrics, 2)}
        </VStack>
      </ZStack>
    );
  }

  const topRow = visibleGlimts.slice(0, 2);
  const bottomRow = visibleGlimts.slice(2, 4);

  return (
    <ZStack>
      {renderWidgetBackground()}
      <VStack
        spacing={metrics.tileGap}
        modifiers={[padding({ all: metrics.outerPadding })]}
      >
        {renderTileRow(topRow, metrics, 2)}
        {bottomRow.length > 0 ? renderTileRow(bottomRow, metrics, 2) : null}
      </VStack>
    </ZStack>
  );
};

export const FriendGlimtWidget = createWidget("FriendGlimt", FriendGlimt);
