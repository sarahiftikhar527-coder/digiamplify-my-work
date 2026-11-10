export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const TOTAL_EMPLOYEES = 10;
export const ATTENDANCE_CUTOFF = '2026-07-20';

export const pad = (n) => String(n).padStart(2, '0');

export const toKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const fromKey = (key) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const eachDay = (fromDate, toDate) => {
  if (!fromDate || !toDate) return [];

  const output = [];
  const current = fromKey(fromDate);
  const end = fromKey(toDate);

  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime())) {
    return output;
  }

  while (current <= end) {
    output.push(toKey(current));
    current.setDate(current.getDate() + 1);
  }

  return output;
};

export const daysBetween = (fromDate, toDate) =>
  eachDay(fromDate, toDate).length;

export const formatRange = (fromDate, toDate) => {
  if (!fromDate || !toDate) return '';

  const start = fromKey(fromDate);
  const end = fromKey(toDate);

  const shortDate = (date) =>
    `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`;

  return `${shortDate(start)} - ${shortDate(end)} ${end.getFullYear()}`;
};

export const getMonthMatrix = (cursor) => {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((offset + count) / 7) * 7;

  const cells = Array.from({ length: total }, (_, index) => {
    const day = index - offset + 1;

    return {
      date:
        day >= 1 && day <= count
          ? new Date(year, month, day)
          : null,
    };
  });

  return Array.from({ length: total / 7 }, (_, week) =>
    cells.slice(week * 7, week * 7 + 7)
  );
};

export const getWeekRow = (cursor) => {
  const start = new Date(cursor);

  start.setDate(
    cursor.getDate() - ((cursor.getDay() + 6) % 7)
  );

  return [
    Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      return { date };
    }),
  ];
};

export const EVENT_TYPES = [
  { id: 'task', label: 'Task View', dot: 'bg-red-600' },
  { id: 'absent', label: 'Absent', dot: 'bg-orange-400' },
  { id: 'weekend', label: 'Weekend', dot: 'bg-neutral-500' },
  { id: 'event', label: 'Event', dot: 'bg-purple-500' },
  { id: 'holiday', label: 'Holiday', dot: 'bg-sky-400' },
  { id: 'meeting', label: 'Meeting', dot: 'bg-emerald-400' },
  { id: 'shift', label: 'Assigned Shift', dot: 'bg-blue-500' },
];

export const MOCK_HOLIDAYS = {
  '2026-07-10': {
    title: 'Eid Holiday',
    sub: '(Eid ul Fitr)',
  },
  '2026-07-11': {
    title: 'Eid Holiday',
    sub: '(Eid ul Fitr)',
  },
  '2026-07-12': {
    title: 'Eid Holiday',
    sub: '(Eid ul Fitr)',
  },
  '2026-07-20': {
    title: 'Eid Holiday',
    sub: '(Eid ul Azha)',
  },
};

export const MOCK_BASE_LEAVES = {
  '2026-07-04': 3,
  '2026-07-06': 3,
  '2026-07-09': 3,
  '2026-07-19': 3,
};

export const MOCK_EMPLOYEES = [
  { id: 'e1', name: 'Allan' },
  { id: 'e2', name: 'Jame Jhon' },
  { id: 'e3', name: 'Jhon Ken' },
  { id: 'e4', name: 'Sara Khan' },
  { id: 'e5', name: 'Ali Raza' },
  { id: 'e6', name: 'Hina Malik' },
  { id: 'e7', name: 'Usman Tariq' },
  { id: 'e8', name: 'Ayesha Noor' },
];

export const MOCK_HOLIDAY_REQUESTS = [1, 2, 3, 4].map((index) => ({
  id: `h${index}`,
  name: 'Jame Jhon',
  role: 'UI/UX Designer',
  from: '2026-07-14',
  to: '2026-07-20',
}));

