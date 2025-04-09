-- Drop existing triggers if tables exist
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_descriptions') THEN
        DROP TRIGGER IF EXISTS course_descriptions_updated_at ON course_descriptions;
    END IF;
END $$;

-- Drop existing policies if table exists
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_descriptions') THEN
        DROP POLICY IF EXISTS "Users can view their own course descriptions" ON course_descriptions;
        DROP POLICY IF EXISTS "Users can insert their own course descriptions" ON course_descriptions;
        DROP POLICY IF EXISTS "Users can update their own course descriptions" ON course_descriptions;
        DROP POLICY IF EXISTS "Users can delete their own course descriptions" ON course_descriptions;
    END IF;
END $$;

-- Drop existing table
DROP TABLE IF EXISTS course_descriptions;

-- Create course_descriptions table
CREATE TABLE course_descriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    freshman JSONB DEFAULT '[]'::jsonb,
    sophomore JSONB DEFAULT '[]'::jsonb,
    junior JSONB DEFAULT '[]'::jsonb,
    senior JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create trigger for updated_at
CREATE TRIGGER course_descriptions_updated_at
    BEFORE UPDATE ON course_descriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE course_descriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own course descriptions"
    ON course_descriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course descriptions"
    ON course_descriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own course descriptions"
    ON course_descriptions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own course descriptions"
    ON course_descriptions FOR DELETE
    USING (auth.uid() = user_id); 