import { Server } from 'socket.io'
import { allowedOrigins } from '../config/cors.js'
import { verifyAccessToken } from '../utils/jwt.js'
import { prisma } from '../config/db.js'
import { registerChatSocket } from './chat.socket.js'

let io = null

// userId -> number of open sockets (a user can have several tabs / devices).
const onlineCounts = new Map()

export const isUserOnline = (userId) =>
  (onlineCounts.get(String(userId)) || 0) > 0

export const getOnlineUserIds = () => [...onlineCounts.keys()]

export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: allowedOrigins, credentials: true },
  })

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('unauthorized'))

      const payload = verifyAccessToken(token)
      const user = await prisma.user.findFirst({
        where: { id: payload.sub, isDeleted: false, status: 'active' },
        select: { id: true, name: true, role: true },
      })
      if (!user) return next(new Error('unauthorized'))

      socket.data.userId = user.id
      socket.data.userName = user.name
      socket.data.userRole = user.role
      next()
    } catch {
      next(new Error('unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    const userId = String(socket.data.userId)

    // Every user gets a private room. All events are sent to this room.
    socket.join(`user:${userId}`)

    // Presence: tell everyone when a user comes online for the first time.
    const previous = onlineCounts.get(userId) || 0
    onlineCounts.set(userId, previous + 1)

    if (previous === 0) {
      socket.broadcast.emit('chat:presence', { userId, online: true })
    }

    // The new socket gets the full list of users who are online right now.
    socket.emit('chat:presence:list', { userIds: getOnlineUserIds() })

    registerChatSocket(io, socket)

    socket.on('disconnect', () => {
      const remaining = (onlineCounts.get(userId) || 1) - 1

      if (remaining <= 0) {
        onlineCounts.delete(userId)
        socket.broadcast.emit('chat:presence', { userId, online: false })
      } else {
        onlineCounts.set(userId, remaining)
      }
    })
  })

  return io
}

export const emitToUser = (userId, event, payload) => {
  io?.to(`user:${userId}`).emit(event, payload)
}

// Sends the same event to several users (each has a private room).
export const emitToUsers = (userIds, event, payload) => {
  if (!io || !Array.isArray(userIds)) return
  for (const userId of new Set(userIds.filter(Boolean).map(String))) {
    io.to(`user:${userId}`).emit(event, payload)
  }
}

// Sends an event to every connected (already authenticated) user.
export const emitToAll = (event, payload) => {
  io?.emit(event, payload)
}

// Sends the same event to several users (each user's private room).
