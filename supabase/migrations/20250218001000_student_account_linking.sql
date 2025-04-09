-- Migration to add student account linking functionality

-- Function to link a student account to a student record
CREATE OR REPLACE FUNCTION public.link_student_account(
    p_student_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_parent_id UUID;
    v_student_exists BOOLEAN;
BEGIN
    -- Check if student exists and get parent_id
    SELECT 
        EXISTS(SELECT 1 FROM public.students WHERE id = p_student_id),
        parent_id INTO v_student_exists, v_parent_id
    FROM public.students
    WHERE id = p_student_id;
    
    IF NOT v_student_exists THEN
        RAISE EXCEPTION 'Student record not found';
    END IF;
    
    -- Update the student record with the user_id
    UPDATE public.students
    SET user_id = p_user_id
    WHERE id = p_student_id;
    
    RETURN TRUE;
END;
$$;

-- Function to get student data for the current user
CREATE OR REPLACE FUNCTION public.get_student_data()
RETURNS TABLE (
    student_id UUID,
    student_name TEXT,
    parent_id UUID,
    grade_level TEXT,
    date_of_birth DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- First check if user is a student (has a user_id in students table)
    RETURN QUERY
    SELECT 
        s.id,
        s.student_name,
        s.parent_id,
        s.grade_level,
        s.date_of_birth
    FROM 
        public.students s
    WHERE 
        s.user_id = auth.uid();
    
    -- If no rows returned, check if user is a parent
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            s.id,
            s.student_name,
            s.parent_id,
            s.grade_level,
            s.date_of_birth
        FROM 
            public.students s
        WHERE 
            s.parent_id = auth.uid();
    END IF;
END;
$$;

-- Update RLS policies to allow students to edit their own data

-- Update attendance_records policies
CREATE POLICY "Students can view their own attendance records"
    ON public.attendance_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM students
            WHERE students.id = attendance_records.student_id
            AND students.user_id = auth.uid()
        )
    );

CREATE POLICY "Students can update their own attendance records"
    ON public.attendance_records FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM students
            WHERE students.id = attendance_records.student_id
            AND students.user_id = auth.uid()
        )
    );

CREATE POLICY "Students can insert their own attendance records"
    ON public.attendance_records FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM students
            WHERE students.id = attendance_records.student_id
            AND students.user_id = auth.uid()
        )
    );

-- Update course_descriptions policies to allow students to edit
CREATE POLICY "Students can update their own course descriptions"
    ON public.course_descriptions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.students 
            WHERE students.id = course_descriptions.student_id
            AND students.user_id = auth.uid()
        )
    );

CREATE POLICY "Students can insert their own course descriptions"
    ON public.course_descriptions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.students 
            WHERE students.id = course_descriptions.student_id
            AND students.user_id = auth.uid()
        )
    );

-- Update transcripts policies to allow students to edit
CREATE POLICY "Students can update their own transcripts"
    ON public.transcripts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.students 
            WHERE students.id = transcripts.student_id
            AND students.user_id = auth.uid()
        )
    );

CREATE POLICY "Students can insert their own transcripts"
    ON public.transcripts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.students 
            WHERE students.id = transcripts.student_id
            AND students.user_id = auth.uid()
        )
    );

-- Update courses policies to allow students to edit
CREATE POLICY "Students can insert courses for their transcripts"
    ON public.courses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM transcripts
            JOIN public.students ON students.id = transcripts.student_id
            WHERE transcripts.id = courses.transcript_id
            AND students.user_id = auth.uid()
        )
    );

CREATE POLICY "Students can update courses for their transcripts"
    ON public.courses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 
            FROM transcripts
            JOIN public.students ON students.id = transcripts.student_id
            WHERE transcripts.id = courses.transcript_id
            AND students.user_id = auth.uid()
        )
    );

CREATE POLICY "Students can delete courses for their transcripts"
    ON public.courses FOR DELETE
    USING (
        EXISTS (
            SELECT 1 
            FROM transcripts
            JOIN public.students ON students.id = transcripts.student_id
            WHERE transcripts.id = courses.transcript_id
            AND students.user_id = auth.uid()
        )
    );

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.link_student_account TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_data TO authenticated; 