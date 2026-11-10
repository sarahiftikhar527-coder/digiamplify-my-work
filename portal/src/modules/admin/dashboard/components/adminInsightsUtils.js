const num = (value) => Number(value) || 0;

const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function timeAgo(value) {
  const date = toDate(value);
  if (!date) return "";

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export const initials = (name = "") =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export function buildInsights(data, leaveRequests = []) {
  const employees = Array.isArray(data?.employees) ? data.employees : [];
  const reportRows = data?.progress?.rows || [];
  const reportSummary = data?.progress?.summary || {};

  const assigned = employees.reduce((sum, e) => sum + num(e.assigned), 0);
  const completed = employees.reduce((sum, e) => sum + num(e.completed), 0);
  const inProgress = employees.reduce((sum, e) => sum + num(e.inProgress), 0);
  const delayed = employees.reduce((sum, e) => sum + num(e.delayed), 0);
  const notStarted = Math.max(0, assigned - completed - inProgress);

  const activeCount = employees.filter((e) => e.status === "active").length;

  const completionRate = pct(completed, assigned);
  const onTrackRate = assigned > 0 ? pct(assigned - delayed, assigned) : 0;

  const reportTotal = num(reportSummary.total);
  const reviewedRate = reportTotal > 0 ? pct(num(reportSummary.reviewed), reportTotal) : 100;

  const pendingLeaves = leaveRequests.filter(
    (request) => String(request.status || "").toLowerCase() === "pending"
  ).length;

  const healthScore =
    assigned > 0
      ? Math.round(completionRate * 0.4 + onTrackRate * 0.4 + reviewedRate * 0.2)
      : null;

  const departmentMap = new Map();

  employees.forEach((employee) => {
    const name = employee.department && employee.department !== "—" ? employee.department : "Unassigned";
    const entry = departmentMap.get(name) || {
      name,
      headcount: 0,
      assigned: 0,
      completed: 0,
      delayed: 0,
    };

    entry.headcount += 1;
    entry.assigned += num(employee.assigned);
    entry.completed += num(employee.completed);
    entry.delayed += num(employee.delayed);
    departmentMap.set(name, entry);
  });

  const departments = [...departmentMap.values()]
    .map((entry) => ({ ...entry, rate: pct(entry.completed, entry.assigned) }))
    .sort((a, b) => b.headcount - a.headcount);

  const ranked = employees
    .filter((e) => num(e.assigned) > 0)
    .map((e) => ({
      ...e,
      rate: pct(num(e.completed), num(e.assigned)),
    }))
    .sort((a, b) => b.completed - a.completed || b.rate - a.rate);

  const topPerformers = ranked.slice(0, 5);

  const atRisk = employees
    .filter((e) => num(e.delayed) > 0)
    .sort((a, b) => num(b.delayed) - num(a.delayed))
    .slice(0, 5);

  const workload = [...employees]
    .filter((e) => num(e.assigned) > 0)
    .sort((a, b) => num(b.assigned) - num(a.assigned))
    .slice(0, 8)
    .map((e) => ({
      name: String(e.name).split(" ")[0],
      fullName: e.name,
      Completed: num(e.completed),
      "In progress": num(e.inProgress),
      Overdue: num(e.delayed),
      Queued: Math.max(0, num(e.assigned) - num(e.completed) - num(e.inProgress) - num(e.delayed)),
    }));

  const reportStatus = [
    { name: "Awaiting review", value: num(reportSummary.submitted), color: "#F59E0B" },
    { name: "Reviewed", value: num(reportSummary.reviewed), color: "#22C55E" },
    { name: "Needs revision", value: num(reportSummary.needsRevision), color: "#E5383B" },
  ];

  const taskStatus = [
    { name: "Completed", value: completed, color: "#22C55E" },
    { name: "In progress", value: inProgress, color: "#3B82F6" },
    { name: "Not started", value: notStarted, color: "#6B7280" },
  ];

  const activity = [
    ...reportRows.map((report) => ({
      id: `report-${report.id}`,
      kind: "report",
      title: `${report.name} submitted a progress report`,
      meta:
        report.status === "reviewed"
          ? "Reviewed"
          : report.status === "needs-revision" || report.status === "needsRevision"
          ? "Needs revision"
          : "Awaiting review",
      tone:
        report.status === "reviewed"
          ? "green"
          : report.status === "submitted"
          ? "amber"
          : "red",
      at: report.raw?.updatedAt || report.raw?.createdAt,
    })),
    ...leaveRequests.map((request) => {
      const status = String(request.status || "pending").toLowerCase();
      const who =
        request.employeeName ||
        request.employee?.name ||
        request.user?.name ||
        request.name ||
        "An employee";

      return {
        id: `leave-${request.id}`,
        kind: "leave",
        title: `${who} requested ${request.type || request.leaveType || "leave"}`,
        meta: status.charAt(0).toUpperCase() + status.slice(1),
        tone: status === "approved" ? "green" : status === "pending" ? "amber" : "red",
        at: request.updatedAt || request.createdAt || request.appliedOn,
      };
    }),
  ]
    .filter((item) => toDate(item.at))
    .sort((a, b) => toDate(b.at) - toDate(a.at))
    .slice(0, 8);

  return {
    headcount: employees.length,
    activeCount,
    assigned,
    completed,
    inProgress,
    delayed,
    notStarted,
    completionRate,
    onTrackRate,
    reviewedRate,
    pendingLeaves,
    healthScore,
    departments,
    topPerformers,
    atRisk,
    workload,
    reportStatus,
    taskStatus,
    activity,
    pendingReports: num(reportSummary.submitted),
  };
}