-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_type AS ENUM ('student', 'parent', 'admin');
CREATE TYPE material_status AS ENUM ('draft', 'published', 'archived');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mongo_id TEXT UNIQUE,
  parent_name TEXT,
  kids JSONB,
  bio TEXT,
  city TEXT,
  state TEXT,
  curriculum TEXT,
  extracurriculars JSONB,
  links JSONB,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  college_onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create school_philosophies table
CREATE TABLE IF NOT EXISTS school_philosophies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prefix TEXT,
  first_name TEXT,
  middle_initial TEXT,
  last_name TEXT,
  title TEXT,
  phone_number TEXT,
  fax TEXT,
  email_address TEXT,
  profile_url TEXT,
  graduating_class_size INTEGER,
  block_schedule BOOLEAN,
  graduation_date DATE,
  outside_us BOOLEAN,
  volunteer_service BOOLEAN,
  school_address JSONB DEFAULT '{}',
  one_sentence_philosophy TEXT,
  why_homeschool TEXT,
  types_of_learning TEXT,
  course_structure TEXT,
  success_measurement TEXT,
  extracurricular_opportunities TEXT,
  ai_philosophy TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  gender TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  dob DATE,
  parent_guardian TEXT,
  student_email TEXT,
  projected_grad_date DATE,
  parent_email TEXT,
  school_name TEXT,
  school_phone TEXT,
  school_address TEXT,
  school_city TEXT,
  school_state TEXT,
  school_zip TEXT,
  issue_date DATE,
  graduation_date DATE,
  freshman_year TEXT,
  sophomore_year TEXT,
  junior_year TEXT,
  senior_year TEXT,
  pre_high_school_year TEXT,
  freshman_courses JSONB DEFAULT '[]',
  sophomore_courses JSONB DEFAULT '[]',
  junior_courses JSONB DEFAULT '[]',
  senior_courses JSONB DEFAULT '[]',
  pre_high_school_courses JSONB DEFAULT '[]',
  cumulative_summary JSONB DEFAULT '{}',
  test_scores TEXT,
  grading_scale JSONB DEFAULT '{}',
  miscellaneous TEXT,
  signature_date DATE,
  pdf_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop the courses table if it exists
DROP TABLE IF EXISTS courses CASCADE;

-- Create course_descriptions table
CREATE TABLE IF NOT EXISTS course_descriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  freshman JSONB DEFAULT '[]',
  sophomore JSONB DEFAULT '[]',
  junior JSONB DEFAULT '[]',
  senior JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create grading_rubrics table
CREATE TABLE IF NOT EXISTS grading_rubrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluation_method TEXT,
  learning_goals TEXT,
  assignments TEXT,
  grading_scale JSONB DEFAULT '{}',
  ai_grading_scale JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create guidance_letters table
CREATE TABLE IF NOT EXISTS guidance_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  letter_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scholarships table
CREATE TABLE IF NOT EXISTS scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  description TEXT,
  offered_by TEXT,
  amount NUMERIC(10,2),
  deadline DATE,
  grade_level TEXT,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create saved_scholarships table
CREATE TABLE IF NOT EXISTS saved_scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scholarship_id)
);

-- Create colleges table
CREATE TABLE IF NOT EXISTS colleges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  deadlines JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_philosophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidance_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Add similar policies for other tables...

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for each table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_philosophies_updated_at
  BEFORE UPDATE ON school_philosophies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transcripts_updated_at
  BEFORE UPDATE ON transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_descriptions_updated_at
  BEFORE UPDATE ON course_descriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grading_rubrics_updated_at
  BEFORE UPDATE ON grading_rubrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guidance_letters_updated_at
  BEFORE UPDATE ON guidance_letters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scholarships_updated_at
  BEFORE UPDATE ON scholarships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_scholarships_updated_at
  BEFORE UPDATE ON saved_scholarships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colleges_updated_at
  BEFORE UPDATE ON colleges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create stored procedure for inserting transcripts
CREATE OR REPLACE FUNCTION insert_transcript(
  p_user_id UUID,
  p_name TEXT,
  p_gender TEXT,
  p_address TEXT,
  p_city TEXT,
  p_state TEXT,
  p_zip TEXT,
  p_dob DATE,
  p_parent_guardian TEXT,
  p_student_email TEXT,
  p_projected_grad_date DATE,
  p_parent_email TEXT,
  p_school_name TEXT,
  p_school_phone TEXT,
  p_school_address TEXT,
  p_school_city TEXT,
  p_school_state TEXT,
  p_school_zip TEXT,
  p_issue_date DATE,
  p_graduation_date DATE,
  p_freshman_year TEXT,
  p_sophomore_year TEXT,
  p_junior_year TEXT,
  p_senior_year TEXT,
  p_pre_high_school_year TEXT,
  p_freshman_courses JSONB,
  p_sophomore_courses JSONB,
  p_junior_courses JSONB,
  p_senior_courses JSONB,
  p_pre_high_school_courses JSONB,
  p_cumulative_summary JSONB,
  p_test_scores TEXT,
  p_grading_scale JSONB,
  p_miscellaneous TEXT,
  p_signature_date DATE,
  p_pdf_data TEXT
) RETURNS UUID AS $$
DECLARE
  v_transcript_id UUID;
BEGIN
  INSERT INTO transcripts (
    user_id,
    name,
    gender,
    address,
    city,
    state,
    zip,
    dob,
    parent_guardian,
    student_email,
    projected_grad_date,
    parent_email,
    school_name,
    school_phone,
    school_address,
    school_city,
    school_state,
    school_zip,
    issue_date,
    graduation_date,
    freshman_year,
    sophomore_year,
    junior_year,
    senior_year,
    pre_high_school_year,
    freshman_courses,
    sophomore_courses,
    junior_courses,
    senior_courses,
    pre_high_school_courses,
    cumulative_summary,
    test_scores,
    grading_scale,
    miscellaneous,
    signature_date,
    pdf_data
  ) VALUES (
    p_user_id,
    p_name,
    p_gender,
    p_address,
    p_city,
    p_state,
    p_zip,
    p_dob,
    p_parent_guardian,
    p_student_email,
    p_projected_grad_date,
    p_parent_email,
    p_school_name,
    p_school_phone,
    p_school_address,
    p_school_city,
    p_school_state,
    p_school_zip,
    p_issue_date,
    p_graduation_date,
    p_freshman_year,
    p_sophomore_year,
    p_junior_year,
    p_senior_year,
    p_pre_high_school_year,
    COALESCE(p_freshman_courses, '[]'::jsonb),
    COALESCE(p_sophomore_courses, '[]'::jsonb),
    COALESCE(p_junior_courses, '[]'::jsonb),
    COALESCE(p_senior_courses, '[]'::jsonb),
    COALESCE(p_pre_high_school_courses, '[]'::jsonb),
    p_cumulative_summary,
    p_test_scores,
    p_grading_scale,
    p_miscellaneous,
    p_signature_date,
    p_pdf_data
  ) RETURNING id INTO v_transcript_id;

  RETURN v_transcript_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_transcript TO authenticated;

-- Create function to execute raw SQL queries
CREATE OR REPLACE FUNCTION execute_sql(query text, values jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  EXECUTE query
  USING variadic array(SELECT jsonb_array_elements(values))
  INTO result;
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;

-- Create function to create users table
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    mongo_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  
  -- Enable RLS
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  
  -- Create policy
  CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);
    
  -- Create trigger for updated_at
  CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_users_table TO authenticated; 