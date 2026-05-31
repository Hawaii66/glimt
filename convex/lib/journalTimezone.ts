import {
  resolveUserTimezone,
  todayIsoDate,
  tomorrowIsoDate,
  validateIanaTimezone,
} from "@glimt/date";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { requireGroupMember, listGroupMemberIds } from "./friendGroups";

type FriendGroupCtx = QueryCtx | MutationCtx;

type FriendGroupRecord = {
  _id: Id<"friendGroups">;
  journalTimezone?: string;
  scheduledJournalTimezone?: string;
  scheduledJournalTimezoneFrom?: string;
};

export type JournalTimezoneContext = {
  effectiveTimezone: string;
  memberTimezones: [string, string];
  memberUserIds: [Id<"users">, Id<"users">];
  timezonesDiffer: boolean;
  canChangeJournalTimezone: boolean;
  scheduledChange?: {
    timezone: string;
    effectiveFrom: string;
  };
};

async function getAcceptedFriendRequestSenderId(
  ctx: FriendGroupCtx,
  userIdA: Id<"users">,
  userIdB: Id<"users">,
): Promise<Id<"users"> | null> {
  const requestAB = await ctx.db
    .query("friendRequests")
    .withIndex("by_from_and_to", (q) =>
      q.eq("fromUserId", userIdA).eq("toUserId", userIdB),
    )
    .collect();
  const acceptedAB = requestAB.find((request) => request.status === "accepted");
  if (acceptedAB) {
    return acceptedAB.fromUserId;
  }

  const requestBA = await ctx.db
    .query("friendRequests")
    .withIndex("by_from_and_to", (q) =>
      q.eq("fromUserId", userIdB).eq("toUserId", userIdA),
    )
    .collect();
  const acceptedBA = requestBA.find((request) => request.status === "accepted");
  if (acceptedBA) {
    return acceptedBA.fromUserId;
  }

  return null;
}

async function getMemberTimezones(
  ctx: FriendGroupCtx,
  memberUserIds: Id<"users">[],
): Promise<[string, string]> {
  if (memberUserIds.length !== 2) {
    throw new Error("Journal timezone requires exactly two group members.");
  }

  const users = await Promise.all(
    memberUserIds.map((memberUserId) => ctx.db.get(memberUserId)),
  );

  return [
    resolveUserTimezone(users[0]?.timezone),
    resolveUserTimezone(users[1]?.timezone),
  ] as [string, string];
}

function resolveJournalTimezoneState(args: {
  group: FriendGroupRecord;
  memberTimezones: [string, string];
  memberUserIds: [Id<"users">, Id<"users">];
  requestSenderTimezone: string;
  now: number;
}): JournalTimezoneContext {
  const { group, memberTimezones, memberUserIds, requestSenderTimezone, now } =
    args;
  const [timezoneA, timezoneB] = memberTimezones;
  const timezonesDiffer = timezoneA !== timezoneB;

  if (!timezonesDiffer) {
    return {
      effectiveTimezone: timezoneA,
      memberTimezones,
      memberUserIds,
      timezonesDiffer: false,
      canChangeJournalTimezone: false,
    };
  }

  const activeTimezone = group.journalTimezone ?? requestSenderTimezone;
  let effectiveTimezone = activeTimezone;
  let scheduledChange: JournalTimezoneContext["scheduledChange"];

  if (group.scheduledJournalTimezone && group.scheduledJournalTimezoneFrom) {
    const today = todayIsoDate(now, activeTimezone);
    if (today >= group.scheduledJournalTimezoneFrom) {
      effectiveTimezone = group.scheduledJournalTimezone;
    } else {
      scheduledChange = {
        timezone: group.scheduledJournalTimezone,
        effectiveFrom: group.scheduledJournalTimezoneFrom,
      };
    }
  }

  return {
    effectiveTimezone,
    memberTimezones,
    memberUserIds,
    timezonesDiffer: true,
    canChangeJournalTimezone: true,
    scheduledChange,
  };
}

async function buildJournalTimezoneContext(
  ctx: FriendGroupCtx,
  group: FriendGroupRecord,
  memberUserIds: Id<"users">[],
  now: number,
): Promise<JournalTimezoneContext> {
  const memberTimezones = await getMemberTimezones(ctx, memberUserIds);
  const requestSenderId = await getAcceptedFriendRequestSenderId(
    ctx,
    memberUserIds[0]!,
    memberUserIds[1]!,
  );
  const senderIndex = requestSenderId
    ? memberUserIds.indexOf(requestSenderId)
    : 0;
  const requestSenderTimezone =
    senderIndex >= 0 ? memberTimezones[senderIndex]! : memberTimezones[0]!;

  return resolveJournalTimezoneState({
    group,
    memberTimezones,
    memberUserIds: memberUserIds as [Id<"users">, Id<"users">],
    requestSenderTimezone,
    now,
  });
}

