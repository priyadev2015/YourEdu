-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload ledger images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view ledger images" ON storage.objects;

-- Policy to allow authenticated users to upload images
CREATE POLICY "Users can upload ledger images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ledger-images');

-- Policy to allow users to update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ledger-images' AND owner = auth.uid());

-- Policy to allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ledger-images' AND owner = auth.uid());

-- Policy to allow public access to view images
CREATE POLICY "Public can view ledger images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ledger-images'); 