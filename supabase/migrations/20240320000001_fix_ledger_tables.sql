-- Drop existing tables if they exist
DROP TABLE IF EXISTS ledger_entry_skills;
DROP TABLE IF EXISTS ledger_entries;
DROP TABLE IF EXISTS ledger_settings;

-- Create ledger_settings table
CREATE TABLE ledger_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Educational Journey',
  subtitle TEXT NOT NULL DEFAULT 'A collection of achievements, skills, and experiences',
  profile_image_url TEXT,
  cover_image_url TEXT,
  theme_color TEXT NOT NULL DEFAULT '#1976d2',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Create ledger_entries table
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  evidence_url TEXT,
  image_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ledger_entry_skills table
CREATE TABLE ledger_entry_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES ledger_entries(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE ledger_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entry_skills ENABLE ROW LEVEL SECURITY;

-- Create policies for ledger_settings
CREATE POLICY "Users can view their own ledger settings"
ON ledger_settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ledger settings"
ON ledger_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ledger settings"
ON ledger_settings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policies for ledger_entries
CREATE POLICY "Users can view their own ledger entries"
ON ledger_entries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ledger entries"
ON ledger_entries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ledger entries"
ON ledger_entries FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ledger entries"
ON ledger_entries FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for ledger_entry_skills
CREATE POLICY "Users can view skills for their own entries"
ON ledger_entry_skills FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM ledger_entries
    WHERE ledger_entries.id = ledger_entry_skills.entry_id
    AND ledger_entries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create skills for their own entries"
ON ledger_entry_skills FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ledger_entries
    WHERE ledger_entries.id = ledger_entry_skills.entry_id
    AND ledger_entries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete skills from their own entries"
ON ledger_entry_skills FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM ledger_entries
    WHERE ledger_entries.id = ledger_entry_skills.entry_id
    AND ledger_entries.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX ledger_settings_user_id_idx ON ledger_settings(user_id);
CREATE INDEX ledger_entries_user_id_idx ON ledger_entries(user_id);
CREATE INDEX ledger_entry_skills_entry_id_idx ON ledger_entry_skills(entry_id); 