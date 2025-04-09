-- Create a function to update password hashes directly
CREATE OR REPLACE FUNCTION public.update_user_password_hash(user_email TEXT, hashed_password TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE auth.users
  SET 
    encrypted_password = hashed_password,
    raw_app_meta_data = raw_app_meta_data || 
      jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
      ),
    raw_user_meta_data = raw_user_meta_data || 
      jsonb_build_object(
        'email_verified', true
      ),
    updated_at = NOW(),
    is_sso_user = false,
    email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE email = user_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_password_hash(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_password_hash(TEXT, TEXT) TO service_role; 