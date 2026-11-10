import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Link2, RefreshCw, Repeat } from "lucide-react";
import meetingsService, { meetingErrorMessage } from "@/services/meetingsService";
import { useDebounced } from "../hooks";
import {
  CATEGORIES,
  DURATIONS,
  MEETING_TYPES,
  PRIORITIES,
  RECURRENCES,
  REMINDERS,
  addMinutesToTime,
  buildISO,
  endOfDayISO,
  format12,
  generateMeetingLink,
  getTzOffset,
  minutesBetween,
  toDateKey,
  toTimeKey,
} from "../utils";
import AttendeePicker from "./AttendeePicker";
import { Modal, Spinner } from "./Shell";

const roundedNowTime = () => {
  const d = new Date();
  const mins = Math.ceil((d.getHours() * 60 + d.getMinutes() + 1) / 15) * 15;
  const h = Math.min(23, Math.floor(mins / 60));
  const m = mins >= 24 * 60 ? 45 : mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

function initialForm(meeting, defaultDate) {
  if (meeting) {
    return {
      title: meeting.title,
      category: meeting.category,
      priority: meeting.priority,
      meetingType: meeting.meetingType,
      date: toDateKey(meeting.seriesStartAt),
      start: toTimeKey(meeting.seriesStartAt),
      end: toTimeKey(meeting.seriesEndAt),
      location: meeting.location,
      meetingLink: meeting.meetingLink,
      recurrence: meeting.recurrence,
      until: meeting.recurrenceUntil ? toDateKey(meeting.recurrenceUntil) : "",
      reminderMinutes: meeting.reminderMinutes,
      agenda: meeting.agenda,
      description: meeting.description,
      notes: meeting.notes,
    };
  }
  const start = roundedNowTime();
  return {
    title: "",
    category: "general",
    priority: "normal",
    meetingType: "online",
    date: defaultDate || toDateKey(new Date()),
    start,
    end: addMinutesToTime(start, 30),
    location: "",
    meetingLink: "",
    recurrence: "none",
    until: "",
    reminderMinutes: 15,
    agenda: "",
    description: "",
    notes: "",
  };
}

export default function MeetingModal({ meeting = null, defaultDate, currentUserId, onClose, onSaved }) {
  const isEdit = Boolean(meeting);
  const [form, setForm] = useState(() => initialForm(meeting, defaultDate));
  const [attendees, setAttendees] = useState(() =>
    (meeting?.attendees || []).map((a) => ({
      id: a.userId,
      name: a.name,
      department: a.department,
      designation: a.designation,
      avatarUrl: a.avatarUrl,
    }))
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [conflicts, setConflicts] = useState({ loading: false, items: [], checked: false });

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  };

  const startISO = buildISO(form.date, form.start);
  const endISO = buildISO(form.date, form.end);
  const timesValid = Boolean(startISO && endISO && new Date(endISO) > new Date(startISO));
  const duration = timesValid ? minutesBetween(startISO, endISO) : 0;
  const attendeeIds = useMemo(() => attendees.map((a) => a.id), [attendees]);

  const checkKey = useDebounced(`${startISO}|${endISO}|${attendeeIds.join(",")}`, 500);

  useEffect(() => {
    if (!timesValid) {
      setConflicts({ loading: false, items: [], checked: false });
      return undefined;
    }
    let alive = true;
    setConflicts((c) => ({ ...c, loading: true }));
    meetingsService
      .conflicts({ attendeeIds, startAt: startISO, endAt: endISO, excludeId: meeting?.id })
      .then((items) => alive && setConflicts({ loading: false, items, checked: true }))
      .catch(() => alive && setConflicts({ loading: false, items: [], checked: false }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkKey]);

  const busyIds = useMemo(() => new Set(conflicts.items.map((c) => c.userId)), [conflicts.items]);

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Please enter a meeting title.";
    if (!form.date) next.date = "Pick a date.";
    if (!timesValid) next.end = "End time must be after the start time.";
    if (!isEdit && startISO && new Date(startISO) < new Date(Date.now() - 60000)) {
      next.start = "This start time is in the past.";
    }
    if (form.meetingLink.trim() && !/^https?:\/\/\S+$/i.test(form.meetingLink.trim())) {
      next.meetingLink = "Link must start with http:// or https://";
    }
    if (form.recurrence !== "none" && form.until && form.until < form.date) {
      next.until = "Repeat-until date must be on or after the meeting date.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving || !validate()) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      agenda: form.agenda.trim(),
      meetingType: form.meetingType,
      category: form.category,
      priority: form.priority,
      location: form.meetingType === "online" ? "" : form.location.trim(),
      meetingLink: form.meetingType === "in_person" ? "" : form.meetingLink.trim(),
      startAt: startISO,
      endAt: endISO,
      tzOffset: getTzOffset(),
      recurrence: form.recurrence,
      recurrenceUntil: form.recurrence !== "none" && form.until ? endOfDayISO(form.until) : null,
      reminderMinutes: Number(form.reminderMinutes),
      attendeeIds,
    };
    if (isEdit) payload.notes = form.notes.trim();

    setSaving(true);
    setFormError("");
    try {
      const saved = isEdit
        ? await meetingsService.update(meeting.id, payload)
        : await meetingsService.create(payload);
      onSaved?.(saved, isEdit ? "updated" : "created");
    } catch (error) {
      setFormError(meetingErrorMessage(error, "Unable to save the meeting. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const showLocation = form.meetingType !== "online";
  const showLink = form.meetingType !== "in_person";

  return (
    <Modal
      title={isEdit ? "Edit meeting" : "Schedule a meeting"}
      subtitle={
        isEdit && meeting.recurrence !== "none"
          ? "Changes apply to the whole series. Attendees are notified if the time changes."
          : "Invite teammates, set reminders and share a join link."
      }
      onClose={() => !saving && onClose()}
      width={760}
      footer={
        <>
          <button type="button" className="mt-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="mt-meeting-form" className="mt-btn mt-btn--primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Schedule meeting"}
          </button>
        </>
      }
    >
      <form id="mt-meeting-form" className="mt-form" onSubmit={submit} noValidate>
        {formError && (
          <p className="mt-alert mt-alert--error" role="alert">
            <AlertTriangle size={14} /> {formError}
          </p>
        )}

        <div className="mt-field">
          <label htmlFor="mt-title">Title *</label>
          <input
            id="mt-title"
            type="text"
            maxLength={200}
            value={form.title}
            placeholder="e.g. Sprint planning"
            onChange={(e) => set("title", e.target.value)}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && <span className="mt-error">{errors.title}</span>}
        </div>

        <div className="mt-grid mt-grid--2">
          <div className="mt-field">
            <label htmlFor="mt-category">Category</label>
            <select id="mt-category" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {Object.entries(CATEGORIES).map(([value, c]) => (
                <option key={value} value={value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-field">
            <label htmlFor="mt-priority">Priority</label>
            <select id="mt-priority" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-grid mt-grid--3">
          <div className="mt-field">
            <label htmlFor="mt-date">Date *</label>
            <input
              id="mt-date"
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              aria-invalid={Boolean(errors.date)}
            />
            {errors.date && <span className="mt-error">{errors.date}</span>}
          </div>
          <div className="mt-field">
            <label htmlFor="mt-start">Start *</label>
            <input
              id="mt-start"
              type="time"
              value={form.start}
              onChange={(e) => {
                const value = e.target.value;
                setForm((f) => ({
                  ...f,
                  start: value,
                  end: value && duration > 0 ? addMinutesToTime(value, duration) : f.end,
                }));
                setErrors((er) => ({ ...er, start: "", end: "" }));
              }}
              aria-invalid={Boolean(errors.start)}
            />
            {errors.start && <span className="mt-error">{errors.start}</span>}
          </div>
          <div className="mt-field">
            <label htmlFor="mt-end">End *</label>
            <input
              id="mt-end"
              type="time"
              value={form.end}
              onChange={(e) => set("end", e.target.value)}
              aria-invalid={Boolean(errors.end)}
            />
            {errors.end && <span className="mt-error">{errors.end}</span>}
          </div>
        </div>

        <div className="mt-durations" aria-label="Quick duration">
          {DURATIONS.map((mins) => (
            <button
              type="button"
              key={mins}
              className={duration === mins ? "is-active" : ""}
              onClick={() => form.start && set("end", addMinutesToTime(form.start, mins))}
            >
              {mins < 60 ? `${mins} min` : `${mins / 60 === 1 ? "1 hr" : `${mins / 60} hrs`}`}
            </button>
          ))}
        </div>

        <fieldset className="mt-field mt-segment">
          <legend>Meeting type</legend>
          <div>
            {MEETING_TYPES.map((t) => (
              <button
                type="button"
                key={t.value}
                className={form.meetingType === t.value ? "is-active" : ""}
                aria-pressed={form.meetingType === t.value}
                onClick={() => set("meetingType", t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>

        {(showLocation || showLink) && (
          <div className={`mt-grid ${showLocation && showLink ? "mt-grid--2" : ""}`}>
            {showLocation && (
              <div className="mt-field">
                <label htmlFor="mt-location">Location</label>
                <input
                  id="mt-location"
                  type="text"
                  maxLength={255}
                  value={form.location}
                  placeholder="Meeting room, office or address"
                  onChange={(e) => set("location", e.target.value)}
                />
              </div>
            )}
            {showLink && (
              <div className="mt-field">
                <label htmlFor="mt-link">Meeting link</label>
                <div className="mt-inline">
                  <input
                    id="mt-link"
                    type="url"
                    maxLength={500}
                    value={form.meetingLink}
                    placeholder="https://..."
                    onChange={(e) => set("meetingLink", e.target.value)}
                    aria-invalid={Boolean(errors.meetingLink)}
                  />
                  <button
                    type="button"
                    className="mt-btn mt-btn--ghost"
                    title="Create a free Jitsi Meet room"
                    onClick={() => set("meetingLink", generateMeetingLink(form.title))}
                  >
                    <Link2 size={13} /> Generate
                  </button>
                </div>
                {errors.meetingLink && <span className="mt-error">{errors.meetingLink}</span>}
              </div>
            )}
          </div>
        )}

        <div className="mt-grid mt-grid--3">
          <div className="mt-field">
            <label htmlFor="mt-repeat">
              <Repeat size={11} /> Repeat
            </label>
            <select id="mt-repeat" value={form.recurrence} onChange={(e) => set("recurrence", e.target.value)}>
              {RECURRENCES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-field">
            <label htmlFor="mt-until">Repeat until</label>
            <input
              id="mt-until"
              type="date"
              min={form.date}
              value={form.until}
              disabled={form.recurrence === "none"}
              onChange={(e) => set("until", e.target.value)}
              aria-invalid={Boolean(errors.until)}
            />
            {errors.until && <span className="mt-error">{errors.until}</span>}
          </div>
          <div className="mt-field">
            <label htmlFor="mt-reminder">Reminder</label>
            <select
              id="mt-reminder"
              value={form.reminderMinutes}
              onChange={(e) => set("reminderMinutes", e.target.value)}
            >
              {REMINDERS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-field">
          <label>Attendees</label>
          <AttendeePicker
            selected={attendees}
            onChange={setAttendees}
            currentUserId={currentUserId}
            busyIds={busyIds}
          />
        </div>

        {timesValid && (
          <div
            className={`mt-avail${conflicts.items.length ? " has-conflicts" : ""}`}
            aria-live="polite"
          >
            {conflicts.loading ? (
              <p>
                <Spinner /> Checking availability for {format12(startISO)} - {format12(endISO)}...
              </p>
            ) : conflicts.items.length > 0 ? (
              <>
                <p>
                  <AlertTriangle size={14} /> {conflicts.items.length} scheduling conflict
                  {conflicts.items.length === 1 ? "" : "s"} found. You can still schedule, but these people may be unavailable.
                </p>
                <ul>
                  {conflicts.items.slice(0, 6).map((c, i) => (
                    <li key={`${c.userId}-${c.startAt}-${i}`}>
                      <strong>{c.userId === currentUserId ? "You" : c.name}</strong>
                      <span>
                        {c.kind === "leave" ? "On approved leave" : `${c.title} (${format12(c.startAt)} - ${format12(c.endAt)})`}
                      </span>
                    </li>
                  ))}
                  {conflicts.items.length > 6 && <li>+{conflicts.items.length - 6} more</li>}
                </ul>
              </>
            ) : conflicts.checked ? (
              <p className="is-free">
                <CheckCircle2 size={14} /> {attendees.length ? "Everyone is free at this time." : "You are free at this time."}
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-field">
          <label htmlFor="mt-agenda">Agenda</label>
          <textarea
            id="mt-agenda"
            rows={3}
            maxLength={5000}
            value={form.agenda}
            placeholder={"1. Updates\n2. Blockers\n3. Next steps"}
            onChange={(e) => set("agenda", e.target.value)}
          />
        </div>

        <div className="mt-field">
          <label htmlFor="mt-desc">Description</label>
          <textarea
            id="mt-desc"
            rows={3}
            maxLength={5000}
            value={form.description}
            placeholder="Add context, documents to read beforehand, or anything attendees should know."
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        {isEdit && (
          <div className="mt-field">
            <label htmlFor="mt-notes">Notes / minutes</label>
            <textarea
              id="mt-notes"
              rows={3}
              maxLength={10000}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        )}
      </form>
    </Modal>
  );
}