-- Allow public access to read group images
CREATE POLICY "Anyone can view group images" ON storage.objects FOR SELECT USING (bucket_id = 'group-images');

-- Allow authenticated users to upload group images
CREATE POLICY "Authenticated users can upload group images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'group-images' 
    AND auth.role() = 'authenticated'
);

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update their own group images" ON storage.objects FOR UPDATE WITH CHECK (
    bucket_id = 'group-images'
    AND auth.uid() = owner
);

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own group images" ON storage.objects FOR DELETE USING (
    bucket_id = 'group-images'
    AND auth.uid() = owner
); 