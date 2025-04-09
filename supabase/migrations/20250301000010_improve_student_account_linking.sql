-- Improve student account linking with a comprehensive function

CREATE OR REPLACE FUNCTION public.link_student_account_v2(
    p_student_id UUID,
    p_user_id UUID,
    p_parent_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_record RECORD;
    v_user_metadata JSONB;
BEGIN
    -- Check if student exists
    SELECT * INTO v_student_record
    FROM public.students
    WHERE id = p_student_id
    AND parent_id = p_parent_id;
    
    IF v_student_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Student record not found or parent mismatch'
        );
    END IF;
    
    -- Update the student record with the user_id
    UPDATE public.students
    SET 
        user_id = p_user_id,
        updated_at = NOW()
    WHERE id = p_student_id;
    
    -- Get user metadata to update
    SELECT raw_user_meta_data INTO v_user_metadata
    FROM auth.users
    WHERE id = p_user_id;
    
    -- Update auth.users metadata to include user_type and student info
    UPDATE auth.users
    SET raw_user_meta_data = v_user_metadata || jsonb_build_object(
        'user_type', 'student',
        'student_id', p_student_id,
        'parent_id', p_parent_id
    )
    WHERE id = p_user_id;
    
    -- Update or insert account_profiles
    INSERT INTO public.account_profiles (
        id,
        name,
        email,
        user_type,
        student_id,
        parent_id
    )
    VALUES (
        p_user_id,
        v_student_record.student_name,
        v_student_record.email,
        'student',
        p_student_id,
        p_parent_id
    )
    ON CONFLICT (id) DO UPDATE
    SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        user_type = EXCLUDED.user_type,
        student_id = EXCLUDED.student_id,
        parent_id = EXCLUDED.parent_id,
        updated_at = NOW();
    
    -- Grant necessary permissions through RLS
    -- This is handled by RLS policies, but we ensure the relationship is properly set
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Student account linked successfully',
        'student_id', p_student_id,
        'user_id', p_user_id,
        'parent_id', p_parent_id
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', SQLERRM,
        'error_code', SQLSTATE
    );
END;
$$;

-- Add RLS policies to ensure proper data access
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Students can view their own data" ON public.students;
    DROP POLICY IF EXISTS "Students can view their courses" ON public.youredu_courses;

    -- Create new policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'students' 
        AND policyname = 'Students can view their own data'
    ) THEN
        CREATE POLICY "Students can view their own data"
            ON public.students
            FOR SELECT
            USING (
                auth.uid() = user_id OR
                auth.uid() = parent_id
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'youredu_courses' 
        AND policyname = 'Students can view their courses'
    ) THEN
        CREATE POLICY "Students can view their courses"
            ON public.youredu_courses
            FOR SELECT
            USING (
                student_id IN (
                    SELECT id FROM public.students
                    WHERE user_id = auth.uid() OR parent_id = auth.uid()
                )
            );
    END IF;
END
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.link_student_account_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_student_account_v2 TO anon; 