import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
  "refresh home screen widgets",
  { minuteUTC: 0 },
  internal.pushWidgets.sendHourlyWidgetRefreshes,
);

export default crons;
