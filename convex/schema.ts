import { defineSchema } from "convex/server";

import {
  authTables,
  capsuleTables,
  dailyTables,
  friendshipTables,
  glimtTables,
  groupTables,
  notificationTables,
} from "./schema/index";

export default defineSchema({
  ...authTables,
  ...groupTables,
  ...glimtTables,
  ...dailyTables,
  ...friendshipTables,
  ...capsuleTables,
  ...notificationTables,
});
