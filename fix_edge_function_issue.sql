-- Fix the issue with the Edge Function for sending invitations

-- First, check if the SITE_URL environment variable is set for the Edge Function
DO $$
DECLARE
    v_function_id TEXT;
    v_env_vars JSONB;
BEGIN
    -- Get the function ID for send-student-invitation
    SELECT id INTO v_function_id
    FROM supabase_functions.functions
    WHERE name = 'send-student-invitation';
    
    IF v_function_id IS NULL THEN
        RAISE NOTICE 'Function send-student-invitation not found. Please make sure it exists.';
        RETURN;
    END IF;
    
    -- Get the current environment variables
    SELECT env INTO v_env_vars
    FROM supabase_functions.secrets
    WHERE function_id = v_function_id;
    
    -- Check if SITE_URL is set
    IF v_env_vars IS NULL OR NOT v_env_vars ? 'SITE_URL' THEN
        RAISE NOTICE 'SITE_URL environment variable is not set for the send-student-invitation function.';
        RAISE NOTICE 'Please set it manually in the Supabase Dashboard:';
        RAISE NOTICE '1. Go to Edge Functions';
        RAISE NOTICE '2. Click on send-student-invitation';
        RAISE NOTICE '3. Add environment variable SITE_URL with value https://app.youredu.school';
    ELSE
        RAISE NOTICE 'SITE_URL environment variable is already set for the send-student-invitation function.';
    END IF;
END $$;