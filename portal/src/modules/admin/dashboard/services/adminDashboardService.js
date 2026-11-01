
import apiClient from "../../../../services/api/apiClient.js";

function getBody(response) {
  return response?.data?.data ?? response?.data ?? {};
}

function getArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.employees)) return value.employees;
  if (Array.isArray(value?.users)) return value.users;
  if (Array.isArray(value?.reports)) return value.reports;
  if (Array.isArray(value?.tasks)) return value.tasks;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.docs)) return value.docs;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function formatPeriod(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMonth(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export async function getAdminDashboard() {
  const [usersResponse, tasksResponse, reportsResponse, metricsResponse] =
    await Promise.all([
      apiClient.get("/users", {
        params: { page: 1, limit: 100, role: "employee" },
      }),
      apiClient.get("/tasks/admin"),
      apiClient.get("/progress-reports/admin"),
      apiClient.get("/progress-reports/admin/metrics"),
    ]);

  const usersBody = getBody(usersResponse);
  const tasksBody = getBody(tasksResponse);
  const reportsBody = getBody(reportsResponse);
  const metricsBody = getBody(metricsResponse);

  const employees = getArray(usersBody.employees ?? usersBody.users ?? usersBody);
  const tasks = getArray(tasksBody.tasks ?? tasksBody);
  const reports = getArray(reportsBody.reports ?? reportsBody);
  const metrics = metricsBody.metrics ?? metricsBody;

  const now = new Date();
  const taskStats = new Map();

  for (const employee of employees) {
    const employeeId = employee.id || employee._id;

    if (!employeeId) continue;

    taskStats.set(String(employeeId), {
      completed: 0,
      delayed: 0,
      assigned: 0,
      inProgress: 0,
    });
  }

  for (const task of tasks) {
    const assignedTo = task.assignedTo;
    const employeeId =
      typeof assignedTo === "object"
        ? assignedTo?._id || assignedTo?.id
        : assignedTo;

    if (!employeeId) continue;

    const key = String(employeeId);

    if (!taskStats.has(key)) {
      taskStats.set(key, {
        completed: 0,
        delayed: 0,
        assigned: 0,
        inProgress: 0,
      });
    }

    const stats = taskStats.get(key);

    stats.assigned += 1;

    if (task.status === "completed") {
      stats.completed += 1;
    }

    if (task.status === "in-progress") {
      stats.inProgress += 1;
    }

    if (
      task.status !== "completed" &&
      task.dueDate &&
      new Date(task.dueDate) < now
    ) {
      stats.delayed += 1;
    }
  }

  const employeeRows = employees.map((employee) => {
    const id = String(employee.id || employee._id);
    const employeeStats = taskStats.get(id) || {
      completed: 0,
      delayed: 0,
      assigned: 0,
      inProgress: 0,
    };

    return {
      id,
      name: employee.name || "Unnamed employee",
      email: employee.email || "",
      role: employee.designation || "Employee",
      designation: employee.designation || "Employee",
      department: employee.department || "—",
      status: employee.status || "inactive",
      hours: "Not tracked",
      completed: employeeStats.completed,
      completedTasks: employeeStats.completed,
      delayed: employeeStats.delayed,
      attendance: null,
      score: null,
      assigned: employeeStats.assigned,
      inProgress: employeeStats.inProgress,
    };
  });

  const reportRows = reports.map((report) => {
    const employee = report.employee || {};

    return {
      id: String(report._id || report.id),
      employeeId: String(employee._id || employee.id || ""),
      name: employee.name || "Employee unavailable",
      email: employee.email || "",
      department: employee.department || "—",
      month: formatMonth(report.periodStart),
      date: formatPeriod(report.createdAt),
      status: report.status || "submitted",
      summary: report.summary || "",
      accomplishments: report.accomplishments || "",
      blockers: report.blockers || "",
      nextSteps: report.nextSteps || "",
      adminFeedback: report.adminFeedback || "",
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      raw: report,
    };
  });

  const stats = metrics.stats || {};
  const reportCounts = metrics.reportCounts || {};

  const pendingReports = reportRows.filter(
    (report) => report.status === "submitted"
  ).length;

  const overdueTasks = Number(stats.overdueTasks || 0);

  const activeEmployees =
    stats.activeEmployees ??
    employees.filter((employee) => employee.status === "active").length;

  const alerts = [];

  if (overdueTasks > 0) {
    alerts.push({
      id: "overdue-tasks",
      tone: "red",
      title: `${overdueTasks} tasks are overdue.`,
      desc: "Review task deadlines and current assignments.",
      action: "View Details",
    });
  }

  if (pendingReports > 0) {
    alerts.push({
      id: "pending-reports",
      tone: "amber",
      title: `${pendingReports} progress reports need review.`,
      desc: "Review the submitted employee reports.",
      action: "View Details",
    });
  }

  if ((stats.reportsNeedingRevision || 0) > 0) {
    alerts.push({
      id: "revision-reports",
      tone: "amber",
      title: `${stats.reportsNeedingRevision} reports need revision.`,
      desc: "Employees need to update these reports.",
      action: "View Details",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "all-clear",
      tone: "green",
      title: "No overdue tasks or pending reports found.",
      desc: "This summary reflects the data currently stored in the system.",
      action: "View Details",
    });
  }

  return {
    stats: [
      {
        id: "employees",
        label: "Active Employees",
        period: "Current",
        value: String(activeEmployees),
        icon: "users",
      },
      {
        id: "completed",
        label: "Tasks Completed",
        period: "This Month",
        value: String(stats.completedTasks || 0),
        icon: "check",
      },
      {
        id: "delayed",
        label: "Overdue Tasks",
        period: "Current",
        value: String(overdueTasks),
        icon: "alert",
      },
      {
        id: "reports",
        label: "Reports Pending Review",
        period: "Current",
        value: String(pendingReports),
        icon: "clock",
      },
    ],
    chart: Array.isArray(metrics.chart) ? metrics.chart : [],
    alerts,
    employees: employeeRows,
    progress: {
      summary: {
        submitted: reportCounts.submitted || 0,
        reviewed: reportCounts.reviewed || 0,
        needsRevision: reportCounts.needsRevision || 0,
        total: reportRows.length,
      },
      rows: reportRows,
    },
    summary: [
      {
        label: "Active Employees",
        value: String(activeEmployees),
      },
      {
        label: "Tasks Completed This Month",
        value: String(stats.completedTasks || 0),
      },
      {
        label: "Tasks Currently In Progress",
        value: String(stats.inProgressTasks || 0),
      },
      {
        label: "Overdue Tasks",
        value: String(overdueTasks),
      },
      {
        label: "Reports Submitted This Month",
        value: String(
          (reportCounts.submitted || 0) +
            (reportCounts.reviewed || 0) +
            (reportCounts.needsRevision || 0)
        ),
      },
    ],
  };
}

export async function reviewEmployeeProgressReport(
  reportId,
  status,
  adminFeedback = ""
) {
  const response = await apiClient.patch(
    `/progress-reports/admin/${reportId}/review`,
    { status, adminFeedback }
  );

  return getBody(response).report;
}
