import { WEEKDAYS, toKey, getMonthMatrix, getWeekRow } from '../calendarData';

const TONES = {
  present: {
    pill: 'bg-emerald-500/10 text-emerald-400',
    dot: 'bg-emerald-400',
  },
  leave: {
    pill: 'bg-red-500/15 text-red-400',
    dot: 'bg-red-500',
  },
  holiday: {
    pill: 'bg-sky-500/15 text-sky-300',
    dot: 'bg-sky-400',
  },
  shift: {
    pill: 'bg-purple-500/15 text-purple-300',
    dot: 'bg-purple-400',
  },
};

const FILTER_OF = {
  present: 'task',
  leave: 'absent',
  holiday: 'holiday',
  shift: 'event',
};

const getCountLabel = (count, singular = 'Employee') =>
  `${count} ${singular}${count === 1 ? '' : 's'}`;

const getAttendanceDetails = (attendance) => {
  if (typeof attendance === 'number') {
    return {
      title: 'Attendance',
      sub: getCountLabel(attendance),
    };
  }

  if (Array.isArray(attendance)) {
    return {
      title: 'Attendance',
      sub: getCountLabel(attendance.length),
    };
  }

  if (attendance && typeof attendance === 'object') {
    return {
      title: attendance.title || 'Attendance',
      sub:
        attendance.sub ||
        (typeof attendance.count === 'number'
          ? getCountLabel(attendance.count)
          : 'Attendance recorded'),
    };
  }

  return {
    title: 'Attendance',
    sub: 'Attendance recorded',
  };
};

const getShiftEmployeeName = (shift) => {
  const employee = shift?.employeeId;

  if (employee && typeof employee === 'object') {
    return (
      shift.employeeName ||
      employee.name ||
      employee.fullName ||
      employee.email ||
      'Employee'
    );
  }

  return shift?.employeeName || shift?.name || 'Employee';
};

const getShiftTime = (shift) => {
  const start = shift?.startTime || shift?.start || '';
  const end = shift?.endTime || shift?.end || '';

  if (start && end) return `${start} - ${end}`;
  if (start) return `Starts ${start}`;
  if (end) return `Ends ${end}`;

  return '';
};

export function getDayItems(
  key,
  col,
  {
    holidays = {},
    leaveByDate = {},
    shiftsByDate = {},
    attendanceByDate = {},
  } = {},
  filters = {}
) {
  const items = [];

  const holiday = holidays[key];
  const leave = leaveByDate[key];
  const shifts = shiftsByDate[key];
  const attendance = attendanceByDate[key];

  if (holiday) {
    const holidayItems = Array.isArray(holiday) ? holiday : [holiday];

    holidayItems.forEach((item, index) => {
      items.push({
        id: item.id || item._id || `holiday-${key}-${index}`,
        type: 'holiday',
        title: item.title || 'Holiday',
        sub: item.sub || item.description || '',
        event: item,
      });
    });
  }

  if (leave) {
    const leaveCount =
      typeof leave === 'number'
        ? leave
        : Array.isArray(leave)
          ? leave.length
          : typeof leave.count === 'number'
            ? leave.count
            : 1;

    items.push({
      id: `leave-${key}`,
      type: 'leave',
      title: 'On Leave',
      sub: getCountLabel(leaveCount),
    });
  }

  if (attendance) {
    const details = getAttendanceDetails(attendance);

    items.push({
      id: `attendance-${key}`,
      type: 'present',
      title: details.title,
      sub: details.sub,
    });
  }

  if (shifts) {
    const shiftRecords = Array.isArray(shifts)
      ? shifts
      : typeof shifts === 'object' && Array.isArray(shifts.items)
        ? shifts.items
        : typeof shifts === 'object' && Array.isArray(shifts.shifts)
          ? shifts.shifts
          : typeof shifts === 'object' && Array.isArray(shifts.records)
            ? shifts.records
            : typeof shifts === 'object' && shifts.shift
              ? [shifts.shift]
              : typeof shifts === 'object' && (
                    shifts._id ||
                    shifts.id ||
                    shifts.employeeId
                  )
                ? [shifts]
                : [];

    if (shiftRecords.length > 0) {
      shiftRecords.forEach((shift, index) => {
        const employeeName = getShiftEmployeeName(shift);
        const time = getShiftTime(shift);

        items.push({
          id: shift._id || shift.id || `shift-${key}-${index}`,
          type: 'shift',
          title:
            shift.title ||
            shift.shiftName ||
            shift.name ||
            'Shift Assigned',
          sub: [employeeName, time].filter(Boolean).join(' · '),
          event: shift,
        });
      });
    } else {
      const shiftCount =
        typeof shifts === 'number'
          ? shifts
          : typeof shifts === 'object' &&
              typeof shifts.count === 'number'
            ? shifts.count
            : 1;

      items.push({
        id: `shift-${key}`,
        type: 'shift',
        title: 'Shift Assigned',
        sub: getCountLabel(shiftCount),
        event: null,
      });
    }
  }

  return items.filter((item) => {
    const filterKey = FILTER_OF[item.type];

    return filterKey ? filters[filterKey] !== false : true;
  });
}

