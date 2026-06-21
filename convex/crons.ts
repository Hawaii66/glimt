import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "refresh home screen widgets",
  { hours: 1 },
  internal.pushWidgets.sendHourlyWidgetRefreshes,
  {},
);

crons.interval(
  "daily glimt reminders",
  { minutes: 15 },
  internal.pushReminders.runDailyReminderChecks,
  {},
);

export default crons;
