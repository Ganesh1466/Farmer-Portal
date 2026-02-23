-- Create the contracts table
CREATE TABLE contracts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    listing_id UUID REFERENCES crop_listings(id),
    farmer_id UUID REFERENCES auth.users(id), -- Seller
    buyer_id UUID REFERENCES auth.users(id),
    contract_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_mode TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed', 'cancelled'
    pdf_url TEXT, -- Optional: URL if PDF is stored in Supabase Storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Policy: Farmers can view their own contracts
CREATE POLICY "Farmers can view their contracts" 
ON contracts FOR SELECT 
USING (auth.uid() = farmer_id);

-- Policy: Buyers can view their own contracts
CREATE POLICY "Buyers can view their contracts" 
ON contracts FOR SELECT 
USING (auth.uid() = buyer_id);

-- Policy: Backend (Service Role) can insert/update (or users if needed)
-- Allowing authenticated users to insert if they are party to the contract
CREATE POLICY "Users can create contracts" 
ON contracts FOR INSERT 
WITH CHECK (auth.uid() = farmer_id OR auth.uid() = buyer_id);
