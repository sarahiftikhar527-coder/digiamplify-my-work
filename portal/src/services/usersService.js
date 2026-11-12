import apiClient, { unwrap } from './api/apiClient'

// Tells the sidebar to refresh the Approvals badge right away.
const notifyApprovalsChanged = (result) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('approvals:changed'))
  }

  return result
}

export const usersService = {
  employees: () => unwrap(apiClient.get('/users/employees')).then((d) => d.items),
  list: (params) => unwrap(apiClient.get('/users', { params })),
  create: (body) => unwrap(apiClient.post('/users', body)),
  update: (id, body) => unwrap(apiClient.patch(`/users/${id}`, body)),
  remove: (id) => unwrap(apiClient.delete(`/users/${id}`)),

  // Signup approval flow (admin only)
  pending: () => unwrap(apiClient.get('/users/pending')).then((d) => d?.requests || []),
  approve: (id) =>
    unwrap(apiClient.patch(`/users/${id}/approve`)).then(notifyApprovalsChanged),
  reject: (id) =>
    unwrap(apiClient.patch(`/users/${id}/reject`)).then(notifyApprovalsChanged),

  // Live clock-in status of all employees (admin only)
  liveStatus: () => unwrap(apiClient.get('/users/live-status')).then((d) => d?.employees || []),
}