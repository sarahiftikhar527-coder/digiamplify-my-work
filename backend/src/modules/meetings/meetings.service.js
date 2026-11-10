import { prisma } from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";
import { isAdmin } from "../calendar/calendar.auth.js";
import { notifyUsers } from "../notifications/notifications.events.js";
import { expandOccurrences, nextOccurrence } from "./meetings.recurrence.js";

const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;
const MAX_OCCURRENCES = 1500;

const USER_SELECT = {
  id: true,
  name: true,
  role: true,
  department: true,
  designation: true,
  avatarUrl: true,
};

const INCLUDE = {
  organizer: { select: USER_SELECT },
  attendees: { include: { user: { select: USER_SELECT } }, orderBy: { createdAt: "asc" } },
};

const actorOf = (user) => ({
  id: String(user.id || user._id),
  role: user.role,
  name: user.name || "Someone",
});

const clip = (value, max) => {
  const text = String(value || "");
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatWhen(date, tzOffset = 0) {
  const local = new Date(new Date(date).getTime() + tzOffset * MIN);
  const h = local.getUTCHours();
  const m = String(local.getUTCMinutes()).padStart(2, "0");
  const hour12 = ((h + 11) % 12) + 1;
  return `${WEEKDAYS[local.getUTCDay()]}, ${local.getUTCDate()} ${MONTHS[local.getUTCMonth()]} at ${String(hour12).padStart(2, "0")}:${m} ${h >= 12 ? "PM" : "AM"}`;
}

/* ------------------------------------------------------------------ */
/* Notifications (never allowed to break the main request)             */
/* ------------------------------------------------------------------ */
async function notify(userIds, actor, { title, message, details = "" }) {
  try {
    const ids = [...new Set(userIds)].filter((id) => id && id !== actor?.id);
    if (!ids.length) return;

    const users = await prisma.user.findMany({
      where: { id: { in: ids }, isDeleted: false, status: "active" },
      select: { id: true, role: true },
    });

    const groups = {
      admin: users.filter((u) => isAdmin(u)).map((u) => u.id),
      employee: users.filter((u) => !isAdmin(u)).map((u) => u.id),
    };

    const base = {
      from: actor?.id || null,
      type: "meeting",
      tag: "HR & Admin",
      title: clip(title, 150),
      message: clip(message, 500),
      details: clip(details, 4000),
      linkLabel: "Open Calendar",
    };

    if (groups.admin.length) await notifyUsers(groups.admin, { ...base, link: "/admin/calendar" });
    if (groups.employee.length) await notifyUsers(groups.employee, { ...base, link: "/calendar" });
  } catch (error) {
    console.error("Meeting notification failed:", error?.message || error);
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function canAccess(actor, meeting) {
  return (
    isAdmin(actor) ||
    meeting.organizerId === actor.id ||
    meeting.attendees.some((a) => a.userId === actor.id)
  );
}

function canManage(actor, meeting) {
  return isAdmin(actor) || meeting.organizerId === actor.id;
}

function serialize(meeting, actor, occurrence = null) {
  const mine = meeting.attendees.find((a) => a.userId === actor.id);
  const start = occurrence?.start || meeting.startAt;
  const end = occurrence?.end || meeting.endAt;

  const rsvpSummary = { accepted: 0, declined: 0, tentative: 0, pending: 0 };
  meeting.attendees.forEach((a) => {
    rsvpSummary[a.rsvp] = (rsvpSummary[a.rsvp] || 0) + 1;
  });

  return {
    id: meeting.id,
    type: "meeting",
    title: meeting.title,
    description: meeting.description || "",
    agenda: meeting.agenda || "",
    notes: meeting.notes || "",
    meetingType: meeting.meetingType,
    category: meeting.category,
    priority: meeting.priority,
    location: meeting.location,
    meetingLink: meeting.meetingLink,
    startAt: new Date(start).toISOString(),
    endAt: new Date(end).toISOString(),
    seriesStartAt: meeting.startAt.toISOString(),
    seriesEndAt: meeting.endAt.toISOString(),
    occurrenceKey: occurrence?.key || meeting.startAt.toISOString(),
    tzOffset: meeting.tzOffset,
    recurrence: meeting.recurrence,
    recurrenceUntil: meeting.recurrenceUntil ? meeting.recurrenceUntil.toISOString() : null,
    reminderMinutes: meeting.reminderMinutes,
    status: meeting.status,
    cancelReason: meeting.cancelReason || "",
    organizerId: meeting.organizerId,
    organizer: meeting.organizer,
    attendees: meeting.attendees.map((a) => ({
      userId: a.userId,
      rsvp: a.rsvp,
      respondedAt: a.respondedAt,
      name: a.user?.name || "Unknown",
      role: a.user?.role || "",
      department: a.user?.department || "",
      designation: a.user?.designation || "",
      avatarUrl: a.user?.avatarUrl || "",
    })),
    attendeeCount: meeting.attendees.length + 1,
    rsvpSummary,
    myRsvp: mine?.rsvp || null,
    isOrganizer: meeting.organizerId === actor.id,
    canManage: canManage(actor, meeting),
    updatedAt: meeting.updatedAt,
  };
}

async function loadMeeting(id) {
  const meeting = await prisma.meeting.findUnique({ where: { id }, include: INCLUDE });
  if (!meeting) throw new ApiError(404, "Meeting not found.");
  return meeting;
}

async function resolveAttendees(ids = [], organizerId) {
  const unique = [...new Set(ids)].filter((id) => id && id !== organizerId);
  if (!unique.length) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: unique }, isDeleted: false, status: "active" },
    select: { id: true },
  });

  if (users.length !== unique.length) {
    throw new ApiError(400, "One or more selected attendees are not available.");
  }

  return unique;
}

