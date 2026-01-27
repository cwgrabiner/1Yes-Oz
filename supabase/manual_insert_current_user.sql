-- Manual SQL to insert current user into public.users table
-- 
-- INSTRUCTIONS:
-- 1. Replace 'YOUR_USER_ID_HERE' with your actual user ID from auth.users
-- 2. Replace 'your.email@example.com' with your actual email (or use NULL)
-- 3. Run this SQL in your Supabase SQL editor or via psql
--
-- To find your user ID:
-- SELECT id, email, created_at FROM auth.users WHERE email = 'your.email@example.com';

-- Option 1: Insert with your user ID and email
INSERT INTO public.users (id, email, created_at)
VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- Replace with your actual UUID
  'your.email@example.com',   -- Replace with your email or use NULL
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email;

-- Option 2: Insert using a query from auth.users (recommended)
-- This automatically gets your user ID and email from auth.users
INSERT INTO public.users (id, email, created_at)
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'your.email@example.com'  -- Replace with your email
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email;

-- Option 3: Insert all users from auth.users that don't exist in public.users
-- Useful if you have multiple users to migrate
INSERT INTO public.users (id, email, created_at)
SELECT 
  au.id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;