export default function CalendarGrid({
  cursor,
  view,
  filters = {},
  data = {},
  selectedKey,
  onSelect = () => {},
  onShiftSelect = () => {},
}) {
  const rows = view === 'week' ? getWeekRow(cursor) : getMonthMatrix(cursor);

  const todayKey = toKey(new Date());
  const todayCol = (new Date().getDay() + 6) % 7;

  const selectedDate = selectedKey
    ? new Date(`${selectedKey}T00:00:00`)
    : null;

  const selectedItems =
    selectedDate && !Number.isNaN(selectedDate.getTime())
      ? getDayItems(
          selectedKey,
          (selectedDate.getDay() + 6) % 7,
          data,
          filters
        )
      : [];

  const renderItem = (item, index, compact = false) => {
    const tone = TONES[item.type] || TONES.present;
    const isClickableShift = item.type === 'shift' && item.event;

    const className = compact
      ? `w-full rounded px-2 py-1.5 text-left text-xs ${tone.pill}`
      : `w-full rounded px-1.5 py-1 text-left text-[9px] leading-tight transition-colors lg:text-[10px] ${tone.pill}`;

    const content = (
      <>
        <div className="truncate font-medium">{item.title}</div>

        {item.sub && (
          <div className="truncate text-neutral-300">{item.sub}</div>
        )}
      </>
    );

    if (isClickableShift) {
      return (
        <button
          key={`${item.id}-${index}`}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onShiftSelect(item.event);
          }}
          className={`${className} cursor-pointer border border-purple-400/20 hover:border-purple-300/60 hover:bg-purple-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400`}
          title={`${item.title}${item.sub ? ` — ${item.sub}` : ''}. Click to view shift details.`}
          aria-label={`View shift: ${item.title}${item.sub ? `, ${item.sub}` : ''}`}
        >
          {content}
        </button>
      );
    }

    return (
      <div
        key={`${item.id}-${index}`}
        className={className}
        title={[item.title, item.sub].filter(Boolean).join(' — ')}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[#232323]">
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={`border-b border-r border-[#232323] py-2 text-center text-[11px] font-medium last:border-r-0 sm:py-3 sm:text-xs ${
              index === todayCol
                ? 'bg-[#c1121f] text-white'
                : 'bg-[#0a0a0a] text-neutral-300'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {rows.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7">
          {week.map((cell, col) => {
            const base = `min-h-[56px] border-b border-r border-[#232323] last:border-r-0 sm:min-h-[84px] ${
              col === todayCol ? 'bg-red-950/25' : 'bg-[#050505]'
            }`;

            if (!cell.date) {
              return <div key={col} className={base} />;
            }

            const key = toKey(cell.date);
            const items = getDayItems(key, col, data, filters);

            const isSelected = key === selectedKey;
            const isToday = key === todayKey;
            const isWeekend = col >= 5;
            const weekendTint =
              filters.weekend && isWeekend ? 'bg-white/[0.04]' : '';

            return (
              <div
                key={col}
                className={`${base} ${weekendTint} flex flex-col p-1 text-left transition-colors sm:p-2 ${
                  isSelected ? 'ring-1 ring-inset ring-red-600' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(key)}
                  aria-label={`Select ${cell.date.toDateString()}, ${items.length} entries`}
                  aria-pressed={isSelected}
                  className="flex w-full shrink-0 items-center rounded text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
                >
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold sm:text-sm ${
                      isToday
                        ? 'bg-[#c1121f] text-white'
                        : 'text-neutral-200'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>
                </button>

                <div className="mt-1 hidden min-w-0 space-y-1 sm:block">
                  {items.map((item, index) => renderItem(item, index))}
                </div>

                <div className="mt-1 hidden flex-wrap gap-1 sm:hidden" />

                <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                  {items.map((item, index) => {
                    const tone = TONES[item.type] || TONES.present;
                    const isClickableShift =
                      item.type === 'shift' && item.event;

                    if (isClickableShift) {
                      return (
                        <button
                          key={`${item.id}-${index}`}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onShiftSelect(item.event);
                          }}
                          title="View shift details"
                          aria-label={`View shift: ${item.title}`}
                          className={`h-2.5 w-2.5 rounded-full ${tone.dot} ring-1 ring-purple-200/40`}
                        />
                      );
                    }

                    return (
                      <span
                        key={`${item.id}-${index}`}
                        className={`h-1.5 w-1.5 rounded-full ${tone.dot}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div
        className="border-t border-[#232323] bg-[#0a0a0a] p-3 sm:hidden"
        aria-live="polite"
      >
        {selectedDate && !Number.isNaN(selectedDate.getTime()) ? (
          <>
            <p className="mb-2 text-xs font-semibold text-white">
              {selectedDate.toDateString()}
            </p>

            {selectedItems.length > 0 ? (
              <div className="space-y-1.5">
                {selectedItems.map((item, index) =>
                  renderItem(item, index, true)
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                Nothing scheduled for this day.
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-neutral-400">
            Tap a day to see details.
          </p>
        )}
      </div>
    </div>
  );
}
