-- Drop existing triggers if tables exist
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transcripts') THEN
        DROP TRIGGER IF EXISTS transcripts_updated_at ON transcripts;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
        DROP TRIGGER IF EXISTS courses_updated_at ON courses;
    END IF;
END $$;

-- Drop existing policies for transcripts if the table exists
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transcripts') THEN
        DROP POLICY IF EXISTS "Parents can view their students' transcripts" ON transcripts;
        DROP POLICY IF EXISTS "Students can view their own transcripts" ON transcripts;
        DROP POLICY IF EXISTS "Parents can insert transcripts for their students" ON transcripts;
        DROP POLICY IF EXISTS "Parents can update transcripts for their students" ON transcripts;
        DROP POLICY IF EXISTS "Parents can delete transcripts for their students" ON transcripts;
    END IF;
END $$;

-- Drop existing policies for courses if the table exists
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
        DROP POLICY IF EXISTS "Users can view courses for their transcripts" ON courses;
        DROP POLICY IF EXISTS "Users can insert courses for their transcripts" ON courses;
        DROP POLICY IF EXISTS "Users can update courses for their transcripts" ON courses;
        DROP POLICY IF EXISTS "Users can delete courses for their transcripts" ON courses;
    END IF;
END $$;

-- Drop tables in correct order (child table first)
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS transcripts;

-- Create transcripts table
CREATE TABLE transcripts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
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
    cumulative_summary JSONB DEFAULT '{
        "totalCredits": "0",
        "gpaCredits": "0",
        "gpaPoints": "0",
        "cumulativeGPA": "0",
        "weightedGPA": null
    }'::jsonb NOT NULL,
    test_scores TEXT,
    grading_scale JSONB DEFAULT '{"show": false}'::jsonb NOT NULL,
    miscellaneous TEXT,
    signature_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_cumulative_summary CHECK (cumulative_summary ? 'totalCredits' AND cumulative_summary ? 'cumulativeGPA')
);

-- Create courses table
CREATE TABLE courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE NOT NULL,
    grade_level TEXT NOT NULL CHECK (grade_level IN ('preHighSchool', 'freshman', 'sophomore', 'junior', 'senior')),
    method TEXT,
    course_title TEXT,
    term1_grade TEXT,
    term2_grade TEXT,
    term3_grade TEXT,
    credits TEXT,
    ap_score TEXT,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_transcripts_student_id ON transcripts(student_id);
CREATE INDEX idx_courses_transcript_id ON courses(transcript_id);
CREATE INDEX idx_transcripts_user_id ON transcripts(user_id);

-- Create triggers for updated_at
CREATE TRIGGER transcripts_updated_at
    BEFORE UPDATE ON transcripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policies for transcripts
CREATE POLICY "Parents can view their students' transcripts"
    ON transcripts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.students 
            WHERE students.id = transcripts.student_id
            AND students.parent_id = auth.uid()
        )
    );

CREATE POLICY "Students can view their own transcripts"
    ON transcripts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.students 
            WHERE students.id = transcripts.student_id
            AND students.user_id = auth.uid()
        )
    );

CREATE POLICY "Parents can insert transcripts for their students"
    ON transcripts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.students 
            WHERE students.id = transcripts.student_id
            AND students.parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can update transcripts for their students"
    ON transcripts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.students 
            WHERE students.id = transcripts.student_id
            AND students.parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can delete transcripts for their students"
    ON transcripts FOR DELETE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.students 
            WHERE students.id = transcripts.student_id
            AND students.parent_id = auth.uid()
        )
    );

-- Create policies for courses
CREATE POLICY "Users can view courses for their transcripts"
    ON courses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM transcripts
            JOIN public.students ON students.id = transcripts.student_id
            WHERE transcripts.id = courses.transcript_id
            AND (students.parent_id = auth.uid() OR students.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert courses for their transcripts"
    ON courses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM transcripts
            JOIN public.students ON students.id = transcripts.student_id
            WHERE transcripts.id = courses.transcript_id
            AND students.parent_id = auth.uid()
        )
    );

CREATE POLICY "Users can update courses for their transcripts"
    ON courses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 
            FROM transcripts
            JOIN public.students ON students.id = transcripts.student_id
            WHERE transcripts.id = courses.transcript_id
            AND students.parent_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete courses for their transcripts"
    ON courses FOR DELETE
    USING (
        EXISTS (
            SELECT 1 
            FROM transcripts
            JOIN public.students ON students.id = transcripts.student_id
            WHERE transcripts.id = courses.transcript_id
            AND students.parent_id = auth.uid()
        )
    );

-- Add a function to ensure cumulative_summary is always properly initialized
CREATE OR REPLACE FUNCTION initialize_transcript_defaults()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cumulative_summary IS NULL THEN
        NEW.cumulative_summary := '{
            "totalCredits": "0",
            "gpaCredits": "0",
            "gpaPoints": "0",
            "cumulativeGPA": "0",
            "weightedGPA": null
        }'::jsonb;
    END IF;
    IF NEW.grading_scale IS NULL THEN
        NEW.grading_scale := '{"show": false}'::jsonb;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_transcript_defaults
    BEFORE INSERT OR UPDATE ON transcripts
    FOR EACH ROW
    EXECUTE FUNCTION initialize_transcript_defaults(); 