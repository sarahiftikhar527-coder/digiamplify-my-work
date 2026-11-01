
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import User from "../../models/User.js";
import Task from "../../models/Task.js";
import Calendar from "../../models/Calendar.js";
import Attendance from "./attendance.model.js";
import { ROLES } from "../../constants/roles.js";

const DEFAULT_TIME_ZONE = "Asia/Karachi";

const fail = (status, message, code = "ATTENDANCE_ERROR") =>
  Object.assign(new Error(message), {
    status,
    statusCode: status,
    code,
  });

function logAttendanceError(label, error) {
  console.error(`[ATTENDANCE] ${label}`, {
    message: error?.message,
    name: error?.name,
    code: error?.code,
    keyPattern: error?.keyPattern,
    keyValue: error?.keyValue,
    errors: error?.errors
      ? Object.fromEntries(
          Object.entries(error.errors).map(([key, value]) => [
            key,
            value.message,
          ])
        )
      : undefined,
  });
}

function normalizeTimeZone(timeZone) {
  if (!timeZone || typeof timeZone !== "string") {
    return DEFAULT_TIME_ZONE;
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

function dateParts(date = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: normalizeTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );
}

export function todayStr(
  date = new Date(),
  timeZone = DEFAULT_TIME_ZONE
) {
  const values = dateParts(date, timeZone);

  return `${values.year}-${values.month}-${values.day}`;
}

/*
|--------------------------------------------------------------------------
| Timezone Date Helpers
|--------------------------------------------------------------------------
*/

function getZonedDateTimeAsUTC(dateKey, timeZone) {
  const [year, month, day] = dateKey.split("-").map(Number);

  const targetUTC = Date.UTC(year, month - 1, day);
  let guess = targetUTC;

  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: normalizeTimeZone(timeZone),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(guess));

    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value])
    );

    const representedUTC = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second)
    );

    guess += targetUTC - representedUTC;
  }

  return new Date(guess);
}

function getNextDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);

  const nextDay = new Date(
    Date.UTC(year, month - 1, day + 1)
  );

  return nextDay.toISOString().slice(0, 10);
}

/*
|--------------------------------------------------------------------------
| Attendance Status
|--------------------------------------------------------------------------
| Late status is disabled completely.
| Anyone who clocks in receives "present".
|--------------------------------------------------------------------------
*/

function statusFromClockIn(clockInAt) {
  if (!clockInAt) return "absent";

  return "present";
}

function workedMinutes(record) {
  if (!record?.clockInAt) return 0;

  const start = new Date(record.clockInAt).getTime();

  const end = record.clockOutAt
    ? new Date(record.clockOutAt).getTime()
    : Date.now();

  return Math.max(0, Math.floor((end - start) / 60000));
}

function serializeRecord(record) {
  if (!record) return null;

  return {
    id: String(record._id),
    dateKey: record.dateKey,
    clockInAt: record.clockInAt || null,
    clockOutAt: record.clockOutAt || null,
    workedMinutes: workedMinutes(record),
    description: record.description || "",
    status: record.clockInAt ? "present" : "absent",
  };
}

async function getEmployeeTimeZone(userId) {
  const user = await User.findById(userId)
    .select("timeZone")
    .lean();

  return normalizeTimeZone(user?.timeZone);
}

function validatePin(pin) {
  const value = String(pin ?? "").trim();

  if (!/^\d{4}$/.test(value)) {
    throw fail(
      400,
      "Enter your 4-digit PIN.",
      "INVALID_PIN_FORMAT"
    );
  }

  return value;
}

async function verifyPin(userId, pin) {
  const value = validatePin(pin);

  const user = await User.findOne({
    _id: userId,
    status: "active",
    isDeleted: false,
  }).select("+pinHash");

  if (!user || !user.pinHash) {
    throw fail(
      400,
      "Set your attendance PIN before clocking in.",
      "PIN_NOT_SET"
    );
  }

  const matches = await bcrypt.compare(value, user.pinHash);

  if (!matches) {
    throw fail(401, "Incorrect PIN.", "INVALID_PIN");
  }

  return user;
}

