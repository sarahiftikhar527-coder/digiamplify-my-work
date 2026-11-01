import { useState } from "react";
import {
  FileText,
  Search,
  CheckCircle2,
  RotateCcw,
  Download,
  Eye,
  X,
} from "lucide-react";

const STATUS_LABELS = {
  submitted: "Pending Review",
  reviewed: "Reviewed",
  "needs-revision": "Needs Revision",
};

function exportReports(rows) {
  const headers = [
    "Employee",
    "Email",
    "Department",
    "Reporting Period",
    "Submission Date",
    "Status",
    "Summary",
    "Accomplishments",
    "Blockers",
    "Next Steps",
    "Admin Feedback",
  ];

  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) =>
      [
        row.name,
        row.email,
        row.department,
        row.month,
        row.date,
        STATUS_LABELS[row.status] || row.status,
        row.summary,
        row.accomplishments,
        row.blockers,
        row.nextSteps,
        row.adminFeedback,
      ]
        .map(escapeCSV)
        .join(",")
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "employee-progress-reports.csv";
  link.click();

  URL.revokeObjectURL(url);
}

export default function EmployeeProgressReport({
  progress,
  onStatusChange,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const rows = Array.isArray(progress?.rows) ? progress.rows : [];

  const filteredRows = rows.filter((row) => {
    const query = search.trim().toLowerCase();

    const matchesSearch = [
      row.name,
      row.email,
      row.department,
      row.month,
      row.summary,
    ].some((value) => String(value || "").toLowerCase().includes(query));

    const matchesFilter =
      filter === "all" || row.status === filter;

    return matchesSearch && matchesFilter;
  });

  const summary = progress?.summary || {};

  async function handleReview(report, status) {
    if (!report.id || !onStatusChange) return;

    try {
      setSavingId(report.id);
      setActionError("");

      await onStatusChange(
        report.id,
        status,
        feedback.trim()
      );

      setSelectedReport(null);
      setFeedback("");
    } catch (error) {
      setActionError(
        error?.message || "Could not update the report. Please try again."
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 text-white sm:p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold">
            Employee Progress Reports
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Reports submitted by employees and saved in the database.
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportReports(filteredRows)}
          disabled={filteredRows.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total Reports",
            value: summary.total ?? rows.length,
          },
          {
            label: "Pending Review",
            value:
              summary.submitted ??
              rows.filter((row) => row.status === "submitted").length,
          },
          {
            label: "Reviewed",
            value:
              summary.reviewed ??
              rows.filter((row) => row.status === "reviewed").length,
          },
          {
            label: "Needs Revision",
            value:
              summary.needsRevision ??
              rows.filter((row) => row.status === "needs-revision").length,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
          >
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search employee or report..."
            className="w-full rounded-lg border border-white/10 bg-black px-9 py-2.5 text-sm outline-none focus:border-red-600"
          />
        </div>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm outline-none focus:border-red-600"
        >
          <option value="all">All reports</option>
          <option value="submitted">Pending review</option>
          <option value="reviewed">Reviewed</option>
          <option value="needs-revision">Needs revision</option>
        </select>
      </div>

      {actionError && (
        <p role="alert" className="rounded-lg bg-red-950/50 p-3 text-sm text-red-300">
          {actionError}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-gray-400">
              <th className="px-3 py-3 font-medium">Employee</th>
              <th className="px-3 py-3 font-medium">Period</th>
              <th className="px-3 py-3 font-medium">Submitted</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((report) => (
              <tr
                key={report.id}
                className="border-b border-white/[0.06] last:border-0"
              >
                <td className="px-3 py-4">
                  <p className="font-medium">{report.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {report.email || report.department}
                  </p>
                </td>

                <td className="px-3 py-4 text-gray-300">
                  {report.month}
                </td>

                <td className="px-3 py-4 text-gray-300">
                  {report.date}
                </td>

                <td className="px-3 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs ${
                      report.status === "reviewed"
                        ? "bg-green-500/10 text-green-300"
                        : report.status === "needs-revision"
                          ? "bg-amber-500/10 text-amber-300"
                          : "bg-blue-500/10 text-blue-300"
                    }`}
                  >
                    {STATUS_LABELS[report.status] || report.status}
                  </span>
                </td>

                <td className="px-3 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReport(report);
                      setFeedback(report.adminFeedback || "");
                      setActionError("");
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/10"
                  >
                    <Eye size={14} />
                    View report
                  </button>
                </td>
              </tr>
            ))}

            {filteredRows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-10 text-center text-gray-500"
                >
                  {rows.length === 0
                    ? "No employee reports have been submitted yet."
                    : "No reports match your search or filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#101010] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Progress Report
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  {selectedReport.name} · {selectedReport.month}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                aria-label="Close report"
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {[
                ["Summary", selectedReport.summary],
                ["Accomplishments", selectedReport.accomplishments],
                ["Blockers", selectedReport.blockers],
                ["Next Steps", selectedReport.nextSteps],
              ].map(([label, value]) => (
                <div key={label}>
                  <h4 className="text-sm font-medium text-gray-300">
                    {label}
                  </h4>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-400">
                    {value || "Not provided"}
                  </p>
                </div>
              ))}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Admin feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  maxLength={3000}
                  rows={3}
                  placeholder="Write feedback for the employee..."
                  className="w-full rounded-lg border border-white/10 bg-black p-3 text-sm outline-none focus:border-red-600"
                />
              </div>

              <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  disabled={
                    savingId === selectedReport.id ||
                    selectedReport.status === "reviewed"
                  }
                  onClick={() => handleReview(selectedReport, "reviewed")}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium hover:bg-green-600 disabled:opacity-40"
                >
                  <CheckCircle2 size={16} />
                  Approve report
                </button>

                <button
                  type="button"
                  disabled={savingId === selectedReport.id}
                  onClick={() =>
                    handleReview(selectedReport, "needs-revision")
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 px-4 py-2.5 text-sm text-amber-300 hover:bg-amber-500/10 disabled:opacity-40"
                >
                  <RotateCcw size={16} />
                  Request revision
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-lg border border-white/10 px-4 py-2.5 text-sm hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}