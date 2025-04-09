-- Drop existing triggers if tables exist
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'youredu_courses') THEN
        DROP TRIGGER IF EXISTS youredu_courses_updated_at ON youredu_courses;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_courses') THEN
        DROP TRIGGER IF EXISTS user_courses_updated_at ON user_courses;
    END IF;
END $$;

-- Drop existing policies
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'youredu_courses') THEN
        DROP POLICY IF EXISTS "Users can view their youredu courses" ON youredu_courses;
        DROP POLICY IF EXISTS "Users can insert their youredu courses" ON youredu_courses;
        DROP POLICY IF EXISTS "Users can update their youredu courses" ON youredu_courses;
        DROP POLICY IF EXISTS "Users can delete their youredu courses" ON youredu_courses;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_courses') THEN
        DROP POLICY IF EXISTS "Users can view their courses" ON user_courses;
        DROP POLICY IF EXISTS "Users can insert their courses" ON user_courses;
        DROP POLICY IF EXISTS "Users can update their courses" ON user_courses;
        DROP POLICY IF EXISTS "Users can delete their courses" ON user_courses;
    END IF;
END $$;

-- Drop and recreate youredu_courses table
DROP TABLE IF EXISTS youredu_courses CASCADE;
CREATE TABLE youredu_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    hs_subject TEXT,
    units TEXT,
    total_hours TEXT,
    instruction_method TEXT,
    materials TEXT[],
    evaluation_method TEXT,
    days TEXT,
    times TEXT,
    dates TEXT,
    textbooks TEXT[],
    teachers UUID[] DEFAULT ARRAY[]::UUID[],
    teacher_name TEXT,
    students UUID[] DEFAULT ARRAY[]::UUID[],
    year INTEGER,
    term_start TEXT,
    term_duration TEXT,
    is_published BOOLEAN DEFAULT false,
    enrollment_capacity INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop and recreate user_courses table
DROP TABLE IF EXISTS user_courses CASCADE;
CREATE TABLE user_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    course_code TEXT,
    college TEXT,
    teacher TEXT,
    teacher_name TEXT,
    hs_subject TEXT,
    units TEXT,
    total_hours TEXT,
    instruction_method TEXT,
    materials TEXT[],
    evaluation_method TEXT,
    days TEXT,
    times TEXT,
    dates TEXT,
    textbooks TEXT[],
    year INTEGER,
    term_start TEXT,
    term_duration TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_youredu_courses_student_id ON youredu_courses(student_id);
CREATE INDEX idx_youredu_courses_creator_id ON youredu_courses(creator_id);
CREATE INDEX idx_user_courses_student_id ON user_courses(student_id);
CREATE INDEX idx_user_courses_uid ON user_courses(uid);

-- Create triggers for updated_at
CREATE TRIGGER youredu_courses_updated_at
    BEFORE UPDATE ON youredu_courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_courses_updated_at
    BEFORE UPDATE ON user_courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE youredu_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;

-- Create policies for youredu_courses
CREATE POLICY "Users can view their youredu courses"
    ON youredu_courses FOR SELECT
    USING (
        creator_id = auth.uid() OR 
        auth.uid() = ANY(teachers) OR
        EXISTS (
            SELECT 1 FROM students 
            WHERE id = student_id 
            AND (parent_id = auth.uid() OR user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert their youredu courses"
    ON youredu_courses FOR INSERT
    WITH CHECK (
        creator_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM students 
            WHERE id = student_id 
            AND parent_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their youredu courses"
    ON youredu_courses FOR UPDATE
    USING (
        creator_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM students 
            WHERE id = student_id 
            AND parent_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their youredu courses"
    ON youredu_courses FOR DELETE
    USING (
        creator_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM students 
            WHERE id = student_id 
            AND parent_id = auth.uid()
        )
    );

-- Create policies for user_courses
CREATE POLICY "Users can view their courses"
    ON user_courses FOR SELECT
    USING (
        uid = auth.uid() OR
        EXISTS (
            SELECT 1 FROM students 
            WHERE id = student_id 
            AND (parent_id = auth.uid() OR user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert their courses"
    ON user_courses FOR INSERT
    WITH CHECK (
        uid = auth.uid() AND
        EXISTS (
            SELECT 1 FROM students 
            WHERE id = student_id 
            AND parent_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their courses"
    ON user_courses FOR UPDATE
    USING (
        uid = auth.uid() AND
        EXISTS (
            SELECT 1 FROM students 
            WHERE id = student_id 
            AND parent_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their courses"
    ON user_courses FOR DELETE
    USING (
        uid = auth.uid() AND
        EXISTS (
            SELECT 1 FROM students 
            WHERE id = student_id 
            AND parent_id = auth.uid()
        )
    );

-- Clean up existing data
TRUNCATE youredu_courses, user_courses; 