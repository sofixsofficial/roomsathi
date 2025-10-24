-- ============================================
-- FIX INFINITE RECURSION IN RLS POLICIES - V2
-- ============================================
-- Run this in Supabase SQL Editor to fix the infinite recursion error
-- ============================================

-- Step 1: Drop ALL existing policies to start fresh
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

-- Step 2: Drop existing functions
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.get_user_type(UUID);

-- Step 3: Create SECURITY DEFINER function to check admin status
-- This bypasses RLS and prevents infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_type_val TEXT;
BEGIN
  -- Query directly without triggering RLS policies
  SELECT user_type INTO user_type_val 
  FROM public.users 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_type_val = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 4: Create non-recursive RLS policies for users table
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

-- Step 5: Create non-recursive RLS policies for properties table
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

-- Step 6: Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Step 7: Verify the fix
SELECT 'Setup complete! Testing queries...' as status;

-- These should now work without infinite recursion:
SELECT COUNT(*) as user_count FROM public.users;
SELECT COUNT(*) as property_count FROM public.properties;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- The infinite recursion error should now be fixed.
-- Try refreshing your app to verify.
-- ============================================
