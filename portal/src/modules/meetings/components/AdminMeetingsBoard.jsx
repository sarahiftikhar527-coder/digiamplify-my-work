import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Download,
  MapPin,
  Mail,
  Percent,
  Plus,
  Repeat,
  Search,
  Users,
  Video,
  ExternalLink,
  RotateCcw,
  Activity,
} from "lucide-react";
import { useDebounced, useMeetings, useMeetingSummary, useNow } from "../hooks";
import {
  CATEGORIES,
  durationText,
  exportMeetingsCSV,
  format12,
  formatDateLong,
  getTzOffset,
  meetingPhase,
  minutesBetween,
  relativeStart,
  toDateKey,
} from "../utils";
import { Avatar } from "./Shell";
import "../meetings.css";

const RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "Next 7 days" },
  { value: "month", label: "Next 30 days" },
  { value: "past", label: "Past 30 days" },
];

const DEFAULTS = { range: "week", scope: "all", category: "", status: "scheduled", search: "" };
const PAGE_SIZE = 30;

function rangeFor(value) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  if (value === "today") end.setDate(end.getDate() + 1);
  else if (value === "week") end.setDate(end.getDate() + 7);
  else if (value === "month") end.setDate(end.getDate() + 30);
  else if (value === "past") {
    end.setDate(end.getDate() + 1);
    start.setDate(start.getDate() - 30);
  }
  return { from: start.toISOString(), to: new Date(end.getTime() - 1).toISOString() };
}

const dayHeading = (iso, now) => {
  const key = toDateKey(iso);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offset = Math.round((new Date(`${key}T00:00:00`) - today) / 86400000);
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  if (offset === -1) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "long" });
};

const donutBackground = (entries, total) => {
  if (!total) return "#1a1a1a";
  let acc = 0;
  const parts = entries.map(([key, count]) => {
    const start = (acc / total) * 100;
    acc += count;
    const end = (acc / total) * 100;
    return `${CATEGORIES[key]?.color || "#777"} ${start}% ${end}%`;
  });
  return `conic-gradient(${parts.join(", ")})`;
};

function Kpi({ icon: Icon, label, value, hint, tone = "#e5192b" }) {
  return (
    <div className="mtb-kpi" style={{ "--tone": tone }}>
      <span className="mtb-kpi__icon" aria-hidden="true">
        <Icon size={16} />
      </span>
      <div>
        <span className="mtb-kpi__label">{label}</span>
        <strong className="mtb-kpi__value">{value}</strong>
        {hint && <small className="mtb-kpi__hint">{hint}</small>}
      </div>
    </div>
  );
}

function AttendeeStack({ attendees = [], total }) {
  const shown = attendees.slice(0, 3);
  const extra = Math.max(0, total - shown.length - 1);
  return (
    <span className="mtb-stack" aria-label={`${total} people`}>
      {shown.map((a) => (
        <span key={a.userId} className="mtb-stack__item" title={a.name}>
          <Avatar name={a.name} src={a.avatarUrl} size={24} />
        </span>
      ))}
      {extra > 0 && <span className="mtb-stack__more">+{extra}</span>}
      {shown.length === 0 && (
        <span className="mtb-stack__solo">
          <Users size={12} /> Just organizer
        </span>
      )}
    </span>
  );
}

function RsvpMeter({ summary = {}, total }) {
  const count = total || 1;
  const pct = (n) => `${((n || 0) / count) * 100}%`;
  return (
    <span
      className="mtb-meter"
      role="img"
      aria-label={`${summary.accepted || 0} accepted, ${summary.tentative || 0} maybe, ${summary.declined || 0} declined, ${summary.pending || 0} waiting`}
    >
      <i className="is-yes" style={{ width: pct(summary.accepted) }} />
      <i className="is-maybe" style={{ width: pct(summary.tentative) }} />
      <i className="is-no" style={{ width: pct(summary.declined) }} />
    </span>
  );
}

function Skeleton() {
  return (
    <div className="mtb-skels" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="mtb-skel" />
      ))}
    </div>
  );
}

