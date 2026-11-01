
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const PRIORITY = {
  high: { label: 'High', dot: 'bg-[#c1121f]' },
  medium: { label: 'Medium', dot: 'bg-orange-400' },
  low: { label: 'Low', dot: 'bg-green-500' },
};

const STATUS = {
  pending: {
    label: 'Pending',
    badge: 'border-orange-500 text-orange-400',
    text: 'text-orange-400',
  },
  'in-progress': {
    label: 'In Progress',
    badge: 'border-[#c1121f] text-[#e5202e]',
    text: 'text-[#e5202e]',
  },
  completed: {
    label: 'Completed',
    badge: 'border-green-600 text-green-500',
    text: 'text-green-500',
  },
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatDate = (value) => {
  if (!value) return '-';

  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);

  if (!year || !month || !day) return '-';

  return `${day} ${MONTHS[month - 1]}, ${year}`;
};

const getDueText = (task) => {
  if (task.status === 'completed') return 'Completed';
  if (!task.dueDate) return 'No due date';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(`${task.dueDate.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(due.getTime())) return 'No due date';

  const diff = Math.round((due - today) / 86400000);

  if (diff < 0) {
    const days = Math.abs(diff);
    return `Overdue by ${days} ${days === 1 ? 'day' : 'days'}`;
  }

  if (diff === 0) return 'Due today';
  if (diff === 1) return '1 day left';

  return `${diff} days left`;
};

const COLS =
  'grid grid-cols-[minmax(0,2.4fr)_1fr_1.3fr_1.3fr_1.5fr_28px] items-center gap-3 px-4';

const TaskTable = ({
  tasks = [],
  onStatusChange,
  updatingId = null,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState(null);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[820px] overflow-hidden rounded-md border border-[#1e1e1e]">
        <div className={`${COLS} bg-[#0f0f0f] py-3 text-xs text-gray-300`}>
          <span>Task Details</span>
          <span className="text-center">Priority</span>
          <span className="text-center">Assigned By</span>
          <span className="text-center">Due Date</span>
          <span className="text-center">Status</span>
          <span />
        </div>

        {tasks.length === 0 && (
          <p className="border-t border-[#1e1e1e] px-4 py-8 text-center text-xs text-gray-400">
            No tasks found.
          </p>
        )}

        {tasks.map((task) => {
          const priority = PRIORITY[task.priority] || PRIORITY.medium;
          const overdue =
            task.status !== 'completed' &&
            Boolean(task.dueDate) &&
            task.dueDate < new Date().toLocaleDateString('en-CA');
          const status = overdue
            ? {
                label: 'Overdue',
                badge: 'border-orange-500 text-orange-400',
                text: 'text-orange-400',
              }
            : STATUS[task.status] || STATUS.pending;
          const expanded = openId === task.id;
          const updating = updatingId === task.id;

          return (
            <div key={task.id} className="border-t border-[#1e1e1e]">
              <div className={`${COLS} py-3`}>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white">
                    {task.title}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-gray-400">
                    {task.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-100">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${priority.dot}`} />
                  {priority.label}
                </div>

                <div className="flex min-w-0 items-center justify-center gap-2 text-xs text-gray-100">
                  <span className="h-6 w-6 shrink-0 rounded-full bg-gray-300" />
                  <span className="truncate">{task.assignedBy || 'Admin'}</span>
                </div>

                <div className="text-center">
                  <p className="text-xs text-white">{formatDate(task.dueDate)}</p>
                  <p className={`mt-1 text-[10px] ${status.text}`}>
                    {getDueText(task)}
                  </p>
                </div>

                <div className="flex justify-center">
                  <select
                    aria-label={`Update status for ${task.title}`}
                    value={task.status}
                    disabled={updating || !onStatusChange}
                    onChange={(event) =>
                      onStatusChange?.(task.id, event.target.value)
                    }
                    className={`max-w-full rounded border bg-black px-2 py-1.5 text-xs focus:border-[#c1121f] focus:outline-none disabled:cursor-wait disabled:opacity-60 ${
                      status.badge
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-label={expanded ? 'Hide details' : 'Show details'}
                  onClick={() => setOpenId(expanded ? null : task.id)}
                  className="flex h-7 w-7 items-center justify-center rounded text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1121f]"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-3 text-xs text-gray-300">
                      {task.description || 'No description added.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskTable;
