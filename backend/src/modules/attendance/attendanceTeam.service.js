import { prisma } from "../../config/db.js";
import { emitToAll } from "../../sockets/index.js";
import { todayStr } from "./attendance.service.js";
import {
  buildStats,
  shouldShowMember,
  summarizeMember,
} from "./attendanceTeam.utils.js";

// Only these user fields are ever sent to other people.
const MEMBER_SELECT = {
  id: true,
  name: true,
  role: true,
  department: true,
  designation: true,
  avatarUrl: true,
  timeZone: true,
};

// Builds the board entry for each given user using only 2 database queries.
async function buildMembers(users, now) {
  if (users.length === 0) return [];

  const userIds = users.map((user) => user.id);

  // "Today" is calculated in each user's own time zone, exactly like the
  // existing clock in code does.
  const dateKeyByUser = new Map(
    users.map((user) => [user.id, todayStr(now, user.timeZone)])
  );
  const dateKeys = [...new Set(dateKeyByUser.values())];

  const [sessions, dayRecords] = await Promise.all([
    prisma.attendanceSession.findMany({
      where: {
        userId: { in: userIds },
        OR: [{ dateKey: { in: dateKeys } }, { clockOutAt: null }],
      },
      include: { breaks: { orderBy: { startAt: "asc" } } },
      orderBy: { clockInAt: "asc" },
    }),
    prisma.attendance.findMany({
      where: { userId: { in: userIds }, dateKey: { in: dateKeys } },
    }),
  ]);

  const sessionsByUser = new Map();

  for (const session of sessions) {
    const todayKey = dateKeyByUser.get(session.userId);

    // Keep today's sessions and any session that is still open.
    if (session.dateKey !== todayKey && session.clockOutAt) continue;

    const list = sessionsByUser.get(session.userId) || [];
    list.push(session);
    sessionsByUser.set(session.userId, list);
  }

  const recordByUser = new Map();

  for (const record of dayRecords) {
    if (record.dateKey === dateKeyByUser.get(record.userId)) {
      recordByUser.set(record.userId, record);
    }
  }

  return users.map((user) => {
    let userSessions = sessionsByUser.get(user.id) || [];

    // Older records that have no session rows yet.
    if (userSessions.length === 0) {
      const record = recordByUser.get(user.id);

      if (record?.clockInAt) {
        userSessions = [
          {
            clockInAt: record.clockInAt,
            clockOutAt: record.clockOutAt || null,
            workedMinutes: record.workedMinutes || 0,
            breaks: [],
          },
        ];
      }
    }

    return summarizeMember(user, userSessions, now);
  });
}

// GET /attendance/team/today
// Everyone who is logged in (admin and employee) can read it.
export async function getTeamToday(currentUserId) {
  const now = new Date();

  const users = await prisma.user.findMany({
    where: { isDeleted: false, status: "active" },
    select: MEMBER_SELECT,
    orderBy: { name: "asc" },
  });

  const members = (await buildMembers(users, now)).filter(shouldShowMember);

  return {
    serverTime: now.toISOString(),
    meId: String(currentUserId),
    stats: buildStats(members),
    members,
  };
}

// Tells every connected user that one person's status changed, so all
// open Clock In pages update instantly without a refresh.
// It never throws: a failed broadcast must not break clock in or clock out.
export async function broadcastMemberUpdate(userId) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: String(userId), isDeleted: false, status: "active" },
      select: MEMBER_SELECT,
    });

    if (!user) return;

    const [member] = await buildMembers([user], new Date());

    if (member) emitToAll("attendance:team-update", member);
  } catch (error) {
    console.error("[ATTENDANCE] team broadcast failed:", error?.message);
  }
}