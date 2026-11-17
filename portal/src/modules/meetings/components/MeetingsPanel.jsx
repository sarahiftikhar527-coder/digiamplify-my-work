
import { useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  ExternalLink,
  Plus,
  Video,
  X,
} from "lucide-react";

import meetingsService, {
  meetingErrorMessage,
} from "@/services/meetingsService";

import {
  useMeetings,
  useMeetingSummary,
  useNow,
} from "../hooks";

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

  if (key === toDateKey(now)) {
    return "Today";
  }

  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  if (key === toDateKey(tomorrow)) {
    return "Tomorrow";
  }

  return formatDateShort(iso);
};

export default function MeetingsPanel({
  refreshKey = 0,
  onSchedule,
  onOpen,
  onChanged,
}) {
  const now = useNow(30000);

  const [localTick, setLocalTick] = useState(0);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState(null);

  const range = useMemo(() => {
    const start = new Date();

    start.setHours(0, 0, 0, 0);

    const end = new Date(start);

    end.setDate(end.getDate() + 15);

    return {
      from: start.toISOString(),
      to: end.toISOString(),
      scope: "mine",
    };
  }, []);

  const list = useMeetings(
    range,
    [refreshKey, localTick]
  );

  const summary = useMeetingSummary(
    getTzOffset(),
    [refreshKey, localTick]
  );

  const upcoming = useMemo(
    () =>
      (list.data || [])
        .filter(
          (meeting) =>
            meeting.status !== "cancelled" &&
            new Date(meeting.endAt) >= now
        )
        .sort(
          (a, b) =>
            new Date(a.startAt) - new Date(b.startAt)
        ),
    [list.data, now]
  );

  const next = upcoming[0] || null;

  const invites = upcoming
    .filter(
      (meeting) =>
        meeting.myRsvp === "pending" &&
        !meeting.isOrganizer
    )
    .slice(0, 3);

  const rest = upcoming
    .filter((meeting) => meeting !== next)
    .slice(0, 5);

  const stats = summary.data;

  const reply = async (meeting, response) => {
    const responseId = `${meeting.id}-${meeting.occurrenceKey}`;

    if (respondingId) return;

    setError("");
    setRespondingId(responseId);

    try {
      await meetingsService.respond(
        meeting.id,
        response
      );

      setLocalTick((current) => current + 1);

      onChanged?.();
    } catch (e) {
      setError(
        meetingErrorMessage(
          e,
          "Unable to save your response."
        )
      );
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <section
      className="mt-card"
      aria-label="Meetings"
    >
      {/* Header */}

      <header className="mt-card__head">
        <h3>
          <CalendarClock size={13} />
          Meetings
        </h3>

        <button
          type="button"
          className="mt-btn mt-btn--primary mt-btn--sm"
          onClick={() => onSchedule?.()}
        >
          <Plus size={13} />
          Schedule
        </button>
      </header>

      {/* Loading */}

      {list.loading && !list.data ? (
        <p className="mt-muted">
          Loading meetings...
        </p>
      ) : list.error ? (
        <p
          className="mt-muted mt-muted--error"
          role="alert"
        >
          {list.error}{" "}

          <button
            type="button"
            className="mt-link"
            onClick={list.reload}
          >
            Retry
          </button>
        </p>
      ) : (
        <>
          {/* Meeting statistics */}

          <div className="mt-stats3">
            <div>
              <strong>
                {stats?.today ?? "–"}
              </strong>

              <span>Today</span>
            </div>

            <div>
              <strong>
                {stats?.next7Days ?? "–"}
              </strong>

              <span>Next 7 days</span>
            </div>

            <div>
              <strong
                className={
                  stats?.pendingInvites
                    ? "is-alert"
                    : ""
                }
              >
                {stats?.pendingInvites ?? "–"}
              </strong>

              <span>Invites</span>
            </div>
          </div>

          {/* Next meeting */}

          {next ? (
            <button
              type="button"
              className="mt-next"
              onClick={() => onOpen?.(next)}
            >
              <span className="mt-next__tag">
                {meetingPhase(next, now) === "live"
                  ? "Happening now"
                  : `Next · ${relativeStart(next, now)}`}
              </span>

              <strong>
                {next.title}
              </strong>

              <span className="mt-next__time">
                {dayLabel(next.startAt, now)}
                {" · "}
                {format12(next.startAt)}
                {" - "}
                {format12(next.endAt)}
              </span>

              {next.meetingLink && (
                <a
                  className="mt-next__join"
                  href={next.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  <Video size={12} />
                  Join
                  <ExternalLink size={11} />
                </a>
              )}
            </button>
          ) : (
            <p className="mt-muted">
              No meetings in the next two weeks.
            </p>
          )}

          {/* Response error */}

          {error && (
            <p
              className="mt-muted mt-muted--error"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* Invitations */}

          {invites.length > 0 && (
            <div className="mt-invites">
              <h4>
                Invitations
              </h4>

              {invites.map((meeting) => {
                const responseId = `${meeting.id}-${meeting.occurrenceKey}`;

                const isResponding =
                  respondingId === responseId;

                return (
                  <div
                    key={responseId}
                    className="mt-invite"
                  >
                    <button
                      type="button"
                      onClick={() => onOpen?.(meeting)}
                    >
                      <strong>
                        {meeting.title}
                      </strong>

                      <small>
                        {dayLabel(
                          meeting.startAt,
                          now
                        )}
                        {" · "}
                        {format12(meeting.startAt)}
                        {" · from "}
                        {meeting.organizer?.name ||
                          "Organizer"}
                      </small>
                    </button>

                    <div>
                      <button
                        type="button"
                        aria-label={`Accept ${meeting.title}`}
                        className="is-yes"
                        disabled={Boolean(respondingId)}
                        onClick={() =>
                          reply(meeting, "accepted")
                        }
                      >
                        <Check size={13} />
                      </button>

                      <button
                        type="button"
                        aria-label={`Decline ${meeting.title}`}
                        className="is-no"
                        disabled={Boolean(respondingId)}
                        onClick={() =>
                          reply(meeting, "declined")
                        }
                      >
                        <X size={13} />
                      </button>

                      {isResponding && (
                        <span className="mt-muted">
                          Saving...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upcoming agenda */}

          {rest.length > 0 && (
            <ul className="mt-agenda">
              {rest.map((meeting) => (
                <li
                  key={`${meeting.id}-${meeting.occurrenceKey}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      onOpen?.(meeting)
                    }
                  >
                    <i
                      style={{
                        background:
                          CATEGORIES[
                            meeting.category
                          ]?.color || "#777",
                      }}
                    />

                    <span>
                      <strong>
                        {meeting.title}
                      </strong>

                      <small>
                        {dayLabel(
                          meeting.startAt,
                          now
                        )}
                        {" · "}
                        {format12(meeting.startAt)}
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