function overlapWhere(from, to) {
  return {
    startAt: { lte: to },
    OR: [
      { recurrence: "none", endAt: { gte: from } },
      {
        recurrence: { not: "none" },
        OR: [{ recurrenceUntil: null }, { recurrenceUntil: { gte: from } }],
      },
    ],
  };
}

function involvesUsers(userIds) {
  return {
    OR: [{ organizerId: { in: userIds } }, { attendees: { some: { userId: { in: userIds } } } }],
  };
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */
export async function listMeetings(user, filters = {}) {
  const actor = actorOf(user);
  const now = new Date();
  const from = filters.from || new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = filters.to || new Date(from.getTime() + 31 * DAY);
  // Dates sent as plain YYYY-MM-DD should cover the whole end day.
  const rangeEnd = new Date(to.getTime() + (filters.toIsDateOnly ? DAY - 1 : 0));

  const and = [overlapWhere(from, rangeEnd)];

  if (!isAdmin(actor) || filters.scope !== "all") and.push(involvesUsers([actor.id]));

  if (!filters.status || filters.status === "scheduled") {
    and.push({ status: { in: ["scheduled", "completed"] } });
  } else if (filters.status !== "all") {
    and.push({ status: filters.status });
  }

  if (filters.category) and.push({ category: filters.category });

  if (filters.q) {
    and.push({
      OR: [{ title: { contains: filters.q } }, { description: { contains: filters.q } }, { location: { contains: filters.q } }],
    });
  }

  const meetings = await prisma.meeting.findMany({
    where: { AND: and },
    include: INCLUDE,
    orderBy: { startAt: "asc" },
    take: 800,
  });

  const out = [];
  for (const meeting of meetings) {
    for (const occ of expandOccurrences(meeting, from, rangeEnd)) {
      out.push(serialize(meeting, actor, occ));
      if (out.length >= MAX_OCCURRENCES) break;
    }
  }

  out.sort((a, b) => a.startAt.localeCompare(b.startAt));
  return out;
}

export async function getMeeting(user, id) {
  const actor = actorOf(user);
  const meeting = await loadMeeting(id);
  if (!canAccess(actor, meeting)) throw new ApiError(403, "You do not have permission to view this meeting.");
  return serialize(meeting, actor);
}

export async function searchDirectory(user, q = "") {
  const text = String(q || "").trim();
  const where = { isDeleted: false, status: "active" };

  if (text) {
    where.OR = [
      { name: { contains: text } },
      { department: { contains: text } },
      { designation: { contains: text } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: USER_SELECT,
    orderBy: { name: "asc" },
    take: text ? 40 : 200,
  });

  return users.map((u) => ({ ...u, isMe: u.id === actorOf(user).id }));
}

/* ------------------------------------------------------------------ */
/* Conflicts / availability                                            */
/* ------------------------------------------------------------------ */
export async function findConflicts(user, { attendeeIds = [], startAt, endAt, excludeId }) {
  const actor = actorOf(user);
  const people = [...new Set([actor.id, ...attendeeIds])];

  const [meetings, leaves, users] = await Promise.all([
    prisma.meeting.findMany({
      where: {
        AND: [
          overlapWhere(startAt, endAt),
          { status: "scheduled" },
          involvesUsers(people),
          ...(excludeId ? [{ id: { not: excludeId } }] : []),
        ],
      },
      include: INCLUDE,
      take: 400,
    }),
    prisma.calendar.findMany({
      where: {
        eventType: "leave",
        status: "approved",
        employeeId: { in: people },
        from: { lte: endAt },
        to: { gte: startAt },
      },
      select: { id: true, employeeId: true, from: true, to: true },
    }),
    prisma.user.findMany({ where: { id: { in: people } }, select: { id: true, name: true } }),
  ]);

  const names = new Map(users.map((u) => [u.id, u.name]));
  const conflicts = [];

  for (const meeting of meetings) {
    const participants = new Set([meeting.organizerId, ...meeting.attendees.map((a) => a.userId)]);
    const declined = new Set(meeting.attendees.filter((a) => a.rsvp === "declined").map((a) => a.userId));
    const visible = isAdmin(actor) || participants.has(actor.id);

    for (const occ of expandOccurrences(meeting, startAt, endAt)) {
      for (const personId of people) {
        if (!participants.has(personId) || declined.has(personId)) continue;
        conflicts.push({
          userId: personId,
          name: names.get(personId) || "Unknown",
          kind: "meeting",
          title: visible ? meeting.title : "Busy",
          startAt: occ.start.toISOString(),
          endAt: occ.end.toISOString(),
        });
      }
    }
  }

  for (const leave of leaves) {
    conflicts.push({
      userId: leave.employeeId,
      name: names.get(leave.employeeId) || "Unknown",
      kind: "leave",
      title: "On approved leave",
      startAt: leave.from.toISOString(),
      endAt: leave.to.toISOString(),
    });
  }

  return conflicts;
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */
const EDITABLE = [
  "title",
  "description",
  "agenda",
  "notes",
  "meetingType",
  "category",
  "priority",
  "location",
  "meetingLink",
  "startAt",
  "endAt",
  "tzOffset",
  "recurrence",
  "recurrenceUntil",
  "reminderMinutes",
];

export async function createMeeting(user, body) {
  const actor = actorOf(user);
  const attendeeIds = await resolveAttendees(body.attendeeIds, actor.id);

  const data = {};
  EDITABLE.forEach((key) => {
    if (body[key] !== undefined) data[key] = body[key];
  });

  if (data.recurrence === "none") data.recurrenceUntil = null;

  const meeting = await prisma.meeting.create({
    data: {
      ...data,
      organizerId: actor.id,
      skippedDates: [],
      attendees: { create: attendeeIds.map((userId) => ({ userId })) },
    },
    include: INCLUDE,
  });

  await notify(attendeeIds, actor, {
    title: `Meeting invitation: ${meeting.title}`,
    message: `${actor.name} invited you to "${meeting.title}" on ${formatWhen(meeting.startAt, meeting.tzOffset)}.`,
    details: [meeting.agenda, meeting.description].filter(Boolean).join("\n\n"),
  });

  return serialize(meeting, actor);
}

export async function updateMeeting(user, id, body) {
  const actor = actorOf(user);
  const existing = await loadMeeting(id);

  if (!canManage(actor, existing)) throw new ApiError(403, "Only the organizer or an admin can edit this meeting.");
  if (existing.status === "cancelled") throw new ApiError(400, "A cancelled meeting cannot be edited.");

  const data = {};
  EDITABLE.forEach((key) => {
    if (body[key] !== undefined) data[key] = body[key];
  });

  const nextRecurrence = data.recurrence ?? existing.recurrence;
  if (nextRecurrence === "none") data.recurrenceUntil = null;

  const sameTime = (a, b) => a && b && new Date(a).getTime() === new Date(b).getTime();
  const scheduleChanged =
    (data.startAt && !sameTime(data.startAt, existing.startAt)) ||
    (data.endAt && !sameTime(data.endAt, existing.endAt)) ||
    (data.recurrence !== undefined && data.recurrence !== existing.recurrence) ||
    (data.recurrenceUntil !== undefined && !sameTime(data.recurrenceUntil, existing.recurrenceUntil));

  if (scheduleChanged) {
    data.skippedDates = [];
    data.lastReminderFor = null;
  }
  if (data.reminderMinutes !== undefined && data.reminderMinutes !== existing.reminderMinutes) {
    data.lastReminderFor = null;
  }

  const currentIds = existing.attendees.map((a) => a.userId);
  let added = [];
  let removed = [];
  const ops = [];

  if (body.attendeeIds !== undefined) {
    const nextIds = await resolveAttendees(body.attendeeIds, existing.organizerId);
    added = nextIds.filter((uid) => !currentIds.includes(uid));
    removed = currentIds.filter((uid) => !nextIds.includes(uid));

    if (removed.length) {
      ops.push(prisma.meetingAttendee.deleteMany({ where: { meetingId: id, userId: { in: removed } } }));
    }
    if (added.length) {
      ops.push(prisma.meetingAttendee.createMany({ data: added.map((userId) => ({ meetingId: id, userId })) }));
    }
  }

  if (scheduleChanged) {
    ops.push(
      prisma.meetingAttendee.updateMany({
        where: { meetingId: id, userId: { in: currentIds.filter((uid) => !removed.includes(uid)) } },
        data: { rsvp: "pending", respondedAt: null },
      })
    );
  }

  ops.push(prisma.meeting.update({ where: { id }, data }));
  await prisma.$transaction(ops);

  const updated = await loadMeeting(id);
  const title = updated.title;

  await notify(added, actor, {
    title: `Meeting invitation: ${title}`,
    message: `${actor.name} invited you to "${title}" on ${formatWhen(updated.startAt, updated.tzOffset)}.`,
    details: [updated.agenda, updated.description].filter(Boolean).join("\n\n"),
  });

  await notify(removed, actor, {
    title: `Removed from meeting: ${title}`,
    message: `${actor.name} removed you from "${title}".`,
  });

  if (scheduleChanged) {
    await notify(
      updated.attendees.map((a) => a.userId).filter((uid) => !added.includes(uid)),
      actor,
      {
        title: `Meeting rescheduled: ${title}`,
        message: `"${title}" is now ${formatWhen(updated.startAt, updated.tzOffset)}. Please confirm your attendance again.`,
      }
    );
  }

  return serialize(updated, actor);
}

export async function cancelMeeting(user, id, { reason = "", occurrence } = {}) {
  const actor = actorOf(user);
  const meeting = await loadMeeting(id);

  if (!canManage(actor, meeting)) throw new ApiError(403, "Only the organizer or an admin can cancel this meeting.");
  if (meeting.status === "cancelled") throw new ApiError(400, "This meeting is already cancelled.");

  const recipients = meeting.attendees.map((a) => a.userId);

  if (occurrence && meeting.recurrence !== "none") {
    const target = new Date(occurrence);
    if (Number.isNaN(target.getTime())) throw new ApiError(400, "Invalid occurrence.");

    const occ = expandOccurrences(
      meeting,
      new Date(target.getTime() - 1),
      new Date(target.getTime() + 1)
    ).find((o) => o.start.getTime() === target.getTime());

    if (!occ) throw new ApiError(404, "That occurrence does not exist.");

    const skipped = Array.isArray(meeting.skippedDates) ? meeting.skippedDates : [];
    const updated = await prisma.meeting.update({
      where: { id },
      data: { skippedDates: [...new Set([...skipped, occ.key])] },
      include: INCLUDE,
    });

    await notify(recipients, actor, {
      title: `Meeting occurrence cancelled: ${meeting.title}`,
      message: `${actor.name} cancelled "${meeting.title}" on ${formatWhen(occ.start, meeting.tzOffset)}.${reason ? ` Reason: ${reason}` : ""}`,
    });

    return serialize(updated, actor);
  }

  const updated = await prisma.meeting.update({
    where: { id },
    data: { status: "cancelled", cancelReason: reason },
    include: INCLUDE,
  });

  await notify(recipients, actor, {
    title: `Meeting cancelled: ${meeting.title}`,
    message: `${actor.name} cancelled "${meeting.title}" (${formatWhen(meeting.startAt, meeting.tzOffset)}).${reason ? ` Reason: ${reason}` : ""}`,
  });

  return serialize(updated, actor);
}

export async function completeMeeting(user, id) {
  const actor = actorOf(user);
  const meeting = await loadMeeting(id);

  if (!canManage(actor, meeting)) throw new ApiError(403, "Only the organizer or an admin can update this meeting.");
  if (meeting.status === "cancelled") throw new ApiError(400, "A cancelled meeting cannot be completed.");

  const updated = await prisma.meeting.update({
    where: { id },
    data: { status: "completed" },
    include: INCLUDE,
  });

  return serialize(updated, actor);
}

export async function deleteMeeting(user, id) {
  const actor = actorOf(user);
  const meeting = await loadMeeting(id);

  if (!canManage(actor, meeting)) throw new ApiError(403, "Only the organizer or an admin can delete this meeting.");

  await prisma.meeting.delete({ where: { id } });

  if (meeting.status === "scheduled") {
    await notify(
      meeting.attendees.map((a) => a.userId),
      actor,
      {
        title: `Meeting cancelled: ${meeting.title}`,
        message: `${actor.name} removed the meeting "${meeting.title}".`,
      }
    );
  }
}

export async function respondToMeeting(user, id, response) {
  const actor = actorOf(user);
  const meeting = await loadMeeting(id);
  const row = meeting.attendees.find((a) => a.userId === actor.id);

  if (!row) throw new ApiError(403, "You are not invited to this meeting.");
  if (meeting.status === "cancelled") throw new ApiError(400, "This meeting has been cancelled.");

  await prisma.meetingAttendee.update({
    where: { id: row.id },
    data: { rsvp: response, respondedAt: new Date() },
  });

  await notify([meeting.organizerId], actor, {
    title: `${actor.name} ${response === "tentative" ? "might attend" : response}`,
    message: `${actor.name} ${response === "tentative" ? "responded maybe to" : response} "${meeting.title}".`,
  });

  return serialize(await loadMeeting(id), actor);
}

/* ------------------------------------------------------------------ */
/* Summary                                                             */
/* ------------------------------------------------------------------ */
const hoursBetween = (a, b) => (new Date(b) - new Date(a)) / (60 * MIN);

export async function getSummary(user, { tzOffset = 0 } = {}) {
  const actor = actorOf(user);
  const now = new Date();
  const local = new Date(now.getTime() + tzOffset * MIN);

  const dayStart = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - tzOffset * MIN);
  const dayEnd = new Date(dayStart.getTime() + DAY);
  const weekEnd = new Date(dayStart.getTime() + 7 * DAY);
  const monthStart = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - tzOffset * MIN);
  const monthEnd = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + 1, 1) - tzOffset * MIN);

  const rangeEnd = new Date(Math.max(monthEnd.getTime(), weekEnd.getTime()));
  const mine = await listMeetings(user, { from: monthStart, to: rangeEnd, scope: "mine" });

  const upcoming = mine.filter((m) => new Date(m.endAt) >= now);
  const inMonth = mine.filter((m) => new Date(m.startAt) >= monthStart && new Date(m.startAt) < monthEnd);

  const byCategory = {};
  inMonth.forEach((m) => {
    byCategory[m.category] = (byCategory[m.category] || 0) + 1;
  });

  const summary = {
    today: upcoming.filter((m) => new Date(m.startAt) < dayEnd).length,
    next7Days: upcoming.filter((m) => new Date(m.startAt) < weekEnd).length,
    pendingInvites: upcoming.filter((m) => m.myRsvp === "pending").length,
    hoursThisMonth: Math.round(inMonth.reduce((sum, m) => sum + hoursBetween(m.startAt, m.endAt), 0) * 10) / 10,
    byCategory,
    nextMeeting: upcoming.find((m) => new Date(m.startAt) >= now) || upcoming[0] || null,
    org: null,
  };

  if (isAdmin(actor)) {
    const all = await listMeetings(user, { from: monthStart, to: monthEnd, scope: "all", status: "all" });
    const active = all.filter((m) => m.status !== "cancelled");

    const invites = active.reduce((sum, m) => sum + m.attendees.length, 0);
    const answered = active.reduce(
      (sum, m) => sum + m.rsvpSummary.accepted + m.rsvpSummary.declined + m.rsvpSummary.tentative,
      0
    );

    const organizers = new Map();
    active.forEach((m) => {
      const key = m.organizerId;
      const row = organizers.get(key) || { id: key, name: m.organizer?.name || "Unknown", count: 0 };
      row.count += 1;
      organizers.set(key, row);
    });

    const orgByCategory = {};
    active.forEach((m) => {
      orgByCategory[m.category] = (orgByCategory[m.category] || 0) + 1;
    });

    summary.org = {
      total: active.length,
      cancelled: all.length - active.length,
      totalHours: Math.round(active.reduce((s, m) => s + hoursBetween(m.startAt, m.endAt), 0) * 10) / 10,
      avgAttendees: active.length ? Math.round((active.reduce((s, m) => s + m.attendeeCount, 0) / active.length) * 10) / 10 : 0,
      responseRate: invites ? Math.round((answered / invites) * 100) : 0,
      byCategory: orgByCategory,
      topOrganizers: [...organizers.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    };
  }

  return summary;
}

