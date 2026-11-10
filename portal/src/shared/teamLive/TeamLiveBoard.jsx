import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Loader2,
  Network,
  RefreshCw,
  Search,
  Activity,
} from "lucide-react";

import useTeamLive from "@/hooks/useTeamLive";
import PersonCard from "./PersonCard";
import ActivityFeed from "./ActivityFeed";
import {
  STATUS_FILTERS,
  STATUS_META,
  countByStatus,
  formatAgo,
  formatDuration,
  getLiveWorkedMinutes,
  groupPeople,
  matchesFilters,
} from "./teamLiveUtils";

// Re-renders the board every few seconds so running timers stay current.
function useTicker(intervalMs = 10000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

const TABS = [
  { key: "hierarchy", label: "Live Hierarchy", icon: Network },
  { key: "activity", label: "Activity Feed", icon: Activity },
];

/**
 * Shared live board.
 *   mode="admin"    -> every person, all details, date picker.
 *   mode="employee" -> every person's clock-ins for today (no notes/e-mails).
 *   embedded        -> no outer padding/background (used inside other pages).
 */
export default function TeamLiveBoard({ mode = "employee", embedded = false }) {
  const isAdminView = mode === "admin";

  const [date, setDate] = useState("");
  const [tab, setTab] = useState("hierarchy");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [expanded, setExpanded] = useState(() => new Set());
  const [collapsedDepartments, setCollapsedDepartments] = useState(
    () => new Set()
  );

  const { data, loading, refreshing, error, updatedAt, reload } = useTeamLive({
    date: isAdminView ? date : "",
  });

  const ticker = useTicker();

  // A past day uses the server time of the response so nothing keeps "running".
  const now = useMemo(
    () => (data && !data.isToday ? new Date(data.serverTime) : ticker),
    [data, ticker]
  );

  const people = useMemo(() => data?.people || [], [data]);
  const events = useMemo(() => data?.events || [], [data]);

  const counts = useMemo(() => countByStatus(people), [people]);

  const totalWorked = useMemo(
    () =>
      people.reduce((sum, person) => sum + getLiveWorkedMinutes(person, now), 0),
    [people, now]
  );

  const visiblePeople = useMemo(
    () => people.filter((person) => matchesFilters(person, search, status)),
    [people, search, status]
  );

  const { admins, departments } = useMemo(
    () => groupPeople(visiblePeople),
    [visiblePeople]
  );

  const toggle = (id) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleDepartment = (name) =>
    setCollapsedDepartments((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const expandAll = () => setExpanded(new Set(visiblePeople.map((p) => p.id)));
  const collapseAll = () => setExpanded(new Set());

  const summaryCards = [
    { key: "working", label: "Working", value: counts.working },
    { key: "break", label: "On break", value: counts.break },
    { key: "out", label: "Clocked out", value: counts.out },
    { key: "not_in", label: "Not clocked in", value: counts.not_in },
  ];

  return (
    <div
      className={
        embedded ? "text-white" : "min-h-full bg-black p-6 text-white"
      }
    >
      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-neutral-300">
          <span className="relative flex h-2.5 w-2.5">
            {data?.isToday !== false && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            )}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                data?.isToday === false ? "bg-neutral-500" : "bg-emerald-500"
              }`}
            />
          </span>

          <span>
            {data?.isToday === false ? "History" : "Live"}
            {updatedAt && (
              <span className="text-neutral-500">
                {" "}
                · updated {formatAgo(updatedAt, now)}
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdminView && (
            <>
              <label className="flex items-center gap-2 rounded-md border border-[#333] bg-[#0b0b0b] px-3 py-2 text-sm text-white">
                <CalendarDays size={15} className="text-red-500" />
                <input
                  type="date"
                  value={date || data?.date || ""}
                  onChange={(event) => setDate(event.target.value)}
                  className="bg-transparent text-white outline-none [color-scheme:dark]"
                />
              </label>

              {date && (
                <button
                  type="button"
                  onClick={() => setDate("")}
                  className="rounded-md border border-red-800 px-3 py-2 text-sm text-red-300 transition hover:bg-red-950/50"
                >
                  Back to today
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={reload}
            disabled={loading || refreshing}
            className="flex items-center gap-2 rounded-md border border-[#333] bg-[#0b0b0b] px-4 py-2 text-sm text-white transition hover:border-red-700 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading || refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {summaryCards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => setStatus(status === card.key ? "all" : card.key)}
            className={`flex items-center justify-between gap-2 rounded-md border px-4 py-3 text-left text-sm transition ${
              status === card.key
                ? "border-red-700 bg-[#1a0808]"
                : "border-[#222] bg-[#0b0b0b] hover:border-[#444]"
            }`}
          >
            <span className="flex items-center gap-2 text-neutral-300">
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

        <div className="col-span-2 flex items-center justify-between gap-2 rounded-md border border-[#222] bg-[#0b0b0b] px-4 py-3 text-sm lg:col-span-1">
          <span className="text-neutral-300">Total worked</span>
          <span className="text-lg font-semibold tabular-nums text-white">
            {formatDuration(totalWorked)}
          </span>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded border border-red-900/70 bg-red-950/40 px-4 py-3 text-sm text-red-400"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={reload}
            className="shrink-0 font-semibold hover:text-white"
          >
            Retry
          </button>
        </p>
      )}

      <div className="rounded-md border border-[#222] bg-[#0b0b0b]">
        {/* Tabs, search and filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222] p-3">
          <div className="flex gap-1 rounded-md border border-[#222] bg-black p-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm transition ${
                  tab === key
                    ? "bg-[#c1121f] font-medium text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-md border border-[#222] bg-black px-3 py-1.5 text-sm text-white">
              <Search size={14} className="text-neutral-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or department"
                className="w-48 bg-transparent text-white outline-none placeholder:text-neutral-600"
              />
            </label>

            {tab === "hierarchy" && (
              <>
                <button
                  type="button"
                  onClick={expandAll}
                  className="rounded-md border border-[#222] px-3 py-1.5 text-xs text-neutral-300 hover:border-[#444]"
                >
                  Expand all
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="rounded-md border border-[#222] px-3 py-1.5 text-xs text-neutral-300 hover:border-[#444]"
                >
                  Collapse all
                </button>
              </>
            )}
          </div>
        </div>

        {tab === "hierarchy" && (
          <div className="flex flex-wrap gap-2 border-b border-[#222] px-3 py-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setStatus(filter.key)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  status === filter.key
                    ? "border-red-700 bg-red-950/50 text-white"
                    : "border-[#222] text-neutral-400 hover:border-[#444]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}

        <div className="p-4">
          {loading && !data ? (
            <div className="flex items-center gap-2 px-2 py-10 text-neutral-400">
              <Loader2 size={18} className="animate-spin" />
              Loading...
            </div>
          ) : tab === "activity" ? (
            <ActivityFeed events={events} now={now} search={search} />
          ) : visiblePeople.length === 0 ? (
            <p className="px-2 py-10 text-neutral-400">
              No people match the current filters.
            </p>
          ) : (
            <div>
              {/* Level 1: admin(s) */}
              {admins.length > 0 && (
                <div className="flex flex-col gap-2">
                  {admins.map((admin) => (
                    <PersonCard
                      key={admin.id}
                      person={admin}
                      now={now}
                      highlight
                      isAdminView={isAdminView}
                      expanded={expanded.has(admin.id)}
                      onToggle={() => toggle(admin.id)}
                    />
                  ))}
                </div>
              )}

              {/* Level 2: departments, level 3: employees */}
              <div
                className={
                  admins.length > 0
                    ? "ml-5 mt-3 border-l border-[#333] pl-5"
                    : ""
                }
              >
                {departments.map((department) => {
                  const collapsed = collapsedDepartments.has(department.name);
                  const departmentCounts = countByStatus(department.members);

                  const departmentWorked = department.members.reduce(
                    (sum, person) => sum + getLiveWorkedMinutes(person, now),
                    0
                  );

                  return (
                    <div key={department.name} className="mb-5 last:mb-0">
                      <button
                        type="button"
                        onClick={() => toggleDepartment(department.name)}
                        aria-expanded={!collapsed}
                        className="mb-2 flex w-full flex-wrap items-center justify-between gap-2 text-left"
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold text-red-500">
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${
                              collapsed ? "-rotate-90" : ""
                            }`}
                          />
                          {department.name}
                          <span className="font-normal text-neutral-500">
                            ({department.members.length})
                          </span>
                        </span>

                        <span className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-400">
                          <span className="text-emerald-400">
                            {departmentCounts.working} working
                          </span>
                          <span className="text-amber-400">
                            {departmentCounts.break} on break
                          </span>
                          <span>{departmentCounts.out} out</span>
                          <span className="text-red-400">
                            {departmentCounts.not_in} not in
                          </span>
                          <span className="tabular-nums text-white/70">
                            {formatDuration(departmentWorked)}
                          </span>
                        </span>
                      </button>

                      {!collapsed && (
                        <div className="ml-3 flex flex-col gap-2 border-l border-[#333] pl-4">
                          {department.members.map((person) => (
                            <PersonCard
                              key={person.id}
                              person={person}
                              now={now}
                              isAdminView={isAdminView}
                              expanded={expanded.has(person.id)}
                              onToggle={() => toggle(person.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}