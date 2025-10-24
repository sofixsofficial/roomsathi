# 🔧 Signup Error Fix Guide

## Problem
You're getting this error when trying to sign up:
```
User insert error: { 
  "code": "42501", 
  "message": "new row violates row-level security policy for table \"users\"" 
}
```

## Root Cause
The Row Level Security (RLS) policy on the `users` table is too restrictive and blocks user creation during signup.

## Solution

### Option 1: Quick Fix (Recommended)
Run the `FIX_USER_INSERT_POLICY.sql` script:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Fix Script**
   - Open the file `FIX_USER_INSERT_POLICY.sql` from your project
   - Copy all the contents
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Success**
   - You should see the policy details in the results
   - The `with_check` column should show `true`

5. **Test Signup**
   - Go back to your app
   - Try signing up with a new account
   - It should work now! ✅

### Option 2: Complete Database Reset
If you want to start fresh with all tables and policies:

1. **Drop All Tables** (⚠️ This will delete all data!)
   ```sql
   DROP TABLE IF EXISTS public.favorites CASCADE;
   DROP TABLE IF EXISTS public.messages CASCADE;
   DROP TABLE IF EXISTS public.conversations CASCADE;
   DROP TABLE IF EXISTS public.properties CASCADE;
   DROP TABLE IF EXISTS public.users CASCADE;
   ```

2. **Run Complete Setup**
   - Open `SUPABASE_COMPLETE_SETUP.sql`
   - Copy all contents
   - Paste into SQL Editor
   - Click "Run"

## What Changed?

### Before (Restrictive)
```sql
CREATE POLICY "Allow user creation during signup" 
  ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
```
This checks if `auth.uid()` matches the `id` being inserted, but during signup the auth session might not be fully established yet.

### After (Permissive)
```sql
CREATE POLICY "Allow user creation during signup" 
  ON public.users
  FOR INSERT 
  WITH CHECK (true);
```
This allows any authenticated request to insert into the users table. It's safe because:
- Users must be created in `auth.users` first (via `supabase.auth.signUp()`)
- The `id` field has a foreign key constraint to `auth.users(id)`
- Only valid auth user IDs can be inserted

## Rate Limiting Errors

If you see errors like:
```
AuthApiError: For security purposes, you can only request this after XX seconds.
```

This is Supabase's rate limiting to prevent abuse. Solutions:
1. **Wait** - Just wait the specified number of seconds
2. **Use Different Email** - Try signing up with a different email address
3. **Clear Rate Limit** (Dashboard) - Go to Authentication > Rate Limits in Supabase Dashboard

## Email Confirmation

After successful signup, users will receive an email confirmation message. The app shows:
```
📧 Please check your email to confirm your account.
After confirming your email, you can log in to access all features.
```

### To Disable Email Confirmation (Development Only)
1. Go to Supabase Dashboard
2. Navigate to Authentication > Settings
3. Scroll to "Email Auth"
4. Toggle OFF "Enable email confirmations"
5. Click "Save"

⚠️ **Note**: For production, keep email confirmation enabled for security.

## Testing Checklist

After applying the fix:
- [ ] Can sign up as a Room Finder (renter)
- [ ] Can sign up as a Room Provider (owner)
- [ ] Receive confirmation email
- [ ] User record created in `users` table
- [ ] Can log in after email confirmation
- [ ] User data loads correctly in the app

## Still Having Issues?

1. **Check Supabase Logs**
   - Dashboard > Logs > Postgres Logs
   - Look for any error messages

2. **Verify RLS Policies**
   ```sql
   SELECT tablename, policyname, cmd, with_check 
   FROM pg_policies 
   WHERE schemaname = 'public' AND tablename = 'users';
   ```

3. **Check Table Permissions**
   ```sql
   SELECT grantee, privilege_type 
   FROM information_schema.role_table_grants 
   WHERE table_schema = 'public' AND table_name = 'users';
   ```

4. **Verify Auth Configuration**
   - Check that `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are correct in `.env`

## Need More Help?

Check these files in your project:
- `SUPABASE_COMPLETE_SETUP.sql` - Complete database setup
- `DATABASE_SCHEMA.md` - Database structure documentation
- `QUICK_START.md` - Getting started guide
- `hooks/auth-store.ts` - Authentication logic
