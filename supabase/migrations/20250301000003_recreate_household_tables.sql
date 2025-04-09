-- Drop existing household tables if they exist
DROP TABLE IF EXISTS public.household_invitations CASCADE;
DROP TABLE IF EXISTS public.household_members CASCADE;
DROP TABLE IF EXISTS public.households CASCADE;

-- Create the tables from scratch
CREATE TABLE IF NOT EXISTS public.households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  primary_account_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.household_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_type TEXT NOT NULL CHECK (member_type IN ('parent', 'student')),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.household_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_name TEXT,
  member_type TEXT NOT NULL CHECK (member_type IN ('parent', 'student')),
  invitation_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Create a unique index for pending invitations
CREATE UNIQUE INDEX IF NOT EXISTS idx_pending_invitations 
ON public.household_invitations (household_id, invitee_email) 
WHERE status = 'pending';

-- Enable RLS on all tables
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for households
CREATE POLICY "Users can view their own households"
ON public.households FOR SELECT
USING (
  auth.uid() = primary_account_id OR
  EXISTS (
    SELECT 1 FROM household_members
    WHERE household_members.household_id = households.id
    AND household_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own households"
ON public.households FOR INSERT
WITH CHECK (
  auth.uid() = primary_account_id
);

CREATE POLICY "Users can update their own households"
ON public.households FOR UPDATE
USING (
  auth.uid() = primary_account_id OR
  EXISTS (
    SELECT 1 FROM household_members
    WHERE household_members.household_id = households.id
    AND household_members.user_id = auth.uid()
    AND household_members.is_primary = true
  )
);

-- Create policies for household_members
CREATE POLICY "Users can view their household members"
ON public.household_members FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.household_members AS hm
    WHERE hm.household_id = household_members.household_id
    AND hm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert household members"
ON public.household_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.households
    WHERE households.id = household_members.household_id
    AND households.primary_account_id = auth.uid()
  )
);

-- Create policies for household_invitations
CREATE POLICY "Users can view their household invitations"
ON public.household_invitations FOR SELECT
USING (
  inviter_id = auth.uid() OR
  invitee_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_members.household_id = household_invitations.household_id
    AND household_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert household invitations"
ON public.household_invitations FOR INSERT
WITH CHECK (
  inviter_id = auth.uid()
);

CREATE POLICY "Users can update their invitations"
ON public.household_invitations FOR UPDATE
USING (
  inviter_id = auth.uid() OR
  invitee_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

-- Create a function to create household tables if they don't exist
CREATE OR REPLACE FUNCTION public.create_household_tables()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Tables are already created by the migration
  RETURN TRUE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_household_tables TO authenticated; 