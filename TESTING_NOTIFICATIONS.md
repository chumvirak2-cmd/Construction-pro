# Testing the Geofence Notification System

## Quick Test Guide

### Prerequisites
- Application is running (`npm run dev`)
- You have logged in as a manager or admin (not as a worker)

### Test 1: Simulate Worker Outside Boundary

1. **Navigate to Workers Page**
   - Go to `/dashboard/workers`
   - Click on "Attendance" tab

2. **Set Site Location** (if not already set)
   - Site Latitude: `40.7128`
   - Site Longitude: `-74.0060`
   - Allowed Radius: `500` meters

3. **Track a Worker**
   - Switch to "Track by Phone" tab
   - Enter a worker's phone number (e.g., `+1234567890`)
   - Click "Track" button

4. **Simulate Location Outside Boundary**
   - Open browser console (F12)
   - Run this code to simulate a location far from the site:
   ```javascript
   // Import the database functions
   import { workerLocationDb } from '../../lib/db'
   
   // Create a location record far from the site (e.g., 1000m away)
   const testLocation = {
     phone: '+1234567890',
     workerId: 'worker-id-here',
     latitude: 40.7228,  // ~1km away from center
     longitude: -74.0060,
     accuracy: 10,
     timestamp: new Date().toISOString()
   }
   
   // This should automatically create a notification
   workerLocationDb.create(testLocation, 40.7128, -74.0060, 500)
   ```

5. **Check Notifications**
   - Look at the notification bell in the sidebar/header
   - You should see a red badge with a number
   - Click the bell icon
   - Verify you see a notification like:
     ```
     ⚠️ Worker Outside Site Boundary
     John Doe (Electrician) is 1000m from site (limit: 500m)
     Just now
     ```

### Test 2: Browser Push Notifications

1. **Enable Push Notifications**
   - Go to Settings → Notifications
   - Check "Push Notifications" toggle
   - Click "Test" button
   - Allow browser permission when prompted

2. **Trigger a Notification**
   - Follow Test 1 steps to simulate a geofence violation
   - You should see a browser push notification appear

### Test 3: Notification Management

1. **Mark as Read**
   - Click notification bell
   - Click "Mark as read" on a notification
   - Badge count should decrease

2. **Mark All as Read**
   - Click "Mark all read" button
   - Badge should disappear

3. **Delete Notification**
   - Click ✕ on a notification
   - It should be removed from the list

4. **Clear All**
   - Click "Clear all" button
   - Confirm the action
   - All notifications should be deleted

### Test 4: Mobile View

1. **Switch to Mobile View**
   - Resize browser window to mobile size (< 768px)
   - Or use browser dev tools device mode

2. **Check Notification Bell**
   - Should appear in top-right of header
   - Red badge should still show unread count
   - Dropdown should work the same way

### Test 5: Worker User (Should Not See Notifications)

1. **Login as Worker**
   - Logout current user
   - Login with a worker account (managementLevel: 'worker')

2. **Verify No Notification Bell**
   - The notification bell should NOT be visible
   - Neither in sidebar nor in header

## Expected Behavior

✅ When worker is outside 500m boundary:
- Tracking alert is created
- Manager notification is created
- Browser push notification appears (if enabled)
- Red badge shows on notification bell

✅ Notification bell features:
- Shows unread count
- Displays dropdown with notifications
- Auto-refreshes every 30 seconds
- Allows marking as read/delete

✅ Manager-only visibility:
- Managers and admins see notifications
- Workers do NOT see the notification bell

## Troubleshooting

### No notifications appearing?
1. Check browser console for errors
2. Verify site coordinates are set correctly
3. Ensure worker location is actually outside the radius
4. Check localStorage for `cp_manager_notifications` key

### Push notifications not working?
1. Ensure you're using HTTPS (or localhost for development)
2. Check browser settings → Notifications
3. Verify "Push Notifications" is enabled in app settings
4. Try clicking the "Test" button again

### Badge not updating?
1. Refresh the page
2. Check if auto-refresh interval is working
3. Verify notification was created in localStorage

## Verification Checklist

- [ ] Notification bell visible in desktop sidebar
- [ ] Notification bell visible in mobile header
- [ ] Red badge shows when there are unread notifications
- [ ] Clicking bell opens dropdown
- [ ] Notifications display with correct information
- [ ] Can mark individual notifications as read
- [ ] Can mark all as read
- [ ] Can delete individual notifications
- [ ] Can clear all notifications
- [ ] Browser push notifications work (when enabled)
- [ ] Workers cannot see notification bell
- [ ] Alerts are created when workers go outside boundary
- [ ] Badge count updates correctly
- [ ] Time formatting works (Just now, 5m ago, etc.)

## Success Criteria

The system is working correctly if:
1. ✅ Geofence violations automatically create manager notifications
2. ✅ Notification bell shows unread count
3. ✅ Managers can view and manage notifications
4. ✅ Browser push notifications work when enabled
5. ✅ Workers cannot see the notification system
6. ✅ No TypeScript/build errors
7. ✅ Responsive design works on mobile and desktop
