# Fix Infinite Recursion Error - Step by Step Guide

## Problem
You're seeing this error:
```
infinite recursion detected in policy for relation "users"
```

This happens because the admin policies check the `users` table to verify if someone is an admin, which triggers the same policy again, creating an infinite loop.

## Solution
Run the SQL script to fix the policies using a `SECURITY DEFINER` function that bypasses RLS.

## Steps to Fix

### 1. Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run the Fix Script
1. Open the file `FIX_INFINITE_RECURSION_V2.sql` in your project
2. Copy the entire contents
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

### 3. Verify the Fix
After running the script, you should see:
- "Setup complete! Testing queries..." message
- Two counts showing your users and properties

### 4. Test Your App
1. Refresh your app
2. Try to:
   - View properties (should work now)
   - View users in admin panel (should work now)
   - Sign up / login (should work now)

## What the Fix Does

### Before (Causes Recursion)
```sql
-- This policy checks the users table...
CREATE POLICY "Admins can view all users" 
  ON public.users
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users  -- ❌ This triggers the same policy again!
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );
```

### After (No Recursion)
```sql
-- Create a SECURITY DEFINER function that bypasses RLS
CREATE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  SELECT user_type FROM public.users WHERE id = auth.uid();
  RETURN user_type = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;  -- ✅ Bypasses RLS!

-- Use the function in the policy
CREATE POLICY "Admins can view all users" 
  ON public.users
  FOR SELECT 
  USING (public.is_admin());  -- ✅ No recursion!
```

## Troubleshooting

### If you still see errors after running the script:

1. **Clear your browser cache** and refresh
2. **Check if the function was created**:
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name = 'is_admin';
   ```

3. **Check if policies exist**:
   ```sql
   SELECT policyname, tablename 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

4. **Test the function directly**:
   ```sql
   SELECT public.is_admin();
   ```

### If you need to start completely fresh:

Run this to disable RLS temporarily (NOT recommended for production):
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
```

Then re-run the `FIX_INFINITE_RECURSION_V2.sql` script and re-enable RLS:
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
```

## Need More Help?

If you're still experiencing issues:
1. Check the Supabase logs in Dashboard > Logs
2. Make sure you're logged in when testing
3. Verify your auth token is valid
4. Check that the `users` table has data

## Summary

✅ The fix uses `SECURITY DEFINER` functions to bypass RLS when checking admin status  
✅ This prevents infinite recursion in policies  
✅ All functionality remains secure and working  
✅ No changes needed to your app code  
