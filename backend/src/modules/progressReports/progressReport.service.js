import mongoose from "../../utils/mongooseCompat.js";
import ProgressReport from "./progressReport.model.js";
import Task from "../../models/Task.js";
import User from "../../models/User.js";
import { ROLES } from "../../constants/roles.js";

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getMonthRange(dateValue) {
  const date = dateValue ? new Date(dateValue) : new Date();

  if (Number.isNaN(date.getTime())) {
    throw createError("Invalid reporting period.");
  }

  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );

  const end = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  return { start, end };
}

export async function submitProgressReport(employeeId, payload) {
  const { start, end } = getMonthRange(payload.periodStart);

  if (payload.periodEnd) {
    const suppliedEnd = new Date(payload.periodEnd);

    if (Number.isNaN(suppliedEnd.getTime())) {
      throw createError("Invalid reporting end date.");
    }

    if (suppliedEnd < start || suppliedEnd > end) {
      throw createError(
        "The report period must be within the selected month."
      );
    }
  }

  if (payload.periodEnd && new Date(payload.periodEnd) < start) {
    throw createError("Report end date cannot precede its start date.");
  }

  const summary = String(payload.summary || "").trim();

  if (!summary) {
    throw createError("A progress summary is required.");
  }

  const existing = await ProgressReport.findOne({
    employee: employeeId,
    periodStart: start,
  });

  if (existing?.status === "reviewed") {
    throw createError(
      "This report has already been reviewed and cannot be edited.",
      409
    );
  }

  const report = await ProgressReport.findOneAndUpdate(
    { employee: employeeId, periodStart: start },
    {
      $set: {
        periodEnd: end,
        summary,
        accomplishments: String(payload.accomplishments || "").trim(),
        blockers: String(payload.blockers || "").trim(),
        nextSteps: String(payload.nextSteps || "").trim(),
        status: "submitted",
        adminFeedback: "",
        reviewedBy: null,
        reviewedAt: null,
      },
      $setOnInsert: {
        employee: employeeId,
        periodStart: start,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).populate("employee", "name email department designation");

  return report;
}

export async function getEmployeeProgressReports(employeeId) {
  return ProgressReport.find({ employee: employeeId })
    .populate("employee", "name email department designation")
    .populate("reviewedBy", "name email")
    .sort({ periodStart: -1 })
    .lean();
}

export async function getAdminProgressReports(filters = {}) {
  const query = {};

  if (filters.status) {
    const allowed = ["submitted", "reviewed", "needs-revision"];

    if (!allowed.includes(filters.status)) {
      throw createError("Invalid report status.");
    }

    query.status = filters.status;
  }

  if (filters.employeeId) {
    if (!mongoose.isValidObjectId(filters.employeeId)) {
      throw createError("Invalid employee ID.");
    }

    query.employee = filters.employeeId;
  }

  const reports = await ProgressReport.find(query)
    .populate("employee", "name email department designation status")
    .populate("reviewedBy", "name email")
    .sort({ periodStart: -1, createdAt: -1 })
    .lean();

  return reports;
}

export async function reviewProgressReport(
  reportId,
  adminId,
  { status, adminFeedback = "" }
) {
  if (!mongoose.isValidObjectId(reportId)) {
    throw createError("Invalid report ID.");
  }

  if (!["reviewed", "needs-revision"].includes(status)) {
    throw createError(
      "Status must be reviewed or needs-revision."
    );
  }

  const report = await ProgressReport.findById(reportId);

  if (!report) {
    throw createError("Progress report not found.", 404);
  }

  report.status = status;
  report.adminFeedback = String(adminFeedback).trim();
  report.reviewedBy = adminId;
  report.reviewedAt = new Date();

  await report.save();

  return report.populate([
    { path: "employee", select: "name email department designation" },
    { path: "reviewedBy", select: "name email" },
  ]);
}

export async function getAdminProgressMetrics() {
  const now = new Date();
  const { start, end } = getMonthRange(now);

  const [
    employeeCount,
    activeEmployees,
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    reports,
    completedByDay,
  ] = await Promise.all([
    User.countDocuments({
      role: ROLES.EMPLOYEE,
      isDeleted: false,
    }),
    User.countDocuments({
      role: ROLES.EMPLOYEE,
      status: "active",
      isDeleted: false,
    }),
    Task.countDocuments({
      createdAt: { $gte: start, $lte: end },
    }),
    Task.countDocuments({
      status: "completed",
      completedAt: { $gte: start, $lte: end },
    }),
    Task.countDocuments({
      status: "in-progress",
    }),
    Task.countDocuments({
      status: { $ne: "completed" },
      dueDate: { $lt: now },
    }),
    ProgressReport.find({
      periodStart: start,
    }).lean(),
    Task.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dayOfMonth: "$completedAt",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const reportCounts = {
    submitted: reports.filter((report) => report.status === "submitted").length,
    reviewed: reports.filter((report) => report.status === "reviewed").length,
    needsRevision: reports.filter(
      (report) => report.status === "needs-revision"
    ).length,
  };

  const reportDay = new Map(
    completedByDay.map((item) => [item._id, item.count])
  );

  const chart = Array.from(
    { length: end.getDate() },
    (_, index) => {
      const day = index + 1;

      return {
        day: `${day} ${start.toLocaleString("en", { month: "short" })}`,
        completed: reportDay.get(day) || 0,
      };
    }
  );

  return {
    stats: {
      employeeCount,
      activeEmployees,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      submittedReports: reportCounts.submitted,
      reviewedReports: reportCounts.reviewed,
      reportsNeedingRevision: reportCounts.needsRevision,
    },
    chart,
    reportCounts,
  };
}