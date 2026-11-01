
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  MessageSquare,
  Search,
  X,
  XCircle,
  UserRound,
  CalendarCheck,
  Send,
  FileText,
} from "lucide-react";

const FILTERS = [
  { label: "All Requests", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Declined", value: "declined" },
];

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  declined: "bg-red-500/10 text-red-400 border-red-500/20",
};

const normalizeStatus = (status) => {
  const value = String(status || "pending").toLowerCase();

  if (["approved", "accepted"].includes(value)) return "approved";
  if (["declined", "rejected", "unapproved"].includes(value)) {
    return "declined";
  }

  return "pending";
};

const getRequestId = (request) => request?.id || request?._id;
const getStartDate = (request) => request?.from || request?.startDate;
const getEndDate = (request) => request?.to || request?.endDate;
const getLeaveType = (request) => request?.type || request?.leaveType || "Leave";
const getRemarks = (request) =>
  request?.remarks || request?.adminComment || request?.admin_comment || "";

const getEmployeeName = (request) =>
  request?.employeeName ||
  request?.employee?.name ||
  request?.employee?.fullName ||
  [request?.employee?.firstName, request?.employee?.lastName]
    .filter(Boolean)
    .join(" ") ||
  "Employee";

const getEmployeeEmail = (request) =>
  request?.employeeEmail || request?.employee?.email || "Employee email unavailable";

