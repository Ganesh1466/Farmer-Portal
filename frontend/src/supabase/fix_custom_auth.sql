-- CRITICAL FIX: UNLINK FROM SUPABASE AUTH
-- Run this in Supabase Dashboard -> SQL Editor

-- 1. DROP the Foreign Key Constraint
-- This stops the database from checking if the User exists in Supabase Auth.
-- Since we are doing Custom Auth, our users WON'T exist in Supabase Auth.
ALTER TABLE public.login DROP CONSTRAINT IF EXISTS login_uuid_fkey;

-- 2. Make sure Password column exists (just in case)
ALTER TABLE public.login ADD COLUMN IF NOT EXISTS password TEXT;

-- 3. Ensure Permissions are Open
ALTER TABLE public.login ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert" ON public.login;
CREATE POLICY "Allow anon insert" 
ON public.login FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read" ON public.login;
CREATE POLICY "Allow public read" 
ON public.login FOR SELECT 
TO anon, authenticated 
USING (true);
