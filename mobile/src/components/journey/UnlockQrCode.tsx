import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

const DEFAULT_SIZE = 220;
const QUIET_ZONE = 20;

type UnlockQrCodeProps = {
  value: string;
  size?: number;
};

export function UnlockQrCode({ value, size = DEFAULT_SIZE }: UnlockQrCodeProps) {
  const frameSize = useMemo(() => size + QUIET_ZONE * 2, [size]);

  return (
    <View
      style={[styles.frame, { width: frameSize, height: frameSize }]}
      accessibilityLabel="Unlock QR code"
    >
      <View style={styles.quietZone}>
        <QRCode
          value={value}
          size={size}
          color="#1A1A1A"
          backgroundColor="#FFFFFF"
          ecl="M"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  quietZone: {
    padding: QUIET_ZONE,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
  },
});
