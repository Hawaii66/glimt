import { cronJobs } from "convex/server";

/**
 * Future local-time push notifications (9 / 15 / 21) should scan users with
 * `users.timezone` set and use `localHour(now, timezone)` from `@glimt/date`.
 */
const crons = cronJobs();

export default crons;
