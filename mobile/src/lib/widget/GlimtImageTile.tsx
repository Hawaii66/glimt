import { Image, ZStack } from "@expo/ui/swift-ui";
import type { CommonViewModifierProps } from "@expo/ui/swift-ui";
import {
  aspectRatio,
  border,
  clipShape,
  frame,
  offset,
  padding,
  resizable,
} from "@expo/ui/swift-ui/modifiers";

import { PHOTO_BORDER_COLOR, type TileMetrics } from "./widget-theme";

type GlimtImageTileProps = {
  photoUri: string;
  avatarUri: string;
  metrics: TileMetrics;
} & CommonViewModifierProps;

export function GlimtImageTile({
  photoUri,
  avatarUri,
  metrics,
  modifiers = [],
}: GlimtImageTileProps) {
  const { cornerRadius, borderWidth, avatarSize } = metrics;
  const avatarOffset = avatarSize / 2;

  return (
    <ZStack
      alignment="bottomTrailing"
      modifiers={[
        padding({ trailing: avatarOffset, bottom: avatarOffset }),
        ...modifiers,
      ]}
    >
      <Image
        uiImage={photoUri}
        modifiers={[
          resizable(),
          aspectRatio({ contentMode: "fill", ratio: 1 }),
          clipShape("roundedRectangle", cornerRadius),
          border({ color: PHOTO_BORDER_COLOR, width: borderWidth }),
        ]}
      />
      {avatarUri ? (
        <Image
          uiImage={avatarUri}
          modifiers={[
            frame({ width: avatarSize, height: avatarSize }),
            clipShape("circle"),
            border({ color: PHOTO_BORDER_COLOR, width: 1.5 }),
            offset({ x: avatarOffset, y: avatarOffset }),
          ]}
        />
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