async function findTodayRecord(userId, dateKey) {
  return Attendance.findOne({
    user: userId,
    dateKey,
  });
}

async function findLatestTodayRecord(userId, dateKey) {
  return Attendance.findOne({
    user: userId,
    dateKey,
  });
}

function alreadyClockedInResult(record) {
  return {
    message: record.clockOutAt
      ? "You have already completed attendance for today."
      : "You are already clocked in today.",
    alreadyClockedIn: true,
    record: serializeRecord(record),
  };
}

function successfulClockInResult(record) {
  return {
    message: "Clock In successful.",
    alreadyClockedIn: false,
    record: serializeRecord(record),
  };
}

async function claimClockIn(userId, dateKey, now) {
  return Attendance.findOneAndUpdate(
    {
      user: userId,
      dateKey,
      $or: [
        { clockInAt: null },
        { clockInAt: { $exists: false } },
      ],
    },
    {
      $set: {
        clockInAt: now,
        clockOutAt: null,
        workedMinutes: 0,
        status: "present",
        description: "",
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Shifts
|--------------------------------------------------------------------------
| Shifts live in the Calendar collection with eventType "shift".
|--------------------------------------------------------------------------
*/

const INACTIVE_SHIFT_STATUSES = [
  "completed",
  "cancelled",
  "rejected",
  "absent",
];

async function getTodayShifts(userId, dateKey, timeZone) {
  const candidates = await Calendar.find({
    eventType: "shift",
    employeeId: userId,
    status: { $nin: INACTIVE_SHIFT_STATUSES },
    from: { $lte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    to: { $gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  })
    .sort({ startTime: 1 })
    .lean();

  return candidates
    .map((shift) => ({
      id: String(shift._id),
      startDate: todayStr(new Date(shift.from), timeZone),
      endDate: todayStr(new Date(shift.to), timeZone),
      startTime: shift.startTime || "",
      endTime: shift.endTime || "",
      breakStart: shift.breakStart || "",
      breakEnd: shift.breakEnd || "",
      status: shift.status,
      completed: shift.status === "completed",
    }))
    .filter(
      (shift) =>
        shift.startTime &&
        shift.startDate <= dateKey &&
        shift.endDate >= dateKey
    );
}

/*
|--------------------------------------------------------------------------
| Employee: Today's Assigned Tasks
|--------------------------------------------------------------------------
| Only tasks assigned to the logged-in employee are returned.
| Due date is filtered using the employee's timezone.
|--------------------------------------------------------------------------
*/

async function getTodayTasks(userId, dateKey, timeZone) {
  const nextDateKey = getNextDateKey(dateKey);

  const startOfDay = getZonedDateTimeAsUTC(
    dateKey,
    timeZone
  );

  const startOfNextDay = getZonedDateTimeAsUTC(
    nextDateKey,
    timeZone
  );

  const tasks = await Task.find({
    assignedTo: userId,
    dueDate: {
      $gte: startOfDay,
      $lt: startOfNextDay,
    },
  })
    .select("title priority status dueDate")
    .sort({ dueDate: 1, createdAt: 1 })
    .lean();

  return tasks.map((task) => ({
    id: String(task._id),
    title: task.title,
    priority: String(task.priority || "Low").toLowerCase(),
    status: task.status,
    completed: task.status === "completed",
    dueAt: task.dueDate || null,
    dueDate: task.dueDate || null,
  }));
}

/*
|--------------------------------------------------------------------------
| Employee: Today's Attendance
|--------------------------------------------------------------------------
*/

export async function getMyToday(userId) {
  const timeZone = await getEmployeeTimeZone(userId);
  const dateKey = todayStr(new Date(), timeZone);

  const [user, record, shifts, tasks] = await Promise.all([
    User.findById(userId).select(
      "name email department designation timeZone +pinHash"
    ),

    findTodayRecord(userId, dateKey),

    getTodayShifts(userId, dateKey, timeZone),

    getTodayTasks(userId, dateKey, timeZone),
  ]);

  if (!user) {
    throw fail(
      404,
      "Employee account was not found.",
      "USER_NOT_FOUND"
    );
  }

  return {
    serverTime: new Date().toISOString(),

    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      designation: user.designation,
    },

    dateKey,

    shifts,
    shift: shifts[0] || null,

    tasks,

    hasPin: Boolean(user.pinHash),

    record: serializeRecord(record),
  };
}

/*
|--------------------------------------------------------------------------
| Employee: Complete Assigned Shift
|--------------------------------------------------------------------------
*/

export async function completeMyShift(userId, shiftId) {
  if (!mongoose.isValidObjectId(shiftId)) {
    throw fail(
      400,
      "Invalid shift ID.",
      "INVALID_SHIFT_ID"
    );
  }

  const updated = await Calendar.findOneAndUpdate(
    {
      _id: shiftId,
      eventType: "shift",
      employeeId: userId,
      status: { $nin: ["completed", "cancelled"] },
    },
    {
      $set: { status: "completed" },
    },
    { new: true }
  );

  if (!updated) {
    throw fail(
      404,
      "Shift not found or already completed.",
      "SHIFT_NOT_FOUND"
    );
  }

  return {
    message: "Shift marked as completed.",
  };
}

/*
|--------------------------------------------------------------------------
| Employee: Recent Attendance
|--------------------------------------------------------------------------
*/

export async function getMyRecent(userId, limit = 30) {
  const timeZone = await getEmployeeTimeZone(userId);

  const safeLimit = Math.min(
    90,
    Math.max(1, Number(limit) || 30)
  );

  const currentDate = todayStr(new Date(), timeZone);

  const records = await Attendance.find({
    user: userId,
    dateKey: { $lt: currentDate },
    clockInAt: { $ne: null },
  })
    .sort({ dateKey: -1 })
    .limit(safeLimit)
    .lean();

  return records.map((record) => serializeRecord(record));
}

/*
|--------------------------------------------------------------------------
| Employee: Monthly Absenteeism
|--------------------------------------------------------------------------
*/

export async function getMyAbsenteeism(userId, month) {
  if (!mongoose.isValidObjectId(userId)) {
    throw fail(
      400,
      "Invalid employee ID.",
      "INVALID_USER_ID"
    );
  }

  const timeZone = await getEmployeeTimeZone(userId);

  const currentMonth = todayStr(
    new Date(),
    timeZone
  ).slice(0, 7);

  const selectedMonth = month || currentMonth;

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth)) {
    throw fail(
      400,
      "Month must be in YYYY-MM format.",
      "INVALID_MONTH"
    );
  }

  if (selectedMonth > currentMonth) {
    return {
      month: selectedMonth,
      timezone: timeZone,
      absent: 0,
      total: 0,
      percentage: 0,
      absentDates: [],
    };
  }

  const [year, monthNumber] = selectedMonth
    .split("-")
    .map(Number);

  const lastDay = new Date(
    Date.UTC(year, monthNumber, 0)
  ).getUTCDate();

  const monthEnd =
    `${selectedMonth}-${String(lastDay).padStart(2, "0")}`;

  const endDate =
    selectedMonth === currentMonth
      ? todayStr(new Date(), timeZone)
      : monthEnd;

  const records = await Attendance.find({
    user: userId,
    dateKey: {
      $gte: `${selectedMonth}-01`,
      $lte: endDate,
    },
    status: "absent",
    clockInAt: null,
  })
    .select("dateKey status clockInAt")
    .sort({ dateKey: 1 })
    .lean();

  const absentDates = [
    ...new Set(
      records
        .filter((record) => !record.clockInAt)
        .map((record) => record.dateKey)
    ),
  ];

  return {
    month: selectedMonth,
    timezone: timeZone,
    absent: absentDates.length,
    total: 0,
    percentage: 0,
    absentDates,
  };
}

/*
|--------------------------------------------------------------------------
| Employee: Clock In
|--------------------------------------------------------------------------
*/

export async function clockIn(userId, pin) {
  const user = await verifyPin(userId, pin);

  const timeZone = normalizeTimeZone(user.timeZone);
  const dateKey = todayStr(new Date(), timeZone);
  const now = new Date();

  try {
    const existing = await findLatestTodayRecord(
      userId,
      dateKey
    );

    if (existing?.clockInAt) {
      return alreadyClockedInResult(existing);
    }

    if (existing) {
      const updated = await claimClockIn(
        userId,
        dateKey,
        now
      );

      if (updated) {
        return successfulClockInResult(updated);
      }

      const latest = await findLatestTodayRecord(
        userId,
        dateKey
      );

      if (latest?.clockInAt) {
        return alreadyClockedInResult(latest);
      }

      throw fail(
        409,
        "Attendance could not be updated. Please try again.",
        "ATTENDANCE_UPDATE_CONFLICT"
      );
    }

    const created = await Attendance.create({
      user: userId,
      dateKey,
      clockInAt: now,
      clockOutAt: null,
      workedMinutes: 0,
      status: "present",
      description: "",
    });

    return successfulClockInResult(created);
  } catch (error) {
    logAttendanceError(
      "Clock In save/update failed",
      error
    );

    if (error.code === 11000) {
      const latest = await findLatestTodayRecord(
        userId,
        dateKey
      );

      if (latest?.clockInAt) {
        return alreadyClockedInResult(latest);
      }

      if (latest) {
        try {
          const updated = await claimClockIn(
            userId,
            dateKey,
            now
          );

          if (updated) {
            return successfulClockInResult(updated);
          }

          const current = await findLatestTodayRecord(
            userId,
            dateKey
          );

          if (current?.clockInAt) {
            return alreadyClockedInResult(current);
          }
        } catch (updateError) {
          logAttendanceError(
            "Duplicate record update failed",
            updateError
          );
        }
      }

      throw fail(
        409,
        "Attendance could not be saved. Please check the backend error and try again.",
        "ATTENDANCE_CREATE_CONFLICT"
      );
    }

    if (
      error.code === "ATTENDANCE_UPDATE_CONFLICT" ||
      error.code === "ATTENDANCE_CREATE_CONFLICT"
    ) {
      throw error;
    }

    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| Employee: Clock Out
|--------------------------------------------------------------------------
*/

export async function clockOut(
  userId,
  pin,
  description = ""
) {
  const user = await verifyPin(userId, pin);

  const timeZone = normalizeTimeZone(user.timeZone);
  const note = String(description ?? "").trim();

  if (!note) {
    throw fail(
      400,
      "Please enter your work description before Clock Out.",
      "DESCRIPTION_REQUIRED"
    );
  }

  if (note.length > 500) {
    throw fail(
      400,
      "Description must be 500 characters or fewer.",
      "DESCRIPTION_TOO_LONG"
    );
  }

  const dateKey = todayStr(new Date(), timeZone);

  const current = await findTodayRecord(
    userId,
    dateKey
  );

  if (!current?.clockInAt) {
    throw fail(
      400,
      "Please clock in first.",
      "NOT_CLOCKED_IN"
    );
  }

  if (current.clockOutAt) {
    return {
      message: "You are already clocked out today.",
      alreadyClockedOut: true,
      record: serializeRecord(current),
    };
  }

  const clockOutAt = new Date();

  const minutes = workedMinutes({
    clockInAt: current.clockInAt,
    clockOutAt,
  });

  const updated = await Attendance.findOneAndUpdate(
    {
      _id: current._id,
      clockOutAt: null,
    },
    {
      $set: {
        clockOutAt,
        workedMinutes: minutes,
        status: "present",
        description: note,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (updated) {
    return {
      message: "Clock Out successful.",
      alreadyClockedOut: false,
      record: serializeRecord(updated),
    };
  }

  const latest = await Attendance.findById(current._id);

  if (latest?.clockOutAt) {
    return {
      message: "You are already clocked out today.",
      alreadyClockedOut: true,
      record: serializeRecord(latest),
    };
  }

  throw fail(
    409,
    "Attendance changed while clocking out. Please refresh and try again.",
    "ATTENDANCE_CLOCK_OUT_CONFLICT"
  );
}

/*
|--------------------------------------------------------------------------
| Employee: Set Attendance PIN
|--------------------------------------------------------------------------
*/

export async function setPin(userId, password, newPin) {
  const pin = validatePin(newPin);

  if (typeof password !== "string" || !password) {
    throw fail(
      400,
      "Your current password is required.",
      "PASSWORD_REQUIRED"
    );
  }

  const user = await User.findById(userId).select(
    "+passwordHash +pinHash +pinResetTokenHash +pinResetExpires"
  );

  if (!user || !user.passwordHash) {
    throw fail(
      401,
      "Current password could not be verified.",
      "INVALID_PASSWORD"
    );
  }

  const validPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!validPassword) {
    throw fail(
      401,
      "Current password is incorrect.",
      "INVALID_PASSWORD"
    );
  }

  user.pinHash = await bcrypt.hash(pin, 12);
  user.pinResetTokenHash = undefined;
  user.pinResetExpires = undefined;

  await user.save();

  return {
    message: "Attendance PIN saved successfully.",
  };
}

/*
|--------------------------------------------------------------------------
| Forgot PIN: Send Reset Email
|--------------------------------------------------------------------------
*/

async function sendPinResetEmail(email, token) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const frontendUrl = process.env.FRONTEND_URL;

  if (!apiKey || !from || !frontendUrl) {
    throw fail(
      503,
      "PIN reset email is not configured.",
      "PIN_RESET_EMAIL_NOT_CONFIGURED"
    );
  }

  const resetUrl =
    `${frontendUrl.replace(/\/$/, "")}/reset-pin?token=${encodeURIComponent(token)}`;

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Reset your DigiAmplify attendance PIN",
        text:
          `A PIN reset was requested for your account.\n\n` +
          `Open this link to set a new PIN: ${resetUrl}\n\n` +
          `This link expires in 15 minutes. If you did not request this, ignore this email.`,
      }),
    }
  );

  if (!response.ok) {
    throw fail(
      502,
      "Unable to send the PIN reset email right now.",
      "PIN_RESET_EMAIL_FAILED"
    );
  }
}

/*
|--------------------------------------------------------------------------
| Forgot PIN: Request Reset
|--------------------------------------------------------------------------
*/

export async function requestPinReset(email) {
  const normalizedEmail = String(email ?? "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    throw fail(
      400,
      "Email is required.",
      "EMAIL_REQUIRED"
    );
  }

  const user = await User.findOne({
    email: normalizedEmail,
    status: "active",
    isDeleted: false,
  }).select("+pinResetTokenHash +pinResetExpires");

  if (!user) {
    return {
      message: "If the account exists, a reset email will be sent.",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.pinResetTokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  user.pinResetExpires = new Date(
    Date.now() + 15 * 60 * 1000
  );

  await user.save();

  try {
    await sendPinResetEmail(user.email, token);
  } catch (error) {
    user.pinResetTokenHash = undefined;
    user.pinResetExpires = undefined;

    await user.save();

    throw error;
  }

  return {
    message: "If the account exists, a reset email will be sent.",
  };
}

/*
|--------------------------------------------------------------------------
| Forgot PIN: Reset PIN
|--------------------------------------------------------------------------
*/

export async function resetPin(token, newPin) {
  const pin = validatePin(newPin);

  if (typeof token !== "string" || token.length < 32) {
    throw fail(
      400,
      "Reset link is invalid or expired.",
      "INVALID_RESET_TOKEN"
    );
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    pinResetTokenHash: tokenHash,
    pinResetExpires: { $gt: new Date() },
    status: "active",
    isDeleted: false,
  }).select(
    "+pinResetTokenHash +pinResetExpires +pinHash"
  );

  if (!user) {
    throw fail(
      400,
      "Reset link is invalid or expired.",
      "INVALID_RESET_TOKEN"
    );
  }

  user.pinHash = await bcrypt.hash(pin, 12);
  user.pinResetTokenHash = undefined;
  user.pinResetExpires = undefined;

  await user.save();

  return {
    message: "PIN reset successfully.",
  };
}

/*
|--------------------------------------------------------------------------
| Admin: Attendance Overview
|--------------------------------------------------------------------------
*/

export async function getAdminOverview({
  date,
  status = "all",
  search = "",
} = {}) {
  const dateKey = date || todayStr();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw fail(
      400,
      "Date must be in YYYY-MM-DD format.",
      "INVALID_DATE"
    );
  }

  const allowedStatuses = [
    "all",
    "present",
    "late",
    "absent",
  ];

  if (!allowedStatuses.includes(status)) {
    throw fail(
      400,
      "Invalid attendance status.",
      "INVALID_STATUS"
    );
  }

  const [users, records] = await Promise.all([
    User.find({
      role: ROLES.EMPLOYEE,
      status: "active",
      isDeleted: false,
    })
      .select(
        "name email department designation timeZone"
      )
      .lean(),

    Attendance.find({ dateKey }).lean(),
  ]);

  const byUser = new Map(
    records.map((record) => [
      String(record.user),
      record,
    ])
  );

  const allRows = users.map((user) => {
    const record = byUser.get(String(user._id));
    const timeZone = normalizeTimeZone(user.timeZone);

    const rowStatus = record?.clockInAt
      ? "present"
      : "absent";

    return {
      userId: String(user._id),
      name: user.name || "Unknown",
      email: user.email || "",
      department: user.department || "",
      designation: user.designation || "",
      timeZone,
      clockInAt: record?.clockInAt || null,
      clockOutAt: record?.clockOutAt || null,
      workedMinutes: workedMinutes(record),
      description: record?.description || "",
      status: rowStatus,
    };
  });

  const stats = {
    totalEmployees: allRows.length,
    present: 0,
    late: 0,
    absent: 0,
    incomplete: 0,
    leave: 0,
  };

  for (const row of allRows) {
    stats[row.status] += 1;

    if (row.clockInAt && !row.clockOutAt) {
      stats.incomplete += 1;
    }
  }

  const query = String(search ?? "")
    .trim()
    .toLowerCase();

  const rows = allRows.filter((row) => {
    const matchesStatus =
      status === "all" || row.status === status;

    const matchesSearch =
      !query ||
      row.name.toLowerCase().includes(query) ||
      row.email.toLowerCase().includes(query) ||
      row.department.toLowerCase().includes(query) ||
      row.designation.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  return {
    date: dateKey,
    stats,
    rows,
  };
}

/*
|--------------------------------------------------------------------------
| Admin: Employee Attendance History
|--------------------------------------------------------------------------
*/

export async function getEmployeeAttendance(userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw fail(
      400,
      "Invalid employee ID.",
      "INVALID_USER_ID"
    );
  }

  const user = await User.findOne({
    _id: userId,
    role: ROLES.EMPLOYEE,
    isDeleted: false,
  })
    .select(
      "name email department designation timeZone"
    )
    .lean();

  if (!user) {
    throw fail(
      404,
      "Employee not found.",
      "EMPLOYEE_NOT_FOUND"
    );
  }

  const timeZone = normalizeTimeZone(user.timeZone);

  const records = await Attendance.find({
    user: userId,
  })
    .sort({ dateKey: -1 })
    .limit(90)
    .lean();

  return {
    employee: {
      userId: String(user._id),
      name: user.name || "",
      email: user.email || "",
      department: user.department || "",
      designation: user.designation || "",
      timeZone,
    },

    records: records.map((record) =>
      serializeRecord(record)
    ),
  };
}

/*
|--------------------------------------------------------------------------
| Admin: Set Employee PIN
|--------------------------------------------------------------------------
*/

export async function setEmployeePin(userId, newPin) {
  const pin = validatePin(newPin);

  if (!mongoose.isValidObjectId(userId)) {
    throw fail(
      400,
      "Invalid employee ID.",
      "INVALID_USER_ID"
    );
  }

  const employee = await User.findOne({
    _id: userId,
    role: ROLES.EMPLOYEE,
    status: "active",
    isDeleted: false,
  }).select(
    "+pinHash +pinResetTokenHash +pinResetExpires"
  );

  if (!employee) {
    throw fail(
      404,
      "Active employee not found.",
      "EMPLOYEE_NOT_FOUND"
    );
  }

  employee.pinHash = await bcrypt.hash(pin, 12);
  employee.pinResetTokenHash = undefined;
  employee.pinResetExpires = undefined;

  await employee.save();

  return {
    message: "Employee attendance PIN updated successfully.",
  };
}
