-- Update existing accounts to have the 'parent' user type if they don't already have one
UPDATE account_profiles
SET user_type = 'parent'
WHERE user_type IS NULL OR user_type = '';

-- Log the migration in the console
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count FROM account_profiles WHERE user_type = 'parent';
  RAISE NOTICE 'Updated % accounts to have parent user_type', updated_count;
END $$; 