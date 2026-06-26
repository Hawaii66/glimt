import { SymbolView } from "expo-symbols";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  MEET_DAY_INFO_BODY,
  MEET_DAY_INFO_TITLE,
} from "@/lib/meet-day";
import { useAppColors } from "@/lib/theme";

type MeetDayInfoModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function MeetDayInfoModal({ visible, onClose }: MeetDayInfoModalProps) {
  const colors = useAppColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.titleRow}>
            <SymbolView
              name="person.2.fill"
              size={22}
              tintColor={colors.text}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              {MEET_DAY_INFO_TITLE}
            </Text>
          </View>

          {MEET_DAY_INFO_BODY.map((paragraph) => (
            <Text
              key={paragraph}
              style={[styles.paragraph, { color: colors.textMuted }]}
            >
              {paragraph}
            </Text>
          ))}

          <Pressable
            style={[styles.doneButton, { backgroundColor: colors.text }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Got it"
          >
            <Text style={[styles.doneButtonText, { color: colors.background }]}>
              Got it
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type MeetDayInfoButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
};

export function MeetDayInfoButton({
  onPress,
  accessibilityLabel = "Learn about meet to view",
}: MeetDayInfoButtonProps) {
  const colors = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={[styles.infoButton, { backgroundColor: colors.fill }]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <SymbolView
        name="info.circle.fill"
        size={18}
        tintColor={colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.58)",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  sheet: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.28,
        shadowRadius: 28,
      },
      android: {
        elevation: 16,
      },
      default: {},
    }),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
  },
  doneButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  infoButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
