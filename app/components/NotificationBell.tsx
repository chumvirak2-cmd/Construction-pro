'use client'

import { useState, useEffect } from 'react'
import { ManagerNotification, User } from '../types'
import { managerNotificationDb, authDb } from '../lib/db'

export default function NotificationBell() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<ManagerNotification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

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
    const sorted = allNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    setNotifications(sorted)
    setUnreadCount(sorted.filter(n => !n.read).length)
  }

  const handleMarkAsRead = (id: string) => {
    managerNotificationDb.markAsRead(id)
    loadNotifications()
  }

  const handleMarkAllAsRead = () => {
    managerNotificationDb.markAllAsRead()
    loadNotifications()
  }

  const handleClearAll = () => {
    if (confirm('Clear all notifications?')) {
      managerNotificationDb.clearAll()
      loadNotifications()
    }
  }

  const handleDeleteNotification = (id: string) => {
    managerNotificationDb.delete(id)
    loadNotifications()
  }

  if (!currentUser || currentUser.managementLevel === 'worker') {
    return null
  }

  const getNotificationIcon = (type: ManagerNotification['type']) => {
    switch (type) {
      case 'geofence_violation':
        return '⚠️'
      case 'warning':
        return '🔶'
      default:
        return 'ℹ️'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">🔔</div>
                  <p>No notifications</p>
                </div>
              ) : (
                <div>
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-medium text-sm text-gray-900">
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteNotification(notification.id)
                              }}
                              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
