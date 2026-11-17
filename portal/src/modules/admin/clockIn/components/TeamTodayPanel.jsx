
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Coffee,
  Loader2,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import apiClient from "@/services/api/apiClient.js";
import useTeamLive from "@/hooks/useTeamLive";
import ActivityFeed from "@/shared/teamLive/ActivityFeed";
import {
  STATUS_FILTERS,
  STATUS_META,
  countByStatus,
  formatAgo,
  formatDuration,
  formatTime,
  getLiveWorkedMinutes,
  initials,
  matchesFilters,
  sortMembers,
} from "@/shared/teamLive/teamLiveUtils";

function useTicker(intervalMs = 10000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

const avatarCache = new Map();

function useAuthenticatedAvatar(avatarUrl) {
  const [imageUrl, setImageUrl] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!avatarUrl) {
      setImageUrl("");
      setFailed(false);
      return undefined;
    }

    let active = true;
    let objectUrl = "";

    setImageUrl("");
    setFailed(false);

    const loadAvatar = async () => {
      try {
        let blob = avatarCache.get(avatarUrl);

        if (!blob) {
          const response = await apiClient.get(avatarUrl, {
            responseType: "blob",
          });

          blob = response.data;
          avatarCache.set(avatarUrl, blob);
        }

        if (!active) return;

        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch {
        if (active) {
          setFailed(true);
        }
      }
    };

    loadAvatar();

    return () => {
      active = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [avatarUrl]);

  return { imageUrl, failed };
}

const Cell = ({ label, value, strong }) => (
  <div className="min-w-[64px]">
    <p className="text-[10px] uppercase tracking-wide text-white/40">
      {label}
    </p>
    <p
      className={`text-[12px] tabular-nums ${
        strong ? "font-semibold text-white" : "text-white/80"
      }`}
    >
      {value}
    </p>
  </div>
);

const PersonRow = ({ person, now, expanded, onToggle }) => {
  const meta = STATUS_META[person.status] || STATUS_META.not_in;
  const active = person.status === "working" || person.status === "break";
  const worked = getLiveWorkedMinutes(person, now);
  const hasSessions = (person.sessions || []).length > 0;

  const { imageUrl, failed } = useAuthenticatedAvatar(person.avatarUrl);

  return (
    <li className="rounded-lg border border-white/10 bg-[#121212]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full flex-wrap items-center gap-x-4 gap-y-3 px-3 py-3 text-left sm:px-4"
      >
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          {imageUrl && !failed ? (
            <img
              src={imageUrl}
              alt={`${person.name} profile`}
              className="h-10 w-10 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-[12px] font-semibold text-white/80">
              {initials(person.name)}
            </span>
          )}

          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#121212] ${meta.dot}`}
          />
        </span>

        <span className="min-w-[140px] flex-1">
          <span className="block truncate text-[13px] font-semibold text-white">
            {person.name}
            {person.isMe && (
              <span className="ml-1.5 text-[10px] font-normal text-white/40">
                (you)
              </span>
            )}
          </span>

          <span className="block truncate text-[11px] text-white/50">
            {[person.designation, person.department]
              .filter(Boolean)
              .join(" · ") || (person.role === "admin" ? "Admin" : "Employee")}
          </span>
        </span>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium ${meta.chip}`}
        >
          {meta.label}
        </span>

        <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Cell
            label="Clock In"
            value={formatTime(person.firstClockInAt)}
            strong={Boolean(person.firstClockInAt)}
          />
          <Cell
            label="Clock Out"
            value={active ? "Working" : formatTime(person.lastClockOutAt)}
            strong={Boolean(person.lastClockOutAt)}
          />
          <Cell
            label="Worked"
            value={hasSessions ? formatDuration(worked) : "--"}
            strong={hasSessions}
          />
        </span>

        <ChevronDown
          size={16}
          className={`ml-auto shrink-0 text-white/40 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="border-t border-white/10 px-3 py-3 sm:px-4">
          {!hasSessions ? (
            <p className="text-[12px] text-white/45">
              Has not clocked in today.
            </p>
          ) : (
            <ul className="space-y-2">
              {person.sessions.map((session, index) => (
                <li
                  key={session.id}
                  className="rounded-md border border-white/10 bg-[#0d0d0d] px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                    <span className="font-medium text-white">
                      Session {index + 1}
                    </span>

                    <span className="tabular-nums text-white/70">
                      {formatTime(session.clockInAt)}
                      {" → "}
                      {session.clockOutAt
                        ? formatTime(session.clockOutAt)
                        : "now"}
                    </span>

                    <span className="tabular-nums text-white/50">
                      {formatDuration(
                        session.clockOutAt
                          ? session.workedMinutes
                          : getLiveWorkedMinutes(
                              { sessions: [session] },
                              now
                            )
                      )}
                    </span>
                  </div>

                  {(session.breaks || []).length > 0 && (
                    <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-amber-300/80">
                      <Coffee size={12} />
                      {session.breaks.length} break
                      {session.breaks.length > 1 ? "s" : ""} ·{" "}
                      {formatDuration(session.breakMinutes)}
                    </p>
                  )}

                  {session.description && (
                    <p className="mt-2 whitespace-pre-line break-words rounded bg-white/[0.04] px-2.5 py-2 text-[11.5px] text-white/70">
                      {session.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
};

const TeamTodayPanel = () => {
  const { data, loading, refreshing, error, updatedAt, reload } = useTeamLive({
    intervalMs: 20000,
  });

  const now = useTicker();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [expanded, setExpanded] = useState(() => new Set());

  const people = useMemo(() => data?.people || [], [data]);
  const events = useMemo(() => data?.events || [], [data]);
  const counts = useMemo(() => countByStatus(people), [people]);

  const visible = useMemo(
    () =>
      sortMembers(
        people.filter((person) => matchesFilters(person, search, status))
      ),
    [people, search, status]
  );

  const toggle = (id) =>
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });

  const summary = [
    { key: "working", label: "Working", value: counts.working },
    { key: "break", label: "On break", value: counts.break },
    { key: "out", label: "Clocked out", value: counts.out },
    { key: "not_in", label: "Not clocked in", value: counts.not_in },
  ];

  return (
    <section className="mt-5 rounded-xl border border-white/10 bg-[#0d0d0d] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[14px] font-semibold text-white">
          <Users size={16} className="text-white/80" />
          Team Attendance · Today
        </h3>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-[11px] text-white/50">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            Live
            {updatedAt && <span>· updated {formatAgo(updatedAt, now)}</span>}
          </span>

          <button
            type="button"
            onClick={reload}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#121212] px-3 py-1.5 text-[11px] text-white transition hover:border-red-600 disabled:opacity-60"
          >
            <RefreshCw
              size={13}
              className={loading || refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {summary.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => setStatus(status === card.key ? "all" : card.key)}
            className={`flex items-center justify-between gap-2 rounded-lg border px-3.5 py-3 text-left text-[12px] transition ${
              status === card.key
                ? "border-red-600 bg-red-600/10"
                : "border-white/10 bg-[#121212] hover:border-white/25"
            }`}
          >
            <span className="flex items-center gap-2 text-white/70">
              <span
                className={`h-2.5 w-2.5 rounded-full ${STATUS_META[card.key].dot}`}
              />
              {card.label}
            </span>
            <span className="text-lg font-semibold text-white">
              {card.value}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-red-600/40 bg-red-600/10 px-4 py-2.5 text-[12px] text-red-300"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={reload}
            className="shrink-0 font-semibold hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setStatus(filter.key)}
              className={`rounded-full border px-3 py-1 text-[11px] transition ${
                status === filter.key
                  ? "border-red-600 bg-red-600/10 text-white"
                  : "border-white/10 text-white/50 hover:border-white/25"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 rounded-md border border-white/10 bg-[#121212] px-3 py-1.5 text-[12px] text-white">
          <Search size={13} className="text-white/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or department"
            className="w-44 bg-transparent text-white outline-none placeholder:text-white/35"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="flex h-[480px] min-h-0 min-w-0 flex-col rounded-lg border border-white/10 bg-[#121212] p-3 sm:p-4">
          <h4 className="mb-3 shrink-0 text-[12px] font-semibold text-white">
            Team Attendance
          </h4>

          <div className="min-h-0 flex-1 overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent]">
            {loading && !data ? (
              <div className="flex items-center gap-2 py-10 text-[12px] text-white/50">
                <Loader2 size={16} className="animate-spin" />
                Loading team attendance...
              </div>
            ) : visible.length === 0 ? (
              <p className="py-10 text-center text-[12px] text-white/45">
                No people match the current filters.
              </p>
            ) : (
              <ul className="space-y-2">
                {visible.map((person) => (
                  <PersonRow
                    key={person.id}
                    person={person}
                    now={now}
                    expanded={expanded.has(person.id)}
                    onToggle={() => toggle(person.id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex h-[480px] min-h-0 min-w-0 flex-col rounded-lg border border-white/10 bg-[#121212] p-3 sm:p-4">
          <h4 className="mb-3 shrink-0 text-[12px] font-semibold text-white">
            Recent Activity
          </h4>

          <div className="min-h-0 flex-1 overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent]">
            <ActivityFeed
              events={events.slice(0, 12)}
              now={now}
              search={search}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamTodayPanel;