-- ============================================
-- RoomRent App - Complete Supabase Setup
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste and Run
-- ============================================

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- 1.1 Users Table
CREATE TABLE IF NOT EXISTS public.users (
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

-- 1.2 Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
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
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  available_from DATE NOT NULL,
  virtual_tour_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected', 'rented')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participants UUID[] NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  property_title TEXT,
  last_message TEXT NOT NULL,
  last_message_time TIMESTAMPTZ NOT NULL,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_conversations_property ON public.conversations(property_id);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON public.favorites(property_id);

-- ============================================
-- 3. CREATE TRIGGERS
-- ============================================

-- 3.1 Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3.2 Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. DROP EXISTING POLICIES (Clean slate)
-- ============================================

-- Users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Properties policies
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can view their own properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can delete their own properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete properties" ON public.properties;

-- Conversations policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;

-- Messages policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages;

-- Favorites policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove favorites" ON public.favorites;

-- ============================================
-- 6. CREATE ROW LEVEL SECURITY POLICIES
-- ============================================

-- 6.1 Users Table Policies
CREATE POLICY "Users can view their own profile" 
  ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.users
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Allow user creation during signup" 
  ON public.users
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view all users" 
  ON public.users
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" 
  ON public.users
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can delete users" 
  ON public.users
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- 6.2 Properties Table Policies
CREATE POLICY "Anyone can view active properties" 
  ON public.properties
  FOR SELECT 
  USING (status = 'active' OR auth.uid() IS NOT NULL);

CREATE POLICY "Owners can view their own properties" 
  ON public.properties
  FOR SELECT 
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert properties" 
  ON public.properties
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own properties" 
  ON public.properties
  FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own properties" 
  ON public.properties
  FOR DELETE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all properties" 
  ON public.properties
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all properties" 
  ON public.properties
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can delete properties" 
  ON public.properties
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- 6.3 Conversations Table Policies
CREATE POLICY "Users can view their own conversations" 
  ON public.conversations
  FOR SELECT 
  USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create conversations" 
  ON public.conversations
  FOR INSERT 
  WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "Users can update their own conversations" 
  ON public.conversations
  FOR UPDATE 
  USING (auth.uid() = ANY(participants));

-- 6.4 Messages Table Policies
CREATE POLICY "Users can view their own messages" 
  ON public.messages
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
  ON public.messages
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" 
  ON public.messages
  FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- 6.5 Favorites Table Policies
CREATE POLICY "Users can view their own favorites" 
  ON public.favorites
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" 
  ON public.favorites
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" 
  ON public.favorites
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- 7. CREATE HELPER FUNCTIONS
-- ============================================

-- 7.1 Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.2 Function to get user type
CREATE OR REPLACE FUNCTION public.get_user_type(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  u_type TEXT;
BEGIN
  SELECT user_type INTO u_type FROM public.users WHERE id = user_id;
  RETURN u_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.properties TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.favorites TO authenticated;

-- Grant select on tables for anon (for viewing active properties)
GRANT SELECT ON public.properties TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_type TO authenticated;

-- ============================================
-- 9. CREATE ADMIN USER (OPTIONAL)
-- ============================================
-- Note: First create the user in Supabase Auth Dashboard
-- Email: sofixscompany@gmail.com
-- Password: SofixsRoomRent@$
-- Then run this to set them as admin:

-- UPDATE public.users 
-- SET user_type = 'admin' 
-- WHERE email = 'sofixscompany@gmail.com';

-- ============================================
-- 10. VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything is set up correctly:

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'properties', 'conversations', 'messages', 'favorites');

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'properties', 'conversations', 'messages', 'favorites');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'properties', 'conversations', 'messages', 'favorites');

-- Check policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready with:
-- ✅ All tables created
-- ✅ Indexes for performance
-- ✅ Triggers for auto-updates
-- ✅ Row Level Security enabled
-- ✅ Comprehensive RLS policies
-- ✅ Helper functions
-- ✅ Proper permissions
-- ============================================
