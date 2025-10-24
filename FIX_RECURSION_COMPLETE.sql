-- ============================================
-- COMPLETE FIX FOR INFINITE RECURSION
-- ============================================
-- Copy and paste this ENTIRE script into Supabase SQL Editor
-- Then click "RUN" to execute
-- ============================================

-- Step 1: Disable RLS temporarily
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.users';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.properties';
    END LOOP;
END $$;

-- Step 3: Drop existing functions
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_type(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_roles() CASCADE;

-- Step 4: Create user_roles table (this prevents recursion)
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
  user_id UUID PRIMARY KEY,
  user_type TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create sync function
CREATE OR REPLACE FUNCTION public.sync_user_roles()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.user_roles (user_id, user_type, updated_at)
    VALUES (NEW.id, NEW.user_type, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET user_type = NEW.user_type, updated_at = NOW();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.user_roles WHERE user_id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger
DROP TRIGGER IF EXISTS sync_user_roles_trigger ON public.users;
CREATE TRIGGER sync_user_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_roles();

-- Step 7: Create is_admin function (uses user_roles, not users table)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 8: Populate user_roles with existing data
INSERT INTO public.user_roles (user_id, user_type, updated_at)
SELECT id, user_type, updated_at FROM public.users
ON CONFLICT (user_id) DO UPDATE 
SET user_type = EXCLUDED.user_type, updated_at = EXCLUDED.updated_at;

-- Step 9: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 10: Create NEW policies for users table (NO RECURSION)
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_select_admin"
  ON public.users FOR SELECT
  USING (public.is_admin());

CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "users_update_admin"
  ON public.users FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "users_delete_admin"
  ON public.users FOR DELETE
  USING (public.is_admin());

-- Step 11: Create policies for properties table
CREATE POLICY "properties_select_active"
  ON public.properties FOR SELECT
  USING (status = 'active' OR auth.uid() IS NOT NULL);

CREATE POLICY "properties_select_own"
  ON public.properties FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "properties_select_admin"
  ON public.properties FOR SELECT
  USING (public.is_admin());

CREATE POLICY "properties_insert_own"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "properties_update_own"
  ON public.properties FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "properties_update_admin"
  ON public.properties FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "properties_delete_own"
  ON public.properties FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "properties_delete_admin"
  ON public.properties FOR DELETE
  USING (public.is_admin());

-- Step 12: Create policy for user_roles table
CREATE POLICY "user_roles_select_all"
  ON public.user_roles FOR SELECT
  USING (true);

-- Step 13: Grant permissions
GRANT ALL ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.sync_user_roles() TO authenticated;

-- Step 14: Verification
SELECT 
  'Setup Complete!' as status,
  (SELECT COUNT(*) FROM public.users) as users_count,
  (SELECT COUNT(*) FROM public.properties) as properties_count,
  (SELECT COUNT(*) FROM public.user_roles) as user_roles_count;

-- Test the is_admin function
SELECT 
  'Testing is_admin function...' as test,
  public.is_admin() as result;

-- ============================================
-- DONE! The infinite recursion is now fixed.
-- ============================================
-- How it works:
-- 1. user_roles table stores user types separately
-- 2. Trigger keeps it in sync with users table
-- 3. is_admin() checks user_roles (not users table)
-- 4. No recursion because policies don't query users table
-- ============================================
