# Database Verification Guide

## 🎯 Quick Check

To verify if all tables are created in your Supabase database, follow these steps:

### Option 1: Run Verification Script (Recommended)

```bash
bun scripts/verify-database.ts
```

This will check all 5 tables:
- ✅ users
- ✅ properties
- ✅ conversations
- ✅ messages
- ✅ favorites

### Option 2: Manual Verification in Supabase Dashboard

1. **Go to Supabase Dashboard**
   - URL: https://dcsoudthcmkrficgcbio.supabase.co
   - Navigate to: **Table Editor**

2. **Check if these tables exist:**
   - `users`
   - `properties`
   - `conversations`
   - `messages`
   - `favorites`

3. **Verify Row Level Security (RLS)**
   - Go to: **Authentication** → **Policies**
   - Each table should have multiple policies enabled

---

## 🔧 If Tables Are Missing

### Step 1: Run the Complete Setup SQL

1. Open Supabase Dashboard: https://dcsoudthcmkrficgcbio.supabase.co
2. Navigate to: **SQL Editor** (left sidebar)
3. Click: **New Query**
4. Copy the entire content from: `SUPABASE_COMPLETE_SETUP.sql`
5. Paste it into the SQL Editor
6. Click: **Run** (or press Ctrl/Cmd + Enter)

### Step 2: Verify the Setup

Run these verification queries in SQL Editor:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'properties', 'conversations', 'messages', 'favorites');
```

Expected result: 5 rows (all table names)

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'properties', 'conversations', 'messages', 'favorites');
```

Expected result: All tables should have `rowsecurity = true`

```sql
-- Check policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Expected result: Multiple policies for each table

```sql
-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'properties', 'conversations', 'messages', 'favorites')
ORDER BY tablename, indexname;
```

Expected result: Multiple indexes for performance optimization

---

## 📋 What the Setup Script Creates

### 1. **Tables** (5 total)
- `users` - User profiles and authentication
- `properties` - Property listings
- `conversations` - Chat conversations
- `messages` - Individual messages
- `favorites` - User's favorite properties

### 2. **Indexes** (17 total)
- Performance optimization for queries
- Faster searches and filtering

### 3. **Triggers** (3 total)
- Auto-update `updated_at` timestamps
- Applied to: users, properties, conversations

### 4. **Row Level Security Policies** (20 total)
- **Users**: 6 policies (view own, update own, insert, admin access)
- **Properties**: 8 policies (view, insert, update, delete for owners and admins)
- **Conversations**: 3 policies (view, create, update own)
- **Messages**: 3 policies (view, send, update received)
- **Favorites**: 3 policies (view, add, remove)

### 5. **Helper Functions** (2 total)
- `is_admin(user_id)` - Check if user is admin
- `get_user_type(user_id)` - Get user type

### 6. **Permissions**
- Proper grants for authenticated and anonymous users
- Secure access control

---

## 🚨 Common Issues & Solutions

### Issue 1: "Could not find the table in the schema cache"

**Solution:**
- The table doesn't exist yet
- Run the `SUPABASE_COMPLETE_SETUP.sql` script
- Wait 10-30 seconds for schema cache to refresh
- Try again

### Issue 2: "Permission denied for table"

**Solution:**
- RLS policies might not be set up correctly
- Re-run the setup script (it will drop and recreate policies)
- Make sure you're authenticated when testing

### Issue 3: "Insert error" when creating user

**Solution:**
- Make sure the user exists in `auth.users` first
- The `public.users` table references `auth.users(id)`
- User must be created via Supabase Auth signup first

### Issue 4: Tables exist but queries fail

**Solution:**
- Check if RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
- Verify policies exist: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
- Make sure you're using the correct user role (authenticated vs anon)

---

## ✅ Success Checklist

After running the setup, verify:

- [ ] All 5 tables exist in Table Editor
- [ ] RLS is enabled on all tables
- [ ] At least 20 policies are created
- [ ] Indexes are created (check in Database → Indexes)
- [ ] Triggers are created (check in Database → Triggers)
- [ ] Helper functions exist (check in Database → Functions)
- [ ] Can signup a new user successfully
- [ ] Can view properties (even when not logged in)
- [ ] Can create property when logged in as owner
- [ ] Admin user can access admin dashboard

---

## 🔐 Admin User Setup

After tables are created, set up the admin user:

1. **Create admin account in Supabase Auth:**
   - Go to: **Authentication** → **Users**
   - Click: **Add user**
   - Email: `sofixscompany@gmail.com`
   - Password: `SofixsRoomRent@$`
   - Confirm email: ✅ (check this box)

2. **Update user type to admin:**
   ```sql
   UPDATE public.users 
   SET user_type = 'admin' 
   WHERE email = 'sofixscompany@gmail.com';
   ```

3. **Verify admin access:**
   - Login with admin credentials
   - Should redirect to `/admin` dashboard
   - Should see all users and properties

---

## 📞 Need Help?

If you're still having issues:

1. Check the console logs in your app
2. Check Supabase logs: **Logs** → **Postgres Logs**
3. Verify your `.env` file has correct credentials
4. Make sure Supabase project is not paused
5. Try running the verification script: `bun scripts/verify-database.ts`

---

## 🎉 Database Schema Overview

```
auth.users (Supabase Auth - managed by Supabase)
    ↓
public.users (Your app users)
    ↓
    ├── properties (owned by users)
    │   ├── favorites (users favorite properties)
    │   └── conversations (about properties)
    │       └── messages (in conversations)
    └── messages (sent/received by users)
```

All tables are connected with proper foreign keys and cascade deletes for data integrity.
