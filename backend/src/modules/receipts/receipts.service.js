
import { prisma } from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";
import { isFinanceUser } from "../../utils/permissions.js";
import { notifyUsers } from "../notifications/notifications.events.js";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUSES = ["Pending", "Completed"];
const METHODS = ["Bank Transfer", "Cash", "Cheque", "Online Wallet"];
const NUM = ["basic", "allowance", "overtime", "bonus", "tax", "deduction"];

const FIELDS = [
  ...NUM, "method", "reference", "bank", "account",
  "paymentDate", "status", "remarks", "month", "year",
];

const LABELS = {
  basic: "Basic salary",
  allowance: "Allowances",
  overtime: "Overtime",
  bonus: "Bonus",
  tax: "Tax",
  deduction: "Other deductions",
  method: "Payment method",
  reference: "Reference no.",
  bank: "Bank",
  account: "Account no.",
  paymentDate: "Payment date",
  status: "Status",
  remarks: "Remarks",
  month: "Month",
  year: "Year",
};

const INCLUDE = {
  employee: {
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      designation: true,
    },
  },
};

const num = (v) => Number(v || 0);
const round = (v) => Math.round(v * 100) / 100;
const isoDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const text = (v, max) => String(v ?? "").trim().slice(0, max);

// Admin and Finance Manager can see every receipt.
const isAdmin = (user) => isFinanceUser(user);

const receiptNo = (row) => {
  const d = new Date(row.createdAt);
  const ym = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  return `RCP-${ym}-${row.id.slice(0, 6).toUpperCase()}`;
};

// DB row -> editable flat values (the breakdown comes from meta.receiptMeta)
const flatten = (row) => {
  const m = row.receiptMeta || {};
  const allowance = num(m.allowance);
  const overtime = num(m.overtime);
  const tax = num(m.tax);

  return {
    basic: num(row.salary),
    allowance,
    overtime,
    bonus: round(Math.max(0, num(row.bonus) - allowance - overtime)),
    tax,
    deduction: round(Math.max(0, num(row.deduction) - tax)),
    method: m.method || "Bank Transfer",
    reference: m.reference || "",
    bank: row.bank || "",
    account: row.account || "",
    paymentDate: isoDate(row.paymentDate),
    status: row.status,
    remarks: row.notes || "",
    month: row.periodMonth,
    year: row.periodYear,
  };
};

const serialize = (row) => {
  const f = flatten(row);
  const m = row.receiptMeta || {};
  const gross = round(f.basic + f.allowance + f.overtime + f.bonus);
  const totalDeductions = round(f.tax + f.deduction);

  return {
    id: row.id,
    receiptNo: receiptNo(row),
    employee: row.employee
      ? {
          id: row.employee.id,
          name: row.employee.name,
          email: row.employee.email,
          department: row.employee.department || row.department || "",
          designation: row.employee.designation || "",
        }
      : null,
    ...f,
    periodLabel: `${MONTHS[f.month - 1] || ""} ${f.year}`,
    gross,
    totalDeductions,
    netPay: round(gross - totalDeductions),
    revision: m.revision || 1,
    history: Array.isArray(m.history) ? m.history : [],
    issuedAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

// Validate + form values -> Finance columns + receiptMeta
const build = (v) => {
  const n = {};

  for (const key of NUM) {
    const x = Number(v[key] ?? 0);

    if (!Number.isFinite(x) || x < 0) {
      throw new ApiError(400, `${LABELS[key]} must be a non-negative number.`);
    }

    n[key] = round(x);
  }

  if (n.basic <= 0) {
    throw new ApiError(400, "Basic salary must be greater than zero.");
  }

  const month = Number(v.month);
  const year = Number(v.year);

  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 9999
  ) {
    throw new ApiError(400, "A valid month and year are required.");
  }

  if (!STATUSES.includes(v.status)) {
    throw new ApiError(400, "Invalid payment status.");
  }

  const method = v.method || "Bank Transfer";

  if (!METHODS.includes(method)) {
    throw new ApiError(400, "Invalid payment method.");
  }

  let paymentDate = null;

  if (v.paymentDate) {
    paymentDate = new Date(v.paymentDate);

    if (Number.isNaN(paymentDate.getTime())) {
      throw new ApiError(400, "Invalid payment date.");
    }
  }

  if (v.status === "Completed" && !paymentDate) {
    paymentDate = new Date();
  }

  return {
    cols: {
      salary: n.basic,
      bonus: round(n.bonus + n.allowance + n.overtime),
      deduction: round(n.deduction + n.tax),
      bank: text(v.bank, 100),
      account: text(v.account, 100),
      paymentDate,
      periodMonth: month,
      periodYear: year,
      status: v.status,
      notes: text(v.remarks, 2000),
    },
    meta: {
      allowance: n.allowance,
      overtime: n.overtime,
      tax: n.tax,
      method,
      reference: text(v.reference, 80),
    },
  };
};

const diff = (before, after) =>
  FIELDS.filter((k) => String(before[k] ?? "") !== String(after[k] ?? "")).map((k) => ({
    field: LABELS[k],
    from: before[k] ?? "",
    to: after[k] ?? "",
  }));

const pick = (body = {}) =>
  Object.fromEntries(
    FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]])
  );

const notify = async (row, actor, title, message) => {
  try {
    await notifyUsers([row.employeeId], {
      from: actor?.id,
      type: "system",
      tag: "HR & Admin",
      title,
      message,
      details: "",
      link: "/finance",
      linkLabel: "Open Finances",
    });
  } catch (error) {
    console.error("Receipt notification failed:", error.message);
  }
};

