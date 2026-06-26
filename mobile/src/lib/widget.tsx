import {
  HStack,
  Image,
  Rectangle,
  Spacer,
  Text,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  aspectRatio,
  containerRelativeFrame,
  cornerRadius,
  font,
  foregroundStyle,
  frame,
  offset,
  padding,
  resizable,
  rotationEffect,
  scaleEffect,
  shadow,
  widgetAccentedRenderingMode,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

export type WidgetGlimtItem = {
  photoUri: string;
  avatarUri: string;
  avatarInitials: string;
  rotationDegrees: number;
};

export type WidgetTileStyle = {
  gradientColors: [string, string, string];
  photoBorderColor: string;
  tileCornerRadius: number;
  tileBorderWidth: number;
  avatarSize: number;
  avatarOffset: number;
  tileScale: number;
  systemSmallTileScale: number;
};

export type FriendGlimtProps = {
  glimts: WidgetGlimtItem[];
  style: WidgetTileStyle;
  whiteUri: string;
  display: {
    showWhiteBorder: boolean;
    showRotation: boolean;
    showAvatar: boolean;
  };
};

const FriendGlimt = (
  props: FriendGlimtProps,
  environment: WidgetEnvironment,
) => {
  "use no memo";
  "widget";

  const {
    gradientColors,
    tileCornerRadius,
    tileBorderWidth,
    avatarSize,
    avatarOffset,
    tileScale,
    systemSmallTileScale,
  } = props.style;
  const { showWhiteBorder, showRotation, showAvatar } = props.display;
  const borderWidth = showWhiteBorder ? tileBorderWidth : 0;

  const widgetGradient = {
    colors: gradientColors,
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
          cornerRadius: tileCornerRadius,
          borderWidth,
          avatarSize,
          tileGap: 0,
          avatarOffset,
          tileScale: systemSmallTileScale,
        };
      case "systemMedium":
        return {
          outerPadding: 6,
          cornerRadius: tileCornerRadius,
          borderWidth,
          avatarSize,
          tileGap: 12,
          avatarOffset,
          tileScale,
        };
      case "systemLarge":
        return {
          outerPadding: 14,
          cornerRadius: tileCornerRadius,
          borderWidth,
          avatarSize,
          tileGap: 10,
          avatarOffset,
          tileScale,
        };
      default:
        return {
          outerPadding: 0,
          cornerRadius: 0,
          borderWidth: 0,
          avatarSize: 0,
          tileGap: 0,
          avatarOffset: 0,
          tileScale: 1,
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

  function whiteBorderImageModifiers(radius: number) {
    return [
      resizable(),
      aspectRatio({ contentMode: "fill", ratio: 1 }),
      cornerRadius(radius),
      widgetAccentedRenderingMode("fullColor"),
      frame({ maxWidth: 10_000, maxHeight: 10_000 }),
    ];
  }

  function renderAvatar(avatarUri: string, avatarInitials: string) {
    if (!showAvatar) {
      return null;
    }

    const avatarModifiers = [
      frame({ width: avatarSize, height: avatarSize }),
      offset({ x: avatarOffset, y: avatarOffset }),
      shadow({ radius: 2, color: "#777" }),
    ];

    if (avatarUri) {
      return (
        <ZStack modifiers={avatarModifiers}>
          {showWhiteBorder ? (
            <Image
              uiImage={props.whiteUri}
              modifiers={whiteBorderImageModifiers(999)}
            />
          ) : null}
          <Image
            uiImage={avatarUri}
            modifiers={[
              resizable(),
              aspectRatio({ contentMode: "fill", ratio: 1 }),
              cornerRadius(999),
              ...(showWhiteBorder ? [padding({ all: 1 })] : []),
              widgetAccentedRenderingMode("fullColor"),
            ]}
          />
        </ZStack>
      );
    }

    return (
      <ZStack modifiers={avatarModifiers}>
        {showWhiteBorder ? (
          <Image
            uiImage={props.whiteUri}
            modifiers={whiteBorderImageModifiers(999)}
          />
        ) : null}
        <Rectangle
          modifiers={[
            foregroundStyle("#F5F0EB"),
            cornerRadius(999),
            ...(showWhiteBorder ? [padding({ all: 1 })] : []),
          ]}
        />
        <Text
          modifiers={[
            font({
              weight: "semibold",
              size: Math.max(10, Math.round(avatarSize * 0.36)),
            }),
            foregroundStyle("#6B6560"),
          ]}
        >
          {avatarInitials}
        </Text>
      </ZStack>
    );
  }

  function renderPhotoTile(
    item: WidgetGlimtItem,
    metrics: ReturnType<typeof tileMetricsForFamily>,
    frameModifiers: import("@expo/ui/swift-ui/modifiers").ViewModifier[] = [],
  ) {
    const innerRadius = metrics.cornerRadius - metrics.borderWidth;
    const rotationDegrees = showRotation ? item.rotationDegrees : 0;

    return (
      <ZStack
        alignment="bottomTrailing"
        modifiers={[
          resizable(),
          aspectRatio({ contentMode: "fit", ratio: 1 }),
          cornerRadius(metrics.cornerRadius),
          rotationEffect(rotationDegrees),
          scaleEffect(metrics.tileScale),
          ...frameModifiers,
        ]}
      >
        {showWhiteBorder ? (
          <ZStack modifiers={[cornerRadius(metrics.cornerRadius)]}>
            <Image
              uiImage={props.whiteUri}
              modifiers={whiteBorderImageModifiers(innerRadius)}
            />
            <Image
              uiImage={item.photoUri}
              modifiers={[
                resizable(),
                aspectRatio({ contentMode: "fill", ratio: 1 }),
                cornerRadius(innerRadius),
                padding({ all: metrics.borderWidth }),
                widgetAccentedRenderingMode("fullColor"),
              ]}
            />
          </ZStack>
        ) : (
          <Image
            uiImage={item.photoUri}
            modifiers={[
              resizable(),
              aspectRatio({ contentMode: "fill", ratio: 1 }),
              cornerRadius(metrics.cornerRadius),
              widgetAccentedRenderingMode("fullColor"),
            ]}
          />
        )}

        {renderAvatar(item.avatarUri, item.avatarInitials)}
      </ZStack>
    );
  }

  function renderHorizontalRow(
    items: WidgetGlimtItem[],
    columns: number,
    metrics: ReturnType<typeof tileMetricsForFamily>,
    centerWhenPartial = false,
  ) {
    if (items.length === 0) {
      return null;
    }

    if (centerWhenPartial && items.length < columns && items.length === 1) {
      const item = items[0];

      return (
        <HStack spacing={metrics.tileGap}>
          <Spacer />
          {renderPhotoTile(item, metrics, [
            containerRelativeFrame({
              axes: "horizontal",
              count: columns,
              span: 1,
              spacing: metrics.tileGap,
            }),
          ])}
          <Spacer />
        </HStack>
      );
    }

    return (
      <HStack spacing={metrics.tileGap}>
        {items.map((item, idx) =>
          renderPhotoTile(item, metrics, [
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

  function renderPhotoLayout(
    items: WidgetGlimtItem[],
    family: string,
    metrics: ReturnType<typeof tileMetricsForFamily>,
  ) {
    if (family === "systemSmall") {
      return renderPhotoTile(items[0], metrics, [
        containerRelativeFrame({ axes: "both" }),
      ]);
    }

    if (family === "systemMedium") {
      return renderHorizontalRow(items, 2, metrics, true);
    }

    const topRow = items.slice(0, 2);
    const bottomRow = items.slice(2, 4);

    if (bottomRow.length === 0) {
      return (
        <VStack spacing={metrics.tileGap}>
          <Spacer />
          {renderHorizontalRow(topRow, 2, metrics)}
          <Spacer />
        </VStack>
      );
    }

    return (
      <VStack spacing={metrics.tileGap}>
        {renderHorizontalRow(topRow, 2, metrics)}
        {bottomRow.length > 0
          ? renderHorizontalRow(bottomRow, 2, metrics, true)
          : null}
      </VStack>
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

  return (
    <ZStack>
      {renderWidgetBackground()}
      <VStack modifiers={[padding({ all: metrics.outerPadding })]}>
        {renderPhotoLayout(visibleGlimts, widgetFamily, metrics)}
      </VStack>
    </ZStack>
  );
};

export type FriendGlimtCameraProps = {
  captureUrl: string;
  style: WidgetTileStyle;
};

const FriendGlimtCamera = (
  props: FriendGlimtCameraProps,
  environment: WidgetEnvironment,
) => {
  "use no memo";
  "widget";

  const { gradientColors } = props.style;
  const renderingMode = environment.widgetRenderingMode ?? "fullColor";
  const isAccented =
    renderingMode === "accented" || renderingMode === "vibrant";
  const widgetGradient = {
    colors: gradientColors,
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 1, y: 1 },
  };

  return (
    <ZStack modifiers={[widgetURL(props.captureUrl)]}>
      {!isAccented ? (
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
      ) : null}
      <VStack spacing={6}>
        {isAccented ? (
          <Image
            systemName="camera.circle.fill"
            size={52}
            modifiers={[widgetAccentedRenderingMode("accented")]}
          />
        ) : (
          <Image systemName="camera.circle.fill" size={52} color="#FFFFFF" />
        )}
        <Text modifiers={[font({ weight: "semibold", size: 13 })]}>
          Take a Glimt
        </Text>
      </VStack>
    </ZStack>
  );
};

export const FriendGlimtWidget = createWidget("FriendGlimt", FriendGlimt);
export const FriendGlimtCameraWidget = createWidget(
  "FriendGlimtCamera",
  FriendGlimtCamera,
);
