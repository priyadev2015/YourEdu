-- Add student-specific columns to household_members table
ALTER TABLE public.household_members
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS grade_level TEXT,
ADD COLUMN IF NOT EXISTS graduation_year TEXT,
ADD COLUMN IF NOT EXISTS school_name TEXT,
ADD COLUMN IF NOT EXISTS previous_school TEXT,
ADD COLUMN IF NOT EXISTS previous_school_phone TEXT,
ADD COLUMN IF NOT EXISTS previous_school_address TEXT,
ADD COLUMN IF NOT EXISTS curriculum TEXT,
ADD COLUMN IF NOT EXISTS special_education_needs TEXT,
ADD COLUMN IF NOT EXISTS student_email TEXT,
ADD COLUMN IF NOT EXISTS student_phone TEXT;

-- Create a view for easier access to student information
CREATE OR REPLACE VIEW public.student_profiles AS
SELECT 
    hm.id as student_id,
    hm.user_id,
    h.primary_account_id as parent_id,
    h.id as household_id,
    COALESCE(ap.name, hm.metadata->>'name') as student_name,
    hm.date_of_birth,
    hm.grade_level,
    hm.graduation_year,
    hm.school_name,
    hm.previous_school,
    hm.previous_school_phone,
    hm.previous_school_address,
    hm.curriculum,
    hm.special_education_needs,
    COALESCE(ap.email, hm.student_email) as student_email,
    COALESCE(ap.phone_number, hm.student_phone) as student_phone,
    hm.created_at,
    hm.status,
    hm.metadata
FROM 
    public.household_members hm
    JOIN public.households h ON h.id = hm.household_id
    LEFT JOIN public.account_profiles ap ON ap.id = hm.user_id
WHERE 
    hm.member_type = 'student';

-- Add RLS policy for the view
ALTER VIEW public.student_profiles OWNER TO authenticated;
GRANT ALL ON public.student_profiles TO authenticated;

CREATE POLICY "Users can view their own student profiles or those in their household"
    ON public.student_profiles
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id OR  -- Student can view their own profile
        auth.uid() = parent_id OR -- Parent can view their students' profiles
        household_id IN (         -- Household members can view profiles
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- Add function to get students for a parent
CREATE OR REPLACE FUNCTION public.get_parent_students(parent_user_id UUID)
RETURNS SETOF public.student_profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT *
    FROM public.student_profiles
    WHERE 
        parent_id = parent_user_id
        OR household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = parent_user_id
        );
$$;
