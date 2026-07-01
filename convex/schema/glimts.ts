import { defineTable } from "convex/server";
import { v } from "convex/values";

import { localDate } from "./validators";

/**
 * A blind glimt: one photo + short caption. The daily "key" is the first glimt
 * on a local calendar day. UTC capture time is stored alongside localDate.
 * Glimts with no glimtShares rows are private (solo journal before joining groups).
 */
export const glimtTables = {
  glimts: defineTable({
    authorId: v.id("users"),
    imageStorageId: v.id("_storage"),
    caption: v.string(),
    capturedAt: v.number(),
    localDate,
    /** IANA timezone on the capture device at shutter time. */
    captureTimezone: v.string(),
    /** Set when the glimt was taken during a sealed capsule period. */
    capsuleVaultId: v.optional(v.id("capsuleVaults")),
  })
    .index("by_authorId_and_localDate", ["authorId", "localDate"])
    .index("by_authorId_and_capturedAt", ["authorId", "capturedAt"]),

  /** Which groups received this glimt (deselected groups are omitted). */
  glimtShares: defineTable({
    glimtId: v.id("glimts"),
    groupId: v.id("groups"),
  })
    .index("by_glimtId", ["glimtId"])
    .index("by_groupId", ["groupId"])
    .index("by_groupId_and_glimtId", ["groupId", "glimtId"]),
};
