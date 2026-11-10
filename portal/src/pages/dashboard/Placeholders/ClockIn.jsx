import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Clock, Loader2, LogIn, LogOut, UserX, Users } from 'lucide-react'
import { attendanceService } from '@/services/attendanceService'
import { getSocket } from '@/services/socket'

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// "9:05 AM"
const formatTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '—'

// "2h 10m" or "45m"
const formatDuration = (ms) => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`
}

// "02:10:35"
const formatClock = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const pad = (n) => String(n).padStart(2, '0')
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

// Total worked time = finished sessions + the session that is still running.
const workedMs = (record, now) =>
  record.closedMs + (record.openSince ? now - Date.parse(record.openSince) : 0)

// Sort order on the board: working first, then clocked out, then absent.
const STATUS_RANK = { working: 0, done: 1, absent: 2 }

const STATUS_STYLES = {
  working: { label: 'Working', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700' },
  done: { label: 'Clocked out', dot: 'bg-sky-500', pill: 'bg-sky-50 text-sky-700' },
  absent: { label: 'Absent', dot: 'bg-rose-500', pill: 'bg-rose-50 text-rose-700' },
}

const FILTERS = [
  ['all', 'All'],
  ['working', 'Working'],
  ['done', 'Clocked out'],
  ['absent', 'Absent'],
]

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function Avatar({ name, src }) {
  if (src) {
    return <img src={src} alt={name} className="h-10 w-10 rounded-full object-cover" />
  }
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
      {initials}
    </div>
  )
}

function MemberRow({ record, now, isMe }) {
  const style = STATUS_STYLES[record.status]

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex min-w-[180px] flex-1 items-center gap-3">
        <Avatar name={record.name} src={record.avatar} />
        <div>
          <p className="font-medium text-slate-900">
            {record.name} {isMe && <span className="text-xs text-slate-400">(You)</span>}
          </p>
          <span
            className={`mt-0.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${style.pill}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${style.dot} ${
                record.status === 'working' ? 'animate-pulse' : ''
              }`}
            />
            {style.label}
          </span>
        </div>
      </div>

      {record.status === 'absent' ? (
        <p className="text-sm text-slate-400">Not clocked in today</p>
      ) : (
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-xs text-slate-400">Clock in</p>
            <p className="font-medium text-slate-800">{formatTime(record.firstClockIn)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Clock out</p>
            <p className="font-medium text-slate-800">
              {record.status === 'working' ? '—' : formatTime(record.lastClockOut)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Worked</p>
            <p className="font-semibold text-slate-900">{formatDuration(workedMs(record, now))}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ClockIn() {
  const [items, setItems] = useState([])
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [now, setNow] = useState(() => Date.now())

  // Difference between the server clock and the browser clock (in ms),
  // so timers stay correct even if the user's device clock is wrong.
  const clockOffset = useRef(0)

  // Insert or replace one person's record, in the list and in "me".
  const upsert = useCallback((item) => {
    setItems((prev) => {
      const index = prev.findIndex((x) => x.userId === item.userId)
      if (index === -1) return [...prev, item]
      const next = [...prev]
      next[index] = item
      return next
    })
    setMe((prev) => (prev && prev.userId === item.userId ? item : prev))
  }, [])

  // Load today's board from the server.
  // Promise callbacks (not an async function) keep every setState call out of
  // the synchronous body of the effect that triggers the first load.
  const load = useCallback(
    () =>
      attendanceService
        .today()
        .then((data) => {
          clockOffset.current = Date.parse(data.serverTime) - Date.now()
          setItems(data.items)
          setMe(data.me)
          setError('')
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false)),
    []
  )

  // Initial load.
  useEffect(() => {
    load()
  }, [load])

  // Tick every second so running timers stay live.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() + clockOffset.current), 1000)
    return () => clearInterval(timer)
  }, [])

  // Real-time updates: whenever anybody clocks in or out, everyone sees it instantly.
  useEffect(() => {
    const socket = getSocket()
    socket.on('attendance:update', upsert)
    // After a reconnect, reload the board to catch anything missed while offline.
    socket.on('connect', load)
    return () => {
      socket.off('attendance:update', upsert)
      socket.off('connect', load)
    }
  }, [upsert, load])

  // Run a clock in / clock out request.
  const runAction = async (request) => {
    setBusy(true)
    setError('')
    try {
      const { item } = await request()
      upsert(item)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const counts = useMemo(() => {
    const result = { all: items.length, working: 0, done: 0, absent: 0 }
    items.forEach((record) => {
      result[record.status] += 1
    })
    return result
  }, [items])

  const visible = useMemo(
    () =>
      items
        .filter((record) => filter === 'all' || record.status === filter)
        .sort(
          (a, b) =>
            STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.name.localeCompare(b.name)
        ),
    [items, filter]
  )

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const isWorking = me?.status === 'working'
  const ActionIcon = isWorking ? LogOut : LogIn

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      {/* My own clock card */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <p className="text-sm text-slate-500">
            {new Date(now).toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-semibold tabular-nums text-slate-900">
            <Clock className="h-6 w-6 text-slate-400" />
            {me ? formatClock(workedMs(me, now)) : '00:00:00'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {me?.status === 'absent' && "You haven't clocked in yet"}
            {isWorking && `Clocked in at ${formatTime(me.firstClockIn)}`}
            {me?.status === 'done' &&
              `Clocked out at ${formatTime(me.lastClockOut)} · total ${formatDuration(me.closedMs)}`}
          </p>
        </div>

        <button
          type="button"
          disabled={busy || !me}
          onClick={() =>
            runAction(isWorking ? attendanceService.clockOut : attendanceService.clockIn)
          }
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white transition disabled:opacity-60 ${
            isWorking ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ActionIcon className="h-5 w-5" />}
          {isWorking ? 'Clock out' : me?.status === 'done' ? 'Clock in again' : 'Clock in'}
        </button>
      </section>

      {error && <p className="rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p>}

      {/* Team board: admin and employee both see everyone */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Users className="h-5 w-5" /> Team today
          </h2>
          <div className="flex flex-wrap gap-1.5 text-sm">
            {FILTERS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1 transition ${
                  filter === key
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label} · {counts[key]}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 py-10 text-slate-400">
            <UserX className="h-6 w-6" />
            <p className="text-sm">Nobody here</p>
          </div>
        ) : (
          visible.map((record) => (
            <MemberRow
              key={record.userId}
              record={record}
              now={now}
              isMe={record.userId === me?.userId}
            />
          ))
        )}
      </section>
    </div>
  )
}