export default function AdminMeetingsBoard({ refreshKey = 0, onOpen, onSchedule }) {
  const now = useNow(30000);
  const [range, setRange] = useState(DEFAULTS.range);
  const [scope, setScope] = useState(DEFAULTS.scope);
  const [category, setCategory] = useState(DEFAULTS.category);
  const [status, setStatus] = useState(DEFAULTS.status);
  const [search, setSearch] = useState(DEFAULTS.search);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const q = useDebounced(search.trim(), 300);

  const params = useMemo(
    () => ({ ...rangeFor(range), scope, category, status, q }),
    [range, scope, category, status, q]
  );

  const list = useMeetings(params, [refreshKey]);
  const summary = useMeetingSummary(getTzOffset(), [refreshKey]);
  const org = summary.data?.org;

  const rows = list.data || [];
  const visibleRows = rows.slice(0, limit);

  const groups = useMemo(() => {
    const map = new Map();
    visibleRows.forEach((m) => {
      const key = toDateKey(m.startAt);
      map.set(key, [...(map.get(key) || []), m]);
    });
    return [...map.entries()];
  }, [visibleRows]);

  const live = useMemo(() => {
    const active = rows.filter((m) => m.status !== "cancelled");
    const responses = { accepted: 0, tentative: 0, declined: 0, pending: 0 };
    active.forEach((m) => {
      Object.keys(responses).forEach((k) => {
        responses[k] += m.rsvpSummary?.[k] || 0;
      });
    });
    return {
      count: active.length,
      liveNow: active.filter((m) => meetingPhase(m, now) === "live").length,
      hours:
        Math.round((active.reduce((s, m) => s + minutesBetween(m.startAt, m.endAt), 0) / 60) * 10) / 10,
      responses,
      invited: responses.accepted + responses.tentative + responses.declined + responses.pending,
    };
  }, [rows, now]);

  const categoryEntries = org ? Object.entries(org.byCategory).sort((a, b) => b[1] - a[1]) : [];
  const categoryTotal = categoryEntries.reduce((s, [, c]) => s + c, 0);
  const topMax = org?.topOrganizers?.[0]?.count || 1;

  const isFiltered =
    range !== DEFAULTS.range ||
    scope !== DEFAULTS.scope ||
    category !== DEFAULTS.category ||
    status !== DEFAULTS.status ||
    search !== DEFAULTS.search;

  const reset = () => {
    setRange(DEFAULTS.range);
    setScope(DEFAULTS.scope);
    setCategory(DEFAULTS.category);
    setStatus(DEFAULTS.status);
    setSearch(DEFAULTS.search);
    setLimit(PAGE_SIZE);
  };

  const pctOf = (n) => (live.invited ? (n / live.invited) * 100 : 0);

  return (
    <section className="mt-board" aria-label="Meetings overview">
      <header className="mtb-head">
        <div className="mtb-title">
          <span className="mtb-title__icon" aria-hidden="true">
            <CalendarDays size={20} />
          </span>
          <div>
            <h2>
              Meetings
              {live.liveNow > 0 && (
                <span className="mtb-live">
                  <i /> {live.liveNow} live now
                </span>
              )}
            </h2>
            <p>Company-wide schedule, attendance responses and meeting analytics.</p>
          </div>
        </div>
        <div className="mtb-actions">
          <button
            type="button"
            className="mt-btn"
            disabled={!rows.length}
            onClick={() => exportMeetingsCSV(rows)}
          >
            <Download size={14} /> Export CSV
          </button>
          <button type="button" className="mt-btn mt-btn--primary" onClick={() => onSchedule?.()}>
            <Plus size={14} /> Schedule meeting
          </button>
        </div>
      </header>

      <div className="mtb-kpis">
        <Kpi
          icon={CalendarDays}
          label="Meetings this month"
          value={org?.total ?? "–"}
          hint={org ? `${org.cancelled} cancelled` : ""}
          tone="#e5192b"
        />
        <Kpi
          icon={Clock}
          label="Meeting hours"
          value={org ? `${org.totalHours}h` : "–"}
          hint="Scheduled this month"
          tone="#4aa3ff"
        />
        <Kpi
          icon={Users}
          label="Avg. attendees"
          value={org?.avgAttendees ?? "–"}
          hint="Including organizer"
          tone="#a05cff"
        />
        <Kpi
          icon={Percent}
          label="Response rate"
          value={org ? `${org.responseRate}%` : "–"}
          hint="Invites answered"
          tone="#22c55e"
        />
        <Kpi
          icon={Mail}
          label="Your pending invites"
          value={summary.data?.pendingInvites ?? "–"}
          hint="Awaiting your reply"
          tone="#f5a524"
        />
      </div>

      {org && org.total > 0 && (
        <div className="mtb-insights">
          <article className="mtb-panel">
            <h4>By category</h4>
            <div className="mtb-donut">
              <div className="mtb-donut__ring" style={{ background: donutBackground(categoryEntries, categoryTotal) }}>
                <div className="mtb-donut__hole">
                  <strong>{categoryTotal}</strong>
                  <span>meetings</span>
                </div>
              </div>
              <ul className="mtb-legend">
                {categoryEntries.map(([key, count]) => (
                  <li key={key}>
                    <i style={{ background: CATEGORIES[key]?.color }} />
                    <span>{CATEGORIES[key]?.label || key}</span>
                    <b>{count}</b>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="mtb-panel">
            <h4>Top organizers</h4>
            <ol className="mtb-rank">
              {org.topOrganizers.map((o, i) => (
                <li key={o.id}>
                  <span className="mtb-rank__pos">{i + 1}</span>
                  <Avatar name={o.name} size={28} />
                  <div className="mtb-rank__body">
                    <strong>{o.name}</strong>
                    <span className="mtb-rank__bar">
                      <i style={{ width: `${Math.max(8, (o.count / topMax) * 100)}%` }} />
                    </span>
                  </div>
                  <b>{o.count}</b>
                </li>
              ))}
            </ol>
          </article>

          <article className="mtb-panel">
            <h4>
              Attendance responses <small>in the list below</small>
            </h4>
            {live.invited ? (
              <>
                <div className="mtb-stacked" role="img" aria-label="RSVP breakdown">
                  <i className="is-yes" style={{ width: `${pctOf(live.responses.accepted)}%` }} />
                  <i className="is-maybe" style={{ width: `${pctOf(live.responses.tentative)}%` }} />
                  <i className="is-no" style={{ width: `${pctOf(live.responses.declined)}%` }} />
                  <i className="is-wait" style={{ width: `${pctOf(live.responses.pending)}%` }} />
                </div>
                <ul className="mtb-resp">
                  <li><i className="is-yes" /> Accepted <b>{live.responses.accepted}</b></li>
                  <li><i className="is-maybe" /> Maybe <b>{live.responses.tentative}</b></li>
                  <li><i className="is-no" /> Declined <b>{live.responses.declined}</b></li>
                  <li><i className="is-wait" /> Waiting <b>{live.responses.pending}</b></li>
                </ul>
              </>
            ) : (
              <p className="mt-muted">No invitations in the selected range.</p>
            )}
          </article>
        </div>
      )}

      <div className="mtb-toolbar">
        <div className="mtb-seg" role="tablist" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              role="tab"
              aria-selected={range === r.value}
              className={range === r.value ? "is-active" : ""}
              onClick={() => {
                setRange(r.value);
                setLimit(PAGE_SIZE);
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="mt-search mtb-search">
          <Search size={14} aria-hidden="true" />
          <input
            type="search"
            value={search}
            placeholder="Search title, description or location"
            aria-label="Search meetings"
            onChange={(e) => {
              setSearch(e.target.value);
              setLimit(PAGE_SIZE);
            }}
          />
        </div>

        <select value={scope} onChange={(e) => setScope(e.target.value)} aria-label="Whose meetings">
          <option value="all">All meetings</option>
          <option value="mine">My meetings</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {Object.entries(CATEGORIES).map(([value, c]) => (
            <option key={value} value={value}>
              {c.label}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="scheduled">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="all">All statuses</option>
        </select>

        {isFiltered && (
          <button type="button" className="mtb-reset" onClick={reset}>
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {!list.loading && !list.error && rows.length > 0 && (
        <p className="mtb-summary">
          <Activity size={13} /> {live.count} meeting{live.count === 1 ? "" : "s"} · {live.hours}h scheduled
          {live.liveNow > 0 && ` · ${live.liveNow} happening now`}
        </p>
      )}

      {list.error && (
        <p className="mt-alert mt-alert--error" role="alert">
          {list.error}{" "}
          <button type="button" className="mt-link" onClick={list.reload}>
            Retry
          </button>
        </p>
      )}

      <div className="mtb-list" aria-busy={list.loading}>
        {list.loading && !list.data ? (
          <Skeleton />
        ) : groups.length === 0 ? (
          <div className="mtb-empty">
            <span aria-hidden="true">
              <CalendarDays size={26} />
            </span>
            <h4>No meetings found</h4>
            <p>Try a different date range or clear the filters.</p>
            <div>
              {isFiltered && (
                <button type="button" className="mt-btn" onClick={reset}>
                  <RotateCcw size={13} /> Reset filters
                </button>
              )}
              <button type="button" className="mt-btn mt-btn--primary" onClick={() => onSchedule?.()}>
                <Plus size={13} /> Schedule meeting
              </button>
            </div>
          </div>
        ) : (
          groups.map(([day, items]) => (
            <section key={day} className="mtb-day">
              <h4>
                <strong>{dayHeading(items[0].startAt, now)}</strong>
                <span>{formatDateLong(items[0].startAt)}</span>
                <em>{items.length}</em>
              </h4>

              {items.map((m) => {
                const phase = meetingPhase(m, now);
                const color = CATEGORIES[m.category]?.color || "#9a9a9a";
                const canJoin =
                  m.meetingLink && m.status !== "cancelled" && phase !== "past" && phase !== "completed";
                const open = () => onOpen?.(m);

                return (
                  <div
                    key={`${m.id}-${m.occurrenceKey}`}
                    role="button"
                    tabIndex={0}
                    className={`mtb-row is-${phase}`}
                    style={{ "--c": color }}
                    onClick={open}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        open();
                      }
                    }}
                  >
                    <span className="mtb-row__time">
                      <strong>{format12(m.startAt)}</strong>
                      <small>{durationText(minutesBetween(m.startAt, m.endAt))}</small>
                    </span>

                    <i className="mtb-row__bar" />

                    <span className="mtb-row__main">
                      <strong>
                        {m.title}
                        {m.priority === "high" && <em>High</em>}
                        {m.recurrence !== "none" && (
                          <Repeat size={12} className="mtb-row__repeat" aria-label="Recurring" />
                        )}
                      </strong>
                      <small>
                        <span className="mtb-tag" style={{ "--c": color }}>
                          {CATEGORIES[m.category]?.label || m.category}
                        </span>
                        <span className="mtb-by">
                          <Avatar name={m.organizer?.name} src={m.organizer?.avatarUrl} size={16} />
                          {m.organizer?.name || "Organizer"}
                        </span>
                        {m.meetingLink && (
                          <span className="mtb-where">
                            <Video size={11} /> Online
                          </span>
                        )}
                        {m.location && (
                          <span className="mtb-where">
                            <MapPin size={11} /> {m.location}
                          </span>
                        )}
                      </small>
                    </span>

                    <span className="mtb-row__people">
                      <AttendeeStack attendees={m.attendees} total={m.attendeeCount} />
                    </span>

                    <span className="mtb-row__rsvp" title="Attendance responses">
                      <RsvpMeter summary={m.rsvpSummary} total={m.attendees.length} />
                      <small>
                        {m.rsvpSummary.accepted}/{m.attendees.length} accepted
                      </small>
                    </span>

                    <span className="mtb-row__end">
                      <span className={`mt-badge mt-badge--phase is-${phase}`}>
                        {phase === "upcoming"
                          ? relativeStart(m, now)
                          : phase === "live"
                            ? "Live"
                            : phase === "cancelled"
                              ? "Cancelled"
                              : phase === "completed"
                                ? "Completed"
                                : "Ended"}
                      </span>
                      {canJoin && (
                        <a
                          className="mtb-join"
                          href={m.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={12} /> Join
                        </a>
                      )}
                    </span>
                  </div>
                );
              })}
            </section>
          ))
        )}

        {rows.length > limit && (
          <button type="button" className="mt-btn mtb-more" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
            Show more ({rows.length - limit} remaining)
          </button>
        )}
      </div>
    </section>
  );
}