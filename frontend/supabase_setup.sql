-- Create a table for public profiles (Adapted for custom `login` table usage)
create table profiles (
  id uuid primary key, -- References `uuid` from your `login` table
  updated_at timestamp with time zone,
  name text,
  email text,
  phone text,
  dob date,
  state text,
  district text,
  taluka text,
  village text,
  avatar_url text
);

-- Set up Row Level Security (RLS)
-- Since we are using custom auth, we will allow public access for now. 
-- Ideally, you should migrate to Supabase Auth for true security.
alter table profiles enable row level security;

create policy "Enable all access for all users"
  on profiles for all
  using ( true )
  with check ( true );

-- Set up Storage!
-- Note: You might need to manually create the 'avatars' bucket in the dashboard if this script fails to create it via SQL
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Anyone can update an avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' );
