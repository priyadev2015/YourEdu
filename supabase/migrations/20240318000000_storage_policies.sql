-- Create storage policies for admin-materials bucket
BEGIN;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Policy to allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'admin-materials' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy to allow authenticated users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'admin-materials' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy to allow authenticated users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'admin-materials' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy to allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'admin-materials' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

COMMIT; 