-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('course-materials', 'course-materials', true),
  ('work-samples', 'work-samples', true),
  ('assignment-submissions', 'assignment-submissions', true)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for course-materials bucket
CREATE POLICY "Allow authenticated uploads to course-materials"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-materials');

CREATE POLICY "Allow authenticated downloads from course-materials"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'course-materials');

-- Add RLS policies for work-samples bucket
CREATE POLICY "Allow authenticated uploads to work-samples"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'work-samples');

CREATE POLICY "Allow authenticated downloads from work-samples"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'work-samples');

-- Add RLS policies for assignment-submissions bucket
CREATE POLICY "Allow authenticated uploads to assignment-submissions"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'assignment-submissions');

CREATE POLICY "Allow authenticated downloads from assignment-submissions"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'assignment-submissions');

-- Add public_url column to course_materials if it doesn't exist
ALTER TABLE course_materials 
ADD COLUMN IF NOT EXISTS public_url TEXT;

-- Add public_url column to work_samples if it doesn't exist
ALTER TABLE work_samples 
ADD COLUMN IF NOT EXISTS public_url TEXT;

-- Add file_details column to assignment_submissions if it doesn't exist
ALTER TABLE assignment_submissions 
ADD COLUMN IF NOT EXISTS file_details JSONB; 