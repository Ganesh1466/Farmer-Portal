-- Create the notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    listing_id UUID REFERENCES crop_listings(id),
    crop_name TEXT NOT NULL,
    buyer_name TEXT,
    buyer_contact TEXT,
    message TEXT,
    status TEXT DEFAULT 'unread', -- 'unread', 'read'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view notifications sent TO them
CREATE POLICY "Users can view their received notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = receiver_id);

-- Policy: Users can insert notifications (send them)
CREATE POLICY "Users can send notifications" 
ON notifications FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update status of their received notifications
CREATE POLICY "Users can update their received notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = receiver_id);
