
import mongoose from "mongoose";
import Finance from "../../models/finance.js";
import User from "../../models/User.js";
import Profile from "../../models/Profile.js";

const getActorId = (req) => req.user?._id;

const fail = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const validatePeriod = (month, year) => {
  const parsedMonth = Number(month);
  const parsedYear = Number(year);

  if (
    !Number.isInteger(parsedMonth) ||
    parsedMonth < 1 ||
    parsedMonth > 12 ||
    !Number.isInteger(parsedYear) ||
    parsedYear < 2000 ||
    parsedYear > 9999
  ) {
    fail(400, "A valid payroll month and year are required.");
  }

  return { month: parsedMonth, year: parsedYear };
};

const getNetPay = (record) =>
  Number(record.salary || 0) +
  Number(record.bonus || 0) -
  Number(record.deduction || 0);

const getProfile = (userId) =>
  Profile.findOne({ user: userId }).lean();

const getEmployeeName = (user, profile) =>
  profile?.fullName ||
  user?.name ||
  profile?.userName ||
  user?.email ||
  "Unknown Employee";

const getEmployeeRole = (user, profile) =>
  profile?.jobTitle ||
  user?.designation ||
  user?.role ||
  "Employee";

const getDepartment = (user, profile, record) =>
  record?.department ||
  user?.department ||
  profile?.department ||
  "Unassigned";

