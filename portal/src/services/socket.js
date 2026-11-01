import { io } from 'socket.io-client'
import { tokenStore } from './api/tokenStore'
import { refreshAccessToken } from './api/apiClient'

let socket = null
let retrying = false

export function getSocket() {
  if (socket) return socket

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    withCredentials: true,
    auth: (cb) => cb({ token: tokenStore.get() }), // har reconnect par taza token
  })

  // Token expire ho to naya le kar dobara jurta hai
  socket.on('connect_error', async () => {
    if (retrying) return
    retrying = true
    try {
      await refreshAccessToken()
      socket.connect()
    } catch {
      // login hi nahi hai, kuch nahi karna
    } finally {
      setTimeout(() => { retrying = false }, 5000)
    }
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}