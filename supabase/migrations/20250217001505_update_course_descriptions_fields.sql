-- Drop existing triggers if table exists
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_descriptions') THEN
        DROP TRIGGER IF EXISTS course_descriptions_updated_at ON course_descriptions;
    END IF;
END $$;

-- Drop existing policies
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_descriptions') THEN
        DROP POLICY IF EXISTS "Parents can view their students' course descriptions" ON course_descriptions;
        DROP POLICY IF EXISTS "Students can view their own course descriptions" ON course_descriptions;
        DROP POLICY IF EXISTS "Parents can insert course descriptions for their students" ON course_descriptions;
        DROP POLICY IF EXISTS "Parents can update course descriptions for their students" ON course_descriptions;
        DROP POLICY IF EXISTS "Parents can delete course descriptions for their students" ON course_descriptions;
    END IF;
END $$;

-- Drop and recreate course_descriptions table with updated JSONB structure
DROP TABLE IF EXISTS course_descriptions;
CREATE TABLE course_descriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    pre_high_school JSONB DEFAULT '[]'::jsonb,
    freshman JSONB DEFAULT '[]'::jsonb,
    sophomore JSONB DEFAULT '[]'::jsonb,
    junior JSONB DEFAULT '[]'::jsonb,
    senior JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id)
);

-- Create indexes
CREATE INDEX idx_course_descriptions_student_id ON course_descriptions(student_id);
CREATE INDEX idx_course_descriptions_user_id ON course_descriptions(user_id);

-- Create trigger for updated_at
CREATE TRIGGER course_descriptions_updated_at
    BEFORE UPDATE ON course_descriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE course_descriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Parents can view their students' course descriptions"
    ON course_descriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.students 
            WHERE students.id = course_descriptions.student_id
            AND students.parent_id = auth.uid()
        )
    );

CREATE POLICY "Students can view their own course descriptions"
    ON course_descriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.students 
            WHERE students.id = course_descriptions.student_id
            AND students.user_id = auth.uid()
        )
    );

CREATE POLICY "Parents can insert course descriptions for their students"
    ON course_descriptions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.students 
            WHERE students.id = course_descriptions.student_id
            AND students.parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can update course descriptions for their students"
    ON course_descriptions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.students 
            WHERE students.id = course_descriptions.student_id
            AND students.parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can delete course descriptions for their students"
    ON course_descriptions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.students 
            WHERE students.id = course_descriptions.student_id
            AND students.parent_id = auth.uid()
        )
    );

-- Add comment to describe JSONB structure
COMMENT ON COLUMN course_descriptions.pre_high_school IS 'Array of course objects with fields: courseTitle, instruction_method, textbooks, materials, evaluation_method, description';
COMMENT ON COLUMN course_descriptions.freshman IS 'Array of course objects with fields: courseTitle, instruction_method, textbooks, materials, evaluation_method, description';
COMMENT ON COLUMN course_descriptions.sophomore IS 'Array of course objects with fields: courseTitle, instruction_method, textbooks, materials, evaluation_method, description';
COMMENT ON COLUMN course_descriptions.junior IS 'Array of course objects with fields: courseTitle, instruction_method, textbooks, materials, evaluation_method, description';
COMMENT ON COLUMN course_descriptions.senior IS 'Array of course objects with fields: courseTitle, instruction_method, textbooks, materials, evaluation_method, description'; 