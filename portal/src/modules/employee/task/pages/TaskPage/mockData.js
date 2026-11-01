const pad = (n) => String(n).padStart(2, '0');

// Aaj se `n` din baad ki date (YYYY-MM-DD), taake "days left" hamesha sahi dikhe
const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const rows = [
  ['high', 'Fahad', 4, 'ongoing'],
  ['medium', 'Hamza', 8, 'delayed'],
  ['low', 'Tabin', 7, 'finished'],
  ['high', 'Fahad', 4, 'ongoing'],
  ['medium', 'Hamza', 8, 'delayed'],
  ['low', 'Tabin', 9, 'finished'],
  ['high', 'Fahad', 3, 'ongoing'],
  ['medium', 'Hamza', 10, 'delayed'],
  ['low', 'Tabin', 6, 'finished'],
  ['high', 'Fahad', 2, 'ongoing'],
  ['medium', 'Hamza', 5, 'ongoing'],
  ['low', 'Tabin', 12, 'finished'],
];

export const mockTask = {
  tasks: rows.map(([priority, assignedBy, days, status], i) => ({
    id: i + 1,
    title: 'Design Employee screen',
    description:
      'You have to design this employee screen with all the required details and states.',
    priority,
    assignedBy,
    dueDate: addDays(days),
    status,
  })),

  analytics: {
    data: [
      { label: 'Completed', value: 7, color: '#1f8a5b' },
      { label: 'Ongoing', value: 5, color: '#c1121f' },
      { label: 'Delayed', value: 2, color: '#f59e0b' },
      { label: 'Cancelled', value: 1, color: '#7c5cdb' },
    ],
    summary: { today: 7, completed: 3, pending: 4 },
  },

  shifts: [
    { id: 1, date: 'Thu, 9 Jul', clockIn: '09:05 AM', clockOut: '02:05 PM', workHours: '5h 20m', status: 'none' },
    { id: 2, date: 'Thu, 9 Jul', clockIn: '09:05 AM', clockOut: '02:05 PM', workHours: '5h 20m', status: 'done' },
    { id: 3, date: 'Thu, 9 Jul', clockIn: '09:05 AM', clockOut: '02:05 PM', workHours: '5h 20m', status: 'left' },
    { id: 4, date: 'Thu, 9 Jul', clockIn: '09:05 AM', clockOut: '02:05 PM', workHours: '5h 20m', status: 'done' },
    { id: 5, date: 'Thu, 9 Jul', clockIn: '09:05 AM', clockOut: '02:05 PM', workHours: '5h 20m', status: 'pending' },
  ],

  recent: {
    newCount: 4,
    items: [
      { id: 1, title: 'Design employee screen', progress: 60, time: 'Today, 09:30 AM' },
      { id: 2, title: 'Design employee screen', progress: 60, time: 'Yesterday, 09:30 AM' },
      { id: 3, title: 'Design employee screen', progress: 60, time: 'Yesterday, 09:30 AM' },
    ],
  },

  priority: [
    { label: 'High', count: 7, color: '#c1121f' },
    { label: 'Medium', count: 5, color: '#f59e0b' },
    { label: 'Low', count: 3, color: '#22c55e' },
  ],
};