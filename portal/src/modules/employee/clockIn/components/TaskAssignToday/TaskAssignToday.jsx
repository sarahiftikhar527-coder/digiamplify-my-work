
import React from "react";
import {
  CheckCircle2,
  ClipboardList,
  Circle,
  CalendarDays,
  Clock3,
} from "lucide-react";

import Card from "../Card";
import { formatTime } from "../../../../../utils/time";

const PRIORITY = {
  high: {
    label: "High Priority",
    dot: "bg-red-500",
    text: "text-red-400",
    badge: "border-red-500/20 bg-red-500/10",
  },
  medium: {
    label: "Medium Priority",
    dot: "bg-amber-400",
    text: "text-amber-400",
    badge: "border-amber-400/20 bg-amber-400/10",
  },
  low: {
    label: "Low Priority",
    dot: "bg-green-500",
    text: "text-green-400",
    badge: "border-green-500/20 bg-green-500/10",
  },
};

const isValidDate = (value) => {
  if (!value) return false;

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

const formatDueDate = (value) => {
  if (!isValidDate(value)) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(new Date(value));
};

const formatDueTime = (value) => {
  if (!isValidDate(value)) return "";

  const date = new Date(value);

  // Date-only tasks often get stored at midnight.
  // Do not display 12:00 AM as a misleading due time.
  if (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0
  ) {
    return "";
  }

  return formatTime(value);
};

const TaskAssignToday = ({ tasks = [], loading = false }) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return (
    <Card icon={ClipboardList} title="Task Assign Today">
      {loading ? (
        <div className="animate-pulse space-y-3 py-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-white/5"
            />
          ))}
        </div>
      ) : safeTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-7 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <ClipboardList
              size={19}
              className="text-white/35"
            />
          </div>

          <p className="text-[12px] font-medium text-white/65">
            No tasks assigned for today.
          </p>

          <p className="mt-1 text-[10px] text-white/35">
            Your assigned tasks will appear here.
          </p>
        </div>
      ) : (
        <ul className="max-h-72 space-y-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15">
          {safeTasks.map((task, index) => {
            const priority =
              PRIORITY[task.priority?.toLowerCase()] ||
              PRIORITY.low;

            const isCompleted =
              task.completed === true ||
              task.status?.toLowerCase() === "completed" ||
              task.status?.toLowerCase() === "approved";

            const dueDate = task.dueDate || task.dueAt;
            const dueTime = task.dueAt
              ? formatDueTime(task.dueAt)
              : "";

            const taskId =
              task.id || task._id || `${task.title}-${index}`;

            return (
              <li
                key={taskId}
                className={`py-3 ${
                  index
                    ? "border-t border-dashed border-white/10"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2.5">
                    {isCompleted ? (
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 shrink-0 text-green-500"
                      />
                    ) : (
                      <Circle
                        size={15}
                        className="mt-0.5 shrink-0 text-red-500"
                      />
                    )}

                    <div className="min-w-0">
                      <p
                        className={`break-words text-[12.5px] font-medium ${
                          isCompleted
                            ? "text-white/45 line-through"
                            : "text-white"
                        }`}
                      >
                        {task.title || "Untitled Task"}
                      </p>

                      {task.subtitle && (
                        <p className="mt-1 line-clamp-2 text-[10px] text-white/40">
                          {task.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {isCompleted && (
                    <span className="shrink-0 rounded-md border border-green-500/20 bg-green-500/10 px-2 py-1 text-[9px] font-semibold text-green-400">
                      Completed
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 pl-[25px]">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] ${priority.badge} ${priority.text}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${priority.dot}`}
                    />
                    {priority.label}
                  </span>

                  {dueDate && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-white/45">
                      <CalendarDays size={11} />
                      {formatDueDate(dueDate)}
                    </span>
                  )}

                  {dueTime && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-white/45">
                      <Clock3 size={11} />
                      {dueTime}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default TaskAssignToday;
