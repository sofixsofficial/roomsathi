# Fix Signup Issue - Complete Guide

## Problem
Users cannot sign up because of RLS (Row Level Security) policy violations. The error message is:
```
"new row violates row-level security policy for table 'users'"
```

## Root Cause
The app was trying to manually insert user records after `auth.signUp()`, but the RLS policies were blocking this insertion due to timing issues and policy conflicts.

## Solution
Use a database trigger to automatically create user records when a new auth user is created. This bypasses the RLS policy issues and ensures user records are created reliably.

## Steps to Fix

### Step 1: Apply the SQL Fix
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `FIX_SIGNUP_COMPLETE.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **RUN** to execute

### Step 2: Verify the Fix
After running the SQL, you should see:
```
status: "Setup Complete!"
message: "Users can now sign up automatically"
```

### Step 3: Test Signup
1. Open your app
2. Go to the signup screen
3. Fill in the form:
   - Select role (Room Finder or Room Provider)
   - Enter full name
   - Enter email
   - Enter phone number
   - Enter password (min 6 characters)
   - Confirm password
4. Click "Create Account"
5. You should see a success message asking you to verify your email

### Step 4: Verify Email
1. Check your email inbox
2. Look for an email from Supabase
3. Click the confirmation link
4. Return to the app and login

## What Changed

### Database Changes
1. **Created trigger function**: `handle_new_user()`
   - Automatically creates user record when auth user is created
   - Uses user metadata from signup
   - Runs with SECURITY DEFINER (bypasses RLS)

2. **Created trigger**: `on_auth_user_created`
   - Fires after INSERT on `auth.users`
   - Calls `handle_new_user()` function

3. **Updated RLS policies**:
   - Added `users_insert_service` policy for service_role
   - Kept `users_insert_authenticated` as backup

### Code Changes
1. **Removed manual user insertion** from `hooks/auth-store.ts`
   - The trigger now handles user creation
   - Simplified signup flow
   - Reduced potential for errors

## How It Works Now

```
User fills signup form
    ↓
App calls supabase.auth.signUp()
    ↓
Supabase creates auth user
    ↓
Trigger automatically creates user record
    ↓
Email confirmation sent
    ↓
User confirms email
    ↓
User can login
```

## Troubleshooting

### Issue: Still getting RLS error
**Solution**: Make sure you ran the complete SQL script. Check if the trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Issue: User record not created
**Solution**: Check if the trigger function exists:
```sql
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

### Issue: Email not received
**Solution**: 
1. Check spam folder
2. Verify email settings in Supabase Dashboard → Authentication → Email Templates
3. For development, you can disable email confirmation in Supabase Dashboard → Authentication → Settings → Email Auth → Disable "Confirm email"

### Issue: Cannot login after signup
**Solution**: Make sure you confirmed your email. Check Supabase Dashboard → Authentication → Users to see if the user's email is confirmed.

## Additional Notes

- The trigger uses `raw_user_meta_data` to get user information
- User metadata is set during signup in the `options.data` field
- The trigger has `ON CONFLICT DO NOTHING` to prevent duplicate insertions
- All user records are created with `status = 'active'` by default

## Testing Checklist

- [ ] SQL script executed successfully
- [ ] Trigger function created
- [ ] Trigger created on auth.users
- [ ] RLS policies updated
- [ ] Can sign up as Room Finder
- [ ] Can sign up as Room Provider
- [ ] Email confirmation received
- [ ] Can login after email confirmation
- [ ] User data appears in users table
- [ ] User role is correct (renter/owner)

## Success Criteria

✅ Users can sign up without errors
✅ User records are automatically created
✅ Email confirmation works
✅ Users can login after confirmation
✅ No RLS policy violations
✅ No infinite recursion errors
