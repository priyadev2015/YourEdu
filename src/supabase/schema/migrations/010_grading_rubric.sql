-- Drop existing triggers if tables exist
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'grading_rubrics') THEN
        DROP TRIGGER IF EXISTS grading_rubrics_updated_at ON grading_rubrics;
    END IF;
END $$;

-- Drop existing policies if table exists
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'grading_rubrics') THEN
        DROP POLICY IF EXISTS "Users can view their own grading rubric" ON grading_rubrics;
        DROP POLICY IF EXISTS "Users can insert their own grading rubric" ON grading_rubrics;
        DROP POLICY IF EXISTS "Users can update their own grading rubric" ON grading_rubrics;
        DROP POLICY IF EXISTS "Users can delete their own grading rubric" ON grading_rubrics;
    END IF;
END $$;

-- Drop existing table
DROP TABLE IF EXISTS grading_rubrics;

-- Create grading_rubrics table
CREATE TABLE grading_rubrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    evaluation_method TEXT,
    learning_goals TEXT,
    assignments TEXT,
    grading_scale JSONB DEFAULT '{
        "A+": "",
        "A": "",
        "A-": "",
        "B+": "",
        "B": "",
        "B-": "",
        "C+": "",
        "C": "",
        "C-": "",
        "D+": "",
        "D": "",
        "D-": "",
        "F": ""
    }'::jsonb,
    ai_grading_scale TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create trigger for updated_at
CREATE TRIGGER grading_rubrics_updated_at
    BEFORE UPDATE ON grading_rubrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE grading_rubrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own grading rubric"
    ON grading_rubrics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grading rubric"
    ON grading_rubrics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grading rubric"
    ON grading_rubrics FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own grading rubric"
    ON grading_rubrics FOR DELETE
    USING (auth.uid() = user_id);