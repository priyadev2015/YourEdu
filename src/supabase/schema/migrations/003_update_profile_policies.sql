-- Drop the existing insert policy
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- Create a new insert policy that allows profile creation during registration
CREATE POLICY "Enable insert for registration" ON profiles
    FOR INSERT WITH CHECK (
        -- Allow insert if the id matches the authenticated user's id
        -- OR if there's no profile yet for this id (for initial creation)
        auth.uid() = id OR 
        NOT EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = id
        )
    );

-- Update the select policy to be more permissive for profile lookup
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (
        -- Allow viewing if the profile belongs to the authenticated user
        -- OR if looking up a profile by id (for registration)
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = profiles.id
        )
    ); 