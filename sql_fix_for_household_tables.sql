-- Fix household tables and RLS policies

-- First, drop existing tables if they exist
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
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
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

-- Create simplified policies for households
CREATE POLICY "Anyone can view households"
ON public.households FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own households"
ON public.households FOR INSERT
WITH CHECK (auth.uid() = primary_account_id);

CREATE POLICY "Users can update their own households"
ON public.households FOR UPDATE
USING (auth.uid() = primary_account_id);

-- Create simplified policies for household_members
CREATE POLICY "Anyone can view household members"
ON public.household_members FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert household members"
ON public.household_members FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update household members"
ON public.household_members FOR UPDATE
USING (true);

-- Create simplified policies for household_invitations
CREATE POLICY "Anyone can view household invitations"
ON public.household_invitations FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert household invitations"
ON public.household_invitations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update household invitations"
ON public.household_invitations FOR UPDATE
USING (true);

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

-- Create a function to handle inserting household members from invitations
CREATE OR REPLACE FUNCTION public.insert_household_member_from_invitation(
  p_user_id UUID,
  p_household_id UUID,
  p_member_type TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_existing_member UUID;
  v_is_primary BOOLEAN;
BEGIN
  -- Check if the user is already a member of this household
  SELECT id INTO v_existing_member
  FROM household_members
  WHERE user_id = p_user_id AND household_id = p_household_id;
  
  -- If already a member, return success with existing info
  IF v_existing_member IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'User is already a member of this household',
      'member_id', v_existing_member
    );
  END IF;
  
  -- Determine if this should be the primary account
  -- Only the first parent in a household is set as primary
  v_is_primary := false;
  
  IF p_member_type = 'parent' THEN
    -- Check if there are any existing parent members
    IF NOT EXISTS (
      SELECT 1 FROM household_members 
      WHERE household_id = p_household_id AND member_type = 'parent'
    ) THEN
      v_is_primary := true;
    END IF;
  END IF;
  
  -- Insert the new household member
  INSERT INTO household_members (
    household_id,
    user_id,
    member_type,
    is_primary
  )
  VALUES (
    p_household_id,
    p_user_id,
    p_member_type,
    v_is_primary
  )
  RETURNING id INTO v_existing_member;
  
  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User added to household successfully',
    'member_id', v_existing_member,
    'is_primary', v_is_primary
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM,
    'error_code', SQLSTATE
  );
END;
$$;

-- Create a function to ensure a household exists for a user
CREATE OR REPLACE FUNCTION public.ensure_household_exists(
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_household_id UUID;
  v_user_name TEXT;
  v_household_name TEXT;
BEGIN
  -- Check if user already has a household as primary account
  SELECT id INTO v_household_id
  FROM households
  WHERE primary_account_id = p_user_id
  LIMIT 1;
  
  -- If household exists, return its ID
  IF v_household_id IS NOT NULL THEN
    RETURN v_household_id;
  END IF;
  
  -- Check if user is a member of any household
  SELECT household_id INTO v_household_id
  FROM household_members
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;
  
  -- If user is a member of a household, return that household ID
  IF v_household_id IS NOT NULL THEN
    RETURN v_household_id;
  END IF;
  
  -- Get user's name from auth.users metadata
  SELECT COALESCE(
    raw_user_meta_data->>'name',
    raw_user_meta_data->>'full_name',
    'My'
  ) INTO v_user_name
  FROM auth.users
  WHERE id = p_user_id;
  
  -- Create household name
  v_household_name := v_user_name || '''s Family';
  
  -- Create a new household
  INSERT INTO households (
    name,
    primary_account_id
  )
  VALUES (
    v_household_name,
    p_user_id
  )
  RETURNING id INTO v_household_id;
  
  -- Create a household member record for the primary account
  INSERT INTO household_members (
    household_id,
    user_id,
    member_type,
    is_primary,
    status
  )
  VALUES (
    v_household_id,
    p_user_id,
    'parent',
    true,
    'active'
  );
  
  RETURN v_household_id;
  
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Failed to create or find household: %', SQLERRM;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_household_tables TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_household_member_from_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_household_exists TO authenticated; 