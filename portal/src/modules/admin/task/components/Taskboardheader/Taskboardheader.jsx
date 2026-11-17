
import AvatarStack from "../Avatarstack/Avatarstack";
import { PlusIcon, SearchIcon } from "../Icons/Icons";
import { formatDateTime } from "../../Constants";

const BOARD_STATUSES = [
  { key: "todo", label: "Pending" },
  { key: "in-progress", label: "In Progress" },
  { key: "review", label: "In Review" },
  { key: "approved", label: "Completed" },
];

const normalizeStatus = (status) => {
  const value = String(status || "").trim().toLowerCase();

  if (["pending", "todo", "to do"].includes(value)) return "todo";

  if (
    ["in-progress", "in progress", "inprogress"].includes(value)
  ) {
    return "in-progress";
  }

  if (["review", "under-review", "under review"].includes(value)) {
    return "review";
  }

  if (["approved", "approve", "completed", "done"].includes(value)) {
    return "approved";
  }

  return value;
};

export default function TaskBoardHeader({
  search = "",
  onSearch = () => {},
  onAdd = () => {},
  projectName = "Product Design",
  assignees = [],
  lastUpdated = null,
  tasks = [],
}) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeAssignees = Array.isArray(assignees) ? assignees : [];

  const getCount = (status) =>
    safeTasks.filter(
      (task) => normalizeStatus(task.status) === status
    ).length;

  const approvedCount = getCount("approved");

  const projectStatus =
    safeTasks.length > 0 && approvedCount === safeTasks.length
      ? "Completed"
      : "In Progress";

  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Task List</h1>
          <p className="mt-1 text-sm text-neutral-300">
            Create, assign, and manage employee tasks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex w-64 items-center gap-2 rounded border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2 text-xs text-neutral-400 focus-within:border-red-700">
            <SearchIcon width={14} height={14} />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search tasks or employees"
              className="w-full bg-transparent text-white outline-none placeholder:text-neutral-500"
            />
          </label>

          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded bg-gradient-to-r from-red-700 to-red-600 px-4 py-2 text-xs font-semibold text-white hover:from-red-600 hover:to-red-500"
          >
            <PlusIcon width={14} height={14} />
            Add Task
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-3 border-y border-[#1f1f1f] py-4 text-xs">
        <div>
          <p className="text-sm font-medium text-white">{projectName}</p>
          <p className="text-blue-500">{projectStatus}</p>
        </div>

        <div className="border-l border-[#262626] pl-5 sm:pl-10">
          <p className="mb-1 text-neutral-400">Assignees</p>
          <AvatarStack users={safeAssignees} max={5} size={26} />
        </div>

        <div className="border-l border-[#262626] pl-5 sm:pl-10">
          <p className="mb-1 text-neutral-400">Last Updated</p>
          <p className="text-white">{formatDateTime(lastUpdated)}</p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 border-l border-[#262626] pl-5 text-neutral-400 sm:pl-10">
          {BOARD_STATUSES.map((status) => (
            <span key={status.key}>
              {status.label}:{" "}
              <b className="text-white">{getCount(status.key)}</b>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
