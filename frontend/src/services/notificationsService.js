import apiClient, { unwrap } from './api/apiClient'

// Backend ki createdAt ko "Today, 10:24 AM" jaisa dikhane ke liye
export function formatTime(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''

  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate())
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000)

  if (diffDays === 0) return `Today, ${time}`
  if (diffDays === 1) return `Yesterday, ${time}`
  const date = d.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
  return `${date}, ${time}`
}

export const mapNotification = (n) => ({ ...n, time: formatTime(n.createdAt) })

export const notificationsService = {
  list: () =>
    unwrap(apiClient.get('/notifications', { params: { limit: 200 } })).then((d) =>
      d.items.map(mapNotification)
    ),
  markRead: (id) => unwrap(apiClient.patch(`/notifications/${id}/read`)),
  markUnread: (id) => unwrap(apiClient.patch(`/notifications/${id}/unread`)),
  markAllRead: () => unwrap(apiClient.patch('/notifications/read-all')),
  remove: (id) => unwrap(apiClient.delete(`/notifications/${id}`)),
  clearAll: () => unwrap(apiClient.delete('/notifications')),
  send: (payload) => unwrap(apiClient.post('/notifications', payload)).then((d) => d.count),
  getPrefs: () => unwrap(apiClient.get('/notifications/preferences')).then((d) => d.items),
  setPref: (key, on) =>
    unwrap(apiClient.patch(`/notifications/preferences/${key}`, { on })).then((d) => d.items),
}