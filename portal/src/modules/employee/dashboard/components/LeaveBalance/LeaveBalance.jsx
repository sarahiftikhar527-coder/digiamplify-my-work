
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Plus,
  X,
} from "lucide-react";

const EMPTY = [];

const DEFAULT_TYPES = [
  { name: "Annual Leave", total: 20, used: 0 },
  { name: "Sick Leave", total: 10, used: 0 },
  { name: "Casual Leave", total: 8, used: 0 },
];

const FILTERS = ["All", "Approved", "Pending", "Unapproved"];

const TONE = {
  approved: {
    label: "Approved",
    icon: "border-green-600/60 text-green-500",
    badge: "bg-green-950/60 text-green-400",
  },
  unapproved: {
    label: "Unapproved",
    icon: "border-red-600/60 text-red-500",
    badge: "border border-red-800/60 bg-red-950/60 text-red-500",
  },
  pending: {
    label: "Pending",
    icon: "border-amber-500/60 text-amber-400",
    badge: "bg-amber-950/60 text-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: "border-gray-600/60 text-gray-400",
    badge: "bg-white/5 text-gray-400",
  },
};

const pad = (n) => String(n).padStart(2, "0");

const toKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const normalizeDate = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return toKey(date);
};

const parseISO = (value) => {
  if (!value) return null;

  const normalized = normalizeDate(value);
  if (!normalized) return null;

  const [year, month, day] = normalized.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const fmt = (value) => {
  const date = parseISO(value);

  return date
    ? date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
};

const normalizeLeave = (leave = {}) => ({
  ...leave,
  id: String(leave.id || leave._id || ""),
  type: leave.type || leave.leaveType || "Annual Leave",
  from: normalizeDate(leave.from || leave.startDate),
  to: normalizeDate(leave.to || leave.endDate),
  status: String(leave.status || "pending").toLowerCase(),
  remarks: leave.remarks || leave.adminComment || "",
  appliedOn: normalizeDate(
    leave.appliedOn || leave.createdAt || leave.applicationDate
  ),
  days: Number.isFinite(Number(leave.days)) && leave.days !== "" && leave.days != null
    ? Number(leave.days)
    : undefined,
});

const countDays = (from, to, excludeWeekends = true) => {
  if (!from || !to) return 0;

  const start = parseISO(from);
  const end = parseISO(to);

  if (!start || !end || end < start) return 0;

  let total = 0;

  for (
    let date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    if (
      excludeWeekends &&
      (date.getDay() === 0 || date.getDay() === 6)
    ) {
      continue;
    }

    total += 1;
  }

  return total;
};

const inputBase =
  "w-full rounded-md border bg-[#0f0f0f] px-3 py-2.5 text-xs text-white placeholder:text-gray-500 outline-none transition focus:border-red-700";

const ErrorText = ({ children }) =>
  children ? (
    <p className="mt-1 text-[10px] text-red-500">{children}</p>
  ) : null;

const Modal = ({ open, onClose, labelledBy, children }) => {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose?.();
          }}
        >
          <div className="flex min-h-full items-center justify-center">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelledBy}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-6 font-[Poppins,ui-sans-serif,system-ui,sans-serif] text-white shadow-2xl shadow-black"
            >
              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const CloseButton = ({ onClick }) => (
  <button
    type="button"
    aria-label="Close"
    onClick={onClick}
    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#3a3a3a] text-white transition hover:border-red-700 hover:text-red-500"
  >
    <X size={14} />
  </button>
);

const ErrorBanner = ({ children }) =>
  children ? (
    <div
      role="alert"
      className="mt-4 flex items-start gap-2 rounded-md border border-red-800/70 bg-red-950/60 px-3 py-2.5 text-xs text-red-300"
    >
      <AlertCircle
        size={14}
        className="mt-0.5 shrink-0 text-red-500"
      />
      <span>{children}</span>
    </div>
  ) : null;

