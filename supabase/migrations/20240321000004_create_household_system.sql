-- Create households table
CREATE TABLE public.households (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    primary_account_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create household_members table
CREATE TABLE public.household_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    member_type TEXT NOT NULL CHECK (member_type IN ('primary', 'parent', 'student')),
    status TEXT NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create household_invitations table
CREATE TABLE public.household_invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES auth.users(id),
    invitee_email TEXT NOT NULL,
    invitee_name TEXT NOT NULL,
    member_type TEXT NOT NULL CHECK (member_type IN ('parent', 'student')),
    status TEXT NOT NULL DEFAULT 'pending',
    invitation_token UUID NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- First disable RLS
ALTER TABLE public.households DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_invitations DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "households_select" ON public.households;
DROP POLICY IF EXISTS "households_insert" ON public.households;
DROP POLICY IF EXISTS "households_update" ON public.households;
DROP POLICY IF EXISTS "households_delete" ON public.households;
DROP POLICY IF EXISTS "members_select" ON public.household_members;
DROP POLICY IF EXISTS "members_insert" ON public.household_members;
DROP POLICY IF EXISTS "members_update" ON public.household_members;
DROP POLICY IF EXISTS "members_delete" ON public.household_members;
DROP POLICY IF EXISTS "invitations_select" ON public.household_invitations;
DROP POLICY IF EXISTS "invitations_insert" ON public.household_invitations;
DROP POLICY IF EXISTS "invitations_update" ON public.household_invitations;
DROP POLICY IF EXISTS "invitations_delete" ON public.household_invitations;

-- Super simple policies
-- Households: you can see households where you're either the primary or a member
CREATE POLICY "households_access"
    ON public.households
    FOR ALL
    TO authenticated
    USING (
        primary_account_id = auth.uid() OR
        id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
    );

-- Members: you can see members of households you're part of
CREATE POLICY "members_access"
    ON public.household_members
    FOR ALL
    TO authenticated
    USING (
        user_id = auth.uid() OR
        household_id IN (SELECT id FROM households WHERE primary_account_id = auth.uid())
    );

-- Invitations: you can see invitations you sent or received
CREATE POLICY "invitations_access"
    ON public.household_invitations
    FOR ALL
    TO authenticated
    USING (
        inviter_id = auth.uid() OR
        invitee_email = auth.jwt()->>'email'
    );

-- Re-enable RLS
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_invitations ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS household_members_user_id_idx ON public.household_members(user_id);
CREATE INDEX IF NOT EXISTS household_members_household_id_idx ON public.household_members(household_id);
CREATE INDEX IF NOT EXISTS household_invitations_token_idx ON public.household_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS household_invitations_email_idx ON public.household_invitations(invitee_email);

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_household_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.household_invitations
    WHERE status = 'pending'
    AND expires_at < now();
END;
$$; 