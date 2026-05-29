import { BottomSheet } from "@expo/ui";

import { SettingsContent } from "@/components/settings/SettingsContent";

type SettingsSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
};

export function SettingsSheet({ isPresented, onDismiss }: SettingsSheetProps) {
  return (
    <BottomSheet isPresented={isPresented} onDismiss={onDismiss}>
      <SettingsContent scrollMaxHeight={560} />
    </BottomSheet>
  );
}
