import { useMemo, useState } from "react";
import { Users } from "lucide-react";

import Card from "../Card";
import useNow from "../../../../../hooks/useNow";
import useTeamAttendance from "../../../../../hooks/useTeamAttendance";
import { formatDuration, formatTime } from "../../../../../utils/time";

// Order on the board: working, on break, clocked out, absent.
const STATE_RANK = { in: 0, break: 1, out: 2, absent: 3 };

const STATE_STYLE = {
  in: {
    label: "Working",
    cls: "border-green-500/40 bg-green-500/10 text-green-400",
    dot: "bg-green-400",
  },
  break: {
    label: "On Break",
    cls: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    dot: "bg-amber-400",
  },
  out: {
    label: "Clocked Out",
    cls: "border-white/15 bg-white/5 text-white/60",
    dot: "bg-white/40",
  },
  absent: {
    label: "Absent",
    cls: "border-red-500/40 bg-red-500/10 text-red-400",
    dot: "bg-red-400",
  },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "in", label: "Working" },
  { key: "break", label: "On Break" },
  { key: "out", label: "Clocked Out" },
  { key: "absent", label: "Absent" },
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

// Worked time in minutes. For someone who is working, the seconds that
// passed since the data arrived are added, so the value keeps growing.
const getWorkedMinutes = (member, nowMs) => {
  const extraSeconds =
    member.state === "in"
      ? Math.max(0, (nowMs - member.receivedAt) / 1000)
      : 0;

  return (member.workedSeconds + extraSeconds) / 60;
};

const Cell = ({ label, value, strong }) => (
  <div className="min-w-[64px]">
    <p className="text-[10px] uppercase tracking-wide text-white/40">{label}</p>
    <p
      className={`text-[12px] tabular-nums ${
        strong ? "font-semibold text-white" : "text-white/80"
      }`}
    >
      {value}
    </p>
  </div>
);

const MemberRow = ({ member, nowMs, isMe }) => {
  const style = STATE_STYLE[member.state] || STATE_STYLE.absent;
  const absent = member.state === "absent";

  return (
    <li
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border p-3 ${
        isMe ? "border-white/25 bg-[#161616]" : "border-white/10 bg-[#121212]"
      }`}
    >
      <div className="flex min-w-0 flex-1 basis-[160px] items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white">
          {getInitials(member.name)}
        </span>

        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-white">
            {member.name}
            {isMe && <span className="ml-1.5 text-[11px] text-white/40">(You)</span>}
          </p>
          <p className="truncate text-[11px] text-white/50">
            {member.designation || member.department || "Team member"}
          </p>
        </div>
      </div>

      <span
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${style.cls}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${style.dot} ${
            member.state === "in" ? "animate-pulse" : ""
          }`}
        />
        {style.label}
      </span>

      {absent ? (
        <p className="basis-full text-[11px] text-white/40 sm:basis-auto">
          Not clocked in today
        </p>
      ) : (
        <div className="flex basis-full gap-4 sm:basis-auto">
          <Cell label="Clock in" value={formatTime(member.firstClockInAt)} />
          <Cell
            label="Clock out"
            value={member.lastClockOutAt ? formatTime(member.lastClockOutAt) : "--:--"}
          />
          <Cell
            label="Worked"
            value={formatDuration(getWorkedMinutes(member, nowMs))}
            strong
          />
        </div>
      )}
    </li>
  );
};

// Shows every team member's status for today, live.
// Employees and admins both see it, so anyone can quickly check
// whether a colleague is available right now.
const TeamAttendanceCard = () => {
  const { members, meId, loading, error, reload } = useTeamAttendance();
  const now = useNow();
  const [filter, setFilter] = useState("all");

  const nowMs = now.getTime();

  const counts = useMemo(() => {
    const result = { all: members.length, in: 0, break: 0, out: 0, absent: 0 };

    members.forEach((member) => {
      result[member.state] = (result[member.state] || 0) + 1;
    });

    return result;
  }, [members]);

  const visible = useMemo(
    () =>
      members
        .filter((member) => filter === "all" || member.state === filter)
        .sort(
          (a, b) =>
            (STATE_RANK[a.state] ?? 9) - (STATE_RANK[b.state] ?? 9) ||
            a.name.localeCompare(b.name)
        ),
    [members, filter]
  );

  return (
    <Card icon={Users} title="Team Today">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
              filter === item.key
                ? "border-white bg-white text-black"
                : "border-white/15 text-white/60 hover:text-white"
            }`}
          >
            {item.label} · {counts[item.key] || 0}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-red-600/40 bg-red-600/10 px-3 py-2 text-[11px] text-red-300">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => reload()}
            className="font-semibold hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <p className="animate-pulse py-3 text-[12px] text-white/50">
          Loading team...
        </p>
      ) : visible.length === 0 ? (
        <p className="py-3 text-[12px] text-white/50">Nobody here.</p>
      ) : (
        <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {visible.map((member) => (
            <MemberRow
              key={member.userId}
              member={member}
              nowMs={nowMs}
              isMe={member.userId === meId}
            />
          ))}
        </ul>
      )}
    </Card>
  );
};

export default TeamAttendanceCard;