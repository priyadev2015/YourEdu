-- Fix student invitation handling by creating a function to check household_invitations

-- Create a function to verify student invitations
CREATE OR REPLACE FUNCTION public.verify_student_invitation(
  p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
  v_household RECORD;
  v_result JSONB;
BEGIN
  -- Check if the invitation exists in household_invitations
  SELECT * INTO v_invitation
  FROM household_invitations
  WHERE invitation_token = p_token
  AND status = 'pending'
  AND expires_at > NOW();
  
  IF v_invitation IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invitation not found or has expired'
    );
  END IF;
  
  -- Get household information
  SELECT * INTO v_household
  FROM households
  WHERE id = v_invitation.household_id;
  
  IF v_household IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Household not found'
    );
  END IF;
  
  -- Return the invitation data
  RETURN jsonb_build_object(
    'success', true,
    'invitation', jsonb_build_object(
      'id', v_invitation.id,
      'household_id', v_invitation.household_id,
      'inviter_id', v_invitation.inviter_id,
      'invitee_email', v_invitation.invitee_email,
      'invitee_name', v_invitation.invitee_name,
      'member_type', v_invitation.member_type,
      'invitation_token', v_invitation.invitation_token,
      'status', v_invitation.status,
      'created_at', v_invitation.created_at,
      'expires_at', v_invitation.expires_at,
      'household_name', v_household.name,
      'primary_account_id', v_household.primary_account_id
    )
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM,
    'error_code', SQLSTATE
  );
END;
$$;

-- Create a function to accept a student invitation
CREATE OR REPLACE FUNCTION public.accept_student_invitation(
  p_token TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
  v_result JSONB;
BEGIN
  -- Check if the invitation exists
  SELECT * INTO v_invitation
  FROM household_invitations
  WHERE invitation_token = p_token
  AND status = 'pending'
  AND expires_at > NOW();
  
  IF v_invitation IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invitation not found or has expired'
    );
  END IF;
  
  -- Update the invitation status
  UPDATE household_invitations
  SET status = 'accepted',
      accepted_at = NOW()
  WHERE id = v_invitation.id;
  
  -- Add the user to the household
  INSERT INTO household_members (
    household_id,
    user_id,
    member_type,
    is_primary,
    status
  )
  VALUES (
    v_invitation.household_id,
    p_user_id,
    v_invitation.member_type,
    false,
    'active'
  );
  
  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Invitation accepted successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM,
    'error_code', SQLSTATE
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.verify_student_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_student_invitation TO anon;
GRANT EXECUTE ON FUNCTION public.accept_student_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_student_invitation TO anon; 