const RequestForm = ({
  balances,
  existing,
  excludeWeekends,
  onClose,
  onRequest,
  onCreated,
}) => {
  const [type, setType] = useState(balances[0]?.name || "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const todayKey = toKey(new Date());
  const days = countDays(from, to, excludeWeekends);
  const balance = balances.find((item) => item.name === type);

  const errorCount = Object.values(errors).filter(Boolean).length;

  const border = (key) =>
    errors[key] ? "border-red-700" : "border-[#2a2a2a]";

  const clearError = (key) => {
    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }));
  };

  const validate = () => {
    const validationErrors = {};

    if (!type) {
      validationErrors.type = "Leave type select karo";
    }

    if (!from) {
      validationErrors.from = "Start date select karo";
    } else if (from < todayKey) {
      validationErrors.from = "Start date past mein nahi ho sakti";
    }

    if (!to) {
      validationErrors.to = "End date select karo";
    } else if (from && to < from) {
      validationErrors.to =
        "End date start date se pehle nahi ho sakti";
    }

    if (from && to && to >= from && !validationErrors.from && !validationErrors.to) {
      if (days === 0) {
        validationErrors.to =
          "In dates mein koi working day nahi (sirf weekend)";
      } else if (balance && days > balance.remaining) {
        validationErrors.type =
          `${type} ke sirf ${balance.remaining} din bache hain, ` +
          `aap ${days} maang rahe ho`;
      } else {
        const overlaps = existing.some((leave) => {
          if (!["approved", "pending"].includes(leave.status)) {
            return false;
          }

          if (leave.type !== type) {
            return false;
          }

          return from <= leave.to && to >= leave.from;
        });

        if (overlaps) {
          validationErrors.to =
            "Ye dates pehle se isi type ki leave ke saath overlap karti hain";
        }
      }
    }

    if (!reason.trim()) {
      validationErrors.reason = "Reason likho";
    }

    return validationErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.values(validationErrors).some(Boolean)) return;

    if (!onRequest) {
      setSubmitError("Leave request service configure nahi hai.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        type,
        from,
        to,
        days,
        reason: reason.trim(),
      };

      const response = await onRequest(payload);
      const created = response?.leave || response?.request || response;

      const newLeave = normalizeLeave({
        status: "pending",
        appliedOn: todayKey,
        ...payload,
        ...(created || {}),
      });

      onCreated?.(newLeave);
      onClose?.();
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Leave request submit nahi ho saki. Dobara try karo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="leave-request-title"
            className="text-base font-semibold"
          >
            Request Leave
          </h2>
          <p className="mt-1 text-xs text-gray-300">
            Apply for time off.
          </p>
        </div>

        <CloseButton onClick={onClose} />
      </div>

      <ErrorBanner>
        {submitError ||
          (errorCount > 0 &&
            `Please fix ${errorCount} ${
              errorCount === 1 ? "field" : "fields"
            } marked in red below.`)}
      </ErrorBanner>

      <div className="mt-5">
        <label className="mb-1.5 block text-xs font-medium text-white">
          Leave Type <span className="text-red-600">*</span>
        </label>

        <div className="relative">
          <select
            required
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              clearError("type");
            }}
            className={`${inputBase} ${border("type")} appearance-none pr-8`}
          >
            {balances.length === 0 && (
              <option value="">No leave types available</option>
            )}

            {balances.map((item) => (
              <option
                key={item.name}
                value={item.name}
                className="bg-black"
              >
                {item.name} ({item.remaining} left)
              </option>
            ))}
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <ErrorText>{errors.type}</ErrorText>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white">
            From <span className="text-red-600">*</span>
          </label>

          <input
            type="date"
            min={todayKey}
            value={from}
            onChange={(event) => {
              const value = event.target.value;

              setFrom(value);

              if (to && value > to) setTo("");

              clearError("from");
              clearError("to");
            }}
            className={`${inputBase} ${border("from")} [color-scheme:dark]`}
          />

          <ErrorText>{errors.from}</ErrorText>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white">
            To <span className="text-red-600">*</span>
          </label>

          <input
            type="date"
            min={from || todayKey}
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              clearError("to");
              clearError("type");
            }}
            className={`${inputBase} ${border("to")} [color-scheme:dark]`}
          />

          <ErrorText>{errors.to}</ErrorText>
        </div>
      </div>

      {from && to && to >= from && (
        <p className="mt-2 text-[11px] text-gray-300">
          Duration: <span className="text-white">{days}</span>{" "}
          {excludeWeekends ? "working " : ""}
          {days === 1 ? "day" : "days"}
          {balance && (
            <span className="text-gray-500">
              {" "}· {balance.remaining} available
            </span>
          )}
        </p>
      )}

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-medium text-white">
          Reason <span className="text-red-600">*</span>
        </label>

        <textarea
          rows={3}
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            clearError("reason");
          }}
          placeholder="Reason for leave..."
          className={`${inputBase} ${border("reason")} resize-none`}
        />

        <ErrorText>{errors.reason}</ErrorText>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-4 py-2 text-xs text-gray-300 hover:text-white"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting || balances.length === 0}
          className="rounded-md bg-red-700 px-5 py-2 text-xs font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
};

