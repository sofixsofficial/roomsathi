# Fix Infinite Recursion Error - Step by Step Guide

## Problem
You're seeing this error:
```
"infinite recursion detected in policy for relation \"users\""
```

This happens because the RLS policies are checking the `users` table while querying the `users` table, creating a circular dependency.

## Solution
We've created a separate `user_roles` table that stores user types independently, eliminating the recursion.

## Steps to Fix

### 1. Open Supabase Dashboard
- Go to https://supabase.com/dashboard
- Select your project: `dcsoudthcmkrficgcbio`

### 2. Open SQL Editor
- Click on "SQL Editor" in the left sidebar
- Click "New Query"

### 3. Run the Fix Script
- Open the file `FIX_INFINITE_RECURSION_FINAL.sql` in this project
- Copy ALL the contents
- Paste into the Supabase SQL Editor
- Click "Run" button

### 4. Verify the Fix
After running the script, you should see output like:
```
✅ Setup complete! Running verification...
✅ user_count: X
✅ property_count: X
✅ user_roles_count: X
```

### 5. Refresh Your App
- Close and reopen your app
- The errors should be gone
- You should now be able to:
  - View properties
  - View users (if admin)
  - Sign up new users
  - Login

## What This Fix Does

1. **Creates `user_roles` table**: Stores user types separately from the main `users` table
2. **Auto-syncs with trigger**: Whenever a user is created/updated, their role is automatically synced
3. **Updates `is_admin()` function**: Now queries `user_roles` instead of `users`, avoiding recursion
4. **Recreates all policies**: Fresh policies without circular dependencies

## Troubleshooting

### If you still see errors:

1. **Clear the cache**:
   ```sql
   -- Run in SQL Editor
   TRUNCATE public.user_roles;
   INSERT INTO public.user_roles (user_id, user_type, updated_at)
   SELECT id, user_type, updated_at FROM public.users;
   ```

2. **Check if tables exist**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('users', 'properties', 'user_roles');
   ```

3. **Check if policies are correct**:
   ```sql
   SELECT tablename, policyname FROM pg_policies 
   WHERE schemaname = 'public';
   ```

## Need Help?
If you're still experiencing issues after running this script, please provide:
1. The exact error message
2. Screenshot of the SQL Editor after running the script
3. Output of the verification queries
