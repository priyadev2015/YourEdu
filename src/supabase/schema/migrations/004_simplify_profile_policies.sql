-- First, drop all existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create simple policies
-- Allow anyone to insert (we'll validate the data in the application)
CREATE POLICY "Allow insert" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Allow users to view their own profile
CREATE POLICY "Allow select own profile" ON profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow update own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; 