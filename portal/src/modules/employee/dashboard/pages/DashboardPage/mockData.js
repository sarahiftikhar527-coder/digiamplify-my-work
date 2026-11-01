// ---------------------------------------------------------------
// MOCK DATA — backend aane par is poori file ki jagah API response
// use karna. Shape wahi rakhna, UI change nahi hoga.
// ---------------------------------------------------------------
const pad = (n) => String(n).padStart(2, '0');
const iso = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const mockDashboard = {
  user: { name: 'Fahad' },

  // dashboard summary numbers (backend se aayenge)
  stats: { assigned: 32, completed: 24, inProgress: 6, overdue: 2 },
  todayProgress: 75,

  // status: 'pending' | 'completed'   priority: 'High' | 'Medium' | 'Low'
  tasks: [
    { id: 1, title: 'Design the dashboard', time: '10:00 AM', priority: 'High', status: 'pending', dueDate: iso(0) },
    { id: 2, title: 'Design the dashboard', time: '10:00 AM', priority: 'Medium', status: 'pending', dueDate: iso(0) },
    { id: 3, title: 'Design the dashboard', time: '10:00 AM', priority: 'Low', status: 'pending', dueDate: iso(0) },
    { id: 4, title: 'Design the dashboard', time: '10:00 AM', priority: 'Medium', status: 'pending', dueDate: iso(0) },
    { id: 5, title: 'Client feedback meeting', time: '11:30 AM', priority: 'High', status: 'pending', dueDate: iso(2) },
    { id: 6, title: 'Update HR policy page', time: '03:00 PM', priority: 'Low', status: 'pending', dueDate: iso(4) },
    { id: 7, title: 'Deploy staging build', time: '09:00 AM', priority: 'Medium', status: 'pending', dueDate: iso(7) },
    { id: 8, title: 'Weekly report', time: '04:00 PM', priority: 'Medium', status: 'completed', dueDate: iso(-1) },
    { id: 9, title: 'Optimize images', time: '01:00 PM', priority: 'Low', status: 'completed', dueDate: iso(-2) },
    { id: 10, title: 'Fix login bug', time: '12:00 PM', priority: 'High', status: 'completed', dueDate: iso(-3) },
    { id: 11, title: 'Write unit tests', time: '05:00 PM', priority: 'Medium', status: 'completed', dueDate: iso(-4) },
    { id: 12, title: 'Code review', time: '10:30 AM', priority: 'Low', status: 'completed', dueDate: iso(-5) },
  ],

  performance: {
    overall: 90,
    goals: '7/10',
    kpi: '95 %',
    feedback: '4.5/5',
    series: [
      { x: 5, value: 0 },
      { x: 7, value: 20 },
      { x: 9, value: 30 },
      { x: 11, value: 52 },
      { x: 13, value: 55 },
      { x: 15, value: 72 },
      { x: 17, value: 68 },
      { x: 19, value: 52 },
      { x: 21, value: 56 },
      { x: 23, value: 78 },
      { x: 25, value: 66 },
      { x: 27, value: 62 },
      { x: 29, value: 98 },
      { x: 30, value: 90 },
    ],
    xTicks: [5, 10, 15, 20, 25, 30].map((x) => ({ x, label: `${x} Jul` })),
  },

  // 4 hafte x 7 din: 'present' | 'absent' | 'leave' | 'today' | 'none'
  attendance: [
    ['present', 'absent', 'leave', 'present', 'absent', 'leave', 'present'],
    ['present', 'present', 'present', 'present', 'absent', 'present', 'present'],
    ['present', 'present', 'present', 'today', 'none', 'none', 'none'],
    ['none', 'leave', 'none', 'none', 'none', 'none', 'none'],
  ],

  announcementsNew: 4,
  announcements: [1, 2, 3, 4].map((id) => ({
    id,
    title: 'New HR policy update',
    description: 'Please review the HR policy…',
    timeAgo: '2h ago',
  })),

  // status: 'approved' | 'unapproved' | 'pending'
  leaves: [
    { id: 1, type: 'Annual Leave', from: '15 Jul 2026', to: '20 Jul 2026', status: 'approved' },
    { id: 2, type: 'Sick Leave', from: '15 Jul 2026', to: '20 Jul 2026', status: 'unapproved' },
    { id: 3, type: 'Casual Leave', from: '15 Jul 2026', to: '20 Jul 2026', status: 'pending' },
    { id: 4, type: 'Annual Leave', from: '15 Jul 2026', to: '20 Jul 2026', status: 'pending' },
  ],
};