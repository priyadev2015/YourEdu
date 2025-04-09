-- Fix household data issues

-- First, check for duplicate households for the same user
DO $$
DECLARE
    v_user_id UUID;
    v_household_count INT;
    v_primary_household_id UUID;
    v_duplicate_household_ids UUID[];
BEGIN
    -- Find users with multiple households
    FOR v_user_id IN 
        SELECT primary_account_id 
        FROM households 
        GROUP BY primary_account_id 
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE 'User % has multiple households', v_user_id;
        
        -- Get the count of households for this user
        SELECT COUNT(*), array_agg(id) INTO v_household_count, v_duplicate_household_ids
        FROM households
        WHERE primary_account_id = v_user_id;
        
        -- Keep the first household and delete the others
        v_primary_household_id := v_duplicate_household_ids[1];
        
        RAISE NOTICE 'Keeping household % for user %', v_primary_household_id, v_user_id;
        
        -- Delete duplicate households (this will cascade to members and invitations)
        DELETE FROM households
        WHERE primary_account_id = v_user_id
        AND id != v_primary_household_id;
        
        RAISE NOTICE 'Deleted % duplicate households for user %', v_household_count - 1, v_user_id;
    END LOOP;
END $$;

-- Check for duplicate household_members entries
DO $$
DECLARE
    v_household_id UUID;
    v_user_id UUID;
    v_member_count INT;
    v_primary_member_id UUID;
BEGIN
    -- Find duplicate household_members entries
    FOR v_household_id, v_user_id IN 
        SELECT household_id, user_id
        FROM household_members
        GROUP BY household_id, user_id
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE 'User % has multiple entries in household %', v_user_id, v_household_id;
        
        -- Get the count of entries for this user in this household
        SELECT COUNT(*), MIN(id) INTO v_member_count, v_primary_member_id
        FROM household_members
        WHERE household_id = v_household_id AND user_id = v_user_id;
        
        -- Keep the first entry and delete the others
        DELETE FROM household_members
        WHERE household_id = v_household_id 
        AND user_id = v_user_id
        AND id != v_primary_member_id;
        
        RAISE NOTICE 'Deleted % duplicate entries for user % in household %', 
            v_member_count - 1, v_user_id, v_household_id;
    END LOOP;
END $$;

-- Check for duplicate pending invitations
DO $$
DECLARE
    v_household_id UUID;
    v_email TEXT;
    v_invitation_count INT;
    v_primary_invitation_id UUID;
BEGIN
    -- Find duplicate pending invitations
    FOR v_household_id, v_email IN 
        SELECT household_id, invitee_email
        FROM household_invitations
        WHERE status = 'pending'
        GROUP BY household_id, invitee_email
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE 'Email % has multiple pending invitations in household %', v_email, v_household_id;
        
        -- Get the count of invitations for this email in this household
        SELECT COUNT(*), MIN(id) INTO v_invitation_count, v_primary_invitation_id
        FROM household_invitations
        WHERE household_id = v_household_id 
        AND invitee_email = v_email
        AND status = 'pending';
        
        -- Keep the first invitation and delete the others
        DELETE FROM household_invitations
        WHERE household_id = v_household_id 
        AND invitee_email = v_email
        AND status = 'pending'
        AND id != v_primary_invitation_id;
        
        RAISE NOTICE 'Deleted % duplicate invitations for email % in household %', 
            v_invitation_count - 1, v_email, v_household_id;
    END LOOP;
END $$;

-- Ensure the unique index for pending invitations exists
DO $$
BEGIN
    -- Check if the index exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_pending_invitations'
    ) THEN
        -- Create the index if it doesn't exist
        CREATE UNIQUE INDEX idx_pending_invitations 
        ON public.household_invitations (household_id, invitee_email) 
        WHERE status = 'pending';
        
        RAISE NOTICE 'Created unique index for pending invitations';
    ELSE
        RAISE NOTICE 'Unique index for pending invitations already exists';
    END IF;
END $$;

-- Ensure RLS policies are correctly set up
DO $$
BEGIN
    -- Drop existing policies and recreate them
    DROP POLICY IF EXISTS "Anyone can view households" ON public.households;
    DROP POLICY IF EXISTS "Users can insert their own households" ON public.households;
    DROP POLICY IF EXISTS "Users can update their own households" ON public.households;
    
    CREATE POLICY "Anyone can view households"
    ON public.households FOR SELECT
    USING (true);
    
    CREATE POLICY "Users can insert their own households"
    ON public.households FOR INSERT
    WITH CHECK (auth.uid() = primary_account_id);
    
    CREATE POLICY "Users can update their own households"
    ON public.households FOR UPDATE
    USING (auth.uid() = primary_account_id);
    
    -- Household members policies
    DROP POLICY IF EXISTS "Anyone can view household members" ON public.household_members;
    DROP POLICY IF EXISTS "Anyone can insert household members" ON public.household_members;
    DROP POLICY IF EXISTS "Anyone can update household members" ON public.household_members;
    
    CREATE POLICY "Anyone can view household members"
    ON public.household_members FOR SELECT
    USING (true);
    
    CREATE POLICY "Anyone can insert household members"
    ON public.household_members FOR INSERT
    WITH CHECK (true);
    
    CREATE POLICY "Anyone can update household members"
    ON public.household_members FOR UPDATE
    USING (true);
    
    -- Household invitations policies
    DROP POLICY IF EXISTS "Anyone can view household invitations" ON public.household_invitations;
    DROP POLICY IF EXISTS "Anyone can insert household invitations" ON public.household_invitations;
    DROP POLICY IF EXISTS "Anyone can update household invitations" ON public.household_invitations;
    
    CREATE POLICY "Anyone can view household invitations"
    ON public.household_invitations FOR SELECT
    USING (true);
    
    CREATE POLICY "Anyone can insert household invitations"
    ON public.household_invitations FOR INSERT
    WITH CHECK (true);
    
    CREATE POLICY "Anyone can update household invitations"
    ON public.household_invitations FOR UPDATE
    USING (true);
    
    RAISE NOTICE 'RLS policies have been reset and recreated';
END $$;

-- Ensure the functions are correctly defined
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
GRANT EXECUTE ON FUNCTION public.insert_household_member_from_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_household_exists TO authenticated; 