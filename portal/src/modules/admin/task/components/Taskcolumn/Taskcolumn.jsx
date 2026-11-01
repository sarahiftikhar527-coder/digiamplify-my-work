
import { useState } from "react";
import TaskCard from "../Taskcard/Taskcard";

export default function TaskColumn({
  status,
  tasks = [],
  employeesById = {},
  onView,
  onDelete,
  onMove,
}) {
  const [isOver, setIsOver] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsOver(false);

    const id = event.dataTransfer.getData("text/plain");

    if (id && onMove) {
      onMove(id, status.key);
    }
  };

  const getAssignees = (task) => {
    const assigned = Array.isArray(task.assignees)
      ? task.assignees
      : [];

    return assigned
      .map((assignee) => {
        if (typeof assignee === "string") {
          return employeesById[assignee] || {
            id: assignee,
            name: "Employee",
          };
        }

        const id = String(assignee?.id || assignee?._id || "");

        return (
          employeesById[id] || {
            ...assignee,
            id,
            name: assignee?.name || assignee?.email || "Employee",
          }
        );
      })
      .filter((employee) => employee && employee.id);
  };

  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={`flex min-w-[260px] flex-1 flex-col gap-3 border-r border-[#1f1f1f] px-3 last:border-r-0 transition-colors ${
        isOver ? "bg-red-950/10" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-red-700 px-5 py-1 text-xs text-white">
          {status.label}
        </span>

        <span className="text-xs text-neutral-500">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 pb-6">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            assignees={getAssignees(task)}
            onView={() => onView?.(task)}
            onDelete={() => onDelete?.(task.id)}
            onDragStart={(event, id) => {
              event.dataTransfer.setData("text/plain", id);
              event.dataTransfer.effectAllowed = "move";
            }}
          />
        ))}

        {tasks.length === 0 && (
          <p className="rounded-md border border-dashed border-[#2a2a2a] py-8 text-center text-xs text-neutral-500">
            No tasks available. Drag a task here.
          </p>
        )}
      </div>
    </section>
  );
}
