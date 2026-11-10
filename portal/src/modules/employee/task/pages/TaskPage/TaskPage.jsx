import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  ChevronDown,
  Circle,
  CircleCheck,
  CircleDot,
  Clock,
  Flag,
  Plus,
  RefreshCw,
  Repeat,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import apiClient from '@/services/api/apiClient.js';
import TeamTasks from '../../components/TeamTasks/TeamTasks.jsx';

const VIEWS = {
  assigned: {
    title: 'Assigned to me',
    hint: 'Fixed daily tasks and extra tasks given by your admin',
  },
  today: {
    title: 'Today & Overdue',
    hint: 'Everything you need to finish or update today',
  },
  personal: {
    title: 'Personal List',
    hint: 'Your own tasks. Only you can see these',
  },
  team: {
    title: 'Team Tasks',
    hint: 'Tasks of every employee. You can view them but not change them',
  },
};

const STATUS_GROUPS = [
  { key: 'pending', label: 'To Do', color: 'text-gray-400' },
  { key: 'in-progress', label: 'In Progress', color: 'text-sky-400' },
  { key: 'review', label: 'In Review', color: 'text-amber-400' },
  { key: 'approved', label: 'Done', color: 'text-emerald-400' },
];

const PRIORITY = {
  High: 'text-red-500',
  Medium: 'text-amber-400',
  Low: 'text-sky-400',
};

const inputCls =
  'w-full rounded-md border border-[#262626] bg-[#111] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-primary';