const formatDate = (date) => {
  if (!date) return "Not scheduled";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const serializePayroll = async (record) => {
  const employeeId = record.employee?._id || record.employee;

  const user =
    record.employee && typeof record.employee === "object"
      ? record.employee
      : await User.findOne({
          _id: employeeId,
          isDeleted: false,
        }).lean();

  if (!user) return null;

  const profile = await getProfile(user._id);

  return {
    id: String(record._id),
    employeeId: String(user._id),
    name: getEmployeeName(user, profile),
    role: getEmployeeRole(user, profile),
    department: getDepartment(user, profile, record),
    salary: Number(record.salary || 0),
    bonus: Number(record.bonus || 0),
    deduction: Number(record.deduction || 0),
    netPay: getNetPay(record),
    bank: record.bank || profile?.bankName || "",
    account: record.account || profile?.accountNumber || "",
    date: formatDate(record.paymentDate),
    paymentDate: record.paymentDate,
    periodMonth: record.periodMonth,
    periodYear: record.periodYear,
    status: record.status,
    notes: record.notes || "",
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

const getChartLabel = (date, range) =>
  date.toLocaleDateString(
    "en-US",
    range === "Week"
      ? { weekday: "short", timeZone: "UTC" }
      : { month: "short", timeZone: "UTC" }
  );

const getRangeSeries = async (range, year, month) => {
  const now = new Date();
  let start;
  let end;
  const periods = [];

  if (range === "Week") {
    const today = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      )
    );

    start = new Date(today);
    start.setUTCDate(start.getUTCDate() - 6);

    end = new Date(today);
    end.setUTCDate(end.getUTCDate() + 1);

    for (
      let date = new Date(start);
      date < end;
      date.setUTCDate(date.getUTCDate() + 1)
    ) {
      const pointDate = new Date(date);

      periods.push({
        key: pointDate.toISOString().slice(0, 10),
        label: getChartLabel(pointDate, "Week"),
      });
    }
  } else if (range === "Year") {
    start = new Date(Date.UTC(year, 0, 1));
    end = new Date(Date.UTC(year + 1, 0, 1));

    for (let m = 0; m < 12; m += 1) {
      const date = new Date(Date.UTC(year, m, 1));

      periods.push({
        key: `${year}-${String(m + 1).padStart(2, "0")}`,
        label: getChartLabel(date, "Year"),
      });
    }
  } else {
    start = new Date(Date.UTC(year, month - 1, 1));
    end = new Date(Date.UTC(year, month, 1));

    for (
      let date = new Date(start);
      date < end;
      date.setUTCDate(date.getUTCDate() + 1)
    ) {
      const pointDate = new Date(date);

      periods.push({
        key: pointDate.toISOString().slice(0, 10),
        label: String(pointDate.getUTCDate()),
      });
    }
  }

  const records = await Finance.find({
    paymentDate: { $gte: start, $lt: end },
    status: "Completed",
  })
    .select("salary bonus deduction paymentDate periodMonth periodYear")
    .lean();

  const totals = new Map(
    periods.map((period) => [period.key, 0])
  );

  for (const record of records) {
    if (!record.paymentDate) continue;

    const date = new Date(record.paymentDate);

    const key =
      range === "Year"
        ? `${date.getUTCFullYear()}-${String(
            date.getUTCMonth() + 1
          ).padStart(2, "0")}`
        : date.toISOString().slice(0, 10);

    if (totals.has(key)) {
      totals.set(
        key,
        totals.get(key) + getNetPay(record)
      );
    }
  }

  return periods.map((period) => ({
    label: period.label,
    value:
      Math.round((totals.get(period.key) / 1000) * 100) / 100,
  }));
};

export const getFinanceDashboard = async (query = {}) => {
  const now = new Date();

  const { month, year } = validatePeriod(
    query.month || now.getMonth() + 1,
    query.year || now.getFullYear()
  );

  const records = await Finance.find({
    periodMonth: month,
    periodYear: year,
  })
    .populate(
      "employee",
      "name email role department designation isDeleted status"
    )
    .sort({ createdAt: -1 })
    .lean();

  const validRecords = records.filter(
    (record) =>
      record.employee &&
      !record.employee.isDeleted &&
      record.employee.status === "active"
  );

  const totalPayroll = validRecords.reduce(
    (sum, record) => sum + Number(record.salary || 0),
    0
  );

  const totalBonus = validRecords.reduce(
    (sum, record) => sum + Number(record.bonus || 0),
    0
  );

  const totalDeductions = validRecords.reduce(
    (sum, record) => sum + Number(record.deduction || 0),
    0
  );

  const completed = validRecords.filter(
    (record) => record.status === "Completed"
  );

  const pending = validRecords.filter(
    (record) => record.status === "Pending"
  );

  const paidAmount = completed.reduce(
    (sum, record) => sum + getNetPay(record),
    0
  );

  const pendingAmount = pending.reduce(
    (sum, record) => sum + getNetPay(record),
    0
  );

  const [
    weekSeries,
    monthSeries,
    yearSeries,
    employeeCount,
  ] = await Promise.all([
    getRangeSeries("Week", year, month),
    getRangeSeries("Month", year, month),
    getRangeSeries("Year", year, month),
    User.countDocuments({
      role: { $nin: ["admin", "superadmin"] },
      isDeleted: false,
      status: "active",
    }),
  ]);

  const alerts = pending
    .filter(
      (record) =>
        record.paymentDate &&
        new Date(record.paymentDate) < now
    )
    .map((record) => ({
      id: String(record._id),
      text: `Overdue payroll payment: PKR ${getNetPay(
        record
      ).toLocaleString("en-PK")}`,
      date: formatDate(record.paymentDate),
    }));

  return {
    period: { month, year },
    stats: [
      {
        id: "total-payroll",
        label: "Total Payroll",
        value: `PKR ${totalPayroll.toLocaleString("en-PK")}`,
        sub: `${validRecords.length} payroll records`,
        tone: "red",
      },
      {
        id: "paid-payroll",
        label: "Paid Payroll",
        value: `PKR ${paidAmount.toLocaleString("en-PK")}`,
        sub: `${completed.length} completed payments`,
        tone: "green",
      },
      {
        id: "pending-payroll",
        label: "Pending Payroll",
        value: `PKR ${pendingAmount.toLocaleString("en-PK")}`,
        sub: `${pending.length} pending payments`,
        tone: "amber",
      },
      {
        id: "total-deductions",
        label: "Total Deductions",
        value: `PKR ${totalDeductions.toLocaleString("en-PK")}`,
        sub: `${employeeCount} active employees`,
        tone: "danger",
      },
    ],
    chart: {
      Week: weekSeries,
      Month: monthSeries,
      Year: yearSeries,
    },
    alerts,
    summary: {
      totalPayroll,
      totalBonus,
      totalDeductions,
      paidAmount,
      pendingAmount,
      employeeCount,
      totalRecords: validRecords.length,
    },
  };
};

export const getPayrollRecords = async (query = {}) => {
  const page = Math.max(
    1,
    Number.parseInt(query.page, 10) || 1
  );

  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(query.limit, 10) || 5)
  );

  const filter = {};

  if (query.status && query.status !== "All") {
    if (!["Pending", "Completed"].includes(query.status)) {
      fail(400, "Invalid payroll status.");
    }

    filter.status = query.status;
  }

  if (query.month || query.year) {
    const now = new Date();

    const period = validatePeriod(
      query.month || now.getMonth() + 1,
      query.year || now.getFullYear()
    );

    filter.periodMonth = period.month;
    filter.periodYear = period.year;
  }

  if (query.employeeId) {
    if (!mongoose.isValidObjectId(query.employeeId)) {
      fail(400, "Invalid employee ID.");
    }

    filter.employee = query.employeeId;
  }

  const records = await Finance.find(filter)
    .populate(
      "employee",
      "name email role department designation isDeleted status"
    )
    .sort({ createdAt: -1 })
    .lean();

  let employees = await Promise.all(
    records.map(serializePayroll)
  );

  employees = employees.filter(Boolean);

  const search = String(query.search || "")
    .trim()
    .toLowerCase();

  const department = String(query.department || "").trim();

  if (search) {
    employees = employees.filter((record) =>
      [record.name, record.role, record.department].some(
        (value) =>
          String(value || "").toLowerCase().includes(search)
      )
    );
  }

  if (department && department !== "All") {
    employees = employees.filter(
      (record) => record.department === department
    );
  }

  const total = employees.length;
  const totalPages = Math.max(
    1,
    Math.ceil(total / limit)
  );

  employees = employees.slice(
    (page - 1) * limit,
    page * limit
  );

  const departments = [
    ...new Set(
      (
        await Promise.all(
          records.map(async (record) => {
            const user = record.employee;

            if (!user) return null;

            const profile = await getProfile(user._id);

            return getDepartment(user, profile, record);
          })
        )
      ).filter(Boolean)
    ),
  ];

  return {
    employees,
    departments,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const createPayroll = async (payload, req) => {
  const {
    employeeId,
    salary,
    bonus = 0,
    deduction = 0,
    bank = "",
    account = "",
    paymentDate,
    periodMonth,
    periodYear,
    status = "Pending",
    notes = "",
  } = payload;

  if (!mongoose.isValidObjectId(employeeId)) {
    fail(400, "A valid employee ID is required.");
  }

  const period = validatePeriod(periodMonth, periodYear);

  for (const [field, value] of Object.entries({
    salary,
    bonus,
    deduction,
  })) {
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < 0
    ) {
      fail(
        400,
        `${field} must be a non-negative number.`
      );
    }
  }

  if (!["Pending", "Completed"].includes(status)) {
    fail(400, "Invalid payroll status.");
  }

  if (
    paymentDate &&
    Number.isNaN(Date.parse(paymentDate))
  ) {
    fail(400, "Invalid payment date.");
  }

  const user = await User.findOne({
    _id: employeeId,
    isDeleted: false,
    status: "active",
    role: { $nin: ["admin", "superadmin"] },
  }).lean();

  if (!user) {
    fail(404, "Active employee not found.");
  }

  const profile = await getProfile(user._id);

  const record = await Finance.create({
    employee: user._id,
    salary,
    bonus,
    deduction,
    department: user.department || profile?.department || "",
    bank: bank || profile?.bankName || "",
    account: account || profile?.accountNumber || "",
    paymentDate: paymentDate || null,
    periodMonth: period.month,
    periodYear: period.year,
    status,
    notes,
    createdBy: getActorId(req),
  });

  return serializePayroll(record.toObject());
};

