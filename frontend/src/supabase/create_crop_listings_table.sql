-- Create crop_listings table for marketplace functionality
CREATE TABLE IF NOT EXISTS crop_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    crop_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create storage bucket for crop images (run in Supabase dashboard)
-- Go to Storage → Create bucket → Name: crop-images → Public: Yes

-- Enable Row Level Security 
ALTER TABLE crop_listings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view available listings
CREATE POLICY "Anyone can view available crop listings"
    ON crop_listings
    FOR SELECT
    USING (status = 'available');

-- Policy: Farmers can insert their own listings
CREATE POLICY "Farmers can insert their own crop listings"
    ON crop_listings
    FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

-- Policy: Farmers can update their own listings
CREATE POLICY "Farmers can update their own crop listings"
    ON crop_listings
    FOR UPDATE
    USING (auth.uid() = seller_id);

-- Policy: Farmers can delete their own listings
CREATE POLICY "Farmers can delete their own crop listings"
    ON crop_listings
    FOR DELETE
    USING (auth.uid() = seller_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_crop_listings_seller_id ON crop_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_crop_listings_status ON crop_listings(status);
CREATE INDEX IF NOT EXISTS idx_crop_listings_created_at ON crop_listings(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_crop_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER trigger_update_crop_listings_updated_at
    BEFORE UPDATE ON crop_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_crop_listings_updated_at();
