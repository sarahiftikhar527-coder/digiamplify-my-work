import { Server } from 'socket.io'
import { allowedOrigins } from '../config/cors.js'
import { verifyAccessToken } from '../utils/jwt.js'
import { prisma } from '../config/db.js'

let io = null

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
        select: { id: true },
      })
      if (!user) return next(new Error('unauthorized'))

      socket.data.userId = user.id
      next()
    } catch {
      next(new Error('unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    // Every user gets a private room.
    socket.join(`user:${socket.data.userId}`)
  })

  return io
}

export const emitToUser = (userId, event, payload) => {
  io?.to(`user:${userId}`).emit(event, payload)
}

// Sends an event to every connected (already authenticated) user.
export const emitToAll = (event, payload) => {
  io?.emit(event, payload)
}