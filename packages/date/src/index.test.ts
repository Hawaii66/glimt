import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  dayDateFromTimestamp,
  isDayEnded,
  localHour,
  tomorrowIsoDate,
} from "./index.ts";

describe("@glimt/date", () => {
  it("buckets late evening New York on the same calendar day", () => {
    const timestamp = Date.parse("2026-05-31T23:30:00-04:00");
    assert.equal(
      dayDateFromTimestamp(timestamp, "America/New_York"),
      "2026-05-31",
    );
  });

  it("buckets the same instant on the next day in Tokyo", () => {
    const timestamp = Date.parse("2026-05-31T23:30:00-04:00");
    assert.equal(dayDateFromTimestamp(timestamp, "Asia/Tokyo"), "2026-06-01");
  });

  it("marks a day ended after journal midnight", () => {
    const timezone = "America/New_York";
    const justBeforeMidnight = Date.parse("2026-05-31T23:59:00-04:00");
    assert.equal(isDayEnded("2026-05-30", justBeforeMidnight, timezone), true);
    assert.equal(isDayEnded("2026-05-31", justBeforeMidnight, timezone), false);

    const justAfterMidnight = Date.parse("2026-06-01T00:01:00-04:00");
    assert.equal(isDayEnded("2026-05-31", justAfterMidnight, timezone), true);
  });

  it("returns tomorrow relative to the active journal timezone", () => {
    const now = Date.parse("2026-05-31T15:00:00-04:00");
    assert.equal(tomorrowIsoDate(now, "America/New_York"), "2026-06-01");
  });

  it("reads local hour in a timezone", () => {
    const now = Date.parse("2026-05-31T21:00:00Z");
    assert.equal(localHour(now, "Europe/Oslo"), 23);
  });
});
