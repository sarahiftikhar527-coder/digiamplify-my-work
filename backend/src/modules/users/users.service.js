import User from "../../models/User.js";
import Attendance from "../../models/Attendance.js";
import RefreshToken from "../../models/RefreshToken.js";

import { todayStr } from "../attendance/attendance.service.js";

import ApiError from "../../utils/ApiError.js";
import { ROLES } from "../../constants/roles.js";
import { hashPassword } from "../../utils/password.js";
import { prisma } from "../../config/db.js";
import { POSITIONS, LEADER_POSITIONS } from "../../constants/positions.js";

import {
  collectDescendantIds,
  getAssignableUsers,
} from "../../utils/hierarchy.js";

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Account status values (signup approval flow).
const STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  REJECTED: "rejected",
};

// Never return password / PIN hashes to the client.
function toPublic(user) {
  if (!user) return user;

  const plain =
    typeof user.toJSON === "function" ? user.toJSON() : { ...user };

  delete plain.passwordHash;
  delete plain.pinHash;
  delete plain.pinResetTokenHash;
  delete plain.pinResetExpires;

  return plain;
}

export async function getEmployees(filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));

  const query = {
    role: ROLES.EMPLOYEE,
    isDeleted: false,
    // Pending / rejected signups are managed on the approvals screen.
    status: { $nin: [STATUS.PENDING, STATUS.REJECTED] },
  };

  if (filters.search?.trim()) {
    const search = escapeRegex(filters.search.trim());

    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [employees, total] = await Promise.all([
    User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    User.countDocuments(query),
  ]);

  return {
    employees: employees.map((employee) => ({
      ...toPublic(employee),
      id: employee._id.toString(),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getEmployeeById(id) {
  const employee = await User.findOne({
    _id: id,
    role: ROLES.EMPLOYEE,
    isDeleted: false,
  }).select("-passwordHash");

  if (!employee) {
    throw new ApiError(404, "Employee not found.");
  }

  return toPublic(employee);
}

export async function createEmployee(data = {}) {
  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const password = String(data.password || "");

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required.");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters.");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const passwordHash = await hashPassword(password);

  const employee = await User.create({
    name,
    email,
    passwordHash,
    role: ROLES.EMPLOYEE,
    phone: String(data.phone || "").trim(),
    department: String(data.department || "").trim(),
    designation: String(data.designation || "").trim(),
    status: "active",
    isDeleted: false,
  });

  return toPublic(
    await User.findById(employee._id).select("-passwordHash")
  );
}

export async function updateEmployee(id, data = {}) {
  const employee = await User.findOne({
    _id: id,
    role: ROLES.EMPLOYEE,
    isDeleted: false,
  }).select("+passwordHash");

  if (!employee) {
    throw new ApiError(404, "Employee not found.");
  }

  if (data.name !== undefined) {
    employee.name = data.name.trim();
  }

  if (data.department !== undefined) {
    employee.department = data.department.trim();
  }

  if (data.designation !== undefined) {
    employee.designation = data.designation.trim();
  }

  if (data.phone !== undefined) {
    employee.phone = data.phone.trim();
  }

  if (data.status !== undefined) {
    employee.status = data.status;
  }

  if (data.password) {
    if (data.password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters.");
    }

    employee.passwordHash = await hashPassword(data.password);
  }

  await employee.save();

  return toPublic(
    await User.findById(employee._id).select("-passwordHash")
  );
}

export async function deactivateEmployee(id) {
  const employee = await User.findOneAndUpdate(
    {
      _id: id,
      role: ROLES.EMPLOYEE,
      isDeleted: false,
    },
    { $set: { status: "inactive" } },
    { new: true }
  ).select("-passwordHash");

  if (!employee) {
    throw new ApiError(404, "Employee not found.");
  }

  return toPublic(employee);
}

/* ------------------------------------------------------------------
   Signup approval flow
   (Admin, Project Manager, HR, Team Lead and Manager)
------------------------------------------------------------------- */

// List signup requests that are waiting for approval (oldest first).
// Read straight from Prisma, with only safe fields (no password / PIN hashes).
export async function listPendingEmployees() {
  const rows = await prisma.user.findMany({
    where: {
      role: ROLES.EMPLOYEE,
      status: STATUS.PENDING,
      isDeleted: false,
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      position: true,
      phone: true,
      department: true,
      designation: true,
      status: true,
      createdAt: true,
    },
  });

  return rows.map((row) => ({ ...row, _id: row.id }));
}

async function findPendingOrFail(id) {
  const employee = await User.findOne({
    _id: id,
    role: ROLES.EMPLOYEE,
    isDeleted: false,
  });

  if (!employee) {
    throw new ApiError(404, "Signup request not found.");
  }

  if (employee.status !== STATUS.PENDING) {
    throw new ApiError(409, "This request has already been reviewed.");
  }

  return employee;
}

// Checks that managerId can be the reporting manager of userId.
// Returns the cleaned manager ID, or null for nobody.
async function validateManager(userId, managerId) {
  if (
    managerId === undefined ||
    managerId === null ||
    managerId === ""
  ) {
    return null;
  }

  if (String(managerId) === String(userId)) {
    throw new ApiError(400, "A person cannot report to themselves.");
  }

  const manager = await prisma.user.findFirst({
    where: {
      id: String(managerId),
      role: ROLES.EMPLOYEE,
      status: STATUS.ACTIVE,
      isDeleted: false,
    },
    select: {
      id: true,
      position: true,
    },
  });

  if (!manager) {
    throw new ApiError(404, "The selected leader was not found.");
  }

  if (!LEADER_POSITIONS.includes(manager.position)) {
    throw new ApiError(
      400,
      "Choose a HR, manager, team lead, project manager or finance manager as the leader."
    );
  }

  // A person can never report to someone who already reports to them.
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

  if (collectDescendantIds(rows, userId).includes(String(managerId))) {
    throw new ApiError(
      400,
      "This would create a loop in the hierarchy. The selected leader already reports to this person."
    );
  }

  return String(managerId);
}

// Approve a signup request.
//  - Admin: can also confirm the position and reporting line.
//  - Project Manager / HR / Team Lead / Manager: can only approve. The new
//    person starts as a plain Employee with no reporting line; an admin can
//    change that later from Roles & Hierarchy.
export async function approveEmployee(id, options = {}, actor = {}) {
  const { isAdmin = true } = actor;
  const employee = await findPendingOrFail(id);

  const data = {
    status: STATUS.ACTIVE,
  };

  if (isAdmin) {
    if (options.position !== undefined) {
      data.position = options.position;
    }

    if (options.managerId !== undefined) {
      data.managerId = await validateManager(
        employee.id,
        options.managerId
      );
    }
  } else {
    data.position = POSITIONS.EMPLOYEE;
  }

  const updated = await User.findByIdAndUpdate(employee.id, data);

  return toPublic(updated);
}

// Change the position and reporting line of an existing active person.
export async function updateStructure(id, { position, managerId } = {}) {
  const employee = await User.findOne({
    _id: id,
    role: ROLES.EMPLOYEE,
    isDeleted: false,
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found.");
  }

  const data = {};

  if (position !== undefined) {
    data.position = position;
  }

  if (managerId !== undefined) {
    data.managerId = await validateManager(employee.id, managerId);
  }

  // Someone who is no longer a leader cannot keep people reporting to them.
  const nextPosition =
    data.position ?? employee.position ?? POSITIONS.EMPLOYEE;

  if (!LEADER_POSITIONS.includes(nextPosition)) {
    await prisma.user.updateMany({
      where: {
        managerId: String(employee.id),
      },
      data: {
        managerId: null,
      },
    });
  }

  if (Object.keys(data).length) {
    await User.findByIdAndUpdate(employee.id, data);
  }

  return toPublic(
    await User.findById(employee.id).select("-passwordHash")
  );
}

// People the given user may assign tasks to (hierarchy aware).
export async function listAssignableUsers(user) {
  const rows = await getAssignableUsers(user);

  return rows.map((row) => ({
    ...row,
    _id: row.id,
  }));
}

// Decline: the employee still cannot log in.
export async function rejectEmployee(id) {
  const employee = await findPendingOrFail(id);

  const updated = await User.findByIdAndUpdate(employee.id, {
    status: STATUS.REJECTED,
  });

  return toPublic(updated);
}

/* ------------------------------------------------------------------
   Live employee status for the admin hierarchy page
------------------------------------------------------------------- */

// Returns every active employee with today's clock-in information and
// whether the employee currently has a signed-in session.
export async function getLiveStatus() {
  const employees = await User.find({
    role: ROLES.EMPLOYEE,
    status: STATUS.ACTIVE,
    isDeleted: false,
  })
    .sort({ name: 1 })
    .lean();

  // Each employee has a time zone, so "today" can differ per employee.
  const dateKeys = [
    ...new Set(
      employees.map((employee) =>
        todayStr(new Date(), employee.timeZone || undefined)
      )
    ),
  ];

  const attendanceByUser = new Map();

  for (const dateKey of dateKeys) {
    const rows = await Attendance.find({ dateKey }).lean();

    for (const row of rows) {
      attendanceByUser.set(
        `${String(row.userId ?? row.user)}|${dateKey}`,
        row
      );
    }
  }

  // Employees with a valid (not revoked, not expired) refresh token are signed in.
  let signedInIds = new Set();

  try {
    const tokens = await RefreshToken.find({
      revoked: false,
      expiresAt: { $gt: new Date() },
    }).lean();

    signedInIds = new Set(
      tokens.map((token) => String(token.userId ?? token.user))
    );
  } catch {
    // Session info is optional: continue without it.
  }

  const list = employees.map((employee) => {
    const id = employee._id.toString();
    const dateKey = todayStr(
      new Date(),
      employee.timeZone || undefined
    );

    const record = attendanceByUser.get(`${id}|${dateKey}`);

    let clockStatus = "not_clocked_in";

    if (record?.clockInAt) {
      clockStatus = record.clockOutAt
        ? "clocked_out"
        : "clocked_in";
    }

    return {
      id,
      name: employee.name,
      email: employee.email,
      department: employee.department || "",
      designation: employee.designation || "",
      clockStatus,
      clockInAt: record?.clockInAt || null,
      clockOutAt: record?.clockOutAt || null,
      workedMinutes: record?.workedMinutes || 0,
      signedIn: signedInIds.has(id),
    };
  });

  const order = {
    clocked_in: 0,
    clocked_out: 1,
    not_clocked_in: 2,
  };

  list.sort(
    (a, b) => order[a.clockStatus] - order[b.clockStatus]
  );

  return list;
}