/* ------------------------------------------------------------------ */
/* Reminder sweep (called every minute by meetings.reminders.job.js)   */
/* ------------------------------------------------------------------ */
export async function runReminderSweep(now = new Date()) {
  const candidates = await prisma.meeting.findMany({
    where: {
      AND: [
        { status: "scheduled", reminderMinutes: { gt: 0 } },
        { startAt: { lte: new Date(now.getTime() + 7 * DAY) } },
        {
          OR: [
            { recurrence: "none", endAt: { gte: now } },
            {
              recurrence: { not: "none" },
              OR: [{ recurrenceUntil: null }, { recurrenceUntil: { gte: now } }],
            },
          ],
        },
      ],
    },
    include: { attendees: true },
    take: 500,
  });

  let sent = 0;

  for (const meeting of candidates) {
    const occ = nextOccurrence(meeting, now, 8);
    if (!occ) continue;

    const remindAt = occ.start.getTime() - meeting.reminderMinutes * MIN;
    if (now.getTime() < remindAt) continue;
    if (meeting.lastReminderFor && meeting.lastReminderFor.getTime() === occ.start.getTime()) continue;

    // Claim the occurrence first so overlapping sweeps never double-send.
    const claim = await prisma.meeting.updateMany({
      where: {
        id: meeting.id,
        OR: [{ lastReminderFor: null }, { lastReminderFor: { not: occ.start } }],
      },
      data: { lastReminderFor: occ.start },
    });
    if (!claim.count) continue;

    const recipients = [
      meeting.organizerId,
      ...meeting.attendees.filter((a) => a.rsvp !== "declined").map((a) => a.userId),
    ];

    const minutes = Math.max(1, Math.round((occ.start.getTime() - now.getTime()) / MIN));
    await notify(recipients, null, {
      title: `Starting soon: ${meeting.title}`,
      message: `"${meeting.title}" starts in ${minutes} minute${minutes === 1 ? "" : "s"} (${formatWhen(occ.start, meeting.tzOffset)}).${
        meeting.meetingLink ? " Join link is in the meeting details." : ""
      }`,
    });
    sent += 1;
  }

  return sent;
}