const conflict = () =>
  new ApiError(
    409,
    "A payment already exists for this employee and period. Edit that receipt instead."
  );

export async function createReceipt(body, actor) {
  const user = await prisma.user.findFirst({
    where: {
      id: String(body.employeeId || ""),
      isDeleted: false,
      status: "active",
      role: { notIn: ["admin", "superadmin"] },
    },
  });

  if (!user) {
    throw new ApiError(404, "Active employee not found.");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  const now = new Date();

  const values = {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    method: "Bank Transfer",
    status: "Pending",
    ...pick(body),
  };

  if (!values.bank) values.bank = profile?.bankName || "";
  if (!values.account) values.account = profile?.accountNumber || "";

  const { cols, meta } = build(values);

  try {
    const row = await prisma.finance.create({
      data: {
        employeeId: user.id,
        department: user.department || profile?.department || "",
        ...cols,
        receiptMeta: {
          ...meta,
          revision: 1,
          history: [
            {
              rev: 1,
              at: now.toISOString(),
              by: actor?.name || "Admin",
              action: "Created",
              changes: [],
            },
          ],
        },
        createdById: actor?.id,
      },
      include: INCLUDE,
    });

    const receipt = serialize(row);

    await notify(
      row,
      actor,
      "New payment receipt",
      `Your receipt ${receipt.receiptNo} for ${receipt.periodLabel} is ready. Net pay: PKR ${receipt.netPay.toLocaleString("en-PK")}.`
    );

    return receipt;
  } catch (error) {
    if (error.code === "P2002") throw conflict();
    throw error;
  }
}

export async function updateReceipt(id, body, actor) {
  const row = await prisma.finance.findUnique({
    where: { id: String(id) },
    include: INCLUDE,
  });

  if (!row) {
    throw new ApiError(404, "Receipt not found.");
  }

  const before = flatten(row);
  const { cols, meta } = build({ ...before, ...pick(body) });
  const changes = diff(before, flatten({ ...row, ...cols, receiptMeta: meta }));

  if (!changes.length) return serialize(row);

  const old = row.receiptMeta || {};
  const revision = (old.revision || 1) + 1;

  const history = [
    ...(Array.isArray(old.history) ? old.history : []),
    {
      rev: revision,
      at: new Date().toISOString(),
      by: actor?.name || "Admin",
      action: "Edited",
      changes,
    },
  ].slice(-50);

  try {
    const saved = await prisma.finance.update({
      where: { id: row.id },
      data: {
        ...cols,
        receiptMeta: { ...meta, revision, history },
        updatedById: actor?.id,
      },
      include: INCLUDE,
    });

    const receipt = serialize(saved);

    await notify(
      saved,
      actor,
      "Payment receipt updated",
      `Your receipt ${receipt.receiptNo} (${receipt.periodLabel}) was updated. Net pay: PKR ${receipt.netPay.toLocaleString("en-PK")}.`
    );

    return receipt;
  } catch (error) {
    if (error.code === "P2002") throw conflict();
    throw error;
  }
}

export const markReceiptPaid = (id, actor) =>
  updateReceipt(id, { status: "Completed" }, actor);

export async function deleteReceipt(id) {
  const row = await prisma.finance.findUnique({
    where: { id: String(id) },
  });

  if (!row) {
    throw new ApiError(404, "Receipt not found.");
  }

  await prisma.finance.delete({
    where: { id: row.id },
  });

  return { id: row.id };
}

export async function getReceipt(id, user) {
  const row = await prisma.finance.findUnique({
    where: { id: String(id) },
    include: INCLUDE,
  });

  if (!row || (!isAdmin(user) && row.employeeId !== user.id)) {
    throw new ApiError(404, "Receipt not found.");
  }

  return serialize(row);
}

export async function listReceipts(query = {}, forEmployeeId) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const where = {};

  if (forEmployeeId) {
    where.employeeId = forEmployeeId;
  } else if (query.employeeId) {
    where.employeeId = String(query.employeeId);
  }

  if (query.status && query.status !== "All") {
    if (!STATUSES.includes(query.status)) {
      throw new ApiError(400, "Invalid payment status.");
    }

    where.status = query.status;
  }

  const month = parseInt(query.month, 10);
  const year = parseInt(query.year, 10);

  if (month) where.periodMonth = month;
  if (year) where.periodYear = year;

  if (query.department && query.department !== "All") {
    where.employee = { department: String(query.department) };
  }

  const q = String(query.search || "").trim();

  if (q) {
    const code = q.replace(/^rcp-\d{6}-/i, "").toLowerCase();

    where.OR = [
      { employee: { name: { contains: q } } },
      { id: { startsWith: code } },
    ];
  }

  const [total, rows, all] = await Promise.all([
    prisma.finance.count({ where }),

    prisma.finance.findMany({
      where,
      include: INCLUDE,
      orderBy: [
        { periodYear: "desc" },
        { periodMonth: "desc" },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.finance.findMany({
      where,
      select: {
        salary: true,
        bonus: true,
        deduction: true,
        status: true,
      },
    }),
  ]);

  const summary = all.reduce(
    (acc, r) => {
      const net = num(r.salary) + num(r.bonus) - num(r.deduction);

      acc.count += 1;
      acc.net += net;

      if (r.status === "Completed") {
        acc.paid += net;
      } else {
        acc.pending += net;
      }

      return acc;
    },
    { count: 0, net: 0, paid: 0, pending: 0 }
  );

  return {
    receipts: rows.map(serialize),
    summary,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
