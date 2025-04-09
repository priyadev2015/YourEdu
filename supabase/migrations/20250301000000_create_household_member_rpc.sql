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