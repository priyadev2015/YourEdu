-- Delete User By ID
-- This SQL script deletes a user and all their related data from Supabase
-- Replace :user_id with the actual UUID of the user you want to delete
-- Example usage: 
-- Replace :user_id with '784c53d5-c696-4881-942b-09246277f0bd'

BEGIN;

-- First delete from group_members to handle foreign key constraint
DELETE FROM public.group_members 
WHERE user_id = :user_id;

-- Delete from account_profiles to handle foreign key constraint
DELETE FROM public.account_profiles 
WHERE id = :user_id;

-- Remove any identities
DELETE FROM auth.identities 
WHERE user_id = :user_id;

-- Remove any sessions
DELETE FROM auth.sessions 
WHERE user_id = :user_id;

-- Remove any refresh tokens
DELETE FROM auth.refresh_tokens 
WHERE user_id = :user_id;

-- Finally remove the user
DELETE FROM auth.users 
WHERE id = :user_id;

COMMIT;

-- Note: This script assumes the following:
-- 1. The user might be a member of groups (group_members table)
-- 2. The user has an entry in public.account_profiles
-- 3. The user might have entries in auth.identities, auth.sessions, and auth.refresh_tokens
-- 4. Tables use either 'id' or 'user_id' as the reference to the user
-- 
-- If deletion fails, check for additional foreign key constraints in other tables
-- that might need to be deleted first. 