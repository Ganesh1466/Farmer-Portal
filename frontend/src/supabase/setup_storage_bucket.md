# Supabase Storage Setup for Crop Images

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://csqskohhvwjhktnfstib.supabase.co
2. Click on **Storage** in the left sidebar
3. Click **"New bucket"** button
4. Enter the following details:
   - **Name**: `crop-images`
   - **Public bucket**: ✅ **Check this box** (make it public)
5. Click **"Create bucket"**

## Step 2: Set Storage Policies (If needed)

If you need to set custom policies, go to the bucket settings and add these:

### Policy 1: Allow Public Read Access
- **Policy name**: "Public Access"
- **Allowed operation**: SELECT
- **Target roles**: public
- **USING expression**: `true`

### Policy 2: Allow Authenticated Users to Upload
- **Policy name**: "Authenticated users can upload"
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **WITH CHECK expression**: `true`

### Policy 3: Allow Users to Delete Their Own Images
- **Policy name**: "Users can delete own images"
- **Allowed operation**: DELETE
- **Target roles**: authenticated
- **USING expression**: `(bucket_id = 'crop-images'::text)`

## Step 3: Verify

After creating the bucket, try uploading an image again from the Sell Crop page.

## Quick Fix (Alternative)

If the bucket already exists but has RLS issues, you can:

1. Go to Storage → crop-images → Policies
2. Click "New Policy"
3. Choose "For full customization"
4. Add this policy:

**Policy Name**: Allow all operations for authenticated users

**Policy Definition**:
```sql
(bucket_id = 'crop-images'::text AND auth.role() = 'authenticated'::text)
```

**Apply to**: ALL (INSERT, SELECT, UPDATE, DELETE)
