# 🚀 RoomRent App - Supabase Setup Guide

## Overview
This RoomRent application uses **Supabase** for authentication and database management. It supports three user roles:
- **Room Finder (Renter)** - Users looking for properties
- **Room Provider (Owner)** - Users listing properties
- **Admin** - Full control over the platform (email: sofixscompany@gmail.com, password: SofixsRoomRent@$)

---

## 📋 Prerequisites
1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project
3. Get your project URL and anon key from Project Settings > API

---

## 🔧 Environment Setup

### Step 1: Create Environment File
Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with your actual Supabase credentials.

---

## 🗄️ Database Schema

### Step 2: Run Complete Setup SQL

**IMPORTANT: Use the automated setup file for best results!**

1. Open your Supabase Dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open the file `SUPABASE_COMPLETE_SETUP.sql` from your project root
5. Copy the entire contents and paste into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Wait for all commands to execute successfully

This will create:
- ✅ All 5 tables (users, properties, conversations, messages, favorites)
- ✅ All indexes for optimal performance
- ✅ All triggers for auto-updating timestamps
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Comprehensive RLS policies for secure access
- ✅ Helper functions for admin checks
- ✅ Proper permissions for authenticated and anonymous users

---

## 📝 Manual Setup (Alternative)

If you prefer to run commands individually, here are the SQL commands:

#### 1. Users Table
```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('renter', 'owner', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow user creation during signup" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 2. Properties Table
```sql
-- Create properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  deposit NUMERIC NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('room-rent', 'flat-rent', 'shutter-rent', 'house-rent', 'land-rent', 'house-buy', 'land-buy', 'hostel-available')),
  category TEXT NOT NULL CHECK (category IN ('rent', 'buy', 'hostel')),
  bhk TEXT NOT NULL,
  furnishing_type TEXT NOT NULL CHECK (furnishing_type IN ('fully', 'semi', 'unfurnished')),
  amenities TEXT[] DEFAULT '{}',
  pets_allowed BOOLEAN DEFAULT false,
  couples_allowed BOOLEAN DEFAULT true,
  families_allowed BOOLEAN DEFAULT true,
  bachelors_allowed BOOLEAN DEFAULT true,
  images TEXT[] DEFAULT '{}',
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  available_from DATE NOT NULL,
  virtual_tour_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected', 'rented')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active properties" ON properties
  FOR SELECT USING (status = 'active');

CREATE POLICY "Owners can view their own properties" ON properties
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own properties" ON properties
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own properties" ON properties
  FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all properties" ON properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all properties" ON properties
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for location-based queries
CREATE INDEX idx_properties_location ON properties(latitude, longitude);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_owner ON properties(owner_id);
```

#### 3. Conversations Table
```sql
-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participants UUID[] NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  property_title TEXT,
  last_message TEXT NOT NULL,
  last_message_time TIMESTAMPTZ NOT NULL,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = ANY(participants));

-- Create trigger for updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for participants
CREATE INDEX idx_conversations_participants ON conversations USING GIN(participants);
```

#### 4. Messages Table
```sql
-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Create index for conversation queries
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
```

#### 5. Favorites Table
```sql
-- Create favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for user queries
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_property ON favorites(property_id);
```

---

## 👤 Admin Account Setup

### Step 3: Create Admin User

After setting up the database, create the admin account:

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User" (or use the signup flow in the app)
3. Use these credentials:
   - **Email**: `sofixscompany@gmail.com`
   - **Password**: `SofixsRoomRent@$`

4. After creating the user, run this SQL to set them as admin:

```sql
UPDATE users 
SET user_type = 'admin' 
WHERE email = 'sofixscompany@gmail.com';
```

---

## 🔐 Authentication Setup

### Step 4: Configure Auth Settings

1. Go to Supabase Dashboard > Authentication > Settings
2. Enable Email authentication
3. Disable email confirmations for development (optional):
   - Set "Enable email confirmations" to OFF
4. Configure Site URL and Redirect URLs if needed

---

## 📱 App Configuration

The app is already configured to use Supabase. The integration includes:

### Authentication Features
- ✅ Email/Password signup with role selection (Renter/Owner)
- ✅ Email/Password login
- ✅ Session persistence
- ✅ Auto-refresh tokens
- ✅ Role-based access control

### Database Features
- ✅ Real-time property listings
- ✅ User profiles
- ✅ Messaging system
- ✅ Favorites management
- ✅ Admin controls

---

## 🧪 Testing the Setup

### Test User Accounts

Create these test accounts for different roles:

#### 1. Room Finder (Renter)
```
Email: renter@test.com
Password: test123
Role: Renter
```

#### 2. Room Provider (Owner)
```
Email: owner@test.com
Password: test123
Role: Owner
```

#### 3. Admin
```
Email: sofixscompany@gmail.com
Password: SofixsRoomRent@$
Role: Admin
```

---

## 🔄 Data Migration (Optional)

If you want to populate the database with sample data, run:

```sql
-- Insert sample properties (after creating owner users)
-- This is optional and for testing purposes
```

---

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check that your `.env` file has the correct Supabase URL and anon key
   - Restart the Expo development server after changing `.env`

2. **"Row Level Security policy violation"**
   - Ensure all RLS policies are created correctly
   - Check that the user is authenticated before accessing protected data

3. **"User not found" after signup**
   - Make sure the `users` table insert trigger is working
   - Check that the user was created in both `auth.users` and `users` tables

4. **Admin can't access admin panel**
   - Verify the user's `user_type` is set to 'admin' in the `users` table
   - Log out and log back in to refresh the session

---

## 📊 Database Monitoring

Monitor your database usage in Supabase Dashboard:
- **Database** > Table Editor - View and edit data
- **Database** > Logs - Check query logs
- **Authentication** > Users - Manage users
- **Storage** > Buckets - Manage file uploads (if needed)

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use Row Level Security** - All tables have RLS enabled
3. **Validate user input** - Client-side and server-side validation
4. **Use prepared statements** - Supabase client handles this automatically
5. **Limit API access** - Use RLS policies to restrict data access

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

## 🎉 You're All Set!

Your RoomRent app is now connected to Supabase with:
- ✅ Authentication system
- ✅ Database with proper schema
- ✅ Row Level Security
- ✅ Admin account
- ✅ Role-based access control

Start the app and test the authentication flow!

```bash
npm start
# or
bun start
```

---

## 📞 Support

If you encounter any issues:
1. Check the Supabase Dashboard logs
2. Review the console logs in your app
3. Verify all environment variables are set correctly
4. Ensure all SQL commands executed successfully

Happy coding! 🚀
