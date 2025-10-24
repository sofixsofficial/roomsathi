# Quick Fix: Admin Login Invalid Credentials

## The Problem
Admin login shows "Invalid admin credentials" error.

## Quick Fix (3 Steps)

### Step 1: Reset Password in Supabase
1. Go to: https://dcsoudthcmkrficgcbio.supabase.co
2. Click: **Authentication** → **Users**
3. Find: `admin@roomrent.com`
4. Click: The user row
5. Click: **Reset Password** or **Change Password**
6. Set to: `Admin@123`
7. Verify: **Email confirmed** = YES

### Step 2: Fix Database Record
1. Go to: **SQL Editor** in Supabase
2. Copy and paste this query:

```sql
-- Fix admin user record
UPDATE public.users
SET 
  user_type = 'admin',
  status = 'active',
  updated_at = NOW()
WHERE id = 'bf6d78d1-e178-40ba-a9d6-7cbbbd893610';

-- If no rows affected, insert instead:
INSERT INTO public.users (
  id, email, name, phone, user_type, status, created_at, updated_at
) VALUES (
  'bf6d78d1-e178-40ba-a9d6-7cbbbd893610',
  'admin@roomrent.com',
  'Admin User',
  '9999999999',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  user_type = 'admin',
  status = 'active',
  updated_at = NOW();
```

3. Click: **RUN** or press `Ctrl+Enter`

### Step 3: Test Login
1. Open the app
2. Click: **"Admin Access"**
3. Enter:
   - Email: `admin@roomrent.com`
   - Password: `Admin@123`
4. Click: **"Admin Login"**

## Done! ✅
You should now see "Admin login successful!" and be redirected to the admin dashboard.

---

## Still Not Working?

Check console logs for errors:
```
Login attempt: { ... }
Login result: { success: false }
Login failed: <error message here>
```

Common issues:
- **Wrong password** → Reset again in Supabase
- **Email not confirmed** → Confirm in Supabase Auth
- **No database record** → Run the INSERT query above
- **Wrong user_type** → Run the UPDATE query above

---

**Need more help?** See `ADMIN_LOGIN_FIX_GUIDE.md` for detailed troubleshooting.
