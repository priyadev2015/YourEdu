-- First, ensure we have the correct foreign key relationships
ALTER TABLE groups
DROP CONSTRAINT IF EXISTS groups_created_by_fkey;

ALTER TABLE groups
ADD CONSTRAINT groups_created_by_fkey
FOREIGN KEY (created_by) REFERENCES account_profiles(id);

-- Update group_members table
ALTER TABLE group_members
DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

ALTER TABLE group_members
ADD CONSTRAINT group_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES account_profiles(id);

-- Update group_posts table
ALTER TABLE group_posts
DROP CONSTRAINT IF EXISTS group_posts_user_id_fkey;

ALTER TABLE group_posts
ADD CONSTRAINT group_posts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES account_profiles(id);

-- Enable Row Level Security
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for groups
CREATE POLICY "Enable read access for all users" ON groups FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Enable update for group creators" ON groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Enable delete for group creators" ON groups FOR DELETE USING (auth.uid() = created_by);

-- Create policies for group_members
CREATE POLICY "Enable read access for all users" ON group_members FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for group admins" ON group_members FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
    )
);
CREATE POLICY "Enable delete for members themselves or group admins" ON group_members FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
    )
);

-- Create policies for group_posts
CREATE POLICY "Enable read access for group members" ON group_posts FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_posts.group_id
        AND gm.user_id = auth.uid()
        AND gm.status = 'accepted'
    )
);
CREATE POLICY "Enable insert for group members" ON group_posts FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_posts.group_id
        AND gm.user_id = auth.uid()
        AND gm.status = 'accepted'
    )
);
CREATE POLICY "Enable update for post authors" ON group_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for post authors or group admins" ON group_posts FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_posts.group_id
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
    )
); 