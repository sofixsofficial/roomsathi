# RoomRent Admin Setup & Features Guide

## 📊 Admin Credentials

**Admin Email:** admin@roomrent.com  
**Admin Password:** Admin@123456

To create the admin account, run the following SQL in your Supabase SQL Editor:

```sql
-- First, create the admin account in Supabase Auth
-- Go to Authentication > Users > Add User
-- Email: admin@roomrent.com
-- Password: Admin@123456
-- Confirm password: Admin@123456
-- Auto Confirm User: YES

-- Then run this SQL (replace YOUR_ADMIN_USER_ID with the actual ID from auth.users)
INSERT INTO users (
  id,
  email,
  name,
  phone,
  user_type,
  status
) VALUES (
  'YOUR_ADMIN_USER_ID',  -- Replace with actual ID from auth.users table
  'admin@roomrent.com',
  'System Administrator',
  '+977-9800000000',
  'admin',
  'active'
);
```

## 🗄️ Database Setup

### Step 1: Run the History & Features Schema

Execute the `HISTORY_AND_FEATURES_SCHEMA.sql` file in your Supabase SQL Editor to create all required tables:

- `property_history` - Tracks all property provider actions
- `finder_history` - Tracks all property finder views and interactions
- `screenshots` - Stores screenshot captures with watermarks
- `admin_actions` - Logs all admin activities
- `broadcast_messages` - Stores admin broadcast messages
- `reports` - Handles user reports and complaints

### Step 2: Verify Tables

Run this query to verify all tables are created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'property_history',
  'finder_history', 
  'screenshots',
  'admin_actions',
  'broadcast_messages',
  'reports'
);
```

## 🎯 Implemented Features

### 1. Admin Dashboard ✅

**Location:** `app/(tabs)/admin.tsx`

**Features:**
- **Statistics Overview**
  - Total Users (Finders + Providers)
  - Active Listings
  - Pending Approvals
  - Total Revenue
  - New Users This Month
  - New Properties This Month

- **System Health Monitoring**
  - Active Users Count
  - Blocked Users Count  
  - Pending Reports
  - Recent Admin Actions

- **Broadcast Messaging**
  - Send messages to All Users, Finders Only, or Providers Only
  - Title and content customization
  - Real-time delivery

- **Quick Actions**
  - Manage Users (View, Block, Delete)
  - Manage Properties (Approve, Reject, Delete)
  - View Reports
  - View Admin Action History

### 2. Property Provider History ✅

**Store:** `hooks/history-store.ts`

**Features:**
- Track all property listings (created, edited, deleted, reposted)
- View count per property
- List of interested finders
- Status change history
- Automatic logging via database triggers

**Usage:**
```typescript
import { useHistory } from '@/hooks/history-store';

const { propertyHistory, addPropertyHistory } = useHistory();

// Auto-tracked on property changes via trigger
// Manual tracking for custom actions:
await addPropertyHistory(propertyId, 'reposted');
```

### 3. Property Finder History ✅

**Store:** `hooks/history-store.ts`

**Features:**
- Track viewed properties
- Track contacted properties
- Favorite/unfavorite tracking
- Provider contact details storage
- Screenshot history

**Usage:**
```typescript
import { useHistory } from '@/hooks/history-store';

const { finderHistory, addFinderHistory } = useHistory();

// Track when finder views a property
await addFinderHistory(propertyId, 'viewed');

// Track when finder contacts provider
await addFinderHistory(propertyId, 'contacted', {
  providerName: 'John Doe',
  providerPhone: '+977-9800000001',
  providerEmail: 'provider@example.com'
});
```

### 4. Location-Based Smart Search ✅

**Utility:** `utils/location-search.ts`

**Features:**
- **10km Radius Loop Algorithm**
  - Starts searching within 10km
  - Automatically expands to 20km, 30km, etc.
  - Maximum radius: 100km (configurable)
  - Sorts results by nearest distance first

- **Distance Calculation**
  - Uses Haversine formula for accuracy
  - Works with latitude/longitude coordinates

**Usage:**
```typescript
import { searchPropertiesByLocation, getCurrentLocation } from '@/utils/location-search';

// Get current location
const location = await getCurrentLocation();

// Search properties
const { properties, radius } = await searchPropertiesByLocation({
  latitude: location.latitude,
  longitude: location.longitude,
  radius: 10,
});

