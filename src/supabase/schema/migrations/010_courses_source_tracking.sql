-- Add source tracking columns to courses table
ALTER TABLE courses
ADD COLUMN source_type TEXT,
ADD COLUMN source_id UUID,
ADD COLUMN is_pulled_in BOOLEAN DEFAULT false;

-- Add indexes for better performance
CREATE INDEX idx_courses_source_type ON courses(source_type);
CREATE INDEX idx_courses_source_id ON courses(source_id);
CREATE INDEX idx_courses_is_pulled_in ON courses(is_pulled_in);

-- Update existing courses to have source_type = 'manual'
UPDATE courses
SET source_type = 'manual'
WHERE source_type IS NULL; 