export async function promoteScheduledJournalTimezoneIfDue(
  ctx: MutationCtx,
  groupId: Id<"friendGroups">,
  now = Date.now(),
): Promise<void> {
  const group = await ctx.db.get(groupId);
  if (!group) {
    return;
  }

  const {
    journalTimezone,
    scheduledJournalTimezone,
    scheduledJournalTimezoneFrom,
  } = group;

  if (
    !journalTimezone ||
    !scheduledJournalTimezone ||
    !scheduledJournalTimezoneFrom
  ) {
    return;
  }

  const today = todayIsoDate(now, journalTimezone);
  if (today < scheduledJournalTimezoneFrom) {
    return;
  }

  await ctx.db.patch(groupId, {
    journalTimezone: scheduledJournalTimezone,
    scheduledJournalTimezone: undefined,
    scheduledJournalTimezoneFrom: undefined,
    updatedAt: now,
  });
}

export async function ensureJournalTimezoneDefault(
  ctx: MutationCtx,
  groupId: Id<"friendGroups">,
  memberUserIds: Id<"users">[],
  now = Date.now(),
): Promise<void> {
  const group = await ctx.db.get(groupId);
  if (!group || group.journalTimezone) {
    return;
  }

  const memberTimezones = await getMemberTimezones(ctx, memberUserIds);
  if (memberTimezones[0] === memberTimezones[1]) {
    return;
  }

  const requestSenderId = await getAcceptedFriendRequestSenderId(
    ctx,
    memberUserIds[0]!,
    memberUserIds[1]!,
  );
  const senderIndex = requestSenderId
    ? memberUserIds.indexOf(requestSenderId)
    : 0;
  const requestSenderTimezone =
    senderIndex >= 0
      ? memberTimezones[senderIndex]!
      : memberTimezones[0]!;

  await ctx.db.patch(groupId, {
    journalTimezone: requestSenderTimezone,
    updatedAt: now,
  });
}

export async function getJournalTimezoneContext(
  ctx: FriendGroupCtx,
  groupId: Id<"friendGroups">,
  memberUserIds: Id<"users">[],
  now = Date.now(),
): Promise<JournalTimezoneContext> {
  const group = await ctx.db.get(groupId);
  if (!group) {
    throw new Error("Friend group not found.");
  }

  return buildJournalTimezoneContext(ctx, group, memberUserIds, now);
}

export async function getEffectiveJournalTimezone(
  ctx: FriendGroupCtx,
  groupId: Id<"friendGroups">,
  memberUserIds: Id<"users">[],
  now = Date.now(),
): Promise<string> {
  const context = await getJournalTimezoneContext(
    ctx,
    groupId,
    memberUserIds,
    now,
  );
  return context.effectiveTimezone;
}

export async function prepareJournalTimezoneForMutation(
  ctx: MutationCtx,
  groupId: Id<"friendGroups">,
  memberUserIds: Id<"users">[],
  now = Date.now(),
): Promise<JournalTimezoneContext> {
  await ensureJournalTimezoneDefault(ctx, groupId, memberUserIds, now);
  await promoteScheduledJournalTimezoneIfDue(ctx, groupId, now);
  return getJournalTimezoneContext(ctx, groupId, memberUserIds, now);
}

export async function setJournalTimezoneForGroup(
  ctx: MutationCtx,
  groupId: Id<"friendGroups">,
  userId: Id<"users">,
  timezone: string,
  now = Date.now(),
) {
  await requireGroupMember(ctx, groupId, userId);
  const memberUserIds = await listGroupMemberIds(ctx, groupId);
  await ensureJournalTimezoneDefault(ctx, groupId, memberUserIds, now);
  await promoteScheduledJournalTimezoneIfDue(ctx, groupId, now);

  const context = await getJournalTimezoneContext(
    ctx,
    groupId,
    memberUserIds,
    now,
  );

  if (!context.canChangeJournalTimezone) {
    throw new Error("Journal timezone cannot be changed for this friendship.");
  }

  const normalizedTimezone = validateIanaTimezone(timezone);
  if (
    normalizedTimezone !== context.memberTimezones[0] &&
    normalizedTimezone !== context.memberTimezones[1]
  ) {
    throw new Error("Choose one of the friends' timezones.");
  }

  const effectiveFrom = tomorrowIsoDate(now, context.effectiveTimezone);

  await ctx.db.patch(groupId, {
    scheduledJournalTimezone: normalizedTimezone,
    scheduledJournalTimezoneFrom: effectiveFrom,
    updatedAt: now,
  });

  return {
    scheduledJournalTimezone: normalizedTimezone,
    scheduledJournalTimezoneFrom: effectiveFrom,
  };
}
