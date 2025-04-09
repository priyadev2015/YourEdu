-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own ledger entries" ON ledger_entries;
DROP POLICY IF EXISTS "Users can insert their own ledger entries" ON ledger_entries;
DROP POLICY IF EXISTS "Users can update their own ledger entries" ON ledger_entries;
DROP POLICY IF EXISTS "Users can delete their own ledger entries" ON ledger_entries;

DROP POLICY IF EXISTS "Users can view their own ledger settings" ON ledger_settings;
DROP POLICY IF EXISTS "Users can insert their own ledger settings" ON ledger_settings;
DROP POLICY IF EXISTS "Users can update their own ledger settings" ON ledger_settings;

-- Enable RLS
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entry_skills ENABLE ROW LEVEL SECURITY;

-- Create policies for ledger_entries
CREATE POLICY "Users can view their own ledger entries"
ON ledger_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ledger entries"
ON ledger_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ledger entries"
ON ledger_entries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ledger entries"
ON ledger_entries FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for ledger_settings
CREATE POLICY "Users can view their own ledger settings"
ON ledger_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ledger settings"
ON ledger_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ledger settings"
ON ledger_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policies for ledger_entry_skills
CREATE POLICY "Users can view their own ledger entry skills"
ON ledger_entry_skills FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ledger_entries
    WHERE ledger_entries.id = ledger_entry_skills.entry_id
    AND ledger_entries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own ledger entry skills"
ON ledger_entry_skills FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ledger_entries
    WHERE ledger_entries.id = ledger_entry_skills.entry_id
    AND ledger_entries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own ledger entry skills"
ON ledger_entry_skills FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM ledger_entries
    WHERE ledger_entries.id = ledger_entry_skills.entry_id
    AND ledger_entries.user_id = auth.uid()
  )
); 