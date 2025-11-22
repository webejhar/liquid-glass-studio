-- Create storage buckets for profile pictures and NID verification
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('profile-pictures', 'profile-pictures', true),
  ('nid-documents', 'nid-documents', false);

-- Create RLS policies for profile pictures
CREATE POLICY "Users can view all profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile picture"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for NID documents
CREATE POLICY "Users can view their own NID documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'nid-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own NID documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'nid-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own NID documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'nid-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own NID documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'nid-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add new fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS nid_url text,
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS verification_notes text,
ADD COLUMN IF NOT EXISTS face_verification_url text;