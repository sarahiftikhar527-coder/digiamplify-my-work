import { Coffee, LogIn, LogOut, RotateCcw } from "lucide-react";
import { formatAgo, formatTime } from "./teamLiveUtils";

const EVENT_META = {
  clock_in: {
    label: "clocked in",
    icon: LogIn,
    color: "text-emerald-400 bg-emerald-500/10",
  },
  clock_out: {
    label: "clocked out",
    icon: LogOut,
    color: "text-red-400 bg-red-500/10",
  },
  break_start: {
    label: "started a break",
    icon: Coffee,
    color: "text-amber-400 bg-amber-500/10",
  },
  break_end: {
    label: "is back from break",
    icon: RotateCcw,
    color: "text-sky-400 bg-sky-500/10",
  },
};

/* Chronological feed of every clock-in, clock-out and break (newest first). */
export default function ActivityFeed({ events = [], now, search = "" }) {
  const term = String(search || "").trim().toLowerCase();

  const visible = term
    ? events.filter((event) =>
        `${event.name} ${event.department}`.toLowerCase().includes(term)
      )
    : events;

  if (visible.length === 0) {
    return (
      <p className="px-2 py-10 text-center text-sm text-neutral-500">
        No clock activity yet for this day.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[#222]">
      {visible.map((event) => {
        const meta = EVENT_META[event.type] || EVENT_META.clock_in;
        const Icon = meta.icon;

        return (
          <li key={event.id} className="flex items-center gap-3 px-1 py-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.color}`}
            >
              <Icon size={15} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">
                <span className="font-medium">{event.name}</span>{" "}
                <span className="text-neutral-400">{meta.label}</span>
              </p>

              <p className="truncate text-xs text-neutral-500">
                {[event.department || "General", event.detail]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm tabular-nums text-white">
                {formatTime(event.at)}
              </p>
              <p className="text-[11px] text-neutral-500">
                {formatAgo(event.at, now)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}