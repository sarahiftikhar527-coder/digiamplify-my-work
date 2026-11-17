import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STYLE = {
  present: 'bg-[#b3121e]',
  absent: 'bg-[#e5202e] ring-2 ring-red-400/40',
  leave: 'bg-amber-400',
  today: 'bg-green-500',
  none: 'bg-[#4a4a4a]',
};

const LABEL = {
  present: 'Present',
  absent: 'Absent',
  leave: 'On Leave',
  today: 'Today',
  none: 'No record',
};

const TEXT_TONE = {
  present: 'text-red-500',
  absent: 'text-red-400',
  leave: 'text-amber-400',
  today: 'text-green-500',
  none: 'text-gray-400',
};

const LEGEND = [
  { key: 'present', label: 'Present' },
  { key: 'absent', label: 'Absent' },
  { key: 'leave', label: 'Leave' },
  { key: 'today', label: 'Today' },
];

const pad = (n) => String(n).padStart(2, '0');
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfWeek = (d) => addDays(d, -((d.getDay() + 6) % 7)); // Monday
const shortDate = (d) => d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
const fullDate = (d) => d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

/**
 * Props:
 *  records        - [{ date: 'YYYY-MM-DD', status: 'present'|'absent'|'leave',
 *                      checkIn?: '09:02 AM', checkOut?: '05:10 PM', note?: string }]
 *  range          - 'Week' | 'Month'  (default 'Month')
 *  initialDate    - Date (default aaj)
 *  loading        - boolean (skeleton)
 *  onRangeChange  - (range) => void
 *  onPeriodChange - ({ range, start, end }) => void   <- backend fetch yahan lagao
 *                   (mount par bhi ek baar call hota hai, start/end 'YYYY-MM-DD' hain)
 *  onDayClick     - (dateKey, record | undefined) => void
 */
