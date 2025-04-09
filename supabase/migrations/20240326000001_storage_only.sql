-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('course-materials', 'course-materials', true),
  ('work-samples', 'work-samples', true),
  ('assignment-submissions', 'assignment-submissions', true)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for course-materials bucket
DROP POLICY IF EXISTS "Allow authenticated uploads to course-materials" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated downloads from course-materials" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to course-materials"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-materials');

CREATE POLICY "Allow authenticated downloads from course-materials"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'course-materials');

-- Add RLS policies for work-samples bucket
DROP POLICY IF EXISTS "Allow authenticated uploads to work-samples" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated downloads from work-samples" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to work-samples"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'work-samples');

CREATE POLICY "Allow authenticated downloads from work-samples"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'work-samples');

-- Add RLS policies for assignment-submissions bucket
DROP POLICY IF EXISTS "Allow authenticated uploads to assignment-submissions" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated downloads from assignment-submissions" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to assignment-submissions"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'assignment-submissions');

CREATE POLICY "Allow authenticated downloads from assignment-submissions"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'assignment-submissions'); 