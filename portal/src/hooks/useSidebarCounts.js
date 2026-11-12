import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import apiClient, { unwrap } from '@/services/api/apiClient'
import { getSocket } from '@/services/socket'
import { usersService } from '@/services/usersService'
import { getChangeRequestCount } from '@/services/api/profileService'

/*
  Live number badges for the sidebar.

  - chatUnread:       unread chat messages (employee and admin).
  - pendingApprovals: signup requests + profile change requests (admin only).

  Updates:
  - instantly through the socket ("chat:notification", "notification:new"),
  - when the admin approves / rejects a request ("approvals:changed"),
  - when the tab becomes visible again,
  - and by a slow refresh as a safety net.
*/
const CHAT_REFRESH_MS = 10000
const APPROVALS_REFRESH_MS = 20000

export default function useSidebarCounts({ isAdmin = false } = {}) {
  const { pathname } = useLocation()

  const [chatUnread, setChatUnread] = useState(0)
  const [pendingSignups, setPendingSignups] = useState(0)
  const [pendingProfile, setPendingProfile] = useState(0)

  const onChatPage = useRef(false)

  onChatPage.current = /^\/(admin\/)?chat(\/|$)/.test(pathname)

  const loadChat = useCallback(async () => {
    try {
      // Light endpoint: only the number of unread messages.
      const result = await unwrap(apiClient.get('/chat/unread'))
      const data = result?.data ?? result

      setChatUnread(Math.max(0, Number(data?.total) || 0))
    } catch {
      // The badge is optional. Ignore errors.
    }
  }, [])

  const loadApprovals = useCallback(async () => {
    try {
      const requests = await usersService.pending()
      setPendingSignups(Array.isArray(requests) ? requests.length : 0)
    } catch {
      // Ignore errors.
    }

    try {
      const result = await getChangeRequestCount()
      setPendingProfile(Number(result?.data?.count || 0))
    } catch {
      // Ignore errors.
    }
  }, [])

  // Chat: first load, page change, slow refresh, tab focus.
  useEffect(() => {
    loadChat()
  }, [loadChat, pathname])

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') loadChat()
    }

    const timer = setInterval(tick, CHAT_REFRESH_MS)
    document.addEventListener('visibilitychange', tick)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [loadChat])

  // Approvals (admin only).
  useEffect(() => {
    if (isAdmin) loadApprovals()
  }, [isAdmin, loadApprovals, pathname])

  useEffect(() => {
    if (!isAdmin) return undefined

    const tick = () => {
      if (document.visibilityState === 'visible') loadApprovals()
    }

    const timer = setInterval(tick, APPROVALS_REFRESH_MS)
    document.addEventListener('visibilitychange', tick)
    window.addEventListener('approvals:changed', loadApprovals)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
      window.removeEventListener('approvals:changed', loadApprovals)
    }
  }, [isAdmin, loadApprovals])

  // Instant updates from the server.
  useEffect(() => {
    let socket

    try {
      socket = getSocket()
    } catch {
      return undefined
    }

    // On the chat page the open conversation is marked as read by the page
    // itself, so wait a moment to avoid a short flash of the badge.
    const onChat = () => {
      if (onChatPage.current) setTimeout(loadChat, 1500)
      else loadChat()
    }

    // A new signup request or profile change request creates a notification.
    const onNotification = () => {
      if (isAdmin) loadApprovals()
    }

    const onConnect = () => {
      loadChat()
      if (isAdmin) loadApprovals()
    }

    socket.on('chat:notification', onChat)
    socket.on('chat:unread:changed', onChat)
    socket.on('notification:new', onNotification)
    socket.on('connect', onConnect)

    return () => {
      socket.off('chat:notification', onChat)
      socket.off('chat:unread:changed', onChat)
      socket.off('notification:new', onNotification)
      socket.off('connect', onConnect)
    }
  }, [isAdmin, loadChat, loadApprovals])

  return {
    chatUnread,
    pendingApprovals: isAdmin ? pendingSignups + pendingProfile : 0,
  }
}