export const updatePayroll = async (id, payload, req) => {
  if (!mongoose.isValidObjectId(id)) {
    fail(400, "Invalid payroll record ID.");
  }

  const record = await Finance.findById(id);

  if (!record) {
    fail(404, "Payroll record not found.");
  }

  const fields = [
    "salary",
    "bonus",
    "deduction",
    "bank",
    "account",
    "paymentDate",
    "periodMonth",
    "periodYear",
    "status",
    "notes",
  ];

  for (const field of fields) {
    if (
      Object.prototype.hasOwnProperty.call(payload, field)
    ) {
      record[field] = payload[field];
    }
  }

  for (const field of ["salary", "bonus", "deduction"]) {
    if (
      typeof record[field] !== "number" ||
      !Number.isFinite(record[field]) ||
      record[field] < 0
    ) {
      fail(
        400,
        `${field} must be a non-negative number.`
      );
    }
  }

  if (!["Pending", "Completed"].includes(record.status)) {
    fail(400, "Invalid payroll status.");
  }

  if (
    record.paymentDate &&
    Number.isNaN(Date.parse(record.paymentDate))
  ) {
    fail(400, "Invalid payment date.");
  }

  const period = validatePeriod(
    record.periodMonth,
    record.periodYear
  );

  record.periodMonth = period.month;
  record.periodYear = period.year;
  record.updatedBy = getActorId(req);

  await record.save();

  return serializePayroll(record.toObject());
};

