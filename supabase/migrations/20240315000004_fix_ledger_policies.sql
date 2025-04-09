-- Enable RLS
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entry_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own entries" ON ledger_entries;
DROP POLICY IF EXISTS "Users can create their own entries" ON ledger_entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON ledger_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON ledger_entries;

DROP POLICY IF EXISTS "Users can view skills for their entries" ON ledger_entry_skills;
DROP POLICY IF EXISTS "Users can add skills to their entries" ON ledger_entry_skills;
DROP POLICY IF EXISTS "Users can delete skills from their entries" ON ledger_entry_skills;

DROP POLICY IF EXISTS "Users can view their own settings" ON ledger_settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON ledger_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON ledger_settings;

-- Policies for ledger_entries
CREATE POLICY "Users can view their own entries"
ON ledger_entries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries"
ON ledger_entries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
ON ledger_entries FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
ON ledger_entries FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policies for ledger_entry_skills
CREATE POLICY "Users can view skills for their entries"
ON ledger_entry_skills FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM ledger_entries
    WHERE ledger_entries.id = ledger_entry_skills.entry_id
    AND ledger_entries.user_id = auth.uid()
));

CREATE POLICY "Users can add skills to their entries"
ON ledger_entry_skills FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM ledger_entries
    WHERE ledger_entries.id = ledger_entry_skills.entry_id
    AND ledger_entries.user_id = auth.uid()
));

CREATE POLICY "Users can delete skills from their entries"
ON ledger_entry_skills FOR DELETE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM ledger_entries
    WHERE ledger_entries.id = ledger_entry_skills.entry_id
    AND ledger_entries.user_id = auth.uid()
));

-- Policies for ledger_settings
CREATE POLICY "Users can view their own settings"
ON ledger_settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
ON ledger_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON ledger_settings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id); 