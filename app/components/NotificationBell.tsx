'use client'

import { useState, useEffect, useMemo } from 'react'
import { ManagerNotification, User } from '../types'
import { managerNotificationDb, authDb } from '../lib/db'

export default function NotificationBell() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<ManagerNotification[]>([])
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  )

  useEffect(() => {
    const user = authDb.getCurrentUser()
    setCurrentUser(user)

    if (user?.managementLevel === 'worker') {
      return
    }

    loadNotifications()

    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = () => {
    const allNotifications = managerNotificationDb.getAll()
    const sorted = [...allNotifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    setNotifications(sorted)
  }

  if (!currentUser || currentUser.managementLevel === 'worker') {
    return null
  }

  return (
    <div className="relative">
      <button
        type="button"
        title="Notifications"
        className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}
