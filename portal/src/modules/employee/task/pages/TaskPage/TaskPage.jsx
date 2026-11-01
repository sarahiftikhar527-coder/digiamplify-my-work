
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import apiClient from '@/services/api/apiClient.js';
import {
  TaskHeader,
  TaskStatsCards,
  TodayProgressRing,
  TaskFilterTabs,
  TaskTable,
  TaskPagination,
  TaskAnalyticsDonut,
  ShiftAssignedTable,
  RecentlyUpdatedTasks,
  PriorityBreakdown,
} from '../../components';

const PAGE_SIZE = 5;
const TABS = ['All', 'Ongoing', 'Completed', 'Overdue'];

const card =
  'min-w-0 rounded-md border border-[#1e1e1e] bg-[#0b0b0b] p-5';

const pad = (value) => String(value).padStart(2, '0');

const todayISO = () => {
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getTaskArray = (response) => {
  const body = response?.data;
  const candidates = [
    body?.tasks,
    body?.data?.tasks,
    body?.data?.items,
    body?.items,
    body?.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const getShiftArray = (response) => {
  const body = response?.data;

  const candidates = [
    body?.data,
    body?.shifts,
    body?.events,
    body?.items,
    body?.results,
    body?.data?.shifts,
    body?.data?.items,
  ];

  return candidates.find(Array.isArray) || [];
};

const normalizeTask = (task) => {
  const assignedBy =
    typeof task.assignedBy === 'object'
      ? task.assignedBy?.name || task.assignedBy?.email || 'Admin'
      : task.assignedBy || 'Admin';

  return {
    id: String(task._id || task.id),
    title: task.title || 'Untitled task',
    description: task.description || '',
    priority: ['high', 'medium', 'low'].includes(
      String(task.priority || '').toLowerCase()
    )
      ? String(task.priority).toLowerCase()
      : 'medium',
    assignedBy,
    dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : '',
    status: ['pending', 'in-progress', 'completed'].includes(task.status)
      ? task.status
      : 'pending',
    createdAt: task.createdAt || '',
    updatedAt: task.updatedAt || task.createdAt || '',
  };
};

const getShiftEmployeeId = (shift) => {
  const employee = shift.employeeId;

  if (employee && typeof employee === 'object') {
    return String(employee._id || employee.id || '');
  }

  return String(employee || '');
};

const getShiftDate = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);

    if (match) return match[1];
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getTimeMinutes = (value) => {
  if (!value) return null;

  const match = String(value).match(/(\d{1,2}):(\d{2})/);

  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) return null;

  return hours * 60 + minutes;
};

const getShiftWorkMinutes = (shift) => {
  const existingMinutes = Number(shift.workMinutes);

  if (Number.isFinite(existingMinutes) && existingMinutes >= 0) {
    return existingMinutes;
  }

  const existingHours = Number(shift.workHours);

  if (Number.isFinite(existingHours) && existingHours > 0) {
    return Math.round(existingHours * 60);
  }

  const start = getTimeMinutes(
    shift.startTime || shift.start || shift.clockIn
  );

  const end = getTimeMinutes(
    shift.endTime || shift.end || shift.clockOut
  );

  if (start === null || end === null) return null;

  let minutes = end - start;

  if (minutes < 0) minutes += 24 * 60;

  return minutes;
};

const normalizeShift = (shift) => {
  const from = getShiftDate(
    shift.from || shift.date || shift.startDate
  );

  const rawStatus = String(shift.status || 'scheduled').toLowerCase();

  let status = 'pending';

  if (['completed', 'done', 'approved'].includes(rawStatus)) {
    status = 'done';
  } else if (['absent', 'left'].includes(rawStatus)) {
    status = 'left';
  } else if (
    ['cancelled', 'canceled', 'rejected'].includes(rawStatus)
  ) {
    status = 'none';
  }

  const workMinutes = getShiftWorkMinutes(shift);

  return {
    ...shift,
    id: String(shift._id || shift.id || ''),
    date: from,
    from,
    clockIn: shift.startTime || shift.start || shift.clockIn || '',
    clockOut: shift.endTime || shift.end || shift.clockOut || '',
    workMinutes,
    workHours:
      workMinutes === null
        ? null
        : Math.round((workMinutes / 60) * 100) / 100,
    status,
    title: shift.title || shift.shiftName || 'Assigned Shift',
  };
};

const isOverdue = (task, today) =>
  task.status !== 'completed' &&
  Boolean(task.dueDate) &&
  task.dueDate < today;

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [tab, setTab] = useState('All');
  const [page, setPage] = useState(1);
  const [analyticsRange, setAnalyticsRange] = useState('Week');
  const [priorityRange, setPriorityRange] = useState('Week');
  const [loading, setLoading] = useState(true);
  const [shiftsLoading, setShiftsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [shiftsError, setShiftsError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/tasks/employee');
      setTasks(getTaskArray(response).map(normalizeTask));
    } catch (err) {
      setError(
        getErrorMessage(err, 'Unable to load your tasks. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadShifts = useCallback(async () => {
    setShiftsLoading(true);
    setShiftsError('');

    try {
      const response = await apiClient.get('/calendar', {
        params: {
          eventType: 'shift',
        },
      });

      const rows = getShiftArray(response)
        .map(normalizeShift)
        .filter((shift) => shift.id && shift.date)
        .sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);

          if (dateCompare !== 0) return dateCompare;

          return String(a.clockIn).localeCompare(String(b.clockIn));
        });

      setShifts(rows);
    } catch (err) {
      setShiftsError(
        getErrorMessage(
          err,
          'Unable to load your assigned shifts. Please try again.'
        )
      );
    } finally {
      setShiftsLoading(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    loadTasks();
    loadShifts();
  }, [loadTasks, loadShifts]);

  useEffect(() => {
    loadTasks();
    loadShifts();
  }, [loadTasks, loadShifts]);

  const handleStatusChange = useCallback(
    async (taskId, nextStatus) => {
      const task = tasks.find((item) => item.id === taskId);

      if (
        !task ||
        updatingId ||
        !['pending', 'in-progress', 'completed'].includes(nextStatus) ||
        task.status === nextStatus
      ) {
        return;
      }

      const previousStatus = task.status;
      setUpdatingId(taskId);
      setStatusMessage('');
      setError('');

      setTasks((current) =>
        current.map((item) =>
          item.id === taskId ? { ...item, status: nextStatus } : item
        )
      );

      try {
        await apiClient.patch(`/tasks/employee/${taskId}/status`, {
          status: nextStatus,
        });

        setStatusMessage('Task status updated successfully.');
      } catch (err) {
        setTasks((current) =>
          current.map((item) =>
            item.id === taskId
              ? { ...item, status: previousStatus }
              : item
          )
        );

        setError(
          getErrorMessage(err, 'Unable to update task status.')
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [tasks, updatingId]
  );

  const today = todayISO();

  const stats = useMemo(
    () => ({
      assigned: tasks.length,
      completed: tasks.filter((task) => task.status === 'completed').length,
      inProgress: tasks.filter((task) => task.status === 'in-progress').length,
      overdue: tasks.filter((task) => isOverdue(task, today)).length,
    }),
    [tasks, today]
  );

  const percent = tasks.length
    ? Math.round((stats.completed / tasks.length) * 100)
    : 0;

  const filtered = useMemo(() => {
    switch (tab) {
      case 'Ongoing':
        return tasks.filter((task) => task.status === 'in-progress');
      case 'Completed':
        return tasks.filter((task) => task.status === 'completed');
      case 'Overdue':
        return tasks.filter((task) => isOverdue(task, today));
      default:
        return tasks;
    }
  }, [tasks, tab, today]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const changeTab = (nextTab) => {
    setTab(nextTab);
    setPage(1);
  };

  const analyticsData = useMemo(
    () => [
      {
        label: 'Completed',
        value: stats.completed,
        color: '#22c55e',
      },
      {
        label: 'In Progress',
        value: stats.inProgress,
        color: '#c1121f',
      },
      {
        label: 'Pending',
        value: tasks.filter((task) => task.status === 'pending').length,
        color: '#f59e0b',
      },
    ],
    [stats, tasks]
  );

  const priorityData = useMemo(
    () =>
      [
        { label: 'High', key: 'high', color: '#c1121f' },
        { label: 'Medium', key: 'medium', color: '#f59e0b' },
        { label: 'Low', key: 'low', color: '#22c55e' },
      ].map((item) => ({
        ...item,
        value: tasks.filter((task) => task.priority === item.key).length,
      })),
    [tasks]
  );

  const recentItems = useMemo(
    () =>
      [...tasks]
        .sort(
          (a, b) =>
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
        )
        .slice(0, 5)
        .map((task) => ({
          id: task.id,
          title: task.title,
          progress:
            task.status === 'completed'
              ? 100
              : task.status === 'in-progress'
                ? 50
                : 0,
          updatedAt: task.updatedAt,
        })),
    [tasks]
  );

  const todayTasks = tasks.filter((task) => task.dueDate === today).length;

  return (
    <div className="w-full min-w-0 space-y-4 bg-black px-4 pb-8 pt-2 font-[Poppins,ui-sans-serif,system-ui,sans-serif] text-white md:px-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <TaskHeader
            title="My Tasks"
            subtitle="View your assigned tasks and update their progress."
          />
        </div>

        <button
          type="button"
          onClick={refreshAll}
          disabled={loading || shiftsLoading}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[#2a2a2a] px-4 text-sm text-gray-200 transition-colors hover:border-[#c1121f] hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading || shiftsLoading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={loadTasks}
            className="underline underline-offset-4"
          >
            Retry tasks
          </button>
        </div>
      )}

      {statusMessage && (
        <p
          role="status"
          className="rounded-md border border-green-900/60 bg-green-950/20 px-4 py-3 text-sm text-green-400"
        >
          {statusMessage}
        </p>
      )}

      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[7fr_3fr]">
        <div className="min-w-0 space-y-8">
          <TaskStatsCards {...stats} loading={loading} />
        </div>

        <div className="flex justify-center lg:justify-end">
          <TodayProgressRing percent={percent} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[7fr_3fr]">
        <div className="min-w-0 space-y-4">
          <div className={card}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <TaskFilterTabs
                tabs={TABS}
                active={tab}
                onChange={changeTab}
              />
            </div>

            {loading ? (
              <div className="space-y-3 py-8">
                {[0, 1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-12 animate-pulse rounded-md bg-[#151515]"
                  />
                ))}
              </div>
            ) : (
              <TaskTable
                tasks={pageItems}
                onStatusChange={handleStatusChange}
                updatingId={updatingId}
              />
            )}

            <TaskPagination
              page={currentPage}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>

          <div className={`${card} grid gap-6 md:grid-cols-[3fr_2fr]`}>
            <RecentlyUpdatedTasks
              items={recentItems}
              newCount={0}
              loading={loading}
              error={error}
              onRetry={loadTasks}
            />

            <div className="min-w-0 md:border-l md:border-[#1e1e1e] md:pl-6">
              <PriorityBreakdown
                data={priorityData}
                range={priorityRange}
                onRangeChange={setPriorityRange}
              />
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className={card}>
            <TaskAnalyticsDonut
              data={analyticsData}
              summary={{
                today: todayTasks,
                completed: stats.completed,
                pending: tasks.filter((task) => task.status === 'pending').length,
              }}
              percent={percent}
              range={analyticsRange}
              onRangeChange={setAnalyticsRange}
            />
          </div>

          <div className={card}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-white">
                Assigned Shifts
              </h2>

              <button
                type="button"
                onClick={loadShifts}
                disabled={shiftsLoading}
                aria-label="Refresh assigned shifts"
                className="inline-flex h-8 items-center gap-2 rounded-md border border-[#2a2a2a] px-3 text-xs text-gray-300 transition-colors hover:border-[#c1121f] hover:text-white disabled:opacity-50"
              >
                <RefreshCw
                  size={13}
                  className={shiftsLoading ? 'animate-spin' : ''}
                />
                Refresh
              </button>
            </div>

            {shiftsError && (
              <div
                role="alert"
                className="mb-3 rounded-md border border-red-900/60 bg-red-950/20 p-3 text-sm text-red-300"
              >
                <p>{shiftsError}</p>
                <button
                  type="button"
                  onClick={loadShifts}
                  className="mt-2 underline underline-offset-4"
                >
                  Try again
                </button>
              </div>
            )}

            <ShiftAssignedTable
              rows={shifts}
              loading={shiftsLoading}
              error={null}
              onRetry={loadShifts}
            />

            {!shiftsLoading && !shiftsError && shifts.length === 0 && (
              <p className="mt-3 text-center text-sm text-neutral-400">
                No shifts have been assigned to you yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
