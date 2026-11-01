import apiClient, { unwrap } from './api/apiClient'

export const usersService = {
  employees: () => unwrap(apiClient.get('/users/employees')).then((d) => d.items),
  list: (params) => unwrap(apiClient.get('/users', { params })),
  create: (body) => unwrap(apiClient.post('/users', body)),
  update: (id, body) => unwrap(apiClient.patch(`/users/${id}`, body)),
  remove: (id) => unwrap(apiClient.delete(`/users/${id}`)),
}