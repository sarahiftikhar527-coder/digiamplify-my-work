
import User from "../../models/User.js";
import ApiError from "../../utils/ApiError.js";
import { ROLES } from "../../constants/roles.js";
import { hashPassword } from "../../utils/password.js";

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function getEmployees(filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));

  const query = {
    role: ROLES.EMPLOYEE,
    isDeleted: false,
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
      ...employee,
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

  return employee;
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

  return User.findById(employee._id).select("-passwordHash");
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

  return User.findById(employee._id).select("-passwordHash");
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

  return employee;
}
