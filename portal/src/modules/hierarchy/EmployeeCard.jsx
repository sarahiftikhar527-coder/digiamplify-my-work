import { useState } from "react";
import { ArrowRightLeft, ChevronDown } from "lucide-react";
import { initials } from "./hierarchyUtils";

export function PersonAvatar({ person, size = 40 }) {
  const [failed, setFailed] = useState(false);

  if (person.avatarUrl && !failed) {
    return (
      <img
        src={person.avatarUrl}
        alt=""
        onError={() => setFailed(true)}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full bg-white/5 object-cover"
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-primary-dark font-semibold text-white"
    >
      {initials(person.name)}
    </span>
  );
}

const TONES = {
  amber: "bg-amber-400/10 text-amber-300",
  green: "bg-emerald-400/10 text-emerald-300",
  blue: "bg-sky-400/10 text-sky-300",
};

const Chip = ({ tone, children }) => (
  <span className={`rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold ${TONES[tone]}`}>
    {children}
  </span>
);

export default function EmployeeCard({
  person,
  isMe = false,
  director = false,
  managerName = "",
  directReports = 0,
  teamSize = 0,
  collapsed = false,
  onToggle,
  draggable = false,
  dragging = false,
  drop = "none", // none | valid | invalid
  over = false,
  matched = false,
  quick = null, // { label, onClick }
  onMove = null,
  handlers = {},
}) {
  const left = Math.max(0, (person.holidayTotal || 0) - (person.holidayUsed || 0));

  const cls = [
    "relative w-[224px] rounded-xl border p-3 text-left transition-all duration-200",
    teamSize > 0 ? "mb-3" : "",
    director
      ? "border-dashed border-white/15 bg-white/[0.02]"
      : "border-white/10 bg-[#101010] hover:border-white/25",
    isMe ? "!border-primary/70 shadow-[0_8px_30px_rgba(193,18,31,0.22)]" : "",
    draggable ? "cursor-grab active:cursor-grabbing" : "",
    dragging || drop === "invalid" ? "opacity-40" : "",
    drop === "valid" ? "ring-1 ring-emerald-500/50" : "",
    over ? "scale-[1.03] !bg-emerald-500/10 ring-2 ring-emerald-400" : "",
    matched ? "ring-2 ring-amber-400/70" : "",
  ].join(" ");

  return (
    <div draggable={draggable} {...handlers} className={cls}>
      <div className="flex items-center gap-2.5">
        <PersonAvatar person={person} />

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[14px] font-semibold text-white">
            <span className="truncate">{person.name}</span>
            {isMe && (
              <span className="rounded bg-primary/25 px-1 text-[9px] font-bold uppercase tracking-wide text-primary-light">
                You
              </span>
            )}
          </p>
          <p className="truncate text-[12px] text-white/50">
            {person.designation || (director ? "Director" : person.department || "Employee")}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Chip tone="amber">{person.weeklyHours || 0}h</Chip>
        {!director && (
          <Chip tone="green">
            {directReports} {directReports === 1 ? "report" : "reports"}
          </Chip>
        )}
        <Chip tone="blue">
          Hol {left}/{person.holidayTotal || 0}
        </Chip>
      </div>

      <p className="mt-2 truncate text-[11px] text-white/40">
        {director
          ? "Director · not in approval chain"
          : managerName
            ? `→ ${managerName}`
            : "Top of hierarchy"}
      </p>

      {(quick || onMove) && (
        <div className="mt-2 flex items-center gap-3 text-[11px] font-semibold">
          {quick && (
            <button
              type="button"
              onClick={quick.onClick}
              className="text-primary-light hover:underline"
            >
              {quick.label}
            </button>
          )}
          {onMove && (
            <button
              type="button"
              onClick={onMove}
              className="flex items-center gap-1 text-white/60 hover:text-white"
            >
              <ArrowRightLeft size={11} /> Move…
            </button>
          )}
        </div>
      )}

      {teamSize > 0 && onToggle && (
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? "Show team" : "Hide team"}
          className="absolute -bottom-3 left-1/2 z-10 flex h-6 min-w-[24px] -translate-x-1/2 items-center justify-center rounded-full border border-white/15 bg-[#1a1a1a] px-1.5 text-[10px] font-semibold text-white/80 transition hover:border-primary hover:text-white"
        >
          {collapsed ? `+${teamSize}` : <ChevronDown size={12} className="rotate-180" />}
        </button>
      )}
    </div>
  );
}