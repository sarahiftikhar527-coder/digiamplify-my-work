
import AvatarStack from "../Avatarstack/Avatarstack";
import { CalendarIcon, EyeIcon, TrashIcon } from "../Icons/Icons";
import { PRIORITY_STYLES, formatDate } from "../../Constants";
import TaskChatButton from "@/components/TaskChat/TaskChat.jsx";

const getProgress = (task) => {
  const status = String(task?.status || "todo").toLowerCase();

  if (["completed", "done", "approved"].includes(status)) return 100;
  if (["in-progress", "in progress", "inprogress"].includes(status)) return 50;
  if (["review", "under-review", "under review"].includes(status)) return 75;

  return 0;
};

export function ProgressRing({ value = 0, size = 44 }) {
  const progress = Math.min(100, Math.max(0, Number(value) || 0));
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-label={`Task progress ${progress}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth="4"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e11d2e"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference - (circumference * progress) / 100
          }
        />
      </svg>

      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white">
        {progress}%
      </span>
    </div>
  );
}

export default function TaskCard({
  task,
  assignees = [],
  onView,
  onDelete,
  onDragStart,
}) {
  const progress = getProgress(task);

  const priorityClass =
    PRIORITY_STYLES?.[task.priority] ||
    "border-neutral-700 text-neutral-300";

  const handleView = (event) => {
    event?.stopPropagation();
    onView?.(task);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete?.(task.id);
  };

  return (
    <div
      draggable
      onDragStart={(event) => onDragStart?.(event, task.id)}
      onClick={handleView}
      className="group cursor-pointer rounded-md border border-[#262626] bg-[#0d0d0d] p-3 transition-colors hover:border-red-900/70 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-white">
            {task.title || "Untitled Task"}
          </h4>

          <p className="truncate text-xs text-neutral-400">
            {task.subtitle || ""}
          </p>
        </div>

        <ProgressRing value={progress} />
      </div>

      <p className="mt-2 line-clamp-3 text-[11px] leading-snug text-neutral-200">
        {task.description || "No description provided."}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`shrink-0 rounded border px-3 py-0.5 text-[10px] ${priorityClass}`}
          >
            {task.priority || "Medium"}
          </span>

          <span
            className="flex min-w-0 items-center gap-1 text-[10px] text-neutral-300"
            title={`Assigned ${formatDate(task.createdAt)} → Due ${formatDate(task.dueDate)}`}
          >
            <CalendarIcon width={12} height={12} />
            <span className="truncate">
              {formatDate(task.createdAt)} → {formatDate(task.dueDate)}
            </span>
          </span>
        </div>

        <AvatarStack users={assignees} />
      </div>

      <div className="mt-2 flex justify-end gap-1">
        <TaskChatButton
          taskId={task.id}
          taskTitle={task.title}
          size={14}
          className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
        />

        <button
          type="button"
          aria-label="View task details"
          title="View task details"
          onClick={handleView}
          className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
        >
          <EyeIcon width={14} height={14} />
        </button>

        <button
          type="button"
          aria-label="Delete task"
          title="Delete task"
          onClick={handleDelete}
          className="rounded p-1.5 text-neutral-400 hover:bg-red-950 hover:text-red-400"
        >
          <TrashIcon width={14} height={14} />
        </button>
      </div>
    </div>
  );
}
