import { useState } from 'react';
import apiClient from '@/services/api/apiClient.js';

const getError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const fmtDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const fmtMinutes = (total) => {
  const minutes = Number(total) || 0;
  if (minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

export default function TaskReviewPanel({ task, onReviewed }) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!task || task.taskType === 'daily') return null;

  const inReview = task.status === 'review';
  const approved = ['approved', 'completed'].includes(task.status);

  if (!inReview && !(approved && task.submissionNote)) return null;

  const submit = async (decision) => {
    if (decision === 'disapprove' && note.trim().length < 3) {
      setError('Please explain what needs to change.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await apiClient.post(`/tasks/admin/${task.id}/review`, {
        decision,
        note: note.trim(),
      });
      setNote('');
      setRejecting(false);
      onReviewed?.();
    } catch (err) {
      setError(getError(err, 'Unable to save your review.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className={`mt-5 rounded-md border p-4 ${
        inReview
          ? 'border-amber-500/30 bg-amber-500/5'
          : 'border-emerald-500/30 bg-emerald-500/5'
      }`}
    >
      <p
        className={`text-sm font-semibold ${
          inReview ? 'text-amber-300' : 'text-emerald-300'
        }`}
      >
        {inReview ? 'Waiting for your review' : 'Approved and completed'}
      </p>

      <p className="mt-1 text-[11px] text-gray-400">
        Submitted {fmtDateTime(task.submittedAt)} · Time spent{' '}
        {fmtMinutes(task.timeSpentMinutes)}
        {approved && task.reviewedByName
          ? ` · Approved by ${task.reviewedByName}`
          : ''}
      </p>

      <p className="mt-3 text-[11px] uppercase tracking-wide text-gray-500">
        Work description
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
        {task.submissionNote || 'No description was added.'}
      </p>

      {approved && task.reviewNote && (
        <p className="mt-3 text-xs text-gray-400">
          Reviewer note: {task.reviewNote}
        </p>
      )}

      {inReview && (
        <div className="mt-4">
          {rejecting && (
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Explain what needs to change..."
              className="mb-3 w-full rounded-md border border-[#262626] bg-[#111] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-primary"
            />
          )}

          {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

          <div className="flex flex-wrap gap-2">
            {!rejecting ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => submit('approve')}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setRejecting(true)}
                  className="rounded-md border border-red-500/40 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-60"
                >
                  Disapprove
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => submit('disapprove')}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
                >
                  Send back for changes
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setRejecting(false);
                    setError('');
                  }}
                  className="rounded-md border border-[#262626] px-4 py-2 text-sm text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}