-- Function to delete all user data
CREATE OR REPLACE FUNCTION delete_user_data(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete all event-related data first
    DELETE FROM public.event_responses WHERE user_id = $1;
    DELETE FROM public.event_invites WHERE inviter_id = $1 OR invitee_id = $1;
    DELETE FROM public.event_registrations WHERE user_id = $1;
    DELETE FROM public.events WHERE host_id = $1;

    -- Delete all post-related data
    DELETE FROM public.post_likes WHERE user_id = $1;
    DELETE FROM public.post_favorites WHERE user_id = $1;
    DELETE FROM public.post_comments WHERE user_id = $1;
    DELETE FROM public.posts WHERE user_id = $1;

    -- Delete all group-related data
    DELETE FROM public.group_members WHERE user_id = $1;
    DELETE FROM public.groups WHERE created_by = $1;

    -- Delete all document-related data
    DELETE FROM public.compliance_documents WHERE user_id = $1;
    DELETE FROM public.documents WHERE user_id = $1;
    DELETE FROM public.folders WHERE user_id = $1;

    -- Delete all education-related data
    DELETE FROM public.course_descriptions WHERE user_id = $1;
    DELETE FROM public.grading_rubrics WHERE user_id = $1;
    DELETE FROM public.guidance_letters WHERE user_id = $1;
    DELETE FROM public.school_philosophies WHERE user_id = $1;

    -- Delete all ledger-related data
    DELETE FROM public.ledger_entry_skills 
    WHERE entry_id IN (SELECT id FROM public.ledger_entries WHERE user_id = $1);
    DELETE FROM public.ledger_entries WHERE user_id = $1;
    DELETE FROM public.ledger_settings WHERE user_id = $1;

    -- Delete all transcript-related data
    DELETE FROM public.courses 
    WHERE transcript_id IN (SELECT id FROM public.transcripts WHERE user_id = $1);
    DELETE FROM public.transcripts WHERE user_id = $1;

    -- Delete ID cards and work permits
    DELETE FROM public.id_cards WHERE user_id = $1;
    DELETE FROM public.work_permits WHERE user_id = $1;

    -- Delete storage objects
    DELETE FROM storage.objects 
    WHERE bucket_id = 'profile-photos' 
    AND name LIKE $1 || '/%';

    DELETE FROM storage.objects 
    WHERE bucket_id = 'ledger-images' 
    AND owner = $1;

    DELETE FROM storage.objects 
    WHERE bucket_id = 'id-cards' 
    AND name LIKE $1 || '/%';

    -- Delete profile data last
    DELETE FROM public.account_profiles WHERE id = $1;
    DELETE FROM public.profiles WHERE id = $1;

    -- Notify of completion
    RAISE NOTICE 'Successfully deleted all data for user %', $1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_data(UUID) TO authenticated;

-- Add cascade delete triggers where needed
DO $$ 
BEGIN
    -- Add cascade delete for events
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'events_host_id_fkey_cascade'
    ) THEN
        ALTER TABLE public.events
        DROP CONSTRAINT IF EXISTS events_host_id_fkey,
        ADD CONSTRAINT events_host_id_fkey_cascade
        FOREIGN KEY (host_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;

    -- Add cascade delete for event_responses
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'event_responses_user_id_fkey_cascade'
    ) THEN
        ALTER TABLE public.event_responses
        DROP CONSTRAINT IF EXISTS event_responses_user_id_fkey,
        ADD CONSTRAINT event_responses_user_id_fkey_cascade
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;

    -- Add cascade delete for profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey_cascade'
    ) THEN
        ALTER TABLE public.profiles
        DROP CONSTRAINT IF EXISTS profiles_id_fkey,
        ADD CONSTRAINT profiles_id_fkey_cascade
        FOREIGN KEY (id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$; 