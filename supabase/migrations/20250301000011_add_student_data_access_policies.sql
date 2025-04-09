-- Add RLS policies for student data access

-- Ensure RLS is enabled on all relevant tables
ALTER TABLE public.youredu_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Add policies using DO block to handle existing policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Students can view their own youredu courses" ON public.youredu_courses;
    DROP POLICY IF EXISTS "Students can view their own user courses" ON public.user_courses;
    DROP POLICY IF EXISTS "Students can view their own transcripts" ON public.transcripts;
    DROP POLICY IF EXISTS "Students can view their own course descriptions" ON public.course_descriptions;
    DROP POLICY IF EXISTS "Students can view their own attendance records" ON public.attendance_records;
    DROP POLICY IF EXISTS "Students can update their own attendance records" ON public.attendance_records;
    DROP POLICY IF EXISTS "Students can insert their own attendance records" ON public.attendance_records;

    -- Create new policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'youredu_courses' 
        AND policyname = 'Students can view their own youredu courses'
    ) THEN
        CREATE POLICY "Students can view their own youredu courses"
            ON public.youredu_courses
            FOR SELECT
            USING (
                student_id IN (
                    SELECT id FROM public.students
                    WHERE user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_courses' 
        AND policyname = 'Students can view their own user courses'
    ) THEN
        CREATE POLICY "Students can view their own user courses"
            ON public.user_courses
            FOR SELECT
            USING (
                student_id IN (
                    SELECT id FROM public.students
                    WHERE user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'transcripts' 
        AND policyname = 'Students can view their own transcripts'
    ) THEN
        CREATE POLICY "Students can view their own transcripts"
            ON public.transcripts
            FOR SELECT
            USING (
                student_id IN (
                    SELECT id FROM public.students
                    WHERE user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'course_descriptions' 
        AND policyname = 'Students can view their own course descriptions'
    ) THEN
        CREATE POLICY "Students can view their own course descriptions"
            ON public.course_descriptions
            FOR SELECT
            USING (
                student_id IN (
                    SELECT id FROM public.students
                    WHERE user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'attendance_records' 
        AND policyname = 'Students can view their own attendance records'
    ) THEN
        CREATE POLICY "Students can view their own attendance records"
            ON public.attendance_records
            FOR SELECT
            USING (
                student_id IN (
                    SELECT id FROM public.students
                    WHERE user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'attendance_records' 
        AND policyname = 'Students can update their own attendance records'
    ) THEN
        CREATE POLICY "Students can update their own attendance records"
            ON public.attendance_records
            FOR UPDATE
            USING (
                student_id IN (
                    SELECT id FROM public.students
                    WHERE user_id = auth.uid()
                )
            )
            WITH CHECK (
                student_id IN (
                    SELECT id FROM public.students
                    WHERE user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'attendance_records' 
        AND policyname = 'Students can insert their own attendance records'
    ) THEN
        CREATE POLICY "Students can insert their own attendance records"
            ON public.attendance_records
            FOR INSERT
            WITH CHECK (
                student_id IN (
                    SELECT id FROM public.students
                    WHERE user_id = auth.uid()
                )
            );
    END IF;
END
$$;

-- Function to check if user has access to student data
CREATE OR REPLACE FUNCTION public.has_student_access(p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.students s
        WHERE s.id = p_student_id
        AND (
            s.user_id = auth.uid() OR  -- User is the student
            s.parent_id = auth.uid()    -- User is the parent
        )
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.has_student_access TO authenticated; 