const DetailBody = ({
  item,
  excludeWeekends,
  onClose,
  onCancel,
  onCancelled,
}) => {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const tone = TONE[item.status] || TONE.pending;

  const doCancel = async () => {
    if (!item.id) {
      setError("Leave request ID nahi mili.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      if (!onCancel) {
        throw new Error("Leave cancellation service configure nahi hai.");
      }

      await onCancel(item.id);
      onCancelled?.(item.id);
      onClose?.();
    } catch (cancelError) {
      setError(
        cancelError?.response?.data?.message ||
          cancelError?.message ||
          "Request cancel nahi ho saki. Dobara try karo."
      );

      setConfirming(false);
    } finally {
      setBusy(false);
    }
  };

  const Row = ({ label, children }) => (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 py-2.5 text-xs last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="max-w-[65%] whitespace-pre-wrap break-words text-right text-white">
        {children}
      </span>
    </div>
  );

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded border bg-black ${tone.icon}`}
          >
            <CalendarDays size={14} />
          </span>

          <div>
            <h2
              id="leave-detail-title"
              className="text-sm font-semibold"
            >
              {item.type}
            </h2>

            <span
              className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] ${tone.badge}`}
            >
              {tone.label}
            </span>
          </div>
        </div>

        <CloseButton onClick={onClose} />
      </div>

      <ErrorBanner>{error}</ErrorBanner>

      <div className="mt-4">
        <Row label="From">{fmt(item.from)}</Row>
        <Row label="To">{fmt(item.to)}</Row>

        <Row label="Duration">
          {item.days} {excludeWeekends ? "working " : ""}
          {item.days === 1 ? "day" : "days"}
        </Row>

        {item.appliedOn && (
          <Row label="Applied on">{fmt(item.appliedOn)}</Row>
        )}

        {item.reason && <Row label="Reason">{item.reason}</Row>}

        {item.remarks && <Row label="Remarks">{item.remarks}</Row>}
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        {item.status === "pending" && !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-md border border-red-800/60 px-4 py-2 text-xs text-red-400 transition hover:bg-red-950/40"
          >
            Cancel Request
          </button>
        )}

        {item.status === "pending" && confirming && (
          <>
            <span className="mr-auto text-[11px] text-gray-300">
              Pakka cancel karni hai?
            </span>

            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="px-3 py-2 text-xs text-gray-300 hover:text-white"
            >
              No
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={doCancel}
              className="rounded-md bg-red-700 px-4 py-2 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-60"
            >
              {busy ? "Cancelling..." : "Yes, cancel"}
            </button>
          </>
        )}

        {!confirming && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-red-700 px-5 py-2 text-xs font-medium text-white transition hover:bg-red-600"
          >
            Close
          </button>
        )}
      </div>
    </>
  );
};

