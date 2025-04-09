-- Drop existing tables if they exist
DROP TABLE IF EXISTS group_posts CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

-- Create groups table
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    privacy TEXT NOT NULL DEFAULT 'public',
    profile_image TEXT,
    landscape_image TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create group_members table
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    role TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_id, user_id)
);

-- Create group_posts table
CREATE TABLE group_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_groups_privacy ON groups(privacy);
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_status ON group_members(status);
CREATE INDEX idx_group_posts_group_id ON group_posts(group_id);
CREATE INDEX idx_group_posts_user_id ON group_posts(user_id);

-- Enable Row Level Security
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;

-- Groups policies (ultra simplified)
CREATE POLICY "public_groups_visible" ON groups 
    FOR SELECT USING (privacy = 'public');

CREATE POLICY "own_groups_visible" ON groups 
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "create_groups" ON groups 
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "update_own_groups" ON groups 
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "delete_own_groups" ON groups 
    FOR DELETE USING (auth.uid() = created_by);

-- Group members policies (ultra simplified)
CREATE POLICY "view_own_memberships" ON group_members 
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "join_groups" ON group_members 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_membership" ON group_members 
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "leave_groups" ON group_members 
    FOR DELETE USING (user_id = auth.uid());

-- Group posts policies (ultra simplified)
CREATE POLICY "view_own_posts" ON group_posts 
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "create_own_posts" ON group_posts 
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_posts" ON group_posts 
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "delete_own_posts" ON group_posts 
    FOR DELETE USING (user_id = auth.uid());

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_posts_updated_at
    BEFORE UPDATE ON group_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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