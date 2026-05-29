import { HStack, Image, Rectangle, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  aspectRatio,
  cornerRadius,
  foregroundStyle,
  frame,
  offset,
  padding,
  resizable,
  rotationEffect,
  scaleEffect,
  shadow,
  widgetAccentedRenderingMode,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

import {
  AVATAR_OFFSET,
  AVATAR_SIZE,
  PHOTO_BORDER_COLOR,
  TILE_CORNER_RADIUS,
  tileRotation,
  WIDGET_GRADIENT_COLORS,
} from "./glimt-tile-styles";

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

  const widgetGradient = {
    colors: [...WIDGET_GRADIENT_COLORS],
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
          outerPadding: 6,
          cornerRadius: TILE_CORNER_RADIUS,
          borderWidth: 8,
          avatarSize: AVATAR_SIZE,
          tileGap: 0,
          avatarOffset: AVATAR_OFFSET,
        };
      case "systemMedium":
        return {
          outerPadding: 6,
          cornerRadius: TILE_CORNER_RADIUS,
          borderWidth: 8,
          avatarSize: AVATAR_SIZE,
          tileGap: 30,
          avatarOffset: AVATAR_OFFSET,
        };
      case "systemLarge":
        return {
          outerPadding: 6,
          cornerRadius: TILE_CORNER_RADIUS,
          borderWidth: 8,
          avatarSize: AVATAR_SIZE,
          tileGap: -5,
          avatarOffset: AVATAR_OFFSET,
        };
      default:
        return {
          outerPadding: 0,
          cornerRadius: 0,
          borderWidth: 0,
          avatarSize: 0,
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
    idx: number,
  ) {
    const { borderWidth, avatarSize, avatarOffset } = metrics;

    return (
      <ZStack alignment="bottomTrailing" modifiers={tileModifiers}>
        <ZStack
          modifiers={[
            resizable(),
            cornerRadius(metrics.cornerRadius),
            rotationEffect(parseFloat(tileRotation(idx))),
            scaleEffect(0.95),
          ]}
        >
          <Rectangle
            modifiers={[
              foregroundStyle({
                type: "color",
                color: PHOTO_BORDER_COLOR,
              }),
            ]}
          />
          <Image
            uiImage={photoUri}
            modifiers={[
              resizable(),
              aspectRatio({ contentMode: "fill", ratio: 1 }),
              cornerRadius(metrics.cornerRadius - metrics.borderWidth),
              padding({ all: borderWidth }),
              widgetAccentedRenderingMode("fullColor"),
            ]}
          />
        </ZStack>
        {avatarUri ? (
          <ZStack
            modifiers={[
              frame({ width: avatarSize, height: avatarSize }),
              offset({ x: avatarOffset, y: avatarOffset }),
              rotationEffect(parseFloat(tileRotation(idx))),
              scaleEffect(0.95),
              shadow({ radius: 2, color: "#777" }),
            ]}
          >
            <Rectangle
              modifiers={[
                foregroundStyle(PHOTO_BORDER_COLOR),
                cornerRadius(999),
              ]}
            />
            <Image
              uiImage={avatarUri}
              modifiers={[
                resizable(),
                aspectRatio({ contentMode: "fill", ratio: 1 }),
                cornerRadius(999),
                padding({ all: 1 }),
                widgetAccentedRenderingMode("fullColor"),
              ]}
            />
          </ZStack>
        ) : (
          <Image
            systemName="person.circle.fill"
            size={avatarSize}
            color={PHOTO_BORDER_COLOR}
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
      <HStack
        spacing={metrics.tileGap}
        modifiers={[padding({ all: metrics.outerPadding })]}
      >
        {items.map((item, idx) =>
          renderGlimtImageTile(item.photoUri, item.avatarUri, metrics, [], idx),
        )}
      </HStack>
    );
  }

  const widgetFamily = environment.widgetFamily;
  const metrics = tileMetricsForFamily(widgetFamily);
  const visibleGlimts = props.glimts.slice(
    0,
    glimtCountForFamily(widgetFamily),
  );

  if (visibleGlimts.length === 0) {
    return <ZStack>{renderWidgetBackground()}</ZStack>;
  }

  if (widgetFamily === "systemSmall") {
    const item = visibleGlimts[0];
    return (
      <ZStack>
        {renderWidgetBackground()}
        <VStack modifiers={[padding({ all: metrics.outerPadding })]}>
          {renderGlimtImageTile(item.photoUri, item.avatarUri, metrics, [], 0)}
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
