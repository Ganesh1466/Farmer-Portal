-- Rating System Schema Updates

-- 1. Add rating fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- 2. Extend notifications table with type and contract_id
-- Notification types: 'crop_interest', 'contract_generated', 'deal_accepted'
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'crop_interest', -- 'crop_interest', 'contract_generated', or 'deal_accepted'
ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id);

-- 3. Add delivery_status to contracts table
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending'; -- 'pending', 'delivered', 'rated'

-- 4. Create ratings table to store individual ratings
CREATE TABLE IF NOT EXISTS ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID REFERENCES contracts(id) NOT NULL,
    farmer_id UUID REFERENCES auth.users(id) NOT NULL,
    buyer_id UUID REFERENCES auth.users(id) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on ratings
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Farmers can view their own ratings
CREATE POLICY "Farmers can view their ratings" 
ON ratings FOR SELECT 
USING (auth.uid() = farmer_id);

-- Policy: Buyers can view their submitted ratings
CREATE POLICY "Buyers can view their ratings" 
ON ratings FOR SELECT 
USING (auth.uid() = buyer_id);

-- Policy: Buyers can insert ratings for contracts they own
CREATE POLICY "Buyers can submit ratings" 
ON ratings FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_ratings_farmer_id ON ratings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_ratings_contract_id ON ratings(contract_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_contracts_delivery_status ON contracts(delivery_status);
