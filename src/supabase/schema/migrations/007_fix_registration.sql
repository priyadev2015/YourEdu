-- First, ensure the profiles table exists with the correct structure
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT,
    email TEXT,
    user_type TEXT DEFAULT 'highschool',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON profiles;
DROP POLICY IF EXISTS "Allow insert" ON profiles;
DROP POLICY IF EXISTS "Allow select own profile" ON profiles;
DROP POLICY IF EXISTS "Allow update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies
CREATE POLICY "Enable profile management" ON profiles
    FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Ensure the trigger for default folders exists and works
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_default_folders();

CREATE OR REPLACE FUNCTION create_default_folders()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO folders (user_id, name, category, is_default)
    VALUES
        (NEW.id, 'Attendance Records', 'attendance'::document_category, true),
        (NEW.id, 'Curriculum Plans', 'curriculum'::document_category, true),
        (NEW.id, 'Assessments', 'assessments'::document_category, true),
        (NEW.id, 'Legal Documents', 'legal'::document_category, true),
        (NEW.id, 'Other', 'other'::document_category, true);
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error details
    RAISE NOTICE 'Error creating default folders: %', SQLERRM;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_folders(); 