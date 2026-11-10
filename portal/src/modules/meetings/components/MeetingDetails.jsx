import { useState } from "react";
import {
  AlertTriangle,
  Ban,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  Pencil,
  Repeat,
  Bell,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import meetingsService, { meetingErrorMessage } from "@/services/meetingsService";
import { useNow } from "../hooks";
import {
  CATEGORIES,
  MEETING_TYPES,
  REMINDERS,
  RSVP_LABELS,
  downloadICS,
  durationText,
  formatDateLong,
  formatTimeRange,
  meetingPhase,
  minutesBetween,
  recurrenceText,
  relativeStart,
} from "../utils";
import { Avatar, Modal } from "./Shell";

const PHASE_LABEL = {
  live: "Live now",
  upcoming: "Upcoming",
  past: "Ended",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function MeetingDetails({ meeting, currentUserId, onClose, onEdit, onChanged, onToast }) {
  const now = useNow(30000);
  const [data, setData] = useState(meeting);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null); // 'cancel' | 'delete'
  const [scope, setScope] = useState("occurrence");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState(meeting.notes || "");

  const phase = meetingPhase(data, now);
  const isRecurring = data.recurrence !== "none";
  const category = CATEGORIES[data.category] || CATEGORIES.general;
  const typeLabel = MEETING_TYPES.find((t) => t.value === data.meetingType)?.label || "";
  const reminderLabel = REMINDERS.find((r) => r.value === data.reminderMinutes)?.label || "";
  const active = phase === "live" || phase === "upcoming";
  const startsSoon =
    phase === "live" || (phase === "upcoming" && new Date(data.startAt) - now <= 10 * 60000);

  const merge = (updated) =>
    setData((prev) => ({
      ...updated,
      startAt: prev.startAt,
      endAt: prev.endAt,
      occurrenceKey: prev.occurrenceKey,
    }));

  const run = async (name, task, onDone) => {
    if (busy) return;
    setBusy(name);
    setError("");
    try {
      const result = await task();
      onDone?.(result);
    } catch (err) {
      setError(meetingErrorMessage(err));
    } finally {
      setBusy("");
    }
  };

  const respond = (response) =>
    run(
      "rsvp",
      () => meetingsService.respond(data.id, response),
      (updated) => {
        merge(updated);
        onChanged?.("rsvp", updated);
        onToast?.(response === "declined" ? "You declined this meeting." : "Your response was saved.");
      }
    );

  const saveNotes = () =>
    run(
      "notes",
      () => meetingsService.update(data.id, { notes: notes.trim() }),
      (updated) => {
        merge(updated);
        onChanged?.("notes", updated);
        onToast?.("Notes saved.");
      }
    );

  const markComplete = () =>
    run(
      "complete",
      () => meetingsService.complete(data.id),
      (updated) => {
        merge(updated);
        onChanged?.("completed", updated);
        onToast?.("Meeting marked as completed.");
      }
    );

  const doCancel = () =>
    run(
      "cancel",
      () =>
        meetingsService.cancel(data.id, {
          reason: reason.trim(),
          occurrence: isRecurring && scope === "occurrence" ? data.occurrenceKey : undefined,
        }),
      (updated) => {
        onChanged?.("cancelled", updated);
        onToast?.(isRecurring && scope === "occurrence" ? "This occurrence was cancelled." : "Meeting cancelled.");
        if (isRecurring && scope === "occurrence") onClose();
        else {
          merge(updated);
          setConfirm(null);
        }
      }
    );

  const doDelete = () =>
    run(
      "delete",
      () => meetingsService.remove(data.id),
      () => {
        onChanged?.("deleted", data);
        onToast?.("Meeting deleted.");
        onClose();
      }
    );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(data.meetingLink);
      onToast?.("Meeting link copied.");
    } catch {
      onToast?.("Could not copy the link. Please copy it manually.");
    }
  };

  const organizer = data.organizer || { name: "Organizer" };

  return (
    <Modal
      title={data.title}
      subtitle={`${formatDateLong(data.startAt)} · ${formatTimeRange(data.startAt, data.endAt)}`}
      onClose={onClose}
      width={760}
      labelId="mt-details-title"
      footer={
        confirm ? null : (
          <>
            <button type="button" className="mt-btn" onClick={() => downloadICS(data)}>
              <CalendarPlus size={14} /> Add to calendar
            </button>
            {data.canManage && phase === "past" && (
              <button type="button" className="mt-btn" disabled={Boolean(busy)} onClick={markComplete}>
                <CheckCircle2 size={14} /> Mark completed
              </button>
            )}
            {data.canManage && data.status !== "cancelled" && (
              <button type="button" className="mt-btn" onClick={() => onEdit?.(data)}>
                <Pencil size={14} /> Edit
              </button>
            )}
            {data.canManage && active && (
              <button
                type="button"
                className="mt-btn mt-btn--danger"
                onClick={() => {
                  setScope(isRecurring ? "occurrence" : "series");
                  setConfirm("cancel");
                }}
              >
                <Ban size={14} /> Cancel meeting
              </button>
            )}
            {data.canManage && !active && (
              <button type="button" className="mt-btn mt-btn--danger" onClick={() => setConfirm("delete")}>
                <Trash2 size={14} /> Delete
              </button>
            )}
          </>
        )
      }
    >
      <div className="mt-details">
        <div className="mt-badges">
          <span className="mt-badge" style={{ "--c": category.color }}>
            {category.label}
          </span>
          <span className={`mt-badge mt-badge--phase is-${phase}`}>{PHASE_LABEL[phase]}</span>
          {phase === "upcoming" && <span className="mt-badge mt-badge--soft">{relativeStart(data, now)}</span>}
          {data.priority === "high" && <span className="mt-badge mt-badge--high">High priority</span>}
          {typeLabel && <span className="mt-badge mt-badge--soft">{typeLabel}</span>}
        </div>

        {error && (
          <p className="mt-alert mt-alert--error" role="alert">
            <AlertTriangle size={14} /> {error}
          </p>
        )}

        {data.status === "cancelled" && (
          <p className="mt-alert">
            <Ban size={14} /> This meeting was cancelled{data.cancelReason ? `: ${data.cancelReason}` : "."}
          </p>
        )}

        {confirm === "cancel" && (
          <div className="mt-confirm" role="alertdialog" aria-label="Cancel meeting">
            <h4>Cancel this meeting?</h4>
            <p>All attendees will be notified.</p>
            {isRecurring && (
              <div className="mt-radio">
                <label>
                  <input type="radio" name="scope" checked={scope === "occurrence"} onChange={() => setScope("occurrence")} />
                  Only this occurrence ({formatDateLong(data.startAt)})
                </label>
                <label>
                  <input type="radio" name="scope" checked={scope === "series"} onChange={() => setScope("series")} />
                  The entire series
                </label>
              </div>
            )}
            <input
              type="text"
              maxLength={500}
              value={reason}
              placeholder="Reason (optional)"
              aria-label="Cancellation reason"
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="mt-confirm__actions">
              <button type="button" className="mt-btn" onClick={() => setConfirm(null)} disabled={Boolean(busy)}>
                Keep meeting
              </button>
              <button type="button" className="mt-btn mt-btn--danger-solid" onClick={doCancel} disabled={Boolean(busy)}>
                {busy === "cancel" ? "Cancelling..." : "Yes, cancel"}
              </button>
            </div>
          </div>
        )}

        {confirm === "delete" && (
          <div className="mt-confirm" role="alertdialog" aria-label="Delete meeting">
            <h4>Delete this meeting permanently?</h4>
            <p>{isRecurring ? "The whole series and its notes will be removed. " : "Its notes will be removed. "}This cannot be undone.</p>
            <div className="mt-confirm__actions">
              <button type="button" className="mt-btn" onClick={() => setConfirm(null)} disabled={Boolean(busy)}>
                Keep it
              </button>
              <button type="button" className="mt-btn mt-btn--danger-solid" onClick={doDelete} disabled={Boolean(busy)}>
                {busy === "delete" ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}

        {data.myRsvp && active && (
          <div className="mt-rsvp" role="group" aria-label="Your response">
            <span>Will you attend?</span>
            {[
              ["accepted", "Accept"],
              ["tentative", "Maybe"],
              ["declined", "Decline"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`mt-rsvp__btn is-${value}${data.myRsvp === value ? " is-active" : ""}`}
                aria-pressed={data.myRsvp === value}
                disabled={Boolean(busy)}
                onClick={() => respond(value)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {(data.meetingLink || data.location) && (
          <div className="mt-where">
            {data.meetingLink && (
              <div className="mt-where__row">
                <Video size={15} />
                <a href={data.meetingLink} target="_blank" rel="noopener noreferrer">
                  {data.meetingLink}
                </a>
                <button type="button" className="mt-icon-btn" onClick={copyLink} aria-label="Copy meeting link" title="Copy link">
                  <Copy size={14} />
                </button>
                {data.status !== "cancelled" && phase !== "past" && phase !== "completed" && (
                  <a
                    className={`mt-btn ${startsSoon ? "mt-btn--primary" : ""}`}
                    href={data.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={13} /> Join
                  </a>
                )}
              </div>
            )}
            {data.location && (
              <div className="mt-where__row">
                <MapPin size={15} />
                <span>{data.location}</span>
              </div>
            )}
          </div>
        )}

        <dl className="mt-facts">
          <div>
            <dt>
              <Clock size={12} /> Duration
            </dt>
            <dd>{durationText(minutesBetween(data.startAt, data.endAt))}</dd>
          </div>
          {isRecurring && (
            <div>
              <dt>
                <Repeat size={12} /> Repeats
              </dt>
              <dd>{recurrenceText(data)}</dd>
            </div>
          )}
          <div>
            <dt>
              <Bell size={12} /> Reminder
            </dt>
            <dd>{reminderLabel}</dd>
          </div>
          <div>
            <dt>
              <Users size={12} /> Organizer
            </dt>
            <dd>{data.isOrganizer ? "You" : organizer.name}</dd>
          </div>
        </dl>

        {data.agenda && (
          <section>
            <h4>Agenda</h4>
            <p className="mt-prewrap">{data.agenda}</p>
          </section>
        )}

        {data.description && (
          <section>
            <h4>Description</h4>
            <p className="mt-prewrap">{data.description}</p>
          </section>
        )}

        <section>
          <h4>
            Attendees ({data.attendeeCount})
            <small>
              {data.rsvpSummary.accepted} accepted · {data.rsvpSummary.tentative} maybe · {data.rsvpSummary.declined} declined ·{" "}
              {data.rsvpSummary.pending} waiting
            </small>
          </h4>
          <ul className="mt-people">
            <li>
              <Avatar name={organizer.name} src={organizer.avatarUrl} size={30} />
              <span>
                <strong>{data.isOrganizer ? "You" : organizer.name}</strong>
                <small>Organizer</small>
              </span>
              <em className="mt-rsvp-tag is-accepted">Host</em>
            </li>
            {data.attendees.map((a) => (
              <li key={a.userId}>
                <Avatar name={a.name} src={a.avatarUrl} size={30} />
                <span>
                  <strong>{a.userId === currentUserId ? "You" : a.name}</strong>
                  <small>{[a.designation, a.department].filter(Boolean).join(" · ") || a.role}</small>
                </span>
                <em className={`mt-rsvp-tag is-${a.rsvp}`}>{RSVP_LABELS[a.rsvp]}</em>
              </li>
            ))}
            {data.attendees.length === 0 && <li className="mt-people__empty">No other attendees invited.</li>}
          </ul>
        </section>

        {(data.canManage || data.notes) && (
          <section>
            <h4>Notes / minutes</h4>
            {data.canManage ? (
              <>
                <textarea
                  rows={4}
                  maxLength={10000}
                  value={notes}
                  placeholder="Capture decisions and action items..."
                  aria-label="Meeting notes"
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="mt-notes__actions">
                  <button
                    type="button"
                    className="mt-btn"
                    disabled={Boolean(busy) || notes.trim() === (data.notes || "").trim()}
                    onClick={saveNotes}
                  >
                    {busy === "notes" ? "Saving..." : "Save notes"}
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-prewrap">{data.notes}</p>
            )}
          </section>
        )}
      </div>
    </Modal>
  );
}