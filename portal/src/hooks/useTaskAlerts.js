import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import apiClient, { unwrap } from '@/services/api/apiClient'
import { getSocket } from '@/services/socket'
import {
  playNotificationSound,
  unlockNotificationSound,
} from '@/utils/notificationSound'

/*
  Employee side only.

  - Keeps the number of NEW (unread) task notifications for the badge on the
    "Task" menu item.
  - When the admin assigns a task, the server pushes "notification:new" over
    the socket. We play a sound and bump the badge straight away.
  - Opening the Task page marks the task notifications as read, so the badge
    goes away.
*/
export default function useTaskAlerts() {
  const { pathname } = useLocation()
  const [count, setCount] = useState(0)
  const onTaskPage = useRef(false)

  onTaskPage.current = pathname === '/task' || pathname.startsWith('/task/')

  const loadCount = useCallback(async () => {
    try {
      const result = await unwrap(
        apiClient.get('/notifications', { params: { unread: 'true', limit: 200 } })
      )
      const data = result?.data ?? result
      const list = Array.isArray(data) ? data : data?.items || []
      setCount(list.filter((item) => item.type === 'task' && !item.read).length)
    } catch {
      // The badge is optional. Ignore errors.
    }
  }, [])

  const markTasksSeen = useCallback(async () => {
    setCount(0)
    try {
      await apiClient.patch('/notifications/read-type/task')
      window.dispatchEvent(new Event('notifications:changed'))
    } catch {
      // Ignore. The count will correct itself on the next load.
    }
  }, [])

  // Allow the browser to play sound after the first click / key press.
  useEffect(() => {
    unlockNotificationSound()
  }, [])

  // First load.
  useEffect(() => {
    loadCount()
  }, [loadCount])

  // Employee is looking at the Task page: nothing is "new" anymore.
  useEffect(() => {
    if (onTaskPage.current) markTasksSeen()
  }, [pathname, markTasksSeen])

  // Live updates.
  useEffect(() => {
    const socket = getSocket()

    const handleNew = (notification) => {
      if (notification?.type !== 'task') return

      playNotificationSound()

      if (onTaskPage.current) {
        // Already on the Task page: keep the badge clear, but still tell the
        // page to reload its list.
        markTasksSeen()
        window.dispatchEvent(new Event('tasks:changed'))
      } else {
        setCount((previous) => previous + 1)
      }
    }

    socket.on('notification:new', handleNew)
    return () => socket.off('notification:new', handleNew)
  }, [markTasksSeen])

  return { newTasks: count }
}