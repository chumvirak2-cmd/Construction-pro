# Worker Geofence Notification System - Implementation Summary

## Overview
A notification system has been added to alert managers when workers go outside the 500-meter site boundary. The system provides real-time notifications through multiple channels.

## Features Implemented

### 1. Manager Notification Database (`app/lib/db.ts`)
- **New storage key**: `cp_manager_notifications`
- **Database operations**:
  - `getAll()` - Get all notifications
  - `getUnread()` - Get unread notifications only
  - `getByType(type)` - Filter by notification type
  - `create(notification)` - Create new notification with optional browser push
  - `markAsRead(id)` - Mark single notification as read
  - `markAllAsRead()` - Mark all notifications as read
  - `delete(id)` - Delete a notification
  - `clearAll()` - Clear all notifications

### 2. Notification Type (`app/types/index.ts`)
```typescript
export interface ManagerNotification {
  id: string
  type: 'geofence_violation' | 'system' | 'warning'
  title: string
  message: string
  workerId?: string
  workerName?: string
  timestamp: string
  read: boolean
  actionUrl?: string
}
```

### 3. Automatic Alert Creation
When a worker's location is recorded and they are outside the site boundary:
1. A tracking alert is created (existing functionality)
2. A manager notification is automatically created with:
   - Worker name and role
   - Distance from site
   - Site radius limit
   - Timestamp

**Example notification message**:
```
"John Doe (Electrician) is 650m from site (limit: 500m)"
```

### 4. Notification Bell Component (`app/components/NotificationBell.tsx`)
A fully-featured notification component that:
- Shows unread count badge (red circle with number)
- Displays notifications in a dropdown menu
- Auto-refreshes every 30 seconds
- Allows marking individual notifications as read
- Allows marking all as read
- Allows deleting individual notifications
- Allows clearing all notifications
- Shows relative time (e.g., "5m ago", "2h ago")
- Different icons for different notification types
- Only visible to managers and above (not shown to workers)

### 5. Dashboard Integration
The notification bell is integrated into:
- **Desktop sidebar**: Below the logo, always visible
- **Mobile header**: Next to the menu button in the top right

### 6. Workers Page Enhancement
- Added red badge on "Track by Phone" tab showing active alert count
- Helps managers quickly see how many geofence violations are active

### 7. Browser Push Notifications
When enabled in settings:
- Uses the browser's Notification API
- Shows desktop notifications even when the app is not in focus
- Requires user permission
- Test button available in Settings → Notifications

## How It Works

### For Managers:
1. When a worker checks in/out or their location is tracked
2. If the worker is more than 500m from the site center
3. An automatic notification appears in the notification bell
4. Manager sees the red badge indicating unread notifications
5. Clicking the bell shows all notifications with details
6. Manager can mark as read, delete, or clear all

### For Workers:
- No changes to worker experience
- Workers don't see the notification bell
- Location tracking works as before

## Configuration

### Site Boundary Settings
Located in Workers page → Attendance tab:
- **Site Latitude**: Center point latitude (default: 40.7128)
- **Site Longitude**: Center point longitude (default: -74.0060)
- **Allowed Radius**: Maximum distance in meters (default: 500)

### Notification Settings
Located in Settings → Notifications:
- **Email Notifications**: Toggle for email alerts (UI only, not implemented)
- **Push Notifications**: Toggle for browser push notifications
- **Daily Summary**: Toggle for daily reports (UI only)
- **Weekly Report**: Toggle for weekly reports (UI only)

## Files Modified

1. **app/types/index.ts**
   - Added `ManagerNotification` interface

2. **app/lib/db.ts**
   - Added `MANAGER_NOTIFICATIONS` storage key
   - Added `managerNotificationDb` module
   - Updated `workerLocationDb.create()` to create notifications on geofence violation

3. **app/dashboard/layout.tsx**
   - Imported `NotificationBell` component
   - Added to mobile header
   - Added to desktop sidebar

4. **app/dashboard/workers/page.tsx**
   - Added alert count badge to "Track by Phone" tab

5. **app/dashboard/settings/page.tsx**
   - Enhanced push notification settings with test button
   - Added permission request functionality

## Files Created

1. **app/components/NotificationBell.tsx**
   - Complete notification UI component
   - Real-time updates (30-second polling)
   - Full CRUD operations for notifications

## Testing

To test the notification system:

1. **As a Manager**:
   - Go to `/dashboard/workers` → Attendance tab
   - Set site coordinates and radius (default 500m)
   - Track a worker by phone number
   - Or have a worker check in from outside the boundary

2. **Verify Notifications**:
   - Check the notification bell in the sidebar/header
   - See the red badge with count
   - Click to view notification details
   - Verify worker name, distance, and timestamp

3. **Browser Push** (optional):
   - Go to Settings → Notifications
   - Enable "Push Notifications"
   - Click "Test" button
   - Allow browser permission when prompted

## Future Enhancements (Not Implemented)

Potential improvements that could be added:
- Email notifications (currently UI only)
- SMS notifications for critical alerts
- Configurable distance thresholds per worker
- Sound alerts for real-time violations
- Notification grouping/batching
- Notification history export
- Custom notification preferences per manager
- Integration with Firebase Cloud Messaging for mobile apps
- Webhook notifications for external systems

## Notes

- All data stored in localStorage (no backend required)
- Notifications persist across page refreshes
- Auto-refresh ensures managers see new alerts within 30 seconds
- Workers cannot see or access manager notifications
- Browser push notifications require HTTPS in production
- Default site coordinates point to New York City (change in Workers page)
