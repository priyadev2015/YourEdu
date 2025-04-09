-- Create students table
CREATE TABLE public.students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    parent_id UUID REFERENCES auth.users(id),
    student_name TEXT NOT NULL,
    date_of_birth DATE,
    grade_level TEXT,
    graduation_year TEXT,
    school_name TEXT,
    previous_school TEXT,
    previous_school_phone TEXT,
    previous_school_address TEXT,
    curriculum TEXT,
    special_education_needs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Parents can view their students
CREATE POLICY "Parents can view their own students"
    ON public.students FOR SELECT
    USING (auth.uid() = parent_id);

-- Students can view their own data
CREATE POLICY "Students can view their own data"
    ON public.students FOR SELECT
    USING (auth.uid() = user_id);

-- Parents can create and update their students
CREATE POLICY "Parents can manage their students"
    ON public.students FOR ALL
    USING (auth.uid() = parent_id);

-- Create indexes
CREATE INDEX students_parent_id_idx ON public.students(parent_id);
CREATE INDEX students_user_id_idx ON public.students(user_id);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
