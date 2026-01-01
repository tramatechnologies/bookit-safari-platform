-- Migration: Create Storage Buckets
-- This migration creates storage buckets for user avatars and bus operator logos

-- Create avatars bucket for user profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public bucket so avatars can be accessed directly
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create operator-logos bucket for bus operator company logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'operator-logos',
  'operator-logos',
  true, -- Public bucket so logos can be accessed directly
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for avatars bucket
-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- RLS Policies for operator-logos bucket
-- Operators can upload their own logo
CREATE POLICY "Operators can upload their own logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'operator-logos' AND
  EXISTS (
    SELECT 1 FROM public.bus_operators
    WHERE user_id = auth.uid()
  )
);

-- Operators can update their own logo
CREATE POLICY "Operators can update their own logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'operator-logos' AND
  EXISTS (
    SELECT 1 FROM public.bus_operators
    WHERE user_id = auth.uid()
  )
);

-- Operators can delete their own logo
CREATE POLICY "Operators can delete their own logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'operator-logos' AND
  EXISTS (
    SELECT 1 FROM public.bus_operators
    WHERE user_id = auth.uid()
  )
);

-- Admins can manage all operator logos
CREATE POLICY "Admins can manage all operator logos"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'operator-logos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::public.user_role
  )
);

-- Anyone can view operator logos (public bucket)
CREATE POLICY "Anyone can view operator logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'operator-logos');

