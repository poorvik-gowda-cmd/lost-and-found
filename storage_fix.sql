-- DEFINITIVE PUBLIC STORAGE FIX
-- Run this in your Supabase SQL Editor

-- 1. Ensure the bucket is public (force update even if it exists)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'item-images';

-- 2. Delete all existing policies for the bucket to reset them
DELETE FROM storage.policies WHERE bucket_id = 'item-images';

-- 3. Create TRULY PUBLIC access (Publicly Viewable)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING (bucket_id = 'item-images');

-- 4. Create Authenticated Upload (Allow anyone logged in to upload)
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'item-images' AND auth.role() = 'authenticated');

-- 5. Create Update/Delete Only for Owners
CREATE POLICY "Owner Access" ON storage.objects FOR ALL 
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Grant all permissions to the schema (SupaBase standard)
GRANT ALL ON storage.objects TO anon, authenticated, service_role;
GRANT ALL ON storage.buckets TO anon, authenticated, service_role;
