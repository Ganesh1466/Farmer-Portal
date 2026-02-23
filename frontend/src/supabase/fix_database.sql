-- CRITICAL FIX FOR CUSTOM LOGIN
-- Run this in Supabase Dashboard -> SQL Editor

-- 1. Add the missing password column
ALTER TABLE public.login ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Ensure the app can Read and Write to the table
ALTER TABLE public.login ENABLE ROW LEVEL SECURITY;

-- Allow Login (Read)
DROP POLICY IF EXISTS "Allow public read" ON public.login;
CREATE POLICY "Allow public read" 
ON public.login FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow Register (Insert)
DROP POLICY IF EXISTS "Allow anon insert" ON public.login;
CREATE POLICY "Allow anon insert" 
ON public.login FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);
