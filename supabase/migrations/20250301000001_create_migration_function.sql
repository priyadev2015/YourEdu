-- Create a function to migrate existing accounts to have the 'parent' user type
CREATE OR REPLACE FUNCTION public.migrate_user_types_to_parent()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update accounts without a user_type to have 'parent' user_type
  UPDATE account_profiles
  SET user_type = 'parent'
  WHERE user_type IS NULL OR user_type = '';
  
  -- Get the count of accounts with 'parent' user_type
  SELECT COUNT(*) INTO updated_count FROM account_profiles WHERE user_type = 'parent';
  
  RETURN updated_count;
END;
$$; 