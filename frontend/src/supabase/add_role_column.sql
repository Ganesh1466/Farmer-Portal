-- Add role column to login table
-- Run this in Supabase Dashboard -> SQL Editor

-- 1. Add the role column if it doesn't exist
ALTER TABLE public.login ADD COLUMN IF NOT EXISTS role TEXT;

-- 2. Set default value for existing rows (optional)
UPDATE public.login SET role = 'farmer' WHERE role IS NULL;

-- 3. Add a check constraint to ensure role is either 'farmer' or 'buyer'
ALTER TABLE public.login 
DROP CONSTRAINT IF EXISTS valid_role_check;

ALTER TABLE public.login 
ADD CONSTRAINT valid_role_check 
CHECK (role IN ('farmer', 'buyer'));

-- 4. You can optionally make the role column NOT NULL
-- Uncomment the line below if you want to enforce role for all users
-- ALTER TABLE public.login ALTER COLUMN role SET NOT NULL;
