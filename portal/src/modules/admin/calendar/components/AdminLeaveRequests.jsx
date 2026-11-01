import { useState } from "react";
import { CalendarDays, Check, X, MessageSquare, ChevronDown } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatRange = (from, to) => {
  const start = formatDate(from);
  const end = formatDate(to);

  if (!start && !end) return "Dates unavailable";
  if (!end || start === end) return start;
  if (!start) return end;

  return `${start} – ${end}`;
};

const getEmployeeCount = (request) => {
  if (Array.isArray(request.employees)) {
    return request.employees.length;
  }

  if (typeof request.employees === "number") {
    return request.employees;
  }

  if (request.employeeId) return 1;

  return 0;
};

const getRequestType = (request) =>
  request.type ||
  request.title ||
  request.leaveType ||
  "Leave Request";

const getEmployeeName = (request) =>
  request.employeeName ||
  request.employee?.name ||
  request.employee?.fullName ||
  request.employee?.email ||
  "Employee";

const getStatusStyle = (status) => {
  switch (String(status || "pending").toLowerCase()) {
    case "approved":
      return "border-emerald-800 bg-emerald-950/40 text-emerald-400";
    case "rejected":
    case "cancelled":
      return "border-red-900 bg-red-950/30 text-red-400";
    default:
      return "border-amber-800 bg-amber-950/30 text-amber-400";
  }
};

export default function AdminLeaveRequests({
  requests = [],
  onSelect = () => {},
  onApprove = async () => {},
  onCancel = async () => {},
  loading = false,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [comments, setComments] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  const validRequests = Array.isArray(requests) ? requests : [];

  const handleAction = async (request, action) => {
    const id = request.id || request._id;

    if (!id) {
      setError("Request ID is missing.");
      return;
    }

    const comment = String(comments[id] || "").trim();

    if (!comment) {
      setError("Please enter a comment before submitting.");
      return;
    }

    try {
      setError("");
      setProcessingId(id);

      if (action === "approve") {
        await onApprove(request, comment);
      } else {
        await onCancel(request, comment);
      }

      setComments((previous) => ({
        ...previous,
        [id]: "",
      }));

      setExpandedId(null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update this leave request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section
      className="rounded-lg border border-[#232323] bg-[#0a0a0a] p-4"
      aria-labelledby="leave-requests-title"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2
          id="leave-requests-title"
          className="text-xs font-semibold text-white"
        >
          Leave Requests
        </h2>

        <span className="rounded border border-[#2a2a2a] px-2 py-1 text-[10px] text-neutral-400">
          {validRequests.length} requests
        </span>
      </div>

      {loading ? (
        <div
          className="py-6 text-center text-xs text-neutral-400"
          role="status"
        >
          Loading leave requests...
        </div>
      ) : validRequests.length === 0 ? (
        <div className="rounded border border-dashed border-[#2a2a2a] px-3 py-6 text-center">
          <CalendarDays
            size={20}
            className="mx-auto mb-2 text-neutral-500"
          />

          <p className="text-xs text-neutral-300">
            No leave requests found.
          </p>

          <p className="mt-1 text-[10px] text-neutral-500">
            Employee leave requests will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {validRequests.map((request, index) => {
            const id =
              request.id ||
              request._id ||
              `${request.from}-${index}`;

            const status = String(request.status || "pending").toLowerCase();
            const isExpanded = expandedId === id;
            const isProcessing = processingId === id;
            const isPending = status === "pending";
            const employeeCount = getEmployeeCount(request);

            return (
              <li
                key={id}
                className="overflow-hidden rounded-lg border border-[#232323] bg-[#0d0d0d]"
              >
                <button
                  type="button"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : id);
                    setError("");
                    onSelect(request);
                  }}
                  className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
                  aria-expanded={isExpanded}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded border border-[#333] text-neutral-300">
                    <CalendarDays size={15} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-white">
                      {getRequestType(request)}
                    </span>

                    <span className="mt-1 block truncate text-[10px] text-neutral-400">
                      {getEmployeeName(request)}
                    </span>

                    <span className="mt-1 block text-[10px] text-neutral-500">
                      {formatRange(request.from, request.to)}
                    </span>
                  </span>

                  <span className="flex shrink-0 flex-col items-end gap-2">
                    <span
                      className={`rounded border px-2 py-1 text-[9px] capitalize ${getStatusStyle(status)}`}
                    >
                      {status}
                    </span>

                    <ChevronDown
                      size={14}
                      className={`text-neutral-500 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-[#232323] p-3">
                    <div className="mb-3 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-neutral-500">
                          Leave Type
                        </p>
                        <p className="mt-1 text-xs text-neutral-200">
                          {request.leaveType || getRequestType(request)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-neutral-500">
                          Employees
                        </p>
                        <p className="mt-1 text-xs text-neutral-200">
                          {employeeCount}
                        </p>
                      </div>
                    </div>

                    {request.description && (
                      <div className="mb-3">
                        <p className="text-[10px] text-neutral-500">
                          Reason for Leave
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-xs text-neutral-300">
                          {request.description}
                        </p>
                      </div>
                    )}

                    {request.comment && (
                      <div className="mb-3 rounded border border-[#292929] bg-black/30 p-3">
                        <p className="mb-1 flex items-center gap-2 text-[10px] text-neutral-400">
                          <MessageSquare size={12} />
                          Previous Comment
                        </p>
                        <p className="whitespace-pre-wrap text-xs text-neutral-300">
                          {request.comment}
                        </p>
                      </div>
                    )}

                    {isPending ? (
                      <>
                        <label
                          htmlFor={`leave-comment-${id}`}
                          className="mb-2 block text-[11px] font-medium text-neutral-300"
                        >
                          Admin Comment
                          <span className="ml-1 text-red-400">*</span>
                        </label>

                        <textarea
                          id={`leave-comment-${id}`}
                          rows={3}
                          value={comments[id] || ""}
                          onChange={(event) => {
                            setComments((previous) => ({
                              ...previous,
                              [id]: event.target.value,
                            }));
                            setError("");
                          }}
                          placeholder="Write an approval or rejection comment..."
                          disabled={isProcessing}
                          className="w-full resize-y rounded-md border border-[#303030] bg-black px-3 py-2 text-xs text-white outline-none placeholder:text-neutral-600 focus:border-red-600 disabled:opacity-50"
                        />

                        {error && expandedId === id && (
                          <p
                            className="mt-2 text-[11px] text-red-400"
                            role="alert"
                          >
                            {error}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleAction(request, "approve")}
                            disabled={isProcessing}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Check size={14} />
                            {isProcessing ? "Processing..." : "Approve Leave"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAction(request, "cancel")}
                            disabled={isProcessing}
                            className="inline-flex items-center justify-center gap-2 rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-[11px] font-semibold text-red-300 transition-colors hover:bg-red-950/60 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X size={14} />
                            Reject / Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="rounded border border-[#292929] bg-black/30 px-3 py-2 text-[11px] text-neutral-400">
                        This request has already been {status}.
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}