const LeaveBalance = ({
  leaves = EMPTY,
  leaveTypes = DEFAULT_TYPES,
  loading = false,
  limit = 4,
  excludeWeekends = true,
  onRequest,
  onCancel,
  onViewAll,
}) => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [requestOpen, setRequestOpen] = useState(false);

  useEffect(() => {
    setItems((Array.isArray(leaves) ? leaves : []).map(normalizeLeave));
  }, [leaves]);

  const normalizedTypes = useMemo(() => {
    const source =
      Array.isArray(leaveTypes) && leaveTypes.length
        ? leaveTypes
        : DEFAULT_TYPES;

    return source.map((item) => ({
      name: item.name || item.type || item.leaveType,
      total: Number(item.total ?? item.entitlement ?? 0),
      used: Number(item.used ?? 0),
    }));
  }, [leaveTypes]);

  const list = useMemo(
    () =>
      items.map((leave) => ({
        ...leave,
        days:
          leave.days ??
          countDays(leave.from, leave.to, excludeWeekends),
      })),
    [items, excludeWeekends]
  );

  const balances = useMemo(
    () =>
      normalizedTypes.map((item) => {
        const reserved = list
          .filter(
            (leave) =>
              leave.type === item.name &&
              leave.status === "pending"
          )
          .reduce((sum, leave) => sum + leave.days, 0);

        return {
          ...item,
          remaining: Math.max(
            0,
            item.total - item.used - reserved
          ),
        };
      }),
    [normalizedTypes, list]
  );

  const filtered =
    filter === "All"
      ? list
      : list.filter((leave) => {
          if (filter === "Unapproved") {
            return leave.status === "unapproved";
          }

          return leave.status === filter.toLowerCase();
        });

  const visible = showAll ? filtered : filtered.slice(0, limit);

  const selected =
    list.find(
      (leave) => String(leave.id) === String(detailId)
    ) || null;

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      setShowAll((previous) => !previous);
    }
  };

  const handleCreated = (item) => {
    if (!item.id || item.id.startsWith("local-")) {
      setItems((previous) => [item, ...previous]);
    } else {
      setItems((previous) => {
        const exists = previous.some(
          (leave) => String(leave.id) === String(item.id)
        );

        if (exists) {
          return previous.map((leave) =>
            String(leave.id) === String(item.id)
              ? { ...leave, ...item }
              : leave
          );
        }

        return [item, ...previous];
      });
    }

    setFilter("All");
  };

  const handleCancelled = (id) => {
    setItems((previous) =>
      previous.map((leave) =>
        String(leave.id) === String(id)
          ? { ...leave, status: "cancelled" }
          : leave
      )
    );
  };

  return (
    <div className="flex h-full flex-col rounded-md border border-[#1e1e1e] bg-[#0b0b0b] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-white">
          Leave Balance
        </h3>

        <button
          type="button"
          title="Request leave"
          aria-label="Request leave"
          onClick={() => setRequestOpen(true)}
          className="flex h-6 w-6 items-center justify-center rounded border border-red-900/70 bg-red-950/50 text-red-500 transition hover:bg-red-700 hover:text-white"
        >
          <Plus size={13} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {balances.map((balance) => (
          <div
            key={balance.name}
            className="rounded-md border border-white/5 bg-white/[0.02] p-2"
          >
            <p className="truncate text-[10px] text-gray-400">
              {balance.name}
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              {Math.max(0, balance.remaining)}
              <span className="ml-1 text-[10px] font-normal text-gray-500">
                / {balance.total}
              </span>
            </p>

            <p className="text-[9px] text-gray-500">days available</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setFilter(item);
              setShowAll(false);
            }}
            className={`rounded px-2 py-1 text-[10px] transition ${
              filter === item
                ? "bg-red-700 text-white"
                : "bg-[#1a1a1a] text-gray-300 hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <ul
        className={`mt-3 space-y-1 ${
          showAll ? "max-h-72 overflow-y-auto pr-1" : ""
        }`}
      >
        {loading &&
          [1, 2, 3, 4].map((item) => (
            <li
              key={item}
              className="flex animate-pulse items-center gap-2.5 py-2"
            >
              <span className="h-6 w-6 rounded bg-white/10" />

              <div className="flex-1 space-y-1.5">
                <div className="h-2 w-1/2 rounded bg-white/10" />
                <div className="h-2 w-2/3 rounded bg-white/5" />
              </div>

              <span className="h-5 w-14 rounded bg-white/10" />
            </li>
          ))}

        {!loading &&
          visible.map((leave) => {
            const tone = TONE[leave.status] || TONE.pending;

            return (
              <li key={leave.id || `${leave.type}-${leave.from}-${leave.to}`}>
                <button
                  type="button"
                  onClick={() => setDetailId(leave.id)}
                  className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-2.5 rounded px-2 py-2 text-left transition hover:bg-white/5"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border bg-black ${tone.icon}`}
                  >
                    <CalendarDays size={11} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] text-white">
                      {leave.type}
                    </p>

                    <p className="truncate text-[10px] text-gray-400">
                      {fmt(leave.from)} - {fmt(leave.to)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded px-2.5 py-1 text-[10px] ${tone.badge}`}
                  >
                    {tone.label}
                  </span>
                </button>
              </li>
            );
          })}

        {!loading && filtered.length === 0 && (
          <li className="py-6 text-center text-xs text-gray-500">
            {filter === "All"
              ? "No leave records."
              : `No ${filter.toLowerCase()} leaves.`}
          </li>
        )}
      </ul>

      {!loading && filtered.length > limit && (
        <button
          type="button"
          onClick={handleViewAll}
          className="mt-auto flex items-center justify-center gap-1 pt-3 text-[10px] text-gray-400 transition hover:text-white"
        >
          {showAll && !onViewAll
            ? "Show less"
            : `View all (${filtered.length})`}

          <ChevronDown
            size={11}
            className={
              showAll && !onViewAll ? "rotate-180" : ""
            }
          />
        </button>
      )}

      <Modal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        labelledBy="leave-request-title"
      >
        <RequestForm
          balances={balances}
          existing={list}
          excludeWeekends={excludeWeekends}
          onClose={() => setRequestOpen(false)}
          onRequest={onRequest}
          onCreated={handleCreated}
        />
      </Modal>

      <Modal
        open={Boolean(selected)}
        onClose={() => setDetailId(null)}
        labelledBy="leave-detail-title"
      >
        {selected && (
          <DetailBody
            item={selected}
            excludeWeekends={excludeWeekends}
            onClose={() => setDetailId(null)}
            onCancel={onCancel}
            onCancelled={handleCancelled}
          />
        )}
      </Modal>
    </div>
  );
};

export default LeaveBalance;