export const deletePayroll = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    fail(400, "Invalid payroll record ID.");
  }

  const record = await Finance.findByIdAndDelete(id);

  if (!record) {
    fail(404, "Payroll record not found.");
  }

  return { id: String(record._id) };
};

export const getMyFinanceDashboard = async (
  userId,
  query = {}
) => {
  if (!mongoose.isValidObjectId(userId)) {
    fail(401, "Authenticated employee is invalid.");
  }

  const now = new Date();

  const { month, year } = validatePeriod(
    query.month || now.getMonth() + 1,
    query.year || now.getFullYear()
  );

  const currentRecords = await Finance.find({
    employee: userId,
    periodMonth: month,
    periodYear: year,
  })
    .sort({ createdAt: -1 })
    .lean();

  const totalSalary = currentRecords.reduce(
    (sum, record) =>
      sum + Number(record.salary || 0),
    0
  );

  const totalBonus = currentRecords.reduce(
    (sum, record) =>
      sum + Number(record.bonus || 0),
    0
  );

  const totalDeduction = currentRecords.reduce(
    (sum, record) =>
      sum + Number(record.deduction || 0),
    0
  );

  const completed = currentRecords.filter(
    (record) => record.status === "Completed"
  );

  const pending = currentRecords.filter(
    (record) => record.status === "Pending"
  );

  const startDate = new Date(
    Date.UTC(year, month - 12, 1)
  );

  const endDate = new Date(
    Date.UTC(year, month, 1)
  );

  const historyRecords = await Finance.find({
    employee: userId,
    periodYear: {
      $gte: startDate.getUTCFullYear(),
      $lte: year,
    },
  })
    .sort({
      periodYear: 1,
      periodMonth: 1,
    })
    .lean();

  const startKey =
    startDate.getUTCFullYear() * 12 +
    startDate.getUTCMonth();

  const endKey =
    endDate.getUTCFullYear() * 12 +
    endDate.getUTCMonth();

  const monthlyTotals = new Map();

  for (const record of historyRecords) {
    const recordKey =
      Number(record.periodYear) * 12 +
      Number(record.periodMonth) -
      1;

    if (recordKey < startKey || recordKey >= endKey) {
      continue;
    }

    const key = `${record.periodYear}-${String(
      record.periodMonth
    ).padStart(2, "0")}`;

    monthlyTotals.set(
      key,
      (monthlyTotals.get(key) || 0) +
        getNetPay(record)
    );
  }

  const earnings = [];

  for (
    let date = new Date(startDate);
    date < endDate;
    date.setUTCMonth(date.getUTCMonth() + 1)
  ) {
    const pointDate = new Date(date);

    const key = `${pointDate.getUTCFullYear()}-${String(
      pointDate.getUTCMonth() + 1
    ).padStart(2, "0")}`;

    earnings.push({
      month: pointDate.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }),
      value: monthlyTotals.get(key) || 0,
    });
  }

  return {
    period: { month, year },
    summary: {
      monthlySalary: totalSalary,
      bonus: totalBonus,
      deduction: totalDeduction,
      netSalary:
        totalSalary + totalBonus - totalDeduction,
      paidAmount: completed.reduce(
        (sum, record) => sum + getNetPay(record),
        0
      ),
      pendingAmount: pending.reduce(
        (sum, record) => sum + getNetPay(record),
        0
      ),
      totalRecords: currentRecords.length,
    },
    earnings,
    payroll: currentRecords.map((record) => ({
      id: String(record._id),
      salary: Number(record.salary || 0),
      bonus: Number(record.bonus || 0),
      deduction: Number(record.deduction || 0),
      netPay: getNetPay(record),
      paymentDate: record.paymentDate,
      periodMonth: record.periodMonth,
      periodYear: record.periodYear,
      status: record.status,
      bank: record.bank || "",
    })),
  };
};

export const getMyPayrollRecords = async (
  userId,
  query = {}
) => {
  if (!mongoose.isValidObjectId(userId)) {
    fail(401, "Authenticated employee is invalid.");
  }

  return getPayrollRecords({
    ...query,
    employeeId: String(userId),
  });
};
