-- Update transcripts table
ALTER TABLE transcripts
  ALTER COLUMN cumulative_summary SET DEFAULT '{"totalCredits": 0, "gpaCredits": 0, "gpaPoints": 0.0, "cumulativeGPA": 0.0, "weightedGPA": "0.0"}'::jsonb,
  ALTER COLUMN grading_scale SET DEFAULT '{"show": true}'::jsonb;

-- Update course_descriptions table
ALTER TABLE course_descriptions
  ALTER COLUMN freshman SET DEFAULT '[]'::jsonb,
  ALTER COLUMN sophomore SET DEFAULT '[]'::jsonb,
  ALTER COLUMN junior SET DEFAULT '[]'::jsonb,
  ALTER COLUMN senior SET DEFAULT '[]'::jsonb,
  ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update grading_rubrics table
ALTER TABLE grading_rubrics
  ALTER COLUMN grading_scale SET DEFAULT '{"A+": "97-100%", "A": "93-96%", "A-": "90-92%", "B+": "87-89%", "B": "83-86%", "B-": "80-82%", "C+": "77-79%", "C": "73-76%", "C-": "70-72%", "D+": "67-69%", "D": "63-66%", "D-": "60-62%", "F": "Below 60%"}'::jsonb,
  ALTER COLUMN ai_grading_scale TYPE TEXT;

-- Update school_philosophies table
ALTER TABLE school_philosophies
  ALTER COLUMN volunteer_service TYPE BOOLEAN USING CASE WHEN volunteer_service = 'Yes' THEN true ELSE false END,
  ALTER COLUMN block_schedule TYPE BOOLEAN USING CASE WHEN block_schedule = 'Yes' THEN true ELSE false END,
  ALTER COLUMN outside_us TYPE BOOLEAN USING CASE WHEN outside_us = 'yes' THEN true ELSE false END,
  ALTER COLUMN school_address SET DEFAULT '{}'::jsonb;

-- Add RLS policies for transcripts
CREATE POLICY "Users can view their own transcripts"
  ON transcripts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own transcripts"
  ON transcripts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transcripts"
  ON transcripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for course_descriptions
CREATE POLICY "Users can view their own course descriptions"
  ON course_descriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own course descriptions"
  ON course_descriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course descriptions"
  ON course_descriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for grading_rubrics
CREATE POLICY "Users can view their own grading rubrics"
  ON grading_rubrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own grading rubrics"
  ON grading_rubrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grading rubrics"
  ON grading_rubrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for school_philosophies
CREATE POLICY "Users can view their own school philosophies"
  ON school_philosophies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own school philosophies"
  ON school_philosophies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own school philosophies"
  ON school_philosophies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    user_type TEXT DEFAULT 'highschool',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at(); 