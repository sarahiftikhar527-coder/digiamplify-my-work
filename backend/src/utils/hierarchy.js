import { prisma } from "../config/db.js";
import ApiError from "./ApiError.js";
import { ROLES } from "../constants/roles.js";
import { assignsToEveryone, canAssignTasks } from "./permissions.js";

const ACTIVE_STAFF = {
  role: ROLES.EMPLOYEE,
  status: "active",
  isDeleted: false,
};

// Ids of everyone below `userId` in the reporting chain (children,
// grandchildren and so on). `rows` is a list of { id, managerId }.
export function collectDescendantIds(rows, userId) {
  const childrenByManager = new Map();

  for (const row of rows) {
    if (!row.managerId) continue;

    if (!childrenByManager.has(row.managerId)) {
      childrenByManager.set(row.managerId, []);
    }

    childrenByManager.get(row.managerId).push(row.id);
  }

  const result = [];
  const seen = new Set([String(userId)]);
  const queue = [String(userId)];

  while (queue.length) {
    const current = queue.shift();

    for (const childId of childrenByManager.get(current) || []) {
      if (seen.has(childId)) continue;

      seen.add(childId);
      result.push(childId);
      queue.push(childId);
    }
  }

  return result;
}

// People this user is allowed to assign tasks to.

export async function getAssignableUsers(user) {
  if (!canAssignTasks(user)) return [];

  const select = {
    id: true,
    name: true,
    email: true,
    role: true,
    position: true,
    managerId: true,
    department: true,
    designation: true,
    status: true,
    isDeleted: true,
    avatarUrl: true,
  };

  if (assignsToEveryone(user)) {
    return prisma.user.findMany({
      where: {
        role: ROLES.EMPLOYEE,
        status: "active",
        isDeleted: false,
        id: { not: String(user.id) },
      },
      select,
      orderBy: { name: "asc" },
    });
  }

  const rows = await prisma.user.findMany({
    where: {
      role: ROLES.EMPLOYEE,
      isDeleted: false,
    },
    select: {
      id: true,
      managerId: true,
    },
  });

  const normalizeId = (id) => String(id ?? "").trim();

  const childrenByManager = new Map();

  for (const row of rows) {
    const managerId = normalizeId(row.managerId);
    const employeeId = normalizeId(row.id);

    if (!managerId || !employeeId) continue;

    if (!childrenByManager.has(managerId)) {
      childrenByManager.set(managerId, []);
    }

    childrenByManager.get(managerId).push(employeeId);
  }

  const allowedIds = new Set();
  const queue = [normalizeId(user.id)];

  while (queue.length) {
    const current = queue.shift();

    for (const childId of childrenByManager.get(current) || []) {
      if (allowedIds.has(childId)) continue;

      allowedIds.add(childId);
      queue.push(childId);
    }
  }

  if (!allowedIds.size) return [];

  return prisma.user.findMany({
    where: {
      id: { in: [...allowedIds] },
      role: ROLES.EMPLOYEE,
      status: "active",
      isDeleted: false,
    },
    select,
    orderBy: { name: "asc" },
  });
}


export async function getAssignableUserIds(user) {
  const users = await getAssignableUsers(user);
  return users.map((item) => item.id);
}

// Throws 403 unless every id in `employeeIds` is inside the user's scope.
export async function assertCanAssignTo(user, employeeIds) {
  if (!canAssignTasks(user)) {
    throw new ApiError(403, "You do not have permission to assign tasks.");
  }

  if (assignsToEveryone(user)) return;

  const allowed = new Set(await getAssignableUserIds(user));
  const blocked = employeeIds.map(String).filter((id) => !allowed.has(id));

  if (blocked.length) {
    throw new ApiError(
      403,
      "You can only assign tasks to people who report to you."
    );
  }
}

// Scope used to filter task lists. `null` means "no limit" (admin).
export async function getTaskScope(user) {
  if (["admin", "superadmin"].includes(String(user?.role).toLowerCase())) {
    return null;
  }

  return {
    userId: String(user.id),
    employeeIds: await getAssignableUserIds(user),
  };
}

// Throws 403 unless the user may manage (edit, change status, delete) the task.
export async function assertCanManageTask(user, taskId) {
  const scope = await getTaskScope(user);

  if (!scope) return;

  const task = await prisma.task.findUnique({
    where: { id: String(taskId) },
    select: { assignedById: true, assignedToId: true },
  });

  if (!task) throw new ApiError(404, "Task not found.");

  const createdByMe = String(task.assignedById) === scope.userId;
  const isPersonal = String(task.assignedById) === String(task.assignedToId);
  const inScope = scope.employeeIds.includes(String(task.assignedToId));

  if (createdByMe && !isPersonal) return;
  if (inScope && !isPersonal) return;

  throw new ApiError(403, "You cannot manage this task.");
}