-- Create ledger entries table
CREATE TABLE ledger_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    evidence_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    image_url TEXT,
    CHECK (type IN ('achievement', 'project', 'certification', 'skill', 'course', 'research', 'art', 'language', 'innovation'))
);

-- Create skills table for ledger entries
CREATE TABLE ledger_entry_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entry_id UUID REFERENCES ledger_entries(id) ON DELETE CASCADE,
    skill VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ledger settings table for user preferences
CREATE TABLE ledger_settings (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    title VARCHAR DEFAULT 'My Educational Journey',
    subtitle VARCHAR DEFAULT 'A collection of achievements, skills, and experiences',
    profile_image_url TEXT,
    cover_image_url TEXT,
    theme_color VARCHAR DEFAULT '#1976d2',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entry_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_settings ENABLE ROW LEVEL SECURITY;

-- Policies for ledger_entries
CREATE POLICY "Users can view their own entries"
    ON ledger_entries
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries"
    ON ledger_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
    ON ledger_entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
    ON ledger_entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for ledger_entry_skills
CREATE POLICY "Users can view skills for their entries"
    ON ledger_entry_skills
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM ledger_entries
        WHERE ledger_entries.id = ledger_entry_skills.entry_id
        AND ledger_entries.user_id = auth.uid()
    ));

CREATE POLICY "Users can add skills to their entries"
    ON ledger_entry_skills
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM ledger_entries
        WHERE ledger_entries.id = ledger_entry_skills.entry_id
        AND ledger_entries.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete skills from their entries"
    ON ledger_entry_skills
    FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM ledger_entries
        WHERE ledger_entries.id = ledger_entry_skills.entry_id
        AND ledger_entries.user_id = auth.uid()
    ));

-- Policies for ledger_settings
CREATE POLICY "Users can view their own settings"
    ON ledger_settings
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
    ON ledger_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON ledger_settings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_ledger_entries_updated_at
    BEFORE UPDATE ON ledger_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ledger_settings_updated_at
    BEFORE UPDATE ON ledger_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 