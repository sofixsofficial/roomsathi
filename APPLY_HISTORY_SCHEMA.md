# Apply History Schema to Database

## Error
```
ERROR Failed to load finder history: {"code": "PGRST205", "details": null, "hint": null, "message": "Could not find the table 'public.finder_history' in the schema cache"}
```

## Fix

The `finder_history` table and other history-related tables need to be created in your Supabase database.

### Steps:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the SQL**
   - Open the file `HISTORY_AND_FEATURES_SCHEMA.sql` in your project
   - Copy ALL the contents (lines 1-368)
   - Paste into the Supabase SQL Editor
   - Click "Run" button

4. **Verify Tables Created**
   Run this query to verify:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'finder_history', 
     'property_history', 
     'screenshots', 
     'admin_actions', 
     'broadcast_messages', 
     'reports'
   );
   ```

   You should see all 6 tables listed.

5. **Refresh Your App**
   - After running the SQL, refresh your mobile app
   - The error should be gone

## What This Creates

This SQL script creates:
- ✅ `property_history` - Track property listing changes
- ✅ `finder_history` - Track finder viewing/contact history
- ✅ `screenshots` - Store property screenshots with watermarks
- ✅ `admin_actions` - Log all admin actions
- ✅ `broadcast_messages` - Admin announcements
- ✅ `reports` - User reports of properties/users
- ✅ Location search function with 10km radius algorithm
- ✅ All necessary RLS policies
- ✅ Automatic triggers for view counting

## Admin Credentials

After setting up, use these credentials:
- **Email**: `sofixscompany@gmail.com`
- **Password**: `SofixsRoomRent@$`

Make sure to create this admin user in Supabase Auth first, then update their user_type to 'admin' in the users table.
