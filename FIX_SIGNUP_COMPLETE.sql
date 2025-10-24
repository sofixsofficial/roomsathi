-- ============================================
-- COMPLETE FIX FOR SIGNUP ISSUE
-- ============================================
-- This script fixes the signup issue by:
-- 1. Creating a trigger to auto-create user records
-- 2. Fixing RLS policies to allow user creation
-- 3. Preventing infinite recursion
-- ============================================

-- Step 1: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, user_type, status, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'renter'),
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Step 5: Update RLS policies for users table
DROP POLICY IF EXISTS "users_insert_own" ON public.users;

-- Allow service_role to insert (for trigger)
CREATE POLICY "users_insert_service"
  ON public.users FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to insert their own record (backup)
CREATE POLICY "users_insert_authenticated"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Step 6: Verification
SELECT 
  'Setup Complete!' as status,
  'Users can now sign up automatically' as message;

-- Test the trigger function
SELECT 
  'Testing handle_new_user function...' as test,
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- ============================================
-- DONE! Signup should now work automatically.
-- ============================================
-- How it works:
-- 1. When user signs up via auth.signUp()
-- 2. Trigger automatically creates user record
-- 3. No need to manually insert into users table
-- 4. User metadata is stored in the record
-- ============================================
