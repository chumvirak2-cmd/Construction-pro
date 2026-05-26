'use client'

import { useState, useEffect, useMemo } from 'react'
import { ManagerNotification, User } from '../types'
import { managerNotificationDb, authDb, demoDb } from '../lib/db'

export default function NotificationBell() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [notifications, setNotifications] = useState<ManagerNotification[]>([])
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  )

  useEffect(() => {
    const user = authDb.getCurrentUser()
    setCurrentUser(user)
    setIsDemo(demoDb.isDemoMode())

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

  if (currentUser?.managementLevel === 'worker') {
    return null
  }

  if (!currentUser && !isDemo) {
    return null
  }

  return (
    <div className="relative">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-yellow-400">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  )
}
