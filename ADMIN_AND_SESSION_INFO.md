# Admin Credentials & Session Tracking Guide

## Admin Access

### Admin Credentials
- **Email**: admin@roomrent.com  
- **Password**: admin123456

### Creating an Admin Account
If you need to create a new admin account:

1. Sign up with any email/password through the app
2. Go to Supabase Dashboard → SQL Editor
3. Run this query to upgrade the user to admin:
```sql
UPDATE public.users 
SET user_type = 'admin' 
WHERE email = 'your-email@example.com';
```

## Session Tracking System

The app now includes comprehensive session tracking for all user types (Finder, Provider, Admin).

### Features Implemented

#### 1. Session Management
- **Auto-start on login**: When users log in, a session is automatically created
- **Auto-end on logout**: Sessions are properly closed when users log out
- **Activity tracking**: Last activity time is continuously updated
- **Session duration**: Track how long users are active in the app

#### 2. Activity Logging
All user actions are logged including:
- `login` - User login event
- `logout` - User logout event
- `property_view` - When a finder views a property
- `property_contact` - When a finder contacts a property owner
- `property_list` - When a provider lists a new property
- `property_edit` - When a provider edits their property
- `property_delete` - When a provider deletes their property

#### 3. Data Storage
- **Local Storage**: Sessions and history are stored locally using AsyncStorage
- **Database Sync**: All sessions and activities are synced to Supabase (if tables exist)
- **Offline Support**: Works even without internet connection

### Database Schema (Optional)

If you want to store sessions in the database, create these tables in Supabase:

```sql
-- User Sessions Table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('renter', 'owner', 'admin')),
  session_id TEXT UNIQUE NOT NULL,
  login_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_time TIMESTAMPTZ,
  last_activity_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_info TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX idx_user_sessions_login_time ON public.user_sessions(login_time DESC);

-- Session History Table  
CREATE TABLE IF NOT EXISTS public.session_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('renter', 'owner', 'admin')),
  action TEXT NOT NULL CHECK (action IN ('login', 'logout', 'property_view', 'property_contact', 'property_list', 'property_edit', 'property_delete')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_session_history_user_id ON public.session_history(user_id);
CREATE INDEX idx_session_history_action ON public.session_history(action);
CREATE INDEX idx_session_history_timestamp ON public.session_history(timestamp DESC);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON public.user_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for session_history
CREATE POLICY "Users can view their own history"
  ON public.session_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
  ON public.session_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all history"
  ON public.session_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );
```

### Usage in Code

The session system is automatically integrated with authentication. Here's how to use it:

```typescript
import { useSession } from '@/hooks/session-store';

function MyComponent() {
  const {
    currentSession,
    sessionHistory,
    logActivity,
    getSessionDuration,
    getSessionHistory
  } = useSession();

  // Log a custom activity
  const handlePropertyView = async (propertyId: string) => {
    await logActivity(
      user.id,
      user.userType,
      'property_view',
      propertyId,
      'Viewed property from search results'
    );
  };

  // Get session duration in seconds
  const duration = getSessionDuration();
  console.log(`User has been active for ${duration} seconds`);

  // Get recent activities
  const recentActivities = getSessionHistory(user.id, 10);
}
```

## Property Types Expansion

The following property types are now available:

### Rent Category
1. **Room Rent** 🏠 - Single room for rent
2. **Flat Rent** 🏢 - Apartment/Flat for rent
3. **Shutter Rent** 🏪 - Commercial shutter/shop for rent
4. **House Rent** 🏡 - Independent house for rent
5. **Land Rent** 🌾 - Land/Plot for rent
6. **Office Rent** 🏢 - Office space for rent

### Buy Category
7. **House Buy** 🏘️ - House for sale
8. **Land Buy** 🗺️ - Land/Plot for sale

### Hostel Category
9. **Hostel Available** 🏨 - Co-ed hostel accommodation
10. **Girls Hostel** 👧 - Girls only hostel accommodation
11. **Boys Hostel** 👦 - Boys only hostel accommodation

## Property Status Management

Properties now have the following statuses:

- **Available** (active): Property is available for rent/sale - visible to finders
- **Booked**: Property has been rented/sold - automatically hidden from finders
- **Pending**: Awaiting admin approval (if auto-approve is disabled)
- **Rejected**: Property was rejected by admin

### Provider Actions
Providers can:
- Mark properties as "Booked" when rented/sold
- Mark properties as "Available" when they become available again
- Edit property details
- Delete properties

### Auto-hide Booked Properties
When a provider marks a property as "Booked", it is automatically removed from the finder's search results. Only "Available" properties are shown to finders.

## Notes

- Session tracking works offline and syncs when online
- Maximum 100 activities are stored locally per user
- Database sync is optional but recommended for admin analytics
- All user types (Finder, Provider, Admin) have session tracking
