
import apiClient, { unwrap } from './api/apiClient'

const notifyApprovalsChanged = (result) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('approvals:changed'))
  }

  return result
}

const extractArray = (payload, keys) => {
  if (Array.isArray(payload)) return payload

  if (!payload || typeof payload !== 'object') return []

  for (const key of keys) {
    if (payload[key] !== undefined) {
      const result = extractArray(payload[key], keys)

      if (result.length || Array.isArray(payload[key])) {
        return result
      }
    }
  }

  return []
}

const extractEmployees = (payload) => {
  return extractArray(payload, [
    'employees',
    'items',
    'users',
    'records',
    'results',
    'data',
    'result',
  ])
}

const extractPendingRequests = (payload) => {
  return extractArray(payload, [
    'requests',
    'items',
    'employees',
    'users',
    'records',
    'results',
    'data',
    'result',
  ])
}

const normalizeEmployees = (payload) => {
  const employees = extractEmployees(payload)
  const seen = new Set()

  return employees
    .filter((employee) => employee && typeof employee === 'object')
    .map((employee) => ({
      ...employee,
      id: String(
        employee.id ||
        employee._id ||
        employee.userId ||
        employee.user?.id ||
        employee.user?._id ||
        ''
      ),
    }))
    .filter((employee) => {
      if (!employee.id || seen.has(employee.id)) return false

      seen.add(employee.id)
      return true
    })
}

export const usersService = {
  employees: async () => {
    const response = await unwrap(
      apiClient.get('/users/assignable')
    )

    return normalizeEmployees(response)
  },

  list: async (params) => {
    const response = await unwrap(
      apiClient.get('/users', { params })
    )

    return response
  },

  create: (body) =>
    unwrap(apiClient.post('/users', body)),

  update: (id, body) =>
    unwrap(apiClient.patch(`/users/${id}`, body)),

  remove: (id) =>
    unwrap(apiClient.delete(`/users/${id}`)),

  pending: async () => {
    const response = await unwrap(
      apiClient.get('/users/pending')
    )

    const requests = extractPendingRequests(response)

    return normalizeEmployees(requests)
  },

  approve: (id, body = {}) =>
    unwrap(apiClient.patch(`/users/${id}/approve`, body))
      .then(notifyApprovalsChanged),

  reject: (id) =>
    unwrap(apiClient.patch(`/users/${id}/reject`))
      .then(notifyApprovalsChanged),

  assignable: async () => {
    const response = await unwrap(
      apiClient.get('/users/assignable')
    )

    return {
      ...response,
      employees: normalizeEmployees(response),
    }
  },

  setStructure: (id, body) =>
    unwrap(apiClient.patch(`/users/${id}/structure`, body)),

  liveStatus: async () => {
    const response = await unwrap(
      apiClient.get('/users/live-status')
    )

    return response?.employees || []
  },
}