const getError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const fmtDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const fmtDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const fmtMinutes = (total) => {
  const minutes = Number(total) || 0;
  if (minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

const toInputDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const nextStatus = (task) => {
  if (task.isDone) return 'pending';
  if (task.status === 'pending') return 'in-progress';
  return 'completed';
};

// Minutes since the employee started the task (used to prefill the time box).
const minutesSinceStart = (task) => {
  if (!task.startedAt) return 0;
  const diff = Date.now() - new Date(task.startedAt).getTime();
  return Number.isFinite(diff) ? Math.max(0, Math.round(diff / 60000)) : 0;
};

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

// Hours + minutes input. Value and onChange both use total minutes.
function TimeField({ value, onChange }) {
  const total = Number(value) || 0;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  const setHours = (raw) =>
    onChange(Math.max(0, Number(raw) || 0) * 60 + minutes);

  const setMinutes = (raw) =>
    onChange(hours * 60 + Math.min(59, Math.max(0, Number(raw) || 0)));

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        className={`${inputCls} w-20`}
        value={hours}
        onChange={(e) => setHours(e.target.value)}
      />
      <span className="text-xs text-gray-400">h</span>
      <input
        type="number"
        min="0"
        max="59"
        className={`${inputCls} w-20`}
        value={minutes}
        onChange={(e) => setMinutes(e.target.value)}
      />
      <span className="text-xs text-gray-400">min</span>
    </div>
  );
}

function StatusIcon({ task, onClick, busy }) {
  if (task.taskType === 'daily') {
    return <Repeat size={18} className="shrink-0 text-primary-light" />;
  }

  const Icon = task.isDone
    ? CircleCheck
    : task.status === 'pending'
      ? Circle
      : CircleDot;

  const color = task.isDone
    ? 'text-emerald-400'
    : task.status === 'in-progress'
      ? 'text-sky-400'
      : task.status === 'review'
        ? 'text-amber-400'
        : 'text-gray-500 hover:text-white';

  return (
    <button
      type="button"
      disabled={busy || task.status === 'review'}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      title="Change status"
      className={`shrink-0 transition-colors disabled:cursor-not-allowed ${color}`}
    >
      <Icon size={18} />
    </button>
  );
}

function DueChip({ task }) {
  if (task.taskType === 'daily') {
    return task.todayUpdate ? (
      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-400">
        Update posted
      </span>
    ) : (
      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-400">
        Update needed
      </span>
    );
  }

  if (!task.dueDate) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs ${
        task.isOverdue
          ? 'text-red-400'
          : task.dueToday
            ? 'text-amber-400'
            : 'text-gray-400'
      }`}
    >
      <Calendar size={13} />
      {task.dueToday ? 'Today' : fmtDate(task.dueDate)}
    </span>
  );
}

function TimeChip({ task }) {
  const minutes =
    task.taskType === 'daily'
      ? task.todayUpdate?.timeSpentMinutes
      : task.isDone
        ? task.timeSpentMinutes
        : 0;

  if (!minutes) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
      <Clock size={13} />
      {fmtMinutes(minutes)}
    </span>
  );
}

function TaskRow({ task, busy, onOpen, onToggle }) {
  return (
    <div
      onClick={() => onOpen(task)}
      className="flex cursor-pointer flex-wrap items-center gap-3 border-b border-[#1a1a1a] px-3 py-2.5 transition-colors last:border-b-0 hover:bg-white/[0.03]"
    >
      <StatusIcon task={task} busy={busy} onClick={() => onToggle(task)} />

      <div className="min-w-0 flex-1 basis-48">
        <p
          className={`truncate text-sm ${
            task.isDone ? 'text-gray-500 line-through' : 'text-white'
          }`}
        >
          {task.title}
        </p>
        {task.taskType === 'daily' && (
          <p className="text-[11px] text-gray-500">Fixed daily task</p>
        )}
      </div>

      {task.taskType !== 'personal' && task.assignedBy?.name && (
        <span className="hidden max-w-[120px] truncate text-xs text-gray-400 sm:block">
          {task.assignedBy.name}
        </span>
      )}

      <TimeChip task={task} />
      <DueChip task={task} />

      <Flag
        size={15}
        className={`shrink-0 ${PRIORITY[task.priority] || 'text-gray-500'}`}
        title={`${task.priority} priority`}
      />
    </div>
  );
}

function Section({ title, color = 'text-white', tasks, children }) {
  const [open, setOpen] = useState(true);

  if (!tasks.length && !children) return null;

  return (
    <section className="rounded-md border border-[#1e1e1e] bg-[#0b0b0b]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${
            open ? '' : '-rotate-90'
          }`}
        />
        <span className={`text-xs font-semibold uppercase tracking-wide ${color}`}>
          {title}
        </span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-gray-300">
          {tasks.length}
        </span>
      </button>

      {open && <div className="border-t border-[#1a1a1a]">{children}</div>}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* "How long did it take?" popup                                       */
/* ------------------------------------------------------------------ */

function DoneModal({ task, saving, onCancel, onConfirm }) {
  const [minutes, setMinutes] = useState(
    task.timeSpentMinutes || minutesSinceStart(task)
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-lg border border-[#1e1e1e] bg-[#0b0b0b] p-5">
        <h3 className="text-base font-semibold text-white">
          Mark task as done
        </h3>
        <p className="mt-1 truncate text-sm text-gray-400">{task.title}</p>

        <div className="mt-4 space-y-2">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            How long did it take?
          </p>
          <TimeField value={minutes} onChange={setMinutes} />
          {task.startedAt && (
            <p className="text-[11px] text-gray-500">
              Started {fmtDateTime(task.startedAt)}
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[#262626] px-4 py-2 text-sm text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onConfirm(minutes)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60"
          >
            Mark done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Drawer                                                              */
/* ------------------------------------------------------------------ */

function TaskDrawer({ task, onClose, onChanged, onToast }) {
  const isDaily = task.taskType === 'daily';
  const isPersonal = task.taskType === 'personal';

  const [note, setNote] = useState(task.todayUpdate?.description || '');
  const [progress, setProgress] = useState(
    task.todayUpdate?.status || 'in-progress'
  );
  const [dailyMinutes, setDailyMinutes] = useState(
    task.todayUpdate?.timeSpentMinutes || 0
  );
  const [doneMinutes, setDoneMinutes] = useState(task.timeSpentMinutes || 0);
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    dueDate: toInputDate(task.dueDate),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const run = async (fn, message) => {
    setSaving(true);
    setError('');
    try {
      await fn();
      onToast(message);
      onChanged();
      return true;
    } catch (err) {
      setError(getError(err, 'Something went wrong. Please try again.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const postUpdate = () =>
    run(
      () =>
        apiClient.post(`/tasks/employee/${task.id}/daily-update`, {
          description: note,
          status: progress,
          timeSpentMinutes: dailyMinutes,
        }),
      'Daily update saved'
    );

  const saveDoneTime = () =>
    run(
      () =>
        apiClient.patch(`/tasks/employee/${task.id}/status`, {
          status: 'completed',
          timeSpentMinutes: doneMinutes,
        }),
      'Time saved'
    );

  const savePersonal = () =>
    run(
      () =>
        apiClient.patch(`/tasks/employee/personal/${task.id}`, {
          title: form.title,
          description: form.description,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
        }),
      'Task updated'
    );

  const removePersonal = async () => {
    if (!window.confirm('Delete this task?')) return;

    const ok = await run(
      () => apiClient.delete(`/tasks/employee/personal/${task.id}`),
      'Task deleted'
    );

    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/60">
      <button
        type="button"
        aria-label="Close"
        className="flex-1 cursor-default"
        onClick={onClose}
      />

      <aside className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-[#1e1e1e] bg-[#0b0b0b] p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              {isDaily
                ? 'Fixed daily task'
                : isPersonal
                  ? 'Personal task'
                  : 'Extra task'}
            </p>
            {isPersonal ? (
              <input
                className={`${inputCls} mt-1 text-base font-semibold`}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            ) : (
              <h2 className="mt-1 text-lg font-semibold text-white">
                {task.title}
              </h2>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 text-xs text-gray-300">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1">
            <Flag size={13} className={PRIORITY[task.priority]} />
            {task.priority}
          </span>
          {!isDaily && task.dueDate && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1">
              <Calendar size={13} /> Due {fmtDate(task.dueDate)}
            </span>
          )}
          {!isPersonal && task.assignedBy?.name && (
            <span className="rounded-full bg-white/5 px-2.5 py-1">
              By {task.assignedBy.name}
            </span>
          )}
        </div>

        {isPersonal ? (
          <div className="space-y-3">
            <textarea
              rows={4}
              placeholder="Description"
              className={inputCls}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className={inputCls}
                value={form.dueDate}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value })
                }
              />
              <select
                className={inputCls}
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value })
                }
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={savePersonal}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60"
              >
                Save changes
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={removePersonal}
                className="rounded-md border border-[#262626] px-3 text-gray-400 hover:text-red-400"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
            {task.description || 'No description added by the admin.'}
          </p>
        )}

        {/* Time tracking for extra and personal tasks */}
        {!isDaily && (
          <div className="mt-5 rounded-md border border-[#1e1e1e] bg-[#111] p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Time tracking
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[11px] text-gray-500">Started</p>
                <p className="text-gray-200">{fmtDateTime(task.startedAt)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Finished</p>
                <p className="text-gray-200">
                  {fmtDateTime(task.completedAt)}
                </p>
              </div>
            </div>

            {task.isDone && (
              <div className="mt-3 border-t border-[#1e1e1e] pt-3">
                <p className="mb-2 text-[11px] text-gray-500">
                  Time spent on this task
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <TimeField value={doneMinutes} onChange={setDoneMinutes} />
                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveDoneTime}
                    className="rounded-md border border-[#262626] px-3 py-2 text-xs text-gray-300 hover:text-white disabled:opacity-60"
                  >
                    Save time
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Daily update for fixed tasks */}
        {isDaily && (
          <div className="mt-6 border-t border-[#1e1e1e] pt-5">
            <h3 className="mb-2 text-sm font-semibold text-white">
              Today&apos;s update
            </h3>
            <textarea
              rows={5}
              className={inputCls}
              placeholder="Write what you worked on today..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <p className="mb-1.5 mt-3 text-[11px] uppercase tracking-wide text-gray-500">
              Time spent today
            </p>
            <TimeField value={dailyMinutes} onChange={setDailyMinutes} />

            <div className="mt-3 flex gap-2">
              <select
                className={`${inputCls} flex-1`}
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
              >
                <option value="in-progress">Still in progress</option>
                <option value="completed">Done for today</option>
              </select>
              <button
                type="button"
                disabled={saving}
                onClick={postUpdate}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60"
              >
                <Send size={14} />
                {task.todayUpdate ? 'Update' : 'Post'}
              </button>
            </div>

            {task.updates.length > 0 && (
              <div className="mt-5 space-y-3">
                <h4 className="text-xs uppercase tracking-wide text-gray-500">
                  Previous updates
                </h4>
                {task.updates.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md border border-[#1e1e1e] bg-[#111] p-3"
                  >
                    <p className="mb-1 flex flex-wrap items-center gap-x-2 text-[11px] text-gray-500">
                      <span>{fmtDate(item.updateDate)}</span>
                      <span>
                        {item.status === 'completed'
                          ? 'Done for the day'
                          : 'In progress'}
                      </span>
                      {item.timeSpentMinutes > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} />
                          {fmtMinutes(item.timeSpentMinutes)}
                        </span>
                      )}
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-gray-300">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const TaskPage = () => {
  const [searchParams] = useSearchParams();
  const requested = searchParams.get('view');
  const view = VIEWS[requested] ? requested : 'assigned';

  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [doneTaskId, setDoneTaskId] = useState(null);

  const [draft, setDraft] = useState({
    title: '',
    dueDate: '',
    priority: 'Medium',
  });
  const [adding, setAdding] = useState(false);

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  }, []);

  const load = useCallback(
    async (silent = false) => {
      // Team Tasks loads its own data.
      if (view === 'team') {
        setLoading(false);
        return;
      }

      if (!silent) setLoading(true);
      setError('');

      try {
        const response = await apiClient.get('/tasks/employee/workspace', {
          params: { view },
        });

        setTasks(response?.data?.tasks || []);
        setCounts(response?.data?.counts || {});
      } catch (err) {
        setError(getError(err, 'Unable to load your tasks. Please try again.'));
      } finally {
        setLoading(false);
      }
    },
    [view]
  );

  useEffect(() => {
    load();
  }, [load]);

    // A new task was just assigned by the admin: refresh the list quietly.
  useEffect(() => {
    const refresh = () => load(true);
    window.addEventListener('tasks:changed', refresh);
    return () => window.removeEventListener('tasks:changed', refresh);
  }, [load]);

  const openTask = useMemo(
    () => tasks.find((task) => task.id === openId) || null,
    [tasks, openId]
  );

  const doneTask = useMemo(
    () => tasks.find((task) => task.id === doneTaskId) || null,
    [tasks, doneTaskId]
  );

  const changeStatus = async (task, status, timeSpentMinutes) => {
    setBusyId(task.id);
    setError('');

    try {
      await apiClient.patch(`/tasks/employee/${task.id}/status`, {
        status,
        ...(timeSpentMinutes !== undefined ? { timeSpentMinutes } : {}),
      });

      if (status === 'completed') showToast('Task marked as done');
      await load(true);
    } catch (err) {
      setError(getError(err, 'Unable to update the task status.'));
    } finally {
      setBusyId(null);
    }
  };

  const toggleStatus = (task) => {
    if (busyId) return;

    const status = nextStatus(task);

    // Finishing a task asks how long it took.
    if (status === 'completed') {
      setDoneTaskId(task.id);
      return;
    }

    changeStatus(task, status);
  };

  const confirmDone = async (minutes) => {
    if (!doneTask) return;

    await changeStatus(doneTask, 'completed', minutes);
    setDoneTaskId(null);
  };

  const addPersonal = async (event) => {
    event.preventDefault();
    if (!draft.title.trim() || adding) return;

    setAdding(true);
    setError('');

    try {
      await apiClient.post('/tasks/employee/personal', {
        title: draft.title,
        dueDate: draft.dueDate || undefined,
        priority: draft.priority,
      });
      setDraft({ title: '', dueDate: '', priority: draft.priority });
      showToast('Task added');
      await load(true);
    } catch (err) {
      setError(getError(err, 'Unable to add the task.'));
    } finally {
      setAdding(false);
    }
  };

  const row = (task) => (
    <TaskRow
      key={task.id}
      task={task}
      busy={busyId === task.id}
      onOpen={(item) => setOpenId(item.id)}
      onToggle={toggleStatus}
    />
  );

  const byStatus = (list) =>
    STATUS_GROUPS.map((group) => ({
      ...group,
      items: list.filter((task) =>
        group.key === 'approved'
          ? task.isDone
          : !task.isDone && task.status === group.key
      ),
    }));

  const daily = tasks.filter((task) => task.taskType === 'daily');
  const others = tasks.filter((task) => task.taskType !== 'daily');

  const renderBody = () => {
    if (view === 'team') {
      return <TeamTasks />;
    }

    if (loading) {
      return (
        <p className="py-16 text-center text-sm text-gray-500">
          Loading tasks...
        </p>
      );
    }

    if (!tasks.length && view !== 'personal') {
      return (
        <p className="rounded-md border border-[#1e1e1e] bg-[#0b0b0b] py-16 text-center text-sm text-gray-500">
          {view === 'today'
            ? 'Nothing due today. You are all caught up.'
            : 'No tasks assigned to you yet.'}
        </p>
      );
    }

    if (view === 'today') {
      const overdue = others.filter((task) => task.isOverdue);
      const dueToday = others.filter((task) => !task.isOverdue);

      return (
        <div className="space-y-4">
          <Section title="Daily updates" color="text-primary-light" tasks={daily}>
            {daily.map(row)}
          </Section>
          <Section title="Overdue" color="text-red-400" tasks={overdue}>
            {overdue.map(row)}
          </Section>
          <Section title="Due today" color="text-amber-400" tasks={dueToday}>
            {dueToday.map(row)}
          </Section>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {view === 'assigned' && (
          <Section
            title="Fixed daily tasks"
            color="text-primary-light"
            tasks={daily}
          >
            {daily.map(row)}
          </Section>
        )}

        {byStatus(others).map((group) => (
          <Section
            key={group.key}
            title={group.label}
            color={group.color}
            tasks={group.items}
          >
            {group.items.map(row)}
          </Section>
        ))}

        {view === 'personal' && !others.length && (
          <p className="py-10 text-center text-sm text-gray-500">
            Your personal list is empty. Add your first task above.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="!mb-1 text-2xl font-semibold text-white">
            {VIEWS[view].title}
          </h1>
          <p className="text-sm text-gray-400">{VIEWS[view].hint}</p>
        </div>

        <div className="flex items-center gap-2">
          {counts.pendingDailyUpdates > 0 &&
            view !== 'personal' &&
            view !== 'team' && (
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-400">
              {counts.pendingDailyUpdates} daily update
              {counts.pendingDailyUpdates > 1 ? 's' : ''} pending
            </span>
          )}
          {counts.overdue > 0 && view !== 'team' && (
            <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-400">
              {counts.overdue} overdue
            </span>
          )}
          {view !== 'team' && (
            <button
              type="button"
              onClick={() => load()}
              className="rounded-md border border-[#262626] p-2 text-gray-400 hover:text-white"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </header>

      {view === 'personal' && (
        <form
          onSubmit={addPersonal}
          className="flex flex-wrap items-center gap-2 rounded-md border border-[#1e1e1e] bg-[#0b0b0b] p-3"
        >
          <input
            className={`${inputCls} min-w-[200px] flex-1`}
            placeholder="Add a task and press Enter"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <input
            type="date"
            className={`${inputCls} w-auto`}
            value={draft.dueDate}
            onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
          />
          <select
            className={`${inputCls} w-auto`}
            value={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <button
            type="submit"
            disabled={adding || !draft.title.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-50"
          >
            <Plus size={15} /> Add
          </button>
        </form>
      )}

      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {renderBody()}

      {openTask && (
        <TaskDrawer
          key={openTask.id}
          task={openTask}
          onClose={() => setOpenId(null)}
          onChanged={() => load(true)}
          onToast={showToast}
        />
      )}

      {doneTask && (
        <DoneModal
          key={doneTask.id}
          task={doneTask}
          saving={busyId === doneTask.id}
          onCancel={() => setDoneTaskId(null)}
          onConfirm={confirmDone}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-md bg-emerald-600 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default TaskPage;