export const MOCK_LEAVE_REQUESTS = [
  {
    id: 'l1',
    type: 'Annual Leave',
    from: '2026-07-15',
    to: '2026-07-20',
    employees: 8,
  },
  {
    id: 'l2',
    type: 'Sick Leave',
    from: '2026-07-15',
    to: '2026-07-20',
    employees: 5,
  },
  {
    id: 'l3',
    type: 'Eid Holidays',
    from: '2026-07-15',
    to: '2026-07-20',
    employees: 'All',
  },
  {
    id: 'l4',
    type: 'Annual Leave',
    from: '2026-07-15',
    to: '2026-07-20',
    employees: 8,
  },
];

export const MOCK_TODAY_ATTENDANCE = Array.from(
  { length: 6 },
  (_, index) => ({
    id: `a${index}`,
    name: 'Allan',
    clockIn: '09:00 AM',
    clockOut: '02:00 PM',
    worked: '5h 10m',
  })
);

export const SHIFT_PRESETS = {
  Morning: {
    start: '09:00',
    end: '17:00',
  },
  Evening: {
    start: '14:00',
    end: '22:00',
  },
  Night: {
    start: '22:00',
    end: '06:00',
  },
  Custom: {
    start: '09:00',
    end: '17:00',
  },
};

export const getShiftId = (shift) => {
  if (!shift || typeof shift !== 'object') return '';

  const id =
    shift._id ??
    shift.id ??
    shift.shiftId ??
    shift.eventId ??
    '';

  return typeof id === 'object' && id !== null
    ? String(id._id ?? id.id ?? '')
    : String(id);
};

export const getShiftDate = (shift) => {
  if (!shift || typeof shift !== 'object') return '';

  const value =
    shift.date ??
    shift.from ??
    shift.startDate ??
    shift.start ??
    '';

  if (!value) return '';

  if (value instanceof Date) {
    return toKey(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? '' : toKey(parsed);
};

export const getShiftEndDate = (shift) => {
  if (!shift || typeof shift !== 'object') return '';

  const value =
    shift.to ??
    shift.endDate ??
    shift.end ??
    shift.date ??
    shift.from ??
    '';

  if (!value) return '';

  if (value instanceof Date) {
    return toKey(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? '' : toKey(parsed);
};

export const getShiftEmployeeName = (shift) => {
  if (!shift || typeof shift !== 'object') return '';

  const employee =
    shift.employee ??
    shift.employeeId ??
    shift.assignee ??
    shift.assignedTo ??
    shift.user ??
    null;

  if (typeof employee === 'string') {
    return shift.employeeName ?? shift.assigneeName ?? '';
  }

  if (employee && typeof employee === 'object') {
    return (
      employee.name ??
      employee.fullName ??
      employee.employeeName ??
      shift.employeeName ??
      shift.assigneeName ??
      ''
    );
  }

  return (
    shift.employeeName ??
    shift.assigneeName ??
    shift.userName ??
    ''
  );
};

export const getShiftTime = (shift) => {
  if (!shift || typeof shift !== 'object') return '';

  const start =
    shift.startTime ??
    shift.fromTime ??
    shift.start_time ??
    '';

  const end =
    shift.endTime ??
    shift.toTime ??
    shift.end_time ??
    '';

  if (start && end) {
    return `${start} - ${end}`;
  }

  if (start) return String(start);
  if (end) return String(end);

  return '';
};

export const groupShiftsByDate = (shifts = []) => {
  const grouped = {};

  const records = Array.isArray(shifts)
    ? shifts
    : Array.isArray(shifts?.items)
      ? shifts.items
      : Array.isArray(shifts?.shifts)
        ? shifts.shifts
        : Array.isArray(shifts?.records)
          ? shifts.records
          : [];

  records.forEach((shift) => {
    if (!shift || typeof shift !== 'object') return;

    const startDate = getShiftDate(shift);
    const endDate = getShiftEndDate(shift);

    if (!startDate) return;

    const dates = eachDay(startDate, endDate || startDate);

    dates.forEach((dateKey) => {
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(shift);
    });
  });

  return grouped;
};