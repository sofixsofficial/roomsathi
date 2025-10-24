# 🔧 Fix Infinite Recursion Error - Step by Step

## ❌ Current Error
```
infinite recursion detected in policy for relation "users"
```

## ✅ Solution
The fix creates a separate `user_roles` table to avoid recursion when checking admin permissions.

---

## 📋 Steps to Apply Fix

### 1. Open Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Select your project: `dcsoudthcmkrficgcbio`

### 2. Open SQL Editor
- Click on **SQL Editor** in the left sidebar
- Click **New Query**

### 3. Copy and Run the Fix
- Open the file: `FIX_RECURSION_COMPLETE.sql`
- **Copy the ENTIRE contents** of the file
- **Paste** into the SQL Editor
- Click **RUN** button (bottom right)

### 4. Wait for Completion
- The script will take 5-10 seconds to run
- You should see a success message with counts:
  ```
  status: Setup Complete!
  users_count: X
  properties_count: Y
  user_roles_count: X
  ```

### 5. Verify the Fix
After running the script, your app should work immediately. The errors will be gone.

---

## 🔍 What This Fix Does

1. **Creates `user_roles` table** - Stores user types separately
2. **Adds sync trigger** - Automatically keeps user_roles in sync with users table
3. **Updates `is_admin()` function** - Checks user_roles instead of users table
4. **Recreates all RLS policies** - Without recursion
5. **Grants proper permissions** - For authenticated and anonymous users

---

## ✨ Why This Works

**Before (Recursive):**
```
Admin Policy → Check users table → Policy checks if admin → Check users table → ♾️
```

**After (No Recursion):**
```
Admin Policy → Check user_roles table → ✅ Done!
```

The `user_roles` table has no RLS policies that check the users table, breaking the recursion.

---

## 🎯 After Applying

Your app will:
- ✅ Load users without errors
- ✅ Load properties without errors
- ✅ Admin features will work
- ✅ All RLS policies will function correctly

---

## 🆘 If You Still See Errors

1. **Refresh your app** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check SQL output** - Make sure the script ran without errors
3. **Verify tables exist** - Run this query:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('users', 'properties', 'user_roles');
   ```
   You should see all 3 tables.

4. **Check policies** - Run this query:
   ```sql
   SELECT tablename, policyname FROM pg_policies 
   WHERE schemaname = 'public' 
   ORDER BY tablename, policyname;
   ```
   You should see multiple policies for users and properties.

---

## 📞 Need Help?

If the fix doesn't work:
1. Copy the error message from SQL Editor
2. Check if all 3 tables exist (users, properties, user_roles)
3. Verify the is_admin() function exists:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name = 'is_admin';
   ```
