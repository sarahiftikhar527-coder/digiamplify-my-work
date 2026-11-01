import apiClient, { refreshAccessToken, unwrap } from './api/apiClient'
import { tokenStore } from './api/tokenStore'
import { disconnectSocket } from './socket'

export const authService = {
  async login(email, password) {
    const data = await unwrap(apiClient.post('/auth/login', { email, password }))
    tokenStore.set(data.accessToken)
    return data.user // { id, name, email, role, ... }
  },

  async logout() {
    try { await apiClient.post('/auth/logout') } catch {}
    tokenStore.clear()
    disconnectSocket()
  },

  async me() {
    const data = await unwrap(apiClient.get('/auth/me'))
    return data.user
  },

  // Page refresh par purana login wapas lane ke liye. User nahi mila to null.
  async restore() {
    if (!tokenStore.get()) {
      try { await refreshAccessToken() } catch { return null }
    }
    try { return await authService.me() } catch { return null }
  },

  changePassword: (currentPassword, newPassword) =>
    unwrap(apiClient.post('/auth/change-password', { currentPassword, newPassword })),
}