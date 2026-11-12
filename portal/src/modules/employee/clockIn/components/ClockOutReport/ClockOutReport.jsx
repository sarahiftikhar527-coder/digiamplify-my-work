import { useMemo } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Circle,
  CheckSquare,
  Square,
} from "lucide-react";

import Card from "../Card";

const MAX = 500;

const PRIORITY_DOT = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-green-500",
};

// Clock out report: tick the tasks that were done today and write a note.
//   tasks      -> today's tasks (from the clock in snapshot)
//   selected   -> array of task ids that are ticked
//   onChange   -> (nextSelectedIds) => void
const ClockOutReport = ({
  tasks = [],
  selected = [],
  onChange = () => {},
  description = "",
  onDescription = () => {},
  disabled = false,
}) => {
  const list = Array.isArray(tasks) ? tasks : [];

  // Tasks already finished (or sent for review) cannot be ticked again.
  const selectable = useMemo(
    () => list.filter((task) => !task.completed && !task.inReview),
    [list]
  );

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const allTicked =
    selectable.length > 0 &&
    selectable.every((task) => selectedSet.has(task.id));

  const toggle = (id) => {
    if (disabled) return;

    onChange(
      selectedSet.has(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id]
    );
  };

  const toggleAll = () => {
    if (disabled) return;

    onChange(allTicked ? [] : selectable.map((task) => task.id));
  };

  const doneCount =
    list.filter((task) => task.completed || task.inReview).length +
    selectable.filter((task) => selectedSet.has(task.id)).length;

  return (
    <Card icon={ClipboardCheck} title="Clock Out Report">
      {list.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[11px] text-white/55">
              Tick the tasks you finished today
              <span className="ml-1.5 font-semibold text-white/80">
                ({doneCount}/{list.length})
              </span>
            </p>

            {selectable.length > 0 && (
              <button
                type="button"
                onClick={toggleAll}
                disabled={disabled}
                className="shrink-0 text-[11px] font-medium text-red-500 hover:text-red-400 disabled:opacity-50"
              >
                {allTicked ? "Clear all" : "Select all"}
              </button>
            )}
          </div>

          <ul className="max-h-56 space-y-1.5 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15">
            {list.map((task) => {
              const locked = task.completed || task.inReview;
              const ticked = locked || selectedSet.has(task.id);

              return (
                <li key={task.id}>
                  <button
                    type="button"
                    disabled={disabled || locked}
                    onClick={() => toggle(task.id)}
                    aria-pressed={ticked}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                      ticked
                        ? "border-green-500/30 bg-green-500/[0.07]"
                        : "border-white/10 bg-[#121212] hover:border-white/25"
                    } ${locked ? "cursor-default" : ""} disabled:cursor-default`}
                  >
                    {locked ? (
                      <CheckCircle2
                        size={17}
                        className="shrink-0 text-green-500"
                      />
                    ) : ticked ? (
                      <CheckSquare
                        size={17}
                        className="shrink-0 text-green-400"
                      />
                    ) : (
                      <Square size={17} className="shrink-0 text-white/40" />
                    )}

                    <span className="min-w-0 flex-1">
                      <span
                        className={`block break-words text-[12.5px] font-medium ${
                          ticked ? "text-white/55" : "text-white"
                        } ${locked ? "line-through" : ""}`}
                      >
                        {task.title || "Untitled Task"}
                      </span>
                    </span>

                    {task.inReview ? (
                      <span className="shrink-0 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[9px] font-semibold text-sky-300">
                        In review
                      </span>
                    ) : task.completed ? (
                      <span className="shrink-0 rounded-md border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[9px] font-semibold text-green-400">
                        Done
                      </span>
                    ) : (
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          PRIORITY_DOT[task.priority] || PRIORITY_DOT.low
                        }`}
                        title={`${task.priority || "low"} priority`}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-2 flex items-center gap-1.5 text-[10px] text-white/40">
            <Circle size={8} className="shrink-0" />
            Ticked tasks are sent to the admin for review when you clock out.
          </p>
        </div>
      )}

      <label className="mb-1.5 block text-[11px] font-medium text-white/55">
        Description {list.length > 0 && "(optional when tasks are ticked)"}
      </label>

      <textarea
        value={description}
        maxLength={MAX}
        disabled={disabled}
        onChange={(event) => onDescription(event.target.value)}
        rows={4}
        placeholder="Describe here what you worked on today..."
        className="w-full resize-none rounded-lg border border-white/10 bg-[#121212] p-3 text-[12.5px] text-white outline-none placeholder:text-white/40 focus:border-red-600 disabled:opacity-60"
      />

      <p className="mt-1 text-right text-[10px] text-white/40">
        {description.length}/{MAX}
      </p>
    </Card>
  );
};

export default ClockOutReport;