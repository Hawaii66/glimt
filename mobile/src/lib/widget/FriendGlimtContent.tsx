import { HStack, Rectangle, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  containerRelativeFrame,
  foregroundStyle,
  frame,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import type { WidgetFamily } from "expo-widgets";

import { GlimtImageTile } from "./GlimtImageTile";
import type { WidgetGlimtItem } from "./types";
import {
  glimtCountForFamily,
  tileMetricsForFamily,
  WIDGET_GRADIENT,
} from "./widget-theme";

type FriendGlimtContentProps = {
  glimts: WidgetGlimtItem[];
  widgetFamily: WidgetFamily;
};

function WidgetBackground() {
  return (
    <Rectangle
      modifiers={[
        frame({ maxWidth: 10_000, maxHeight: 10_000 }),
        foregroundStyle({
          type: "linearGradient",
          colors: [...WIDGET_GRADIENT.colors],
          startPoint: WIDGET_GRADIENT.startPoint,
          endPoint: WIDGET_GRADIENT.endPoint,
        }),
      ]}
    />
  );
}

function TileRow({
  items,
  metrics,
  columns,
}: {
  items: WidgetGlimtItem[];
  metrics: ReturnType<typeof tileMetricsForFamily>;
  columns: number;
}) {
  return (
    <HStack spacing={metrics.tileGap}>
      {items.map((item, index) => (
        <GlimtImageTile
          key={`${item.photoUri}-${index}`}
          photoUri={item.photoUri}
          avatarUri={item.avatarUri}
          metrics={metrics}
          modifiers={[
            containerRelativeFrame({
              axes: "horizontal",
              count: columns,
              span: 1,
              spacing: metrics.tileGap,
            }),
          ]}
        />
      ))}
    </HStack>
  );
}

export function FriendGlimtContent({
  glimts,
  widgetFamily,
}: FriendGlimtContentProps) {
  const metrics = tileMetricsForFamily(widgetFamily);
  const count = glimtCountForFamily(widgetFamily);
  const visibleGlimts = glimts.slice(0, count);

  if (visibleGlimts.length === 0) {
    return (
      <ZStack>
        <WidgetBackground />
      </ZStack>
    );
  }

  if (widgetFamily === "systemSmall") {
    const item = visibleGlimts[0];
    return (
      <ZStack>
        <WidgetBackground />
        <VStack modifiers={[padding({ all: metrics.outerPadding })]}>
          <GlimtImageTile
            photoUri={item.photoUri}
            avatarUri={item.avatarUri}
            metrics={metrics}
          />
        </VStack>
      </ZStack>
    );
  }

  if (widgetFamily === "systemMedium") {
    return (
      <ZStack>
        <WidgetBackground />
        <VStack modifiers={[padding({ all: metrics.outerPadding })]}>
          <TileRow items={visibleGlimts} metrics={metrics} columns={2} />
        </VStack>
      </ZStack>
    );
  }

  const topRow = visibleGlimts.slice(0, 2);
  const bottomRow = visibleGlimts.slice(2, 4);

  return (
    <ZStack>
      <WidgetBackground />
      <VStack
        spacing={metrics.tileGap}
        modifiers={[padding({ all: metrics.outerPadding })]}
      >
        <TileRow items={topRow} metrics={metrics} columns={2} />
        {bottomRow.length > 0 ? (
          <TileRow items={bottomRow} metrics={metrics} columns={2} />
        ) : null}
      </VStack>
    </ZStack>
  );
}
