import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ClipboardList,
  Clock,
  CheckCircle2,
  Circle,
  X,
} from 'lucide-react'

const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/*
  Turns any date value into a local "YYYY-MM-DD" key.
  - "2026-11-05"               -> kept as it is (no timezone shift)
  - "2026-11-04T19:00:00.000Z" -> converted to the LOCAL date (5 Nov in Pakistan)
    (before, only the first 10 characters were cut, so it landed on the wrong day)
*/
const normalizeDate = (value) => {
  if (!value) return ''

  const text = String(value).trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? '' : formatDateKey(date)
}

/*
  DATE FIELDS: the calendar looks for the task date in these fields, in this order.
  If admin tasks come with a different field name, add that name in this list.
*/
const TASK_DATE_FIELDS = [
  'dueDate',
  'deadline',
  'date',
  'dueAt',
  'endDate',
  'scheduledDate',
  'scheduledAt',
  'startDate',
  'assignedDate',
]

const getTaskDate = (task) => {
  if (!task) return ''

  for (const field of TASK_DATE_FIELDS) {
    const key = normalizeDate(task[field])

    if (key) return key
  }

  return ''
}

const formatTime = (value) => {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatus = (status = 'pending') => {
  const value = String(status).toLowerCase()

  if (['completed', 'done', 'approved'].includes(value)) {
    return 'completed'
  }

  if (['in-progress', 'in progress', 'inprogress'].includes(value)) {
    return 'in-progress'
  }

  return 'pending'
}

const UpcomingTasksCalendar = ({
  tasks = [],
  selectedDate,
  onSelectDate,
  onMonthChange,
  loading = false,
  disabled = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = selectedDate
      ? new Date(`${selectedDate}T00:00:00`)
      : new Date()

    return new Date(date.getFullYear(), date.getMonth(), 1)
  })

  const [activeDate, setActiveDate] = useState(
    selectedDate || formatDateKey(new Date())
  )

  const [showDayTasks, setShowDayTasks] = useState(false)

  useEffect(() => {
    if (!selectedDate) return

    setActiveDate(selectedDate)

    const date = new Date(`${selectedDate}T00:00:00`)

    if (!Number.isNaN(date.getTime())) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    }
  }, [selectedDate])

  const todayKey = formatDateKey(new Date())

  const monthLabel = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []

    for (let i = 0; i < firstDay; i += 1) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(new Date(year, month, day))
    }

    return days
  }, [currentMonth])

  const taskDates = useMemo(
    () => new Set(tasks.map(getTaskDate).filter(Boolean)),
    [tasks]
  )

  const selectedTasks = useMemo(
    () => tasks.filter((task) => getTaskDate(task) === activeDate),
    [tasks, activeDate]
  )

  const changeMonth = (direction) => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + direction,
      1
    )

    setCurrentMonth(nextMonth)
    onMonthChange?.(nextMonth)
  }

  const handleDateSelect = (date) => {
    if (!date || disabled || loading) return

    const dateKey = formatDateKey(date)

    setActiveDate(dateKey)
    setShowDayTasks(false)
    onSelectDate?.(dateKey)
  }

  const handleViewTasks = () => {
    onSelectDate?.(activeDate)
    setShowDayTasks(true)
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full rounded-2xl border border-white/10 bg-[#111111] p-5 text-white sm:p-6"
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d50818]/10 text-[#d50818]">
              <CalendarDays size={20} />
            </div>

            <div>
              <h2 className="text-base font-semibold">
                My Task Schedule
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                {monthLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              disabled={disabled || loading}
              aria-label="Previous month"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-300 transition hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              disabled={disabled || loading}
              aria-label="Next month"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-300 transition hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-7 gap-1 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
            (day) => (
              <div
                key={day}
                className="py-2 text-xs font-medium text-gray-500"
              >
                {day}
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-10"
                />
              )
            }

            const dateKey = formatDateKey(date)
            const isToday = dateKey === todayKey
            const isSelected = dateKey === activeDate
            const hasTasks = taskDates.has(dateKey)

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => handleDateSelect(date)}
                disabled={disabled || loading}
                aria-label={`${dateKey}${hasTasks ? ', has tasks' : ''}`}
                className={`relative flex min-h-10 flex-col items-center justify-center rounded-lg text-sm transition disabled:opacity-50 ${
                  isSelected
                    ? 'bg-[#d50818] font-semibold text-white'
                    : isToday
                      ? 'border border-[#d50818] text-white'
                      : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <span>{date.getDate()}</span>

                {hasTasks && (
                  <span
                    className={`mt-0.5 h-1 w-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-[#d50818]'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-white">
              {activeDate}
            </p>
            <span className="text-xs text-gray-400">
              {selectedTasks.length}{' '}
              {selectedTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleViewTasks}
            disabled={disabled || loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d50818] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <ClipboardList size={17} />
            View Day&apos;s Tasks
          </button>
        </div>
      </motion.section>

      {showDayTasks && (
        <div
          className="fixed inset-0 z-[60] flex overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowDayTasks(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Tasks for selected date"
            className="m-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] p-5 text-white shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">
                  Tasks for Selected Day
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  {activeDate}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDayTasks(false)}
                aria-label="Close tasks"
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {selectedTasks.length === 0 ? (
              <div className="rounded-xl border border-white/10 px-4 py-8 text-center">
                <CalendarDays
                  size={28}
                  className="mx-auto mb-3 text-gray-500"
                />
                <p className="text-sm font-medium">
                  No tasks scheduled
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  No assigned tasks were found for this date.
                </p>
              </div>
            ) : (
              <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                {selectedTasks.map((task, index) => {
                  const status = getStatus(task.status)
                  const completed = status === 'completed'

                  return (
                    <article
                      key={task._id || task.id || index}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-[#d50818]">
                          {completed ? (
                            <CheckCircle2 size={19} />
                          ) : (
                            <Circle size={19} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="break-words text-sm font-medium">
                            {task.title ||
                              task.taskTitle ||
                              task.subject ||
                              task.name ||
                              'Untitled Task'}
                          </h4>

                          {(task.description || task.details) && (
                            <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-gray-400">
                              {task.description || task.details}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                completed
                                  ? 'bg-green-500/10 text-green-400'
                                  : status === 'in-progress'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'bg-red-500/10 text-red-300'
                              }`}
                            >
                              {status === 'in-progress'
                                ? 'In Progress'
                                : status === 'completed'
                                  ? 'Completed'
                                  : 'Pending'}
                            </span>

                            {(task.dueTime || task.time) && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock size={13} />
                                {task.dueTime || formatTime(task.time) || task.time}
                              </span>
                            )}

                            {task.priority && (
                              <span className="text-xs capitalize text-gray-400">
                                {task.priority} priority
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowDayTasks(false)}
              className="mt-5 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-200 transition hover:bg-white/5"
            >
              Close
            </button>
          </section>
        </div>
      )}
    </>
  )
}

export default UpcomingTasksCalendar