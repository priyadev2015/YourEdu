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
GRANT EXECUTE ON FUNCTION public.ensure_household_exists TO authenticated; 