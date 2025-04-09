-- Add user_type and metadata columns to account_profiles
ALTER TABLE public.account_profiles
ADD COLUMN IF NOT EXISTS user_type text,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb; 