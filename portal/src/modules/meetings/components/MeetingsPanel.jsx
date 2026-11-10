import { useMemo, useState } from "react";
import { CalendarClock, Check, ExternalLink, Plus, Video, X } from "lucide-react";
import meetingsService, { meetingErrorMessage } from "@/services/meetingsService";
import { useMeetings, useMeetingSummary, useNow } from "../hooks";
import {
  CATEGORIES,
  format12,
  formatDateShort,
  getTzOffset,
  meetingPhase,
  relativeStart,
  toDateKey,
} from "../utils";
import "../meetings.css";

const dayLabel = (iso, now) => {
  const key = toDateKey(iso);
  if (key === toDateKey(now)) return "Today";
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (key === toDateKey(tomorrow)) return "Tomorrow";
  return formatDateShort(iso);
};

export default function MeetingsPanel({ refreshKey = 0, onSchedule, onOpen, onChanged }) {
  const now = useNow(30000);
  const [localTick, setLocalTick] = useState(0);
  const [error, setError] = useState("");

  const range = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 15);
    return { from: start.toISOString(), to: end.toISOString(), scope: "mine" };
  }, []);

  const list = useMeetings(range, [refreshKey, localTick]);
  const summary = useMeetingSummary(getTzOffset(), [refreshKey, localTick]);

  const upcoming = useMemo(
    () =>
      (list.data || []).filter((m) => m.status !== "cancelled" && new Date(m.endAt) >= now),
    [list.data, now]
  );

  const next = upcoming[0] || null;
  const invites = upcoming.filter((m) => m.myRsvp === "pending" && !m.isOrganizer).slice(0, 3);
  const rest = upcoming.filter((m) => m !== next).slice(0, 5);
  const stats = summary.data;

  const reply = async (meeting, response) => {
    setError("");
    try {
      await meetingsService.respond(meeting.id, response);
      setLocalTick((t) => t + 1);
      onChanged?.();
    } catch (e) {
      setError(meetingErrorMessage(e, "Unable to save your response."));
    }
  };

  return (
    <section className="mt-card" aria-label="Meetings">
      <header className="mt-card__head">
        <h3>
          <CalendarClock size={13} /> Meetings
        </h3>
        <button type="button" className="mt-btn mt-btn--primary mt-btn--sm" onClick={() => onSchedule?.()}>
          <Plus size={13} /> Schedule
        </button>
      </header>

      {list.loading && !list.data ? (
        <p className="mt-muted">Loading meetings...</p>
      ) : list.error ? (
        <p className="mt-muted mt-muted--error" role="alert">
          {list.error}{" "}
          <button type="button" className="mt-link" onClick={list.reload}>
            Retry
          </button>
        </p>
      ) : (
        <>
          <div className="mt-stats3">
            <div>
              <strong>{stats?.today ?? "–"}</strong>
              <span>Today</span>
            </div>
            <div>
              <strong>{stats?.next7Days ?? "–"}</strong>
              <span>Next 7 days</span>
            </div>
            <div>
              <strong className={stats?.pendingInvites ? "is-alert" : ""}>{stats?.pendingInvites ?? "–"}</strong>
              <span>Invites</span>
            </div>
          </div>

          {next ? (
            <button type="button" className="mt-next" onClick={() => onOpen?.(next)}>
              <span className="mt-next__tag">
                {meetingPhase(next, now) === "live" ? "Happening now" : `Next · ${relativeStart(next, now)}`}
              </span>
              <strong>{next.title}</strong>
              <span className="mt-next__time">
                {dayLabel(next.startAt, now)}, {format12(next.startAt)} - {format12(next.endAt)}
              </span>
              {next.meetingLink && (
                <a
                  className="mt-next__join"
                  href={next.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Video size={12} /> Join <ExternalLink size={11} />
                </a>
              )}
            </button>
          ) : (
            <p className="mt-muted">No meetings in the next two weeks.</p>
          )}

          {error && (
            <p className="mt-muted mt-muted--error" role="alert">
              {error}
            </p>
          )}

          {invites.length > 0 && (
            <div className="mt-invites">
              <h4>Invitations</h4>
              {invites.map((m) => (
                <div key={`${m.id}-${m.occurrenceKey}`} className="mt-invite">
                  <button type="button" onClick={() => onOpen?.(m)}>
                    <strong>{m.title}</strong>
                    <small>
                      {dayLabel(m.startAt, now)} · {format12(m.startAt)} · from {m.organizer?.name}
                    </small>
                  </button>
                  <div>
                    <button type="button" aria-label={`Accept ${m.title}`} className="is-yes" onClick={() => reply(m, "accepted")}>
                      <Check size={13} />
                    </button>
                    <button type="button" aria-label={`Decline ${m.title}`} className="is-no" onClick={() => reply(m, "declined")}>
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <ul className="mt-agenda">
              {rest.map((m) => (
                <li key={`${m.id}-${m.occurrenceKey}`}>
                  <button type="button" onClick={() => onOpen?.(m)}>
                    <i style={{ background: CATEGORIES[m.category]?.color }} />
                    <span>
                      <strong>{m.title}</strong>
                      <small>
                        {dayLabel(m.startAt, now)} · {format12(m.startAt)}
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}