console.log(`Found ${properties.length} properties within ${radius}km`);
```

### 5. Screenshot Capture with Watermark ✅

**Utility:** `utils/screenshot-capture.ts`

**Features:**
- Capture property listing screenshots
- Auto-add watermark: "Captured via RoomRent App"
- Save to device storage
- Store reference in database
- Share functionality (WhatsApp, Messenger, etc.)

**Usage:**
```typescript
import { captureScreenshot, shareScreenshot } from '@/utils/screenshot-capture';
import { useRef } from 'react';

const viewRef = useRef();

// Capture
const uri = await captureScreenshot(viewRef, userId, propertyId);

// Share
await shareScreenshot(uri);
```

## 🚀 Next Implementation Steps

### Phase 1: Provider History Page

Create `app/provider/history.tsx`:
- Display property_history table data
- Filter by action type (created, edited, deleted, reposted)
- Show view counts and interested finders
- Allow reposting deleted properties

### Phase 2: Finder History Page

Create `app/finder/history.tsx`:
- Display finder_history table data
- Show viewed properties timeline
- List contacted properties with provider details
- Quick access to favorites

### Phase 3: Enhanced Property Details

Update `app/property/[id].tsx`:
- Add "Call Provider" button (tel: link)
- Add "Message Provider" button
- Add "Capture Screenshot" button
- Track views automatically
- Show distance from user's location

### Phase 4: Admin User Management

Enhance `app/admin/users.tsx`:
- Block/Unblock toggle switches
- Delete user with confirmation
- View user's property history
- View user's finder history
- Send individual messages

### Phase 5: Admin Property Management

Enhance `app/admin/properties.tsx`:
- Approve/Reject pending properties
- Block/Unblock specific listings
- View property view count
- View interested finders list
- Delete properties with confirmation

## 📱 Admin Access

To access the admin dashboard:

1. Login with admin credentials
2. Navigate to the Profile tab
3. Admin Dashboard will be visible only for admin users
4. Or directly navigate to `/admin` route

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS policies:
- Users can only see their own data
- Admins can see all data
- Property providers can manage their listings
- Finders can manage their history

### Admin Action Logging

Every admin action is logged:
- User blocks/unblocks
- Property approvals/rejections
- Broadcast messages
- User deletions
- Property deletions

View logs in Admin Dashboard > Recent Activity

## 🧪 Testing Guide

### Test Provider History

1. Login as provider (owner type)
2. Add a property
3. Edit the property
4. Check provider history - should show "created" and "edited" entries
5. Delete property
6. Check history - should show "deleted" entry

### Test Finder History

1. Login as finder (renter type)
2. View multiple properties
3. Contact a provider
4. Favorite a property
5. Check finder history - should show all actions

### Test Location Search

1. Login as finder
2. Go to home/search page
3. Enable location permission
4. Search will automatically find properties within 10km
5. If none found, radius expands automatically

### Test Admin Features

1. Login as admin
2. Go to Admin Dashboard
3. Test broadcast message
4. Go to Manage Users
5. Block/unblock a user
6. Go to Manage Properties
7. Approve/reject a property

## 📊 Analytics Tracking

The admin dashboard tracks:
- Total listings
- Active users
- Blocked users  
- Most viewed properties
- Popular locations (cities with most searches)
- Average search radius needed

## 🎨 UI Enhancements

The app features:
- **Colorful Gradient Cards** for statistics
- **Modern Icons** from Lucide React Native
- **Smooth Animations** on actions
- **Responsive Design** for all screen sizes
- **Beautiful Modals** for forms and confirmations

## 🔄 Real-time Updates

All data syncs in real-time:
- Property status changes reflect immediately
- User blocks take effect instantly
- Broadcast messages delivered in real-time
- History updates automatically

## 📝 Notes

- Ensure Supabase is properly configured
- Run all SQL scripts in order
- Test each feature after implementation
- Keep admin credentials secure
- Regular backups of database recommended

## 🆘 Troubleshooting

### Can't see admin dashboard
- Verify user_type is 'admin' in users table
- Check if admin user ID matches auth.users ID

### Location search not working
- Enable location permissions on device
- Check if properties have valid coordinates
- Verify SQL function exists in database

### Screenshots not saving
- Check device storage permissions
- Verify screenshots table exists
- Check file system write permissions

### History not tracking
- Verify triggers are created
- Check if tables exist
- Review RLS policies

---

**Support:** For issues, check the database logs in Supabase dashboard and console logs in the app.
