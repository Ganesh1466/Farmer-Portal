
-- Fix ratings table Foreign Keys to point to public.profiles
-- Run this in Supabase SQL Editor

DO $$
BEGIN
    -- 1. Drop existing FKs if they exist (to ensure clean slate)
    BEGIN
        ALTER TABLE ratings DROP CONSTRAINT ratings_farmer_id_fkey;
    EXCEPTION WHEN undefined_object THEN END;

    BEGIN
        ALTER TABLE ratings DROP CONSTRAINT ratings_buyer_id_fkey;
    EXCEPTION WHEN undefined_object THEN END;
END $$;

-- 2. Add new FKs to public.profiles with explicit names
ALTER TABLE ratings
    ADD CONSTRAINT ratings_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    ADD CONSTRAINT ratings_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Verify
COMMENT ON CONSTRAINT ratings_farmer_id_fkey ON ratings IS 'Link to Farmer Profile';
COMMENT ON CONSTRAINT ratings_buyer_id_fkey ON ratings IS 'Link to Buyer Profile';

-- 4. Grant permissions just in case
GRANT ALL ON public.ratings TO authenticated;
GRANT ALL ON public.ratings TO service_role;
