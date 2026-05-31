import { StyleSheet } from "react-native";

import { COUNT_INSET, LOCKED_CONNECTOR_SIZE } from "./constants";

export const styles = StyleSheet.create({
  row: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  rowLocked: {
    borderWidth: 1.5,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  dateHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dateHeaderText: {
    flex: 1,
    gap: 2,
  },
  avatarChip: {},
  dateLabel: {
    fontSize: 17,
    fontWeight: "700",
  },
  friendName: {
    fontSize: 13,
  },
  lockBadges: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 6,
    flexShrink: 1,
    maxWidth: "52%",
  },
  meetLockedHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    flexShrink: 1,
  },
  lockedBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  tilesArea: {
    position: "relative",
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  previewColumn: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  countLabel: {
    position: "absolute",
    right: COUNT_INSET,
    bottom: COUNT_INSET,
    zIndex: 2,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 3,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  countLabelText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  stack: {
    position: "relative",
    alignSelf: "center",
  },
  stackLayer: {
    position: "absolute",
  },
  previewTileWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  previewTile: {
    overflow: "hidden",
  },
  tileContent: {
    position: "relative",
    overflow: "hidden",
  },
  emptyTile: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  lockedTile: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  lockedConnector: {
    position: "absolute",
    left: "50%",
    zIndex: 10,
    width: LOCKED_CONNECTOR_SIZE,
    height: LOCKED_CONNECTOR_SIZE,
    borderRadius: LOCKED_CONNECTOR_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  caption: {
    fontSize: 14,
    textAlign: "center",
    width: "100%",
  },
  lockedMessage: {
    alignItems: "center",
    paddingTop: 4,
  },
  lockedBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
