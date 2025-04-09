-- First run the migration function
SELECT migrate_existing_accounts();

-- Drop old tables and functions
DROP TABLE IF EXISTS public.student_invitations CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_invitations();

-- Clean up account_profiles metadata
ALTER TABLE public.account_profiles
DROP COLUMN IF EXISTS parent_id,
DROP COLUMN IF EXISTS is_primary_parent; 