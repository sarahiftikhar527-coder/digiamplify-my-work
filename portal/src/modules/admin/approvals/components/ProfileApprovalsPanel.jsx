import { useCallback, useEffect, useState } from 'react';
import {
  Check,
  ExternalLink,
  FileText,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  approveChangeRequest,
  getChangeRequests,
  rejectChangeRequest,
} from '@/services/api/profileService';
import {
  needsAuthenticatedFetch,
  openAuthenticatedFile,
} from '@/utils/authenticatedFile';

const FIELD_LABELS = {
  fullName: 'Full Name',
  userName: 'User Name',
  dob: 'Date Of Birth',
  gender: 'Gender',
  nationality: 'Nationality',
  language: 'Language',
  workEmail: 'Work Email',
  phone: 'Phone Number',
  emergencyNumber: 'Emergency Number',
  currentAddress: 'Current Address',
  permanentAddress: 'Permanent Address',
  country: 'Country',
  city: 'City',
  education: 'Education',
  documents: 'Documents',
};

const FILTERS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const STATUS_STYLE = {
  pending: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  approved: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  rejected: 'border-red-500/40 bg-red-500/10 text-red-200',
};

const errorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong. Please try again.';

const formatDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const docName = (doc) =>
  doc?.fileName || doc?.label || doc?.name || 'Document';

const diffDocuments = (previous, next) => {
  const before = Array.isArray(previous) ? previous : [];
  const after = Array.isArray(next) ? next : [];

  const beforeIds = new Set(before.map((doc) => String(doc?.id)));
  const afterIds = new Set(after.map((doc) => String(doc?.id)));

  return {
    added: after.filter((doc) => !beforeIds.has(String(doc?.id))),
    removed: before.filter((doc) => !afterIds.has(String(doc?.id))),
  };
};

async function openDocument(url) {
  if (!url) return;

  if (needsAuthenticatedFetch(url)) {
    await openAuthenticatedFile(url);
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

function DocumentLine({ doc, tone, label, onOpen }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span
        className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${tone}`}
      >
        {label}
      </span>

      <FileText size={14} className="text-white/50" />
      <span className="break-all text-white/90">{docName(doc)}</span>

      {onOpen && (
        <button
          type="button"
          onClick={() => onOpen(doc.url)}
          className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-0.5 text-xs text-white/80 hover:bg-white/10"
        >
          View <ExternalLink size={11} />
        </button>
      )}
    </div>
  );
}

function ChangeRows({ request, onOpen }) {
  const fields = Object.keys(request.changes || {});

  return (
    <div className="space-y-3">
      {fields.map((field) => {
        if (field === 'documents') {
          const { added, removed } = diffDocuments(
            request.previous?.documents,
            request.changes.documents
          );

          return (
            <div
              key={field}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <p className="mb-2 text-xs uppercase tracking-wide text-white/50">
                {FIELD_LABELS.documents}
              </p>

              <div className="space-y-2">
                {added.map((doc, index) => (
                  <DocumentLine
                    key={`add-${doc.id || index}`}
                    doc={doc}
                    label="Added"
                    tone="bg-emerald-500/15 text-emerald-200"
                    onOpen={onOpen}
                  />
                ))}

                {removed.map((doc, index) => (
                  <DocumentLine
                    key={`remove-${doc.id || index}`}
                    doc={doc}
                    label="Removed"
                    tone="bg-red-500/15 text-red-200"
                  />
                ))}
              </div>
            </div>
          );
        }

        const before = request.previous?.[field];
        const after = request.changes[field];

        return (
          <div
            key={field}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
          >
            <p className="mb-2 text-xs uppercase tracking-wide text-white/50">
              {FIELD_LABELS[field] || field}
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[11px] text-white/40">Current</p>
                <p className="break-words text-sm text-white/60 line-through decoration-white/20">
                  {String(before || '') || 'Empty'}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-white/40">Requested</p>
                <p className="break-words text-sm font-medium text-white">
                  {String(after || '') || 'Empty'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProfileApprovalsPanel({ onCountChange }) {
  const [filter, setFilter] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState('');
  const [rejectingId, setRejectingId] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getChangeRequests(filter);
      const items = response?.data ?? [];

      setRequests(Array.isArray(items) ? items : []);

      if (filter === 'pending') {
        onCountChange?.(Array.isArray(items) ? items.length : 0);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filter, onCountChange]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpen = async (url) => {
    setError('');

    try {
      await openDocument(url);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const decide = async (request, approve) => {
    if (busyId) return;

    setBusyId(request.id);
    setError('');
    setSuccess('');

    try {
      const response = approve
        ? await approveChangeRequest(request.id)
        : await rejectChangeRequest(request.id, note);

      setSuccess(
        response?.message ||
          (approve ? 'Changes approved.' : 'Request rejected.')
      );
      setRejectingId('');
      setNote('');
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId('');
    }
  };

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                filter === item.id
                  ? 'border-[#c1121f] bg-[#c1121f] text-white'
                  : 'border-white/15 text-white/70 hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200"
        >
          {success}
        </div>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-white/50">
          Loading profile requests...
        </p>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-4 py-14 text-center">
          <p className="font-medium text-white/80">
            No {filter} profile requests
          </p>
          <p className="mt-1 text-sm text-white/45">
            {filter === 'pending'
              ? 'When an employee edits their profile, the request appears here.'
              : 'Nothing to show here yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const isPending = request.status === 'pending';
            const busy = busyId === request.id;

            return (
              <article
                key={request.id}
                className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 sm:p-5"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-white">
                      {request.employee?.name || 'Employee'}
                    </h3>
                    <p className="text-xs text-white/50">
                      {request.employee?.email}
                      {request.createdAt
                        ? ` · Requested ${formatDateTime(request.createdAt)}`
                        : ''}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs capitalize ${
                      STATUS_STYLE[request.status] || STATUS_STYLE.pending
                    }`}
                  >
                    {request.status}
                  </span>
                </div>

                <ChangeRows request={request} onOpen={handleOpen} />

                {!isPending && (
                  <p className="mt-3 text-xs text-white/50">
                    {request.status === 'approved' ? 'Approved' : 'Rejected'}
                    {request.reviewedBy?.name
                      ? ` by ${request.reviewedBy.name}`
                      : ''}
                    {request.reviewedAt
                      ? ` · ${formatDateTime(request.reviewedAt)}`
                      : ''}
                    {request.reviewNote ? ` · ${request.reviewNote}` : ''}
                  </p>
                )}

                {isPending && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    {rejectingId === request.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={note}
                          onChange={(event) => setNote(event.target.value)}
                          maxLength={500}
                          rows={2}
                          placeholder="Reason for rejecting (optional, the employee will see it)"
                          className="w-full rounded-lg border border-white/15 bg-black/40 p-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#c1121f] focus:outline-none"
                        />

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => decide(request, false)}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#c1121f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a70f1a] disabled:opacity-60"
                          >
                            <X size={16} />
                            {busy ? 'Rejecting...' : 'Confirm Reject'}
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setRejectingId('');
                              setNote('');
                            }}
                            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy || Boolean(busyId)}
                          onClick={() => decide(request, true)}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <Check size={16} />
                          {busy ? 'Approving...' : 'Approve'}
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(busyId)}
                          onClick={() => {
                            setRejectingId(request.id);
                            setNote('');
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-200 hover:bg-red-500/10 disabled:opacity-60"
                        >
                          <X size={16} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}