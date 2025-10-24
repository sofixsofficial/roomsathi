-- Fix Admin Login Issue
-- Run this in Supabase SQL Editor

-- First, check if admin user exists in users table
DO $$
DECLARE
  admin_user_id UUID := 'bf6d78d1-e178-40ba-a9d6-7cbbbd893610';
  admin_exists BOOLEAN;
BEGIN
  -- Check if user exists in users table
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = admin_user_id
  ) INTO admin_exists;

  IF admin_exists THEN
    -- Update existing admin user
    UPDATE public.users
    SET 
      user_type = 'admin',
      status = 'active',
      name = 'Admin User',
      email = 'admin@roomrent.com',
      phone = '9999999999',
      updated_at = NOW()
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'Admin user updated successfully';
  ELSE
    -- Insert new admin user
    INSERT INTO public.users (
      id,
      email,
      name,
      phone,
      user_type,
      status,
      avatar,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'admin@roomrent.com',
      'Admin User',
      '9999999999',
      'admin',
      'active',
      NULL,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Admin user created successfully';
  END IF;
END $$;

-- Verify the admin user
SELECT 
  id,
  email,
  name,
  user_type,
  status,
  created_at
FROM public.users
WHERE id = 'bf6d78d1-e178-40ba-a9d6-7cbbbd893610';
