// Clean state for employee dashboard - no mock Fahad records

export const mockDashboard = {
  user: { name: 'User' },
  stats: { assigned: 0, completed: 0, inProgress: 0, overdue: 0 },
  todayProgress: 0,
  tasks: [],
  performance: {
    overall: 0,
    goals: '0/0',
    kpi: '0 %',
    feedback: '0/5',
    series: [],
  },
  attendance: [],
  recentActivity: [],
};
