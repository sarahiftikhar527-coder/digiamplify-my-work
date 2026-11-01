
import { useState } from 'react';
import { Check, X, CalendarDays, LoaderCircle } from 'lucide-react';
import Avatar from './Avatar';

function parseDate(value) {
  if (!value) return null;

  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(String(value))
      ? `${value}T00:00:00`
      : value
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date) {
  if (!date) return 'Unknown date';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRange(from, to) {
  const start = parseDate(from);
  const end = parseDate(to);

  if (!start && !end) return 'Dates not available';
  if (!start) return `Until ${formatDate(end)}`;
  if (!end) return `From ${formatDate(start)}`;

  if (start.toDateString() === end.toDateString()) {
    return formatDate(start);
  }

  return `${formatDate(start)} – ${formatDate(end)}`;
}

function daysBetween(from, to) {
  const start = parseDate(from);
  const end = parseDate(to);

  if (!start || !end) return null;

  const startDay = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const endDay = Date.UTC(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  );

  return Math.max(1, Math.floor((endDay - startDay) / 86400000) + 1);
}

function getRequestName(request) {
  const employee = request.employeeId;

  if (employee && typeof employee === 'object') {
    return (
      request.name ||
      request.employeeName ||
      employee.name ||
      employee.fullName ||
      employee.email ||
      'Employee'
    );
  }

  return request.name || request.employeeName || 'Employee';
}

function getRequestRole(request) {
  const employee = request.employeeId;

  if (employee && typeof employee === 'object') {
    return request.role || employee.role || employee.designation || 'Employee';
  }

  return request.role || request.designation || 'Employee';
}

export default function HolidayApprovalList({
  requests = [],
  onApprove = () => {},
  onReject = () => {},
  loading = false,
}) {
  const [processing, setProcessing] = useState({});

  const handleAction = async (request, action) => {
    const id = request.id || request._id;

    if (!id || processing[id]) return;

    setProcessing((current) => ({
      ...current,
      [id]: action,
    }));

    try {
      if (action === 'approve') {
        await onApprove(request);
      } else {
        await onReject(request);
      }
    } finally {
      setProcessing((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }
  };

  const pendingRequests = requests.filter(
    (request) => !['approved', 'rejected', 'cancelled'].includes(
      String(request.status || 'pending').toLowerCase()
    )
  );

  return (
    <section
      className="rounded-lg border border-[#232323] bg-[#0a0a0a] p-4"
      aria-labelledby="holiday-approval-title"
    >
      <h2
        id="holiday-approval-title"
        className="mb-3 flex items-center gap-2 text-xs font-semibold"
      >
        Holiday Approval

        <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#c1121f] px-1 text-[9px] text-white">
          {pendingRequests.length}
        </span>
      </h2>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-xs text-neutral-400">
          <LoaderCircle size={15} className="animate-spin" />
          Loading holiday requests...
        </div>
      ) : pendingRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CalendarDays size={22} className="mb-2 text-neutral-500" />
          <p className="text-xs text-neutral-400">
            No pending holiday requests.
          </p>
        </div>
      ) : (
        <ul className="max-h-[300px] divide-y divide-[#1f1f1f] overflow-y-auto pr-1">
          {pendingRequests.map((request, index) => {
            const id = request.id || request._id || `request-${index}`;
            const name = getRequestName(request);
            const role = getRequestRole(request);
            const days = daysBetween(request.from, request.to);
            const action = processing[id];
            const busy = Boolean(action);

            return (
              <li
                key={id}
                className="flex items-center gap-3 py-3"
              >
                <Avatar name={name} size="h-8 w-8" />

                <div className="min-w-0 flex-1 text-[10px] leading-snug text-neutral-300">
                  <p className="truncate text-xs font-semibold text-white">
                    {name}
                  </p>

                  <p className="text-neutral-400">{role}</p>

                  <p className="mt-1">{formatRange(request.from, request.to)}</p>

                  {days !== null && (
                    <p>
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    disabled={busy || !request.id && !request._id}
                    onClick={() => handleAction(request, 'approve')}
                    aria-label={`Approve ${name}`}
                    title="Approve request"
                    className="grid h-7 w-7 place-items-center rounded-full border border-emerald-600 text-emerald-500 transition-colors hover:bg-emerald-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {action === 'approve' ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={busy || !request.id && !request._id}
                    onClick={() => handleAction(request, 'reject')}
                    aria-label={`Reject ${name}`}
                    title="Reject request"
                    className="grid h-7 w-7 place-items-center rounded-full border border-red-600 text-red-500 transition-colors hover:bg-red-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {action === 'reject' ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <X size={14} />
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