const AttendanceOverview = ({
  records = [],
  range = 'Month',
  initialDate,
  loading = false,
  onRangeChange,
  onPeriodChange,
  onDayClick,
}) => {
  const [currentRange, setCurrentRange] = useState(range);
  const [anchor, setAnchor] = useState(() => (initialDate ? new Date(initialDate) : new Date()));
  const [selected, setSelected] = useState(null);

  useEffect(() => setCurrentRange(range), [range]);

  const now = new Date();
  const todayKey = toKey(now);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const recordMap = useMemo(() => new Map(records.map((r) => [r.date, r])), [records]);

  // Visible din (Week = 7 din, Month = poora calendar grid)
  const period = useMemo(() => {
    if (currentRange === 'Week') {
      const start = startOfWeek(anchor);
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(start, i);
        return { date, key: toKey(date), inPeriod: true };
      });
      return {
        start: days[0].date,
        end: days[6].date,
        days,
        label: `${shortDate(days[0].date)} - ${shortDate(days[6].date)}`,
      };
    }

    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    const lead = (first.getDay() + 6) % 7;
    const total = Math.ceil((lead + last.getDate()) / 7) * 7;
    const gridStart = addDays(first, -lead);
    const days = Array.from({ length: total }, (_, i) => {
      const date = addDays(gridStart, i);
      return { date, key: toKey(date), inPeriod: date.getMonth() === anchor.getMonth() };
    });
    return {
      start: first,
      end: last,
      days,
      label: first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  }, [currentRange, anchor]);

  // Backend ko batao kaunsa period dikh raha hai
  const startKey = toKey(period.start);
  const endKey = toKey(period.end);
  const periodCb = useRef(onPeriodChange);
  periodCb.current = onPeriodChange;

  useEffect(() => {
    periodCb.current?.({ range: currentRange, start: startKey, end: endKey });
    setSelected(null);
  }, [currentRange, startKey, endKey]);

  const counts = useMemo(() => {
    const c = { present: 0, absent: 0, leave: 0 };
    period.days.forEach((d) => {
      if (!d.inPeriod) return;
      const rec = recordMap.get(d.key);
      if (rec && c[rec.status] !== undefined) c[rec.status] += 1;
    });
    return c;
  }, [period, recordMap]);

  const changeRange = (value) => {
    setCurrentRange(value);
    onRangeChange?.(value);
    // Current month mein ho to Week aaj ke hafte par khule
    if (anchor.getFullYear() === now.getFullYear() && anchor.getMonth() === now.getMonth()) {
      setAnchor(new Date());
    }
  };

  const move = (dir) =>
    setAnchor((a) =>
      currentRange === 'Week' ? addDays(a, 7 * dir) : new Date(a.getFullYear(), a.getMonth() + dir, 1)
    );

  // Future ke period mein nahi ja sakte
  const canNext =
    currentRange === 'Week'
      ? addDays(period.start, 7) <= startOfToday
      : new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1) <= startOfToday;

  const describe = (cell) => {
    const rec = recordMap.get(cell.key);
    const isToday = cell.key === todayKey;
    const isFuture = cell.date > startOfToday;
    let status = 'none';
    if (isToday) status = 'today';
    else if (!isFuture && rec) status = rec.status;
    return { rec, isToday, status };
  };

  const pick = (cell) => {
    const { rec } = describe(cell);
    setSelected(cell.key === selected ? null : cell.key);
    onDayClick?.(cell.key, rec);
  };

  const selectedCell = period.days.find((d) => d.key === selected);
  const selectedInfo = selectedCell ? describe(selectedCell) : null;

  const arrow =
    'flex h-5 w-5 items-center justify-center rounded border border-[#2a2a2a] text-gray-300 transition hover:border-red-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[#2a2a2a]';

  return (
    <div className="flex h-full flex-col rounded-md border border-[#1e1e1e] bg-[#0b0b0b] p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-white">Attendance Overview</h3>
        <select
          value={currentRange}
          onChange={(e) => changeRange(e.target.value)}
          className="rounded border border-[#2a2a2a] bg-[#0b0b0b] px-2 py-1 text-[10px] text-gray-300 outline-none"
        >
          <option>Week</option>
          <option>Month</option>
        </select>
      </div>

      {/* Period navigation */}
      <div className="mt-3 flex items-center justify-between">
        <button type="button" className={arrow} onClick={() => move(-1)} aria-label="Previous period">
          <ChevronLeft size={11} />
        </button>
        <span className="text-[11px] text-gray-300">{period.label}</span>
        <button type="button" className={arrow} onClick={() => move(1)} disabled={!canNext} aria-label="Next period">
          <ChevronRight size={11} />
        </button>
      </div>

      {/* Grid */}
      <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-[10px] text-gray-300">
        {DAYS.map((d) => (
          <span key={d} className="pb-1">
            {d}
          </span>
        ))}

        {loading &&
          Array.from({ length: 14 }, (_, i) => (
            <span key={i} className="flex h-6 items-center justify-center">
              <span className="h-3 w-3 animate-pulse rounded-full bg-white/10" />
            </span>
          ))}

        {!loading &&
          period.days.map((cell) => {
            if (!cell.inPeriod) return <span key={cell.key} className="h-6" />;
            const { status, rec } = describe(cell);
            const tip = `${fullDate(cell.date)} - ${rec && status !== 'today' ? LABEL[rec.status] : LABEL[status]}`;
            return (
              <button
                key={cell.key}
                type="button"
                title={tip}
                aria-label={tip}
                onClick={() => pick(cell)}
                className={`flex h-6 items-center justify-center rounded transition hover:bg-white/10 ${
                  selected === cell.key ? 'bg-white/10' : ''
                }`}
              >
                <span className={`h-3 w-3 rounded-full ${STYLE[status]}`} />
              </button>
            );
          })}
      </div>

      {/* Selected day detail */}
      {selectedCell && selectedInfo ? (
        <div className="mt-3 rounded border border-white/10 bg-[#101010] px-3 py-2 text-[10px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white">{fullDate(selectedCell.date)}</span>
            <span className={TEXT_TONE[selectedInfo.rec?.status || selectedInfo.status]}>
              {selectedInfo.rec ? LABEL[selectedInfo.rec.status] : LABEL[selectedInfo.status]}
            </span>
          </div>
          {(selectedInfo.rec?.checkIn || selectedInfo.rec?.checkOut) && (
            <p className="mt-1 text-gray-400">
              In {selectedInfo.rec.checkIn || '-'} · Out {selectedInfo.rec.checkOut || '-'}
            </p>
          )}
          {selectedInfo.rec?.note && <p className="mt-1 text-gray-400">{selectedInfo.rec.note}</p>}
        </div>
      ) : (
        <p className="mt-3 text-center text-[10px] text-gray-500">Click on any day to view its details.</p>
      )}

      {/* Legend with counts */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 pt-4 text-[10px] text-gray-300">
        {LEGEND.map(({ key, label }) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${STYLE[key]}`} />
            {label}
            {counts[key] !== undefined && <span className="text-white">{counts[key]}</span>}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AttendanceOverview;