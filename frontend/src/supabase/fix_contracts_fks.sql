-- Fix contracts table Foreign Keys to point to public.profiles instead of auth.users
-- This is necessary to allow API joins (elections) to fetch Farmer and Buyer details.

DO $$
BEGIN
    -- 1. Drop existing FKs to auth.users (Standard names)
    -- We try to drop them if they exist to avoid errors.
    BEGIN
        ALTER TABLE contracts DROP CONSTRAINT contracts_farmer_id_fkey;
    EXCEPTION
        WHEN undefined_object THEN
            RAISE NOTICE 'Constraint contracts_farmer_id_fkey not found, skipping drop.';
    END;

    BEGIN
        ALTER TABLE contracts DROP CONSTRAINT contracts_buyer_id_fkey;
    EXCEPTION
        WHEN undefined_object THEN
            RAISE NOTICE 'Constraint contracts_buyer_id_fkey not found, skipping drop.';
    END;
END $$;

-- 2. Add new FKs to public.profiles
ALTER TABLE contracts
    ADD CONSTRAINT contracts_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.profiles(id),
    ADD CONSTRAINT contracts_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id);

-- 3. Verify relationships
COMMENT ON CONSTRAINT contracts_farmer_id_fkey ON contracts IS 'Link to Farmer Profile';
COMMENT ON CONSTRAINT contracts_buyer_id_fkey ON contracts IS 'Link to Buyer Profile';
