import { prisma } from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";
import { ROLES } from "../../constants/roles.js";
import { todayStr } from "../attendance/attendance.service.js";

export const HOLIDAY_ALLOWANCE = 33;

const ACTIVE = { isDeleted: false, status: "active" };

// Employee positions that may change reporting lines (besides admins).
const HIERARCHY_MANAGER_POSITIONS = ["project_manager", "team_lead"];

const clean = (value) => String(value || "").trim().toLowerCase();

// managerId -> [employee ids]
function buildChildren(people) {
  const map = new Map();

  for (const person of people) {
    if (!person.managerId) continue;
    if (!map.has(person.managerId)) map.set(person.managerId, []);
    map.get(person.managerId).push(person.id);
  }

  return map;
}

// Everyone below rootId (children, grandchildren, ...).
function teamOf(rootId, childrenMap) {
  const team = new Set();
  const stack = [...(childrenMap.get(rootId) || [])];

  while (stack.length) {
    const id = stack.pop();
    if (team.has(id)) continue;
    team.add(id);
    stack.push(...(childrenMap.get(id) || []));
  }

  return team;
}

export async function getHierarchy(actor) {
  const year = String(new Date().getFullYear());
  const weekStart = todayStr(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));

  const [people, hourRows, leaveRows] = await Promise.all([
    prisma.user.findMany({
      where: ACTIVE,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        position: true,
        department: true,
        designation: true,
        avatarUrl: true,
        managerId: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.attendance.groupBy({
      by: ["userId"],
      where: { dateKey: { gte: weekStart } },
      _sum: { workedMinutes: true },
    }),
    prisma.leave.groupBy({
      by: ["employeeId"],
      where: { status: "approved", from: { startsWith: year } },
      _sum: { days: true },
    }),
  ]);

  const minutes = new Map(hourRows.map((r) => [r.userId, r._sum.workedMinutes || 0]));
  const usedDays = new Map(leaveRows.map((r) => [r.employeeId, r._sum.days || 0]));
  const employeeIds = new Set(
    people.filter((p) => p.role === ROLES.EMPLOYEE).map((p) => p.id)
  );

  const shape = (p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role,
    position: clean(p.position) || "employee",
    department: p.department || "",
    designation: p.designation || "",
    avatarUrl: p.avatarUrl || "",
    managerId: employeeIds.has(p.managerId) ? p.managerId : null,
    weeklyHours: Math.round((minutes.get(p.id) || 0) / 60),
    holidayUsed: usedDays.get(p.id) || 0,
    holidayTotal: HOLIDAY_ALLOWANCE,
  });

  const self = people.find((p) => p.id === actor.id);

  return {
    me: {
      id: actor.id,
      role: actor.role,
      position: clean(self?.position) || "employee",
    },
    directors: people.filter((p) => p.role === ROLES.ADMIN).map(shape),
    employees: people.filter((p) => p.role === ROLES.EMPLOYEE).map(shape),
  };
}

/**
 * Change who an employee reports to.
 *  - Admin: can move anyone anywhere (managerId = null means "top").
 *  - Project Manager / Team Lead: can only move people BELOW them, and only
 *    to themselves or to somebody else in their own team.
 *  - Every other employee position: not allowed (403).
 *  - Nobody can be moved under their own team (no loops).
 */
export async function setManager(actor, userId, managerId = null) {
  // Read the actor from the database so the check never trusts the token alone.
  const actorRow = await prisma.user.findUnique({
    where: { id: actor.id },
    select: { id: true, role: true, position: true },
  });

  const actorRole = actorRow?.role ?? actor.role;
  const actorIsAdmin = actorRole === ROLES.ADMIN;
  const actorPosition = clean(actorRow?.position);

  if (!actorIsAdmin && !HIERARCHY_MANAGER_POSITIONS.includes(actorPosition)) {
    throw new ApiError(
      403,
      "Only Admin, Project Manager and Team Lead can change the hierarchy."
    );
  }

  const people = await prisma.user.findMany({
    where: { ...ACTIVE, role: ROLES.EMPLOYEE },
    select: { id: true, name: true, managerId: true },
  });

  const byId = new Map(people.map((p) => [p.id, p]));
  const target = byId.get(userId);

  if (!target) throw new ApiError(404, "Employee not found.");

  const newManagerId = managerId || null;

  if (newManagerId && !byId.has(newManagerId)) {
    throw new ApiError(404, "The selected manager was not found.");
  }

  if (newManagerId === userId) {
    throw new ApiError(400, "An employee cannot report to themselves.");
  }

  if ((target.managerId || null) === newManagerId) {
    return { id: userId, managerId: newManagerId, unchanged: true };
  }

  const childrenMap = buildChildren(people);

  if (newManagerId && teamOf(userId, childrenMap).has(newManagerId)) {
    throw new ApiError(400, "You cannot move someone under their own team.");
  }

  if (!actorIsAdmin) {
    const myTeam = teamOf(actor.id, childrenMap);

    if (!myTeam.has(userId)) {
      throw new ApiError(403, "Only people above you in the hierarchy can move this person.");
    }

    if (!newManagerId || (newManagerId !== actor.id && !myTeam.has(newManagerId))) {
      throw new ApiError(403, "You can only move people inside your own team.");
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { managerId: newManagerId },
  });

  return { id: userId, managerId: newManagerId };
}