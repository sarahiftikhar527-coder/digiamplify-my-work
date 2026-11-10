import apiClient, { unwrap } from './api/api/apiClient'

// All attendance related API calls.
// Every function returns the unwrapped `data` object from the backend response.
export const attendanceService = {
  // Today's board for the whole team (admin and employee both get it).
  // Returns: { items, me, serverTime }
  today: () => unwrap(apiClient.get('/attendance/today')),

  // Clock the current user in. Returns: { item }
  clockIn: () => unwrap(apiClient.post('/attendance/clock-in')),

  // Clock the current user out. Returns: { item }
  clockOut: () => unwrap(apiClient.post('/attendance/clock-out')),

  // Attendance history, admin only.
  // params: { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD', userId?: string }
  history: (params) => unwrap(apiClient.get('/attendance/history', { params })),
}