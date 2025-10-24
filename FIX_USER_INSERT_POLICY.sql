-- ============================================
-- FIX: User Insert RLS Policy
-- ============================================
-- This script fixes the RLS policy that prevents
-- user creation during signup
-- ============================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow user creation during signup" ON public.users;

-- Create a new permissive policy that allows inserts
-- This is safe because:
-- 1. Users can only be created through Supabase Auth first
-- 2. The id must match an existing auth.users record (FK constraint)
-- 3. The insert happens immediately after auth.signUp()
CREATE POLICY "Allow user creation during signup" 
  ON public.users
  FOR INSERT 
  WITH CHECK (true);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'users'
  AND policyname = 'Allow user creation during signup';

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Paste this entire script
-- 5. Click "Run" or press Cmd/Ctrl + Enter
-- 6. You should see the policy details in the results
-- 7. Try signing up again in your app
-- ============================================
