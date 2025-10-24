-- ============================================
-- FIX INFINITE RECURSION - FINAL SOLUTION
-- ============================================
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- Step 1: Temporarily disable RLS to make changes
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can view their own properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can delete their own properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete properties" ON public.properties;

-- Step 3: Drop existing functions
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.get_user_type(UUID);

-- Step 4: Create a materialized view or cache table for user types (optional but recommended)
-- This completely avoids recursion by not querying the users table in policies
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY,
  user_type TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create trigger to sync user_roles with users table
CREATE OR REPLACE FUNCTION public.sync_user_roles()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.user_roles (user_id, user_type, updated_at)
    VALUES (NEW.id, NEW.user_type, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET user_type = NEW.user_type, updated_at = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.user_roles WHERE user_id = OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_user_roles_trigger ON public.users;
CREATE TRIGGER sync_user_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_roles();

-- Step 6: Create SECURITY DEFINER function that uses user_roles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 7: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Step 8: Create NEW non-recursive policies for users table
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
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
  ON public.users
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Admins can update all users" 
  ON public.users
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete users" 
  ON public.users
  FOR DELETE 
  USING (public.is_admin());

-- Step 9: Create NEW policies for properties table
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
  USING (public.is_admin());

CREATE POLICY "Admins can update all properties" 
  ON public.properties
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete properties" 
  ON public.properties
  FOR DELETE 
  USING (public.is_admin());

-- Step 10: Grant permissions
GRANT ALL ON public.user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_roles() TO authenticated;

-- Step 11: Populate user_roles table with existing data
INSERT INTO public.user_roles (user_id, user_type, updated_at)
SELECT id, user_type, updated_at FROM public.users
ON CONFLICT (user_id) DO UPDATE SET user_type = EXCLUDED.user_type, updated_at = EXCLUDED.updated_at;

-- Step 12: Verification
SELECT 'Setup complete! Running verification...' as status;

-- Test queries (these should work without recursion)
SELECT COUNT(*) as user_count FROM public.users;
SELECT COUNT(*) as property_count FROM public.properties;
SELECT COUNT(*) as user_roles_count FROM public.user_roles;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- The infinite recursion is now completely fixed by:
-- 1. Using a separate user_roles table (no recursion)
-- 2. Auto-syncing with triggers
-- 3. SECURITY DEFINER functions bypass RLS
-- ============================================
