# Fix Admin Login - Invalid Credentials

## Problem
The admin user `admin@roomrent.com` exists in Supabase Authentication but login fails with "Invalid admin credentials".

## Root Cause
The issue occurs because:
1. The user exists in Supabase Auth (visible in screenshot with UID: bf6d78d1-e178-40ba-a9d6-7cbbbd893610)
2. BUT either:
   - The password doesn't match
   - Or the user record doesn't exist in the `users` table with `user_type = 'admin'`

## Solution

### Step 1: Reset Admin Password in Supabase

1. Go to your Supabase Dashboard: https://dcsoudthcmkrficgcbio.supabase.co
2. Navigate to **Authentication** → **Users**
3. Find user `admin@roomrent.com` (UID: bf6d78d1-e178-40ba-a9d6-7cbbbd893610)
4. Click on the user
5. Click **"Send password recovery"** OR **"Change password"**
6. Set the password to: `Admin@123` (or any password you prefer)
7. Make sure the user is confirmed (email should be confirmed)

### Step 2: Fix Users Table Record

1. Go to **SQL Editor** in Supabase
2. Run the SQL script from `FIX_ADMIN_LOGIN.sql`
3. This will ensure the user record exists in the `users` table with `user_type = 'admin'`

### Step 3: Verify Login

1. Open the app
2. Click on **"Admin Access"** button
3. Enter credentials:
   - Email: `admin@roomrent.com`
   - Password: `Admin@123` (or the password you set)
4. Click **"Admin Login"**

## Alternative: Create Fresh Admin User

If the above doesn't work, create a completely new admin user:

1. Go to Supabase **Authentication** → **Users**
2. Click **"Add User"**
3. Enter:
   - Email: `admin@roomrent.com`
   - Password: `Admin@123`
   - Auto Confirm User: **YES** (important!)
4. Click **Create User**
5. Copy the new User ID
6. Go to **SQL Editor** and run:

```sql
-- Replace USER_ID with the actual UUID from step 5
INSERT INTO public.users (
  id,
  email,
  name,
  phone,
  user_type,
  status,
  created_at,
  updated_at
) VALUES (
  'USER_ID',  -- Replace with actual UUID
  'admin@roomrent.com',
  'Admin User',
  '9999999999',
  'admin',
  'active',
  NOW(),
  NOW()
);
```

7. Try logging in again

## Expected Behavior After Fix

After successful login:
- Admin should see "Admin login successful!" alert
- Admin should be redirected to `/(tabs)/admin` dashboard
- Admin can manage both property finders and providers
- Admin can block/unblock users for misconduct
- Admin has full platform control

## Note

The login process requires:
1. Valid authentication credentials in Supabase Auth
2. Corresponding user record in `users` table
3. `user_type` must be set to `'admin'`
4. `status` should be `'active'` (not 'blocked' or 'suspended')

Make sure all these conditions are met for successful admin login!