const formatDate = (date) => {
  if (!date) return "Not specified";

  const parsed = new Date(`${String(date).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return String(date);

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDays = (request) => {
  if (Number(request?.days) > 0) return Number(request.days);

  const startValue = getStartDate(request);
  const endValue = getEndDate(request);

  if (!startValue || !endValue) return 0;

  const start = new Date(`${String(startValue).slice(0, 10)}T00:00:00`);
  const end = new Date(`${String(endValue).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  let days = 0;

  for (
    const date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    if (date.getDay() !== 0 && date.getDay() !== 6) days += 1;
  }

  return days;
};

export default function LeaveManagement({
  leaveRequests = [],
  onUpdateLeave,
  loading = false,
}) {
  const [requests, setRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminComment, setAdminComment] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setRequests(
      (Array.isArray(leaveRequests) ? leaveRequests : []).map((request) => ({
        ...request,
        id: getRequestId(request),
      }))
    );
  }, [leaveRequests]);

  const counts = useMemo(
    () =>
      requests.reduce(
        (result, request) => {
          result.all += 1;
          result[normalizeStatus(request.status)] += 1;
          return result;
        },
        { all: 0, pending: 0, approved: 0, declined: 0 }
      ),
    [requests]
  );

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const status = normalizeStatus(request.status);
      const matchesFilter = activeFilter === "all" || status === activeFilter;

      const matchesSearch = [
        getEmployeeName(request),
        getEmployeeEmail(request),
        getLeaveType(request),
        request.reason || "",
      ].some((value) => String(value).toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [requests, activeFilter, search]);

  const openDetails = (request) => {
    setSelectedRequest(request);
    setAdminComment(getRemarks(request));
    setError("");
  };

  const updateRequest = async (requestedStatus) => {
    if (!selectedRequest) return;

    const requestId = getRequestId(selectedRequest);

    if (!requestId) {
      setError("This leave request does not have a valid database ID.");
      return;
    }

    if (typeof onUpdateLeave !== "function") {
      setError("Leave API is not connected.");
      return;
    }

    const currentStatus = normalizeStatus(selectedRequest.status);
    const status =
      requestedStatus === "declined" || requestedStatus === "unapproved"
        ? "unapproved"
        : requestedStatus;

    setUpdatingId(requestId);
    setError("");

    try {
      const result = await onUpdateLeave(requestId, {
        status,
        remarks: adminComment.trim(),
      });

      const updatedRecord = result?.leave || result?.request || result?.data || result;
      const newStatus =
        currentStatus === "pending" ? status : selectedRequest.status;

      const updatedRequest = {
        ...selectedRequest,
        ...(updatedRecord && typeof updatedRecord === "object"
          ? updatedRecord
          : {}),
        status: newStatus,
        remarks: adminComment.trim(),
      };

      setRequests((current) =>
        current.map((request) =>
          String(getRequestId(request)) === String(requestId)
            ? updatedRequest
            : request
        )
      );

      setSelectedRequest(updatedRequest);
    } catch (err) {
      setError(
        err?.message || "Unable to update this request. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const isPending = selectedRequest
    ? normalizeStatus(selectedRequest.status) === "pending"
    : false;

  return (
    <section className="mt-8 space-y-6 text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-red-400">
            <CalendarDays size={19} />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              Employee Requests
            </span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Leave Management
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
            Review employee leave applications, make decisions, and share comments.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <Clock3 size={18} className="text-amber-400" />
          <div>
            <p className="text-xs text-gray-400">Awaiting review</p>
            <p className="text-lg font-semibold">{counts.pending}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Requests", value: counts.all, icon: FileText, color: "text-blue-400" },
          { label: "Pending", value: counts.pending, icon: Clock3, color: "text-amber-400" },
          { label: "Approved", value: counts.approved, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Declined", value: counts.declined, icon: XCircle, color: "text-red-400" },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-400 sm:text-sm">{item.label}</span>
                <Icon size={19} className={item.color} />
              </div>
              <p className="mt-3 text-2xl font-semibold">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0d]">
        <div className="border-b border-white/[0.08] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-semibold">Leave Applications</h3>
              <p className="mt-1 text-xs text-gray-500">
                View requests and review their current status.
              </p>
            </div>
            <div className="relative w-full lg:max-w-xs">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employees or leave type..."
                className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500/60"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  activeFilter === filter.value
                    ? "border-red-500/40 bg-red-500/10 text-red-400"
                    : "border-white/[0.08] text-gray-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {filter.label}
                <span className="ml-2 opacity-75">{counts[filter.value]}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">
            Loading leave requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <CalendarCheck size={25} className="text-gray-500" />
            </div>
            <h4 className="mt-4 font-medium">No leave requests found</h4>
            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Employee applications will appear here after they are submitted.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.07]">
            {filteredRequests.map((request, index) => {
              const status = normalizeStatus(request.status);
              const requestId = getRequestId(request) || index;

              return (
                <motion.div
                  key={requestId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.025 }}
                  className="flex flex-col gap-4 p-4 transition hover:bg-white/[0.02] sm:p-5 xl:flex-row xl:items-center xl:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                      <UserRound size={19} className="text-gray-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium">{getEmployeeName(request)}</h4>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${STATUS_STYLES[status]}`}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{getEmployeeEmail(request)}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} className="text-gray-500" />
                          {getLeaveType(request)}
                        </span>
                        <span>
                          {formatDate(getStartDate(request))} – {formatDate(getEndDate(request))}
                        </span>
                        <span>
                          {getDays(request)} {getDays(request) === 1 ? "day" : "days"}
                        </span>
                      </div>
                      {request.reason && (
                        <p className="mt-3 line-clamp-2 text-sm leading-5 text-gray-400">
                          {request.reason}
                        </p>
                      )}
                      {getRemarks(request) && (
                        <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-gray-500">
                          <MessageSquare size={14} className="mt-0.5 shrink-0" />
                          <span>Admin comment: {getRemarks(request)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openDetails(request)}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="border-t border-white/[0.08] px-4 py-3 text-xs text-gray-500 sm:px-5">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !updatingId) {
                setSelectedRequest(null);
                setError("");
              }
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="leave-details-title"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#101010] shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5 sm:p-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-red-400">
                    Leave Application
                  </p>
                  <h3 id="leave-details-title" className="mt-2 text-xl font-semibold">
                    Request Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {getEmployeeName(selectedRequest)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={Boolean(updatingId)}
                  onClick={() => {
                    setSelectedRequest(null);
                    setError("");
                  }}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                  aria-label="Close details"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Employee", value: getEmployeeName(selectedRequest) },
                    { label: "Email", value: getEmployeeEmail(selectedRequest) },
                    { label: "Leave Type", value: getLeaveType(selectedRequest) },
                    {
                      label: "Duration",
                      value: `${getDays(selectedRequest)} ${getDays(selectedRequest) === 1 ? "day" : "days"}`,
                    },
                    { label: "Start Date", value: formatDate(getStartDate(selectedRequest)) },
                    { label: "End Date", value: formatDate(getEndDate(selectedRequest)) },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                    >
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="mt-2 break-words text-sm font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium">Employee Reason</h4>
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm leading-6 text-gray-300">
                    {selectedRequest.reason || "No reason provided."}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-leave-comment"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                  >
                    <MessageSquare size={16} className="text-red-400" />
                    Admin Comment
                  </label>
                  <textarea
                    id="admin-leave-comment"
                    value={adminComment}
                    onChange={(event) => setAdminComment(event.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Write a comment or explain your decision..."
                    className="w-full resize-y rounded-xl border border-white/10 bg-black/40 p-3 text-sm leading-6 text-white outline-none placeholder:text-gray-600 focus:border-red-500/60"
                  />
                  <p className="mt-1 text-right text-xs text-gray-600">
                    {adminComment.length}/1000
                  </p>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm leading-5 text-red-300"
                  >
                    {error}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <button
                  type="button"
                  disabled={Boolean(updatingId)}
                  onClick={() => {
                    setSelectedRequest(null);
                    setError("");
                  }}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/[0.05] disabled:opacity-50"
                >
                  Close
                </button>

                {isPending ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={Boolean(updatingId)}
                      onClick={() => updateRequest("unapproved")}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      {updatingId ? "Saving..." : "Decline"}
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(updatingId)}
                      onClick={() => updateRequest("approved")}
                      className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                    >
                      <Check size={16} />
                      {updatingId ? "Saving..." : "Approve"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={Boolean(updatingId)}
                    onClick={() => updateRequest(selectedRequest.status)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                  >
                    <Send size={16} />
                    {updatingId ? "Saving..." : "Update Comment"}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
