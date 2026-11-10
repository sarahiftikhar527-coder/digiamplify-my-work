import User from "../../models/User.js";
import Attendance from "../../models/Attendance.js";
import RefreshToken from "../../models/RefreshToken.js";
import { todayStr } from "../attendance/attendance.service.js";
import ApiError from "../../utils/ApiError.js";
import { ROLES } from "../../constants/roles.js";
import { hashPassword } from "../../utils/password.js";

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

  const plain = typeof user.toJSON === "function" ? user.toJSON() : { ...user };

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

  return toPublic(await User.findById(employee._id).select("-passwordHash"));
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

  return toPublic(await User.findById(employee._id).select("-passwordHash"));
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
   Signup approval flow (admin only)
------------------------------------------------------------------- */

// List signup requests that are waiting for approval (oldest first).
export async function listPendingEmployees() {
  const pending = await User.find({
    role: ROLES.EMPLOYEE,
    status: STATUS.PENDING,
    isDeleted: false,
  })
    .sort({ createdAt: 1 })
    .lean();

  return pending.map((employee) => ({
    ...toPublic(employee),
    id: employee._id.toString(),
  }));
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

// Admin approves: the employee can log in from now on.
export async function approveEmployee(id) {
  const employee = await findPendingOrFail(id);

  const updated = await User.findByIdAndUpdate(employee.id, {
    status: STATUS.ACTIVE,
  });

  return toPublic(updated);
}

// Admin declines: the employee still cannot log in.
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
    ...new Set(employees.map((e) => todayStr(new Date(), e.timeZone || undefined))),
  ];

  const attendanceByUser = new Map();

  for (const dateKey of dateKeys) {
    const rows = await Attendance.find({ dateKey }).lean();

    for (const row of rows) {
      attendanceByUser.set(`${String(row.userId ?? row.user)}|${dateKey}`, row);
    }
  }

  // Employees with a valid (not revoked, not expired) refresh token are signed in.
  let signedInIds = new Set();

  try {
    const tokens = await RefreshToken.find({
      revoked: false,
      expiresAt: { $gt: new Date() },
    }).lean();

    signedInIds = new Set(tokens.map((t) => String(t.userId ?? t.user)));
  } catch {
    // Session info is optional: continue without it.
  }

  const list = employees.map((employee) => {
    const id = employee._id.toString();
    const dateKey = todayStr(new Date(), employee.timeZone || undefined);
    const record = attendanceByUser.get(`${id}|${dateKey}`);

    let clockStatus = "not_clocked_in";
    if (record?.clockInAt) {
      clockStatus = record.clockOutAt ? "clocked_out" : "clocked_in";
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

  const order = { clocked_in: 0, clocked_out: 1, not_clocked_in: 2 };
  list.sort((a, b) => order[a.clockStatus] - order[b.clockStatus]);

  return list;
}