import { prisma } from '../config/db.js'

/*
  Chat events that come FROM the browser.

  - chat:typing  { conversationId, typing }
      Tells the other members of a conversation that this user is typing.

  Everything else (new message, delete, reaction, pin, read) is sent by the
  chat service after the data is saved, so the browser can never fake it.
*/

// Small cache so we do not hit the database for every key press.
// key: "<userId>:<conversationId>" -> { memberIds, expires }
const memberCache = new Map()
const CACHE_MS = 30 * 1000

async function getOtherMemberIds(userId, conversationId) {
  const key = `${userId}:${conversationId}`
  const cached = memberCache.get(key)

  if (cached && cached.expires > Date.now()) {
    return cached.memberIds
  }

  const members = await prisma.chatMember.findMany({
    where: { conversationId, leftAt: null },
    select: { userId: true },
  })

  const isMember = members.some((member) => member.userId === userId)
  const memberIds = isMember
    ? members.map((member) => member.userId).filter((id) => id !== userId)
    : null

  memberCache.set(key, { memberIds, expires: Date.now() + CACHE_MS })

  // Keep the cache small.
  if (memberCache.size > 2000) {
    const now = Date.now()
    for (const [cacheKey, value] of memberCache) {
      if (value.expires < now) memberCache.delete(cacheKey)
    }
  }

  return memberIds
}

export function registerChatSocket(io, socket) {
  const userId = String(socket.data.userId)

  socket.on('chat:typing', async (payload = {}) => {
    try {
      const conversationId = String(payload.conversationId || '').trim()
      if (!conversationId) return

      const others = await getOtherMemberIds(userId, conversationId)
      if (!others || others.length === 0) return

      const event = {
        conversationId,
        typing: Boolean(payload.typing),
        user: { id: userId, name: socket.data.userName || 'Someone' },
      }

      for (const otherId of others) {
        io.to(`user:${otherId}`).emit('chat:typing', event)
      }
    } catch {
      // Typing indicators are optional. Never crash because of them.
    }
  })
}