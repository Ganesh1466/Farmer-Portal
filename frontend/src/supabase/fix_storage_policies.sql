-- Fix Storage Bucket Policies for crop-images
-- Run this in Supabase SQL Editor if the bucket was created as PUBLIC but still has RLS errors

-- Policy 1: Allow anyone to read images (public access)
CREATE POLICY "Public Access to crop images"
ON storage.objects FOR SELECT
USING (bucket_id = 'crop-images');

-- Policy 2: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload crop images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'crop-images' 
    AND auth.role() = 'authenticated'
);

-- Policy 3: Allow users to update their own images
CREATE POLICY "Users can update own crop images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'crop-images' 
    AND auth.role() = 'authenticated'
)
WITH CHECK (
    bucket_id = 'crop-images' 
    AND auth.role() = 'authenticated'
);

-- Policy 4: Allow users to delete their own images
CREATE POLICY "Users can delete own crop images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'crop-images' 
    AND auth.role() = 'authenticated'
);

-- If you want to allow all operations without restriction (for testing):
-- DROP ALL existing policies first, then create this one:
/*
CREATE POLICY "Allow all for authenticated users"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'crop-images')
WITH CHECK (bucket_id = 'crop-images');
*/
