# 🚀 Quick Start - Supabase Setup

## ⚡ Fast Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for it to initialize

### 2. Get Your Credentials
1. Go to **Project Settings** > **API**
2. Copy your **Project URL**
3. Copy your **anon/public key**

### 3. Update Environment Variables
Edit `.env` file in your project root:
```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run Database Setup
1. Open Supabase Dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open `SUPABASE_COMPLETE_SETUP.sql` from your project
5. Copy ALL contents and paste into SQL Editor
6. Click **Run** (or Ctrl/Cmd + Enter)
7. Wait for success message

### 5. Create Admin Account
**Option A: Via Supabase Dashboard**
1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Email: `sofixscompany@gmail.com`
4. Password: `SofixsRoomRent@$`
5. Click **Create User**
6. Go back to **SQL Editor** and run:
```sql
UPDATE public.users 
SET user_type = 'admin' 
WHERE email = 'sofixscompany@gmail.com';
```

**Option B: Via App Signup**
1. Start your app
2. Sign up with:
   - Email: `sofixscompany@gmail.com`
   - Password: `SofixsRoomRent@$`
   - Role: Owner (or Renter, doesn't matter)
3. Go to Supabase **SQL Editor** and run:
```sql
UPDATE public.users 
SET user_type = 'admin' 
WHERE email = 'sofixscompany@gmail.com';
```

### 6. Configure Auth Settings (Optional)
1. Go to **Authentication** > **Settings**
2. **For Development**: Disable email confirmations
   - Find "Enable email confirmations"
   - Toggle it **OFF**
3. **For Production**: Keep email confirmations ON

### 7. Start Your App
```bash
npm start
# or
bun start
```

## ✅ Verify Setup

### Check Tables Created
Go to **Table Editor** in Supabase Dashboard. You should see:
- ✅ users
- ✅ properties
- ✅ conversations
- ✅ messages
- ✅ favorites

### Test Login
1. **Admin Login**: `sofixscompany@gmail.com` / `SofixsRoomRent@$`
2. Should redirect to Admin Dashboard

### Create Test Users
**Renter Account:**
- Email: `renter@test.com`
- Password: `test123`
- Role: Renter

**Owner Account:**
- Email: `owner@test.com`
- Password: `test123`
- Role: Owner

## 🚨 Common Issues

### "Could not find table" Error
**Solution**: Run the `SUPABASE_COMPLETE_SETUP.sql` file in SQL Editor

### "Invalid login credentials"
**Solution**: 
1. Check email/password are correct
2. If using email confirmation, verify email first
3. Or disable email confirmations in Auth Settings

### "Row Level Security policy violation"
**Solution**: Make sure you ran ALL the SQL commands including RLS policies

### Admin can't access admin panel
**Solution**: Run this SQL:
```sql
UPDATE public.users 
SET user_type = 'admin' 
WHERE email = 'sofixscompany@gmail.com';
```

### App shows "Failed to load properties"
**Solution**: 
1. Check your `.env` file has correct credentials
2. Restart Expo dev server after changing `.env`
3. Verify tables exist in Supabase Dashboard

## 📚 Full Documentation
For detailed setup instructions, see `SUPABASE_SETUP.md`

## 🎉 You're Ready!
Your RoomRent app is now connected to Supabase with:
- ✅ Authentication
- ✅ Database with RLS
- ✅ Admin account
- ✅ All tables and policies

Start building! 🚀
