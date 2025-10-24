-- ============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- ============================================
-- The issue: Admin policies query the users table,
-- which triggers the same policy again = infinite loop
-- 
-- Solution: Use SECURITY DEFINER functions that bypass RLS
-- ============================================

-- Step 1: Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete properties" ON public.properties;

-- Step 2: Create a SECURITY DEFINER function to check admin status
-- This function bypasses RLS and directly checks the user_type
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_type_val TEXT;
BEGIN
  -- Directly query without triggering RLS
  SELECT user_type INTO user_type_val 
  FROM public.users 
  WHERE id = auth.uid();
  
  RETURN user_type_val = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate admin policies using the SECURITY DEFINER function
-- Users table admin policies
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

-- Properties table admin policies
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

-- Step 4: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================
-- Test that policies work without recursion:
-- SELECT * FROM public.users; -- Should work now
-- SELECT * FROM public.properties; -- Should work now
-- ============================================
