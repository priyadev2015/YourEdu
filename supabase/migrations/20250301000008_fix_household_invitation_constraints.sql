-- Fix household invitation constraints to allow re-inviting after cancellation

-- First, check if there's a unique constraint on household_invitations for household_id and invitee_email
DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE c.conname LIKE '%household_invitations%email%'
        AND n.nspname = 'public'
    ) INTO constraint_exists;

    IF constraint_exists THEN
        RAISE NOTICE 'Found unique constraint on household_invitations table. Dropping it...';
        
        -- Drop the constraint (we'll use a dynamic approach since we don't know the exact name)
        EXECUTE (
            SELECT 'ALTER TABLE public.household_invitations DROP CONSTRAINT ' || c.conname
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE c.conname LIKE '%household_invitations%email%'
            AND n.nspname = 'public'
            LIMIT 1
        );
        
        RAISE NOTICE 'Constraint dropped successfully.';
    ELSE
        RAISE NOTICE 'No unique constraint found on household_invitations table for email.';
    END IF;
END $$;

-- Create a new unique constraint that includes the status column
-- This allows multiple invitations to the same email as long as they have different statuses
DO $$
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE c.conname = 'household_invitations_household_email_status_unique'
        AND n.nspname = 'public'
    ) THEN
        -- Create the constraint
        ALTER TABLE public.household_invitations
        ADD CONSTRAINT household_invitations_household_email_status_unique
        UNIQUE (household_id, invitee_email, status);
        
        RAISE NOTICE 'Created new unique constraint that includes status column.';
    ELSE
        RAISE NOTICE 'The constraint household_invitations_household_email_status_unique already exists.';
    END IF;
END $$;

-- Update RLS policy for household_invitations to ensure proper access
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Household members can view invitations" ON public.household_invitations;
    DROP POLICY IF EXISTS "Primary account can manage invitations" ON public.household_invitations;
    
    -- Create new policies
    CREATE POLICY "Household members can view invitations"
    ON public.household_invitations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.household_members
            WHERE household_members.household_id = household_invitations.household_id
            AND household_members.user_id = auth.uid()
            AND household_members.status = 'active'
        )
    );
    
    CREATE POLICY "Primary account can manage invitations"
    ON public.household_invitations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.households
            WHERE households.id = household_invitations.household_id
            AND households.primary_account_id = auth.uid()
        )
    );
    
    RAISE NOTICE 'Updated RLS policies for household_invitations table.';
END $$; 