import { addDays, fromISO, toISO, weekdayIndex } from '../../utils/calendar';

/* ============================================================
   BACKEND SWITCH
   1. Set USE_MOCK = false
   2. Set API_BASE_URL to your server
   3. Make your endpoints return the shapes written in the comments
   ============================================================ */
const USE_MOCK = true;
const API_BASE_URL = '/api';

const delay = (value, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

async function http(path, { method = 'GET', body } = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include', // TODO: or send your token: headers: { Authorization: `Bearer ${token}` }
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      message = (await res.json()).message || message;
    } catch {
      /* response had no JSON body */
    }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

/* ---------------- Mock data (delete when backend is ready) ---------------- */
const MONTH_PATTERN = [
  [1, 'task', 'View Project Proposal'], [3, 'absent', 'Employee absent'],
  [4, 'task', 'View Project Proposal'], [6, 'absent', 'Employee absent'],
  [9, 'task', 'View Project Proposal'], [10, 'holiday', 'Eid Holiday (Eid ul Fitr)'],
  [13, 'task', 'View Project Proposal'], [16, 'task', 'View Project Proposal'],
  [18, 'task', 'View Project Proposal'], [20, 'holiday', 'Eid Holiday (Eid ul Azha)'],
  [23, 'absent', 'Employee absent'], [26, 'task', 'View Project Proposal'],
  [28, 'task', 'View Project Proposal'],
];

function mockEvents(from, to) {
  const out = [];
  const start = fromISO(from);
  const end = fromISO(to);
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    MONTH_PATTERN.forEach(([day, type, title]) => {
      const d = new Date(cur.getFullYear(), cur.getMonth(), day);
      const iso = toISO(d);
      if (d.getMonth() === cur.getMonth() && iso >= from && iso <= to) {
        out.push({ id: `${iso}-${type}`, date: iso, type, title });
      }
    });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return out;
}

const db = {
  leaves: [
    { id: 'l1', type: 'Annual', startDate: '2026-07-15', endDate: '2026-07-20', status: 'approved' },
    { id: 'l2', type: 'Sick', startDate: '2026-07-15', endDate: '2026-07-20', status: 'unapproved' },
    { id: 'l3', type: 'Casual', startDate: '2026-07-15', endDate: '2026-07-20', status: 'pending' },
    { id: 'l4', type: 'Annual', startDate: '2026-07-15', endDate: '2026-07-20', status: 'pending' },
  ],
  availability: [],
};

const APPROVERS = [
  { id: 'a1', name: 'James Jhon', role: 'HR Manager' },
  { id: 'a2', name: 'Sara Khan', role: 'Team Lead' },
  { id: 'a3', name: 'Ali Raza', role: 'Project Manager' },
  { id: 'a4', name: 'Mry Jhon', role: 'Department Manager' },
];

const mockTasks = () =>
  [
    ['t1', 'Review project proposal', 2], ['t2', 'Dashboard Redesign', 4],
    ['t3', 'UI/UX research', 6], ['t4', 'Review project proposal', 9],
  ].map(([id, title, n]) => ({ id, title, date: toISO(addDays(new Date(), n)), isNew: true }));

const DAY_ITEMS = [
  { id: 'i1', type: 'meeting', title: 'Daily startup meeting', start: '09:00', end: '09:30', place: 'Meeting Room 1', attendees: 8 },
  { id: 'i2', type: 'task', title: 'Redesign dashboard', start: '09:30', end: '11:00', place: 'Design Team', attendees: 8 },
  { id: 'i3', type: 'meeting', title: 'Daily startup meeting', start: '11:00', end: '11:30', place: 'Meeting Room 1', attendees: 8 },
  { id: 'i4', type: 'meeting', title: 'Daily startup meeting', start: '11:30', end: '12:00', place: 'Meeting Room 1', attendees: 8 },
  { id: 'i5', type: 'break', title: 'Lunch Break', start: '13:00', end: '14:00', place: 'Break', attendees: null },
  { id: 'i6', type: 'task', title: 'Redesign dashboard', start: '14:00', end: '16:00', place: 'Design Team', attendees: 8 },
  { id: 'i7', type: 'task', title: 'Redesign dashboard', start: '16:00', end: '17:00', place: 'Design Team', attendees: 8 },
  { id: 'i8', type: 'meeting', title: 'Review and feedback', start: '17:00', end: '18:00', place: 'Meeting Room 1', attendees: 8 },
];

function mockDaySchedule(iso) {
  const wd = weekdayIndex(fromISO(iso));
  const avail = db.availability.find((a) => iso >= a.from && iso <= a.to && a.days.includes(wd));
  if (wd >= 5 && !avail) {
    return { date: iso, shift: null, breakTime: null, clockIn: null, clockOut: null, items: [] };
  }
  const shift = avail ? { start: avail.start, end: avail.end } : { start: '09:00', end: '18:00' };
  const past = iso <= toISO(new Date());
  return {
    date: iso,
    shift,
    breakTime: { start: '13:00', end: '14:00' },
    clockIn: past ? { time: shift.start, status: 'On Time' } : null,
    clockOut: past ? { time: shift.end, status: 'On Time' } : null,
    items: avail ? [] : DAY_ITEMS,
  };
}

/* ---------------- Public API ---------------- */
export const calendarService = {
  // GET /calendar/events?from=YYYY-MM-DD&to=YYYY-MM-DD
  // -> [{ id, date: 'YYYY-MM-DD', type: 'task'|'absent'|'event'|'holiday', title }]
  getEvents: ({ from, to }) =>
    USE_MOCK ? delay(mockEvents(from, to)) : http(`/calendar/events?from=${from}&to=${to}`),

  // GET /calendar/days/:date
  // -> { date, shift: {start,end}|null, breakTime: {start,end}|null,
  //      clockIn: {time,status}|null, clockOut: {time,status}|null,
  //      items: [{ id, type: 'meeting'|'task'|'break', title, start, end, place, attendees }] }
  //    (times are "HH:MM" in 24h)
  getDaySchedule: (date) =>
    USE_MOCK ? delay(mockDaySchedule(date)) : http(`/calendar/days/${date}`),

  // GET /calendar/tasks/upcoming -> [{ id, title, date: 'YYYY-MM-DD', isNew }]
  getUpcomingTasks: () => (USE_MOCK ? delay(mockTasks()) : http('/calendar/tasks/upcoming')),

  // GET /calendar/absenteeism -> { absent: 3, total: 10 }
  getAbsenteeism: () =>
    USE_MOCK ? delay({ absent: 3, total: 10 }) : http('/calendar/absenteeism'),

  // GET /leave-requests
  // -> [{ id, type: 'Annual'|'Sick'|'Casual'|'Unpaid', startDate, endDate, status: 'approved'|'unapproved'|'pending' }]
  getLeaveRequests: () => (USE_MOCK ? delay([...db.leaves]) : http('/leave-requests')),

  // GET /approvers?q=text -> [{ id, name, role }]
  searchApprovers: (q = '') =>
    USE_MOCK
      ? delay(
          APPROVERS.filter((a) => `${a.name} ${a.role}`.toLowerCase().includes(q.trim().toLowerCase())),
          150
        )
      : http(`/approvers?q=${encodeURIComponent(q)}`),

  // POST /leave-requests (multipart/form-data) -> the created request
  createLeaveRequest: async (payload) => {
    if (!USE_MOCK) {
      const fd = new FormData();
      fd.append('approverIds', JSON.stringify(payload.approverIds));
      ['startDate', 'endDate', 'subject', 'leaveType', 'description'].forEach((k) => fd.append(k, payload[k]));
      payload.attachments.forEach((file) => fd.append('attachments', file));
      return http('/leave-requests', { method: 'POST', body: fd });
    }
    const created = {
      id: `l-${Date.now()}`,
      type: payload.leaveType,
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: 'pending',
    };
    db.leaves.unshift(created);
    return delay(created);
  },

  // POST /availability
  // body: { days: [0..6] (Mon=0), from, to, start: 'HH:MM', end: 'HH:MM', shift: 'morning'|'afternoon'|'night' }
  saveAvailability: async (payload) => {
    if (!USE_MOCK) return http('/availability', { method: 'POST', body: payload });
    db.availability.push({ id: `av-${Date.now()}`, ...payload });
    return delay(payload);
  },
};