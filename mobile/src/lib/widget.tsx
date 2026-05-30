import {
  HStack,
  Image,
  Rectangle,
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
};

export type WidgetTileStyle = {
  gradientColors: [string, string, string];
  photoBorderColor: string;
  tileCornerRadius: number;
  tileBorderWidth: number;
  avatarSize: number;
  avatarOffset: number;
  tileScale: number;
};

export type FriendGlimtProps = {
  glimts: WidgetGlimtItem[];
  style: WidgetTileStyle;
  whiteUri: string;
};

const FriendGlimt = (
  props: FriendGlimtProps,
  environment: WidgetEnvironment,
) => {
  "use no memo";
  "widget";

  const {
    gradientColors,
    photoBorderColor,
    tileCornerRadius,
    tileBorderWidth,
    avatarSize,
    avatarOffset,
    tileScale,
  } = props.style;

  function tileRotation(index: number): `${number}deg` {
    return `${Math.pow(-1, index + 1) * 2}deg`;
  }

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
          borderWidth: tileBorderWidth,
          avatarSize,
          tileGap: 0,
          avatarOffset,
        };
      case "systemMedium":
        return {
          outerPadding: 6,
          cornerRadius: tileCornerRadius,
          borderWidth: tileBorderWidth,
          avatarSize,
          tileGap: 30,
          avatarOffset,
        };
      case "systemLarge":
        return {
          outerPadding: 6,
          cornerRadius: tileCornerRadius,
          borderWidth: tileBorderWidth,
          avatarSize,
          tileGap: 5,
          avatarOffset,
        };
      default:
        return {
          outerPadding: 0,
          cornerRadius: 0,
          borderWidth: 0,
          avatarSize: 0,
          tileGap: 0,
          avatarOffset: 0,
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
    const { borderWidth } = metrics;
    const avatarOverflow = Math.max(avatarSize / 2, -avatarOffset);

    return (
      <ZStack
        alignment="bottomTrailing"
        modifiers={[
          resizable(),
          cornerRadius(metrics.cornerRadius),
          rotationEffect(parseFloat(tileRotation(idx))),
          scaleEffect(0.95),
        ]}
      >
        <ZStack modifiers={[cornerRadius(metrics.cornerRadius)]}>
          <Image
            uiImage={props.whiteUri}
            modifiers={[
              resizable(),
              aspectRatio({ contentMode: "fill", ratio: 1 }),
              cornerRadius(metrics.cornerRadius - metrics.borderWidth),
              widgetAccentedRenderingMode("fullColor"),
              scaleEffect(10000),
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
              scaleEffect(tileScale),
              shadow({ radius: 2, color: "#777" }),
            ]}
          >
            <Rectangle
              modifiers={[foregroundStyle(photoBorderColor), cornerRadius(999)]}
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
        {items.map((item, idx) =>
          renderGlimtImageTile(
            item.photoUri,
            item.avatarUri,
            metrics,
            [
              containerRelativeFrame({
                axes: "horizontal",
                count: columns,
                span: 1,
                spacing: metrics.tileGap,
              }),
            ],
            idx,
          ),
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
          {renderGlimtImageTile(
            item.photoUri,
            item.avatarUri,
            metrics,
            [containerRelativeFrame({ axes: "both" })],
            0,
          )}
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

export type FriendGlimtCameraProps = {
  captureUrl: string;
  style: WidgetTileStyle;
};

const FriendGlimtCamera = (
  props: FriendGlimtCameraProps,
  _environment: WidgetEnvironment,
) => {
  "use no memo";
  "widget";

  const { gradientColors } = props.style;
  const widgetGradient = {
    colors: gradientColors,
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 1, y: 1 },
  };

  return (
    <ZStack modifiers={[widgetURL(props.captureUrl)]}>
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
      <VStack spacing={6}>
        <Image systemName="camera.circle.fill" size={52} color="#FFFFFF" />
        <Text
          modifiers={[
            font({ weight: "semibold", size: 13 }),
            foregroundStyle("#FFFFFF"),
          ]}
        >
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
