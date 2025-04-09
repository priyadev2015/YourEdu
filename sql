

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "app_settings";


ALTER SCHEMA "app_settings" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."document_category" AS ENUM (
    'attendance',
    'curriculum',
    'assessments',
    'legal',
    'other'
);


ALTER TYPE "public"."document_category" OWNER TO "postgres";


CREATE TYPE "public"."material_status" AS ENUM (
    'draft',
    'published',
    'archived'
);


ALTER TYPE "public"."material_status" OWNER TO "postgres";


CREATE TYPE "public"."notification_priority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE "public"."notification_priority" OWNER TO "postgres";


CREATE TYPE "public"."notification_source" AS ENUM (
    'YOUREDU_ADMIN',
    'SYSTEM'
);


ALTER TYPE "public"."notification_source" OWNER TO "postgres";


CREATE TYPE "public"."user_type" AS ENUM (
    'student',
    'parent',
    'admin'
);


ALTER TYPE "public"."user_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app_settings"."get_secret"("setting_key" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (SELECT value FROM app_settings.secrets WHERE key = setting_key);
END;
$$;


ALTER FUNCTION "app_settings"."get_secret"("setting_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_household_invitations"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    DELETE FROM public.household_invitations
    WHERE status = 'pending'
    AND expires_at < now();
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_household_invitations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_folders"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO folders (user_id, name, category, is_default)
    VALUES
        (NEW.id, 'Attendance Records', 'attendance'::document_category, true),
        (NEW.id, 'Curriculum Plans', 'curriculum'::document_category, true),
        (NEW.id, 'Assessments', 'assessments'::document_category, true),
        (NEW.id, 'Legal Documents', 'legal'::document_category, true),
        (NEW.id, 'Other', 'other'::document_category, true);
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error details
    RAISE NOTICE 'Error creating default folders: %', SQLERRM;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_default_folders"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_comment_count"("post_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE posts
    SET comment_count = GREATEST(0, comment_count - 1)
    WHERE id = post_id;
END;
$$;


ALTER FUNCTION "public"."decrement_comment_count"("post_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_like_count"("post_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE posts
    SET like_count = GREATEST(0, like_count - 1)
    WHERE id = post_id;
END;
$$;


ALTER FUNCTION "public"."decrement_like_count"("post_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user_data"("user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
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
$_$;


ALTER FUNCTION "public"."delete_user_data"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user_account"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.account_profiles (id, name, email, account_type, account_status, interests)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'Parent',
    'Active',
    '{}'::TEXT[]
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user_account"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_comment_count"("post_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE posts
    SET comment_count = comment_count + 1
    WHERE id = post_id;
END;
$$;


ALTER FUNCTION "public"."increment_comment_count"("post_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_like_count"("post_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE posts
    SET like_count = like_count + 1
    WHERE id = post_id;
END;
$$;


ALTER FUNCTION "public"."increment_like_count"("post_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."initialize_transcript_defaults"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.cumulative_summary IS NULL THEN
        NEW.cumulative_summary := '{
            "totalCredits": "0",
            "gpaCredits": "0",
            "gpaPoints": "0",
            "cumulativeGPA": "0",
            "weightedGPA": null
        }'::jsonb;
    END IF;
    IF NEW.grading_scale IS NULL THEN
        NEW.grading_scale := '{"show": false}'::jsonb;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."initialize_transcript_defaults"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_household_member_from_invitation"("p_user_id" "uuid", "p_household_id" "uuid", "p_member_type" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_invitation_exists boolean;
    v_new_member_id uuid;
BEGIN
    -- Check if there's a valid invitation
    SELECT EXISTS (
        SELECT 1 
        FROM household_invitations hi
        WHERE hi.household_id = p_household_id
        AND hi.status = 'pending'
        AND hi.invitee_email = (
            SELECT email 
            FROM auth.users 
            WHERE id = p_user_id
        )
        AND hi.member_type = p_member_type
    ) INTO v_invitation_exists;

    IF NOT v_invitation_exists THEN
        RAISE EXCEPTION 'No valid invitation found';
    END IF;

    -- Insert the new member
    INSERT INTO household_members (
        user_id,
        household_id,
        member_type,
        status
    ) VALUES (
        p_user_id,
        p_household_id,
        p_member_type,
        'active'
    )
    RETURNING id INTO v_new_member_id;

    RETURN v_new_member_id;
END;
$$;


ALTER FUNCTION "public"."insert_household_member_from_invitation"("p_user_id" "uuid", "p_household_id" "uuid", "p_member_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."migrate_existing_accounts"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    account RECORD;
    new_household_id UUID;
BEGIN
    -- For each primary parent account
    FOR account IN 
        SELECT * FROM account_profiles 
        WHERE user_type = 'parent' 
        AND (metadata->>'is_primary_parent')::boolean = true
    LOOP
        -- Create a household
        INSERT INTO households (primary_account_id, name)
        VALUES (account.id, account.name || '''s Household')
        RETURNING id INTO new_household_id;

        -- Add primary parent as household member
        INSERT INTO household_members (household_id, user_id, member_type)
        VALUES (new_household_id, account.id, 'primary');

        -- Migrate linked students
        INSERT INTO household_members (household_id, user_id, member_type, metadata)
        SELECT 
            new_household_id,
            id,
            'student',
            metadata
        FROM account_profiles
        WHERE account_type = 'student'
        AND metadata->>'parent_id' = account.id::text;

        -- Migrate pending invitations
        INSERT INTO household_invitations (
            household_id,
            inviter_id,
            invitee_email,
            invitee_name,
            member_type,
            status,
            invitation_token,
            expires_at,
            metadata
        )
        SELECT 
            new_household_id,
            parent_id,
            student_email,
            student_name,
            'student',
            status,
            invitation_token,
            expires_at,
            metadata
        FROM student_invitations
        WHERE parent_id = account.id
        AND status = 'pending';
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."migrate_existing_accounts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_household_access"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY household_access;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."refresh_household_access"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_email"("to_email" "text", "subject" "text", "html_content" "text", "from_email" "text" DEFAULT 'colin@youredu.school'::"text", "from_name" "text" DEFAULT 'YourEDU'::"text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://api.sendgrid.com/v3/mail/send',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || app_settings.get_secret('sendgrid_api_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'personalizations', jsonb_build_array(
        jsonb_build_object(
          'to', jsonb_build_array(jsonb_build_object('email', to_email))
        )
      ),
      'from', jsonb_build_object(
        'email', from_email,
        'name', from_name
      ),
      'subject', subject,
      'content', jsonb_build_array(
        jsonb_build_object(
          'type', 'text/html',
          'value', html_content
        )
      )
    )
  );
  
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;


ALTER FUNCTION "public"."send_email"("to_email" "text", "subject" "text", "html_content" "text", "from_email" "text", "from_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_claim"("claim" "text", "value" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', 
    json_build_object(claim, value)::text,
    true);
END;
$$;


ALTER FUNCTION "public"."set_claim"("claim" "text", "value" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_chat_conversation_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.chat_conversations 
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_chat_conversation_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_event_attendees"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.events
        SET current_attendees = current_attendees + 1
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.events
        SET current_attendees = current_attendees - 1
        WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_event_attendees"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_password_hash"("user_email" "text", "password_hash" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Update the encrypted_password field directly
  UPDATE auth.users
  SET 
    encrypted_password = password_hash,
    email_confirmed_at = NOW(),  -- Ensure email is confirmed
    confirmed_at = NOW(),        -- Ensure account is confirmed
    updated_at = NOW()
  WHERE email = user_email;
END;
$$;


ALTER FUNCTION "public"."update_password_hash"("user_email" "text", "password_hash" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_password_hash"("user_email" "text", "hashed_password" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
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


ALTER FUNCTION "public"."update_user_password_hash"("user_email" "text", "hashed_password" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "app_settings"."secrets" (
    "key" "text" NOT NULL,
    "value" "text" NOT NULL
);


ALTER TABLE "app_settings"."secrets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."account_profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "email" "text",
    "age" integer,
    "education_level" "text",
    "street_address" "text",
    "city" "text",
    "state" "text",
    "zip" "text",
    "timezone" "text",
    "phone_number" "text",
    "profile_picture" "text",
    "account_type" "text" DEFAULT 'Parent'::"text",
    "account_status" "text" DEFAULT 'Active'::"text",
    "interests" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "years_homeschooling" integer,
    "user_type" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "sierra_college_id" "text",
    "first_name" character varying(255),
    "last_name" character varying(255)
);


ALTER TABLE "public"."account_profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."account_profiles"."sierra_college_id" IS 'Student ID number for Sierra College';



CREATE TABLE IF NOT EXISTS "public"."assignment_submissions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "assignment_id" "uuid",
    "student_id" "uuid",
    "status" "text" DEFAULT 'submitted'::"text" NOT NULL,
    "files" "text"[],
    "comment" "text",
    "grade" numeric,
    "feedback" "text",
    "graded_by" "uuid",
    "graded_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "file_details" "jsonb"
);


ALTER TABLE "public"."assignment_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_id" "uuid",
    "creator_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "due_date" timestamp with time zone,
    "submission_type" "text" NOT NULL,
    "max_points" integer DEFAULT 100,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."attendance_records" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "student_id" "uuid",
    "date" "date" NOT NULL,
    "status" "text" DEFAULT 'not_marked'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "attendance_records_status_check" CHECK (("status" = ANY (ARRAY['present'::"text", 'absent'::"text", 'not_marked'::"text"])))
);


ALTER TABLE "public"."attendance_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."california_psa" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "is_full_time_private" "text",
    "previously_filed" "text",
    "school_name" "text" NOT NULL,
    "cds_code" "text",
    "county" "text",
    "district" "text",
    "school_type" "text",
    "accommodations" "text",
    "special_education" "text",
    "high_school_diploma" "text",
    "low_grade" "text",
    "high_grade" "text",
    "classification" "text",
    "physical_street" "text",
    "physical_city" "text",
    "physical_state" "text",
    "physical_zip" "text",
    "physical_zip4" "text",
    "use_physical_for_mailing" boolean,
    "mailing_street" "text",
    "mailing_city" "text",
    "mailing_state" "text",
    "mailing_zip" "text",
    "mailing_zip4" "text",
    "phone" "text",
    "fax_number" "text",
    "primary_email" "text",
    "website" "text",
    "name_changed" "text",
    "previous_name" "text",
    "district_changed" "text",
    "previous_district" "text",
    "youngest_years" "text",
    "youngest_months" "text",
    "oldest_years" "text",
    "enrollment" "jsonb",
    "previous_year_graduates" "text",
    "full_time_teachers" "text",
    "part_time_teachers" "text",
    "administrators" "text",
    "other_staff" "text",
    "site_admin_salutation" "text",
    "site_admin_first_name" "text",
    "site_admin_last_name" "text",
    "site_admin_title" "text",
    "site_admin_phone" "text",
    "site_admin_extension" "text",
    "site_admin_email" "text",
    "site_admin_street" "text",
    "site_admin_city" "text",
    "site_admin_state" "text",
    "site_admin_zip" "text",
    "site_admin_zip4" "text",
    "use_site_admin_for_director" boolean,
    "director_salutation" "text",
    "director_first_name" "text",
    "director_last_name" "text",
    "director_position" "text",
    "director_phone" "text",
    "director_extension" "text",
    "director_email" "text",
    "director_street" "text",
    "director_city" "text",
    "director_state" "text",
    "director_zip" "text",
    "director_zip4" "text",
    "custodian_salutation" "text",
    "custodian_first_name" "text",
    "custodian_last_name" "text",
    "custodian_title" "text",
    "custodian_phone" "text",
    "custodian_extension" "text",
    "custodian_street" "text",
    "custodian_city" "text",
    "custodian_state" "text",
    "custodian_zip" "text",
    "custodian_zip4" "text",
    "use_custodian_address" boolean,
    "records_street" "text",
    "records_city" "text",
    "records_state" "text",
    "records_zip" "text",
    "records_zip4" "text",
    "records_acknowledgment" boolean,
    "tax_status" "jsonb",
    "statutory_acknowledgment" boolean,
    "submitted_at" timestamp with time zone,
    "user_id" "uuid",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "signature" "text",
    "signature_date" "date",
    "status" "text" DEFAULT 'draft'::"text"
);


ALTER TABLE "public"."california_psa" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "course_id" "text" NOT NULL,
    "course_type" "text" NOT NULL,
    "crn" "text",
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "price" numeric(10,2) DEFAULT 0 NOT NULL,
    "discount" numeric(10,2) DEFAULT 0 NOT NULL,
    "college" "text" NOT NULL,
    "saved_for_later" boolean DEFAULT false NOT NULL,
    CONSTRAINT "cart_items_course_type_check" CHECK (("course_type" = ANY (ARRAY['college'::"text", 'youredu'::"text"])))
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_conversations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."chat_conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "chat_messages_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'assistant'::"text"])))
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."college_courses" (
    "code" "text" NOT NULL,
    "department_code" "text",
    "course_number" "text",
    "title" "text",
    "description" "text",
    "units" double precision,
    "lecture_hours" integer,
    "lab_hours" integer,
    "total_hours" integer,
    "prerequisites" "text",
    "advisory" "text",
    "department_name" "text",
    "hs_subject" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "college" "text",
    "igetc" "text"
);


ALTER TABLE "public"."college_courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."college_courses_schedules" (
    "id" integer NOT NULL,
    "college" "text" NOT NULL,
    "course_code" "text" NOT NULL,
    "course_name" "text" NOT NULL,
    "extra_notes" "text",
    "crn" "text" NOT NULL,
    "status" "text" NOT NULL,
    "credits" double precision,
    "weeks" integer,
    "max_students" integer,
    "enrolled" integer,
    "waitlisted" integer,
    "instructor" "text",
    "textbook_cost" "text",
    "section_dates" "text"[],
    "section_times" "text"[],
    "section_locations" "text"[],
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "term" "text" NOT NULL,
    "year" integer,
    "term_duration" "text",
    "price" numeric(10,2) DEFAULT 0 NOT NULL,
    "discount" numeric(10,2) DEFAULT 0 NOT NULL,
    "teacher_link" "text"
);


ALTER TABLE "public"."college_courses_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."college_courses_schedules_backup" (
    "id" integer,
    "college" "text",
    "course_code" "text",
    "course_name" "text",
    "extra_notes" "text",
    "crn" "text",
    "status" "text",
    "credits" double precision,
    "weeks" integer,
    "max_students" integer,
    "enrolled" integer,
    "waitlisted" integer,
    "instructor" "text",
    "textbook_cost" "text",
    "section_dates" "text"[],
    "section_times" "text"[],
    "section_locations" "text"[],
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "term" "text",
    "year" integer,
    "term_duration" "text",
    "price" numeric(10,2),
    "discount" numeric(10,2),
    "teacher_link" "text"
);


ALTER TABLE "public"."college_courses_schedules_backup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compliance_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "state" "text" NOT NULL,
    "document_type" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "emailed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."compliance_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_assignments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "course_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "type" "text" NOT NULL,
    "due_date" timestamp with time zone,
    "points" integer,
    "instructions" "text",
    "attachments" "text"[],
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."course_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_attendance" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "student_name" "text" NOT NULL,
    "date" "date" NOT NULL,
    "status" "text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."course_attendance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_descriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "pre_high_school" "jsonb" DEFAULT '[]'::"jsonb",
    "freshman" "jsonb" DEFAULT '[]'::"jsonb",
    "sophomore" "jsonb" DEFAULT '[]'::"jsonb",
    "junior" "jsonb" DEFAULT '[]'::"jsonb",
    "senior" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."course_descriptions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."course_descriptions"."pre_high_school" IS 'Array of course objects with fields: courseTitle, instruction_method, textbooks, materials, evaluation_method, description';



COMMENT ON COLUMN "public"."course_descriptions"."freshman" IS 'Array of course objects with fields: courseTitle, instruction_method, textbooks, materials, evaluation_method, description';



COMMENT ON COLUMN "public"."course_descriptions"."sophomore" IS 'Array of course objects with fields: courseTitle, instruction_method, textbooks, materials, evaluation_method, description';



COMMENT ON COLUMN "public"."course_descriptions"."junior" IS 'Array of course objects with fields: courseTitle, instruction_method, textbooks, materials, evaluation_method, description';



COMMENT ON COLUMN "public"."course_descriptions"."senior" IS 'Array of course objects with fields: courseTitle, instruction_method, textbooks, materials, evaluation_method, description';



CREATE TABLE IF NOT EXISTS "public"."course_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "category" "text" NOT NULL,
    "name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "size_kb" integer NOT NULL,
    "mime_type" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "course_files_category_check" CHECK (("category" = ANY (ARRAY['materials'::"text", 'textbooks'::"text", 'assignments'::"text", 'syllabus'::"text", 'records'::"text", 'transcripts'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."course_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_materials" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "course_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "file_size" integer NOT NULL,
    "public_url" "text",
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."course_materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_notes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."course_notes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."course_offerings" AS
 SELECT COALESCE("c"."code", "cs"."course_code") AS "course_code",
    COALESCE("c"."college", "cs"."college") AS "college",
    "c"."title",
    "c"."description",
    "c"."units",
    "c"."total_hours",
    "c"."prerequisites",
    "c"."advisory",
    "c"."hs_subject",
    "cs"."extra_notes",
    "cs"."crn",
    "cs"."status",
    "cs"."weeks",
    "cs"."max_students",
    "cs"."enrolled",
    "cs"."waitlisted",
    "cs"."instructor",
    "cs"."term",
    "cs"."section_dates",
    "cs"."section_times",
    "cs"."section_locations"
   FROM ("public"."college_courses" "c"
     FULL JOIN "public"."college_courses_schedules" "cs" ON ((("c"."code" = "cs"."course_code") AND ("c"."college" = "cs"."college"))))
  WHERE (("c"."title" IS NOT NULL) AND ("cs"."crn" IS NOT NULL));


ALTER TABLE "public"."course_offerings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_todos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "due_date" timestamp with time zone,
    "completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."course_todos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "transcript_id" "uuid" NOT NULL,
    "grade_level" "text" NOT NULL,
    "method" "text",
    "course_title" "text",
    "term1_grade" "text",
    "term2_grade" "text",
    "term3_grade" "text",
    "credits" "text",
    "ap_score" "text",
    "sort_order" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "courses_grade_level_check" CHECK (("grade_level" = ANY (ARRAY['preHighSchool'::"text", 'freshman'::"text", 'sophomore'::"text", 'junior'::"text", 'senior'::"text"])))
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."courseschedules_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."courseschedules_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."courseschedules_id_seq" OWNED BY "public"."college_courses_schedules"."id";



CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "folder_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "size_kb" integer NOT NULL,
    "mime_type" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_invites" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "event_id" "uuid",
    "inviter_id" "uuid",
    "invitee_id" "uuid",
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "event_invites_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text"])))
);


ALTER TABLE "public"."event_invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_registrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."event_registrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_responses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "event_id" "uuid",
    "user_id" "uuid",
    "response_type" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "event_responses_response_type_check" CHECK (("response_type" = ANY (ARRAY['going'::"text", 'interested'::"text"])))
);


ALTER TABLE "public"."event_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."folders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "category" "public"."document_category" NOT NULL,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."folders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."four_year_plans" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "course_positions" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."four_year_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."grading_rubrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "evaluation_method" "text",
    "learning_goals" "text",
    "assignments" "text",
    "grading_scale" "jsonb" DEFAULT '{"A": "", "B": "", "C": "", "D": "", "F": "", "A+": "", "A-": "", "B+": "", "B-": "", "C+": "", "C-": "", "D+": "", "D-": ""}'::"jsonb",
    "ai_grading_scale" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."grading_rubrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."group_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_posts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."group_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "privacy" "text" DEFAULT 'private'::"text" NOT NULL,
    "profile_image" "text",
    "landscape_image" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_by" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."household_invitations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "household_id" "uuid",
    "inviter_id" "uuid",
    "invitee_email" "text" NOT NULL,
    "invitee_name" "text" NOT NULL,
    "member_type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "invitation_token" "uuid" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "accepted_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "household_invitations_member_type_check" CHECK (("member_type" = ANY (ARRAY['parent'::"text", 'student'::"text"])))
);


ALTER TABLE "public"."household_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."household_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "household_id" "uuid",
    "user_id" "uuid",
    "member_type" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "household_members_member_type_check" CHECK (("member_type" = ANY (ARRAY['primary'::"text", 'parent'::"text", 'student'::"text"])))
);


ALTER TABLE "public"."household_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."households" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "primary_account_id" "uuid" NOT NULL,
    "name" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."households" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."id_cards" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "grade" "text",
    "school_name" "text" NOT NULL,
    "school_logo_url" "text",
    "school_address" "text" NOT NULL,
    "school_phone" "text" NOT NULL,
    "photo_url" "text",
    "expiration_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "id_cards_type_check" CHECK (("type" = ANY (ARRAY['student'::"text", 'teacher'::"text", 'membership'::"text"])))
);


ALTER TABLE "public"."id_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ledger_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" character varying NOT NULL,
    "title" character varying NOT NULL,
    "description" "text",
    "date" "date" NOT NULL,
    "evidence_url" "text",
    "verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "image_url" "text",
    CONSTRAINT "ledger_entries_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['achievement'::character varying, 'project'::character varying, 'certification'::character varying, 'skill'::character varying, 'course'::character varying, 'research'::character varying, 'art'::character varying, 'language'::character varying, 'innovation'::character varying])::"text"[])))
);


ALTER TABLE "public"."ledger_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ledger_entry_skills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entry_id" "uuid" NOT NULL,
    "skill" character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ledger_entry_skills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ledger_settings" (
    "user_id" "uuid" NOT NULL,
    "title" character varying DEFAULT 'My Educational Journey'::character varying,
    "subtitle" character varying DEFAULT 'A collection of achievements, skills, and experiences'::character varying,
    "profile_image_url" "text",
    "cover_image_url" "text",
    "theme_color" character varying DEFAULT '#1976d2'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ledger_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."my_courses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "term" "text",
    "subject_area" "text",
    "description" "text",
    "progress" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."my_courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."my_terms" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "order" integer,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."my_terms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "source" "public"."notification_source" NOT NULL,
    "priority" "public"."notification_priority" DEFAULT 'MEDIUM'::"public"."notification_priority" NOT NULL,
    "action_url" "text",
    "action_text" "text",
    "image_url" "text",
    "is_active" boolean DEFAULT true,
    "target_all_users" boolean DEFAULT true
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "watched_video" boolean DEFAULT false,
    "completed_profile" boolean DEFAULT false,
    "added_students" boolean DEFAULT false,
    "created_course" boolean DEFAULT false,
    "submitted_feedback" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."onboarding_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_comments" (
    "id" bigint NOT NULL,
    "post_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_comments" OWNER TO "postgres";


ALTER TABLE "public"."post_comments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."post_comments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."post_drafts" (
    "id" bigint NOT NULL,
    "content" "text" NOT NULL,
    "category" "text" NOT NULL,
    "hashtags" "text"[] DEFAULT '{}'::"text"[],
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_drafts" OWNER TO "postgres";


ALTER TABLE "public"."post_drafts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."post_drafts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."post_favorites" (
    "id" bigint NOT NULL,
    "post_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_favorites" OWNER TO "postgres";


ALTER TABLE "public"."post_favorites" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."post_favorites_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."post_likes" (
    "id" bigint NOT NULL,
    "post_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_likes" OWNER TO "postgres";


ALTER TABLE "public"."post_likes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."post_likes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" bigint NOT NULL,
    "content" "text" NOT NULL,
    "category" "text" NOT NULL,
    "hashtags" "text"[] DEFAULT '{}'::"text"[],
    "user_id" "uuid" NOT NULL,
    "like_count" integer DEFAULT 0,
    "comment_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


ALTER TABLE "public"."posts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."posts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "profile_picture" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."psa_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "school_year" "text" NOT NULL,
    "submission_name" "text" NOT NULL,
    "status" "text" NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"(),
    "psa_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "pdf_url" "text"
);


ALTER TABLE "public"."psa_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."school_philosophies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "prefix" "text",
    "first_name" "text",
    "middle_initial" "text",
    "last_name" "text",
    "title" "text",
    "phone_number" "text",
    "fax" "text",
    "email_address" "text",
    "profile_url" "text",
    "graduating_class_size" integer,
    "block_schedule" boolean,
    "graduation_date" "date",
    "outside_us" boolean,
    "volunteer_service" "text",
    "school_address" "jsonb",
    "one_sentence_philosophy" "text",
    "why_homeschool" "text",
    "types_of_learning" "text",
    "course_structure" "text",
    "success_measurement" "text",
    "extracurricular_opportunities" "text",
    "ai_philosophy" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."school_philosophies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."school_profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "prefix" "text",
    "first_name" "text",
    "middle_initial" "text",
    "last_name" "text",
    "title" "text",
    "phone_number" "text",
    "fax" "text",
    "email_address" "text",
    "profile_url" "text",
    "graduating_class_size" "text",
    "block_schedule" "text",
    "graduation_date" "date",
    "outside_us" "text",
    "volunteer_service" "text",
    "school_address" "text",
    "one_sentence_philosophy" "text",
    "why_homeschool" "text",
    "types_of_learning" "text",
    "course_structure" "text",
    "success_measurement" "text",
    "extracurricular_opportunities" "text",
    "ai_philosophy" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."school_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."students" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "parent_id" "uuid",
    "student_name" "text" NOT NULL,
    "date_of_birth" "date",
    "grade_level" "text",
    "graduation_year" "text",
    "school_name" "text",
    "previous_school" "text",
    "previous_school_phone" "text",
    "previous_school_address" "text",
    "curriculum" "text",
    "special_education_needs" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "email" "text"
);


ALTER TABLE "public"."students" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assignment_id" "uuid",
    "student_id" "uuid",
    "file_path" "text",
    "text_content" "text",
    "grade" numeric(5,2),
    "feedback" "text",
    "submitted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "graded_at" timestamp with time zone,
    "graded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "category" "text" NOT NULL,
    "message" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."support_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transcripts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "name" "text",
    "gender" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "zip" "text",
    "dob" "date",
    "parent_guardian" "text",
    "student_email" "text",
    "projected_grad_date" "date",
    "parent_email" "text",
    "school_name" "text",
    "school_phone" "text",
    "school_address" "text",
    "school_city" "text",
    "school_state" "text",
    "school_zip" "text",
    "issue_date" "date",
    "graduation_date" "date",
    "freshman_year" "text",
    "sophomore_year" "text",
    "junior_year" "text",
    "senior_year" "text",
    "pre_high_school_year" "text",
    "cumulative_summary" "jsonb" DEFAULT '{"gpaPoints": "0", "gpaCredits": "0", "weightedGPA": null, "totalCredits": "0", "cumulativeGPA": "0"}'::"jsonb" NOT NULL,
    "test_scores" "text",
    "grading_scale" "jsonb" DEFAULT '{"show": false}'::"jsonb" NOT NULL,
    "miscellaneous" "text",
    "signature_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_cumulative_summary" CHECK ((("cumulative_summary" ? 'totalCredits'::"text") AND ("cumulative_summary" ? 'cumulativeGPA'::"text")))
);


ALTER TABLE "public"."transcripts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_calendars" (
    "id" "uuid" NOT NULL,
    "calendar_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "last_sync" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "student_id" "uuid",
    "is_combined_calendar" boolean DEFAULT false
);


ALTER TABLE "public"."user_calendars" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_college_list" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "college_name" "text" NOT NULL,
    "early_action" "date",
    "early_decision" "date",
    "regular_decision" "date",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."user_college_list" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_courses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "uid" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "course_code" "text",
    "college" "text",
    "teacher" "text",
    "hs_subject" "text",
    "units" "text",
    "total_hours" "text",
    "instruction_method" "text",
    "materials" "text"[],
    "evaluation_method" "text",
    "days" "text",
    "times" "text",
    "dates" "text",
    "textbooks" "text"[],
    "year" integer,
    "term_start" "text",
    "term_duration" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "crn" "text",
    "is_college_level" boolean DEFAULT false,
    "location" "text",
    "teacher_name" "text",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone
);


ALTER TABLE "public"."user_courses" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_courses"."teacher_name" IS 'Text field for storing teacher name';



CREATE TABLE IF NOT EXISTS "public"."user_courses_todos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "uid" "uuid" NOT NULL,
    "user_course_ids" "uuid"[] NOT NULL,
    "special_todo_type" "text",
    "name" "text" NOT NULL,
    "description" "text",
    "importance" integer DEFAULT 5 NOT NULL,
    "completed" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "completed_at" timestamp with time zone,
    "student_id" "uuid"
);


ALTER TABLE "public"."user_courses_todos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_scholarships" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "offered_by" "text",
    "amount" "text",
    "deadline" "date",
    "grade_level" "text",
    "link" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."user_scholarships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_permits" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "student_name" "text" NOT NULL,
    "date_of_birth" "date" NOT NULL,
    "address" "text" NOT NULL,
    "phone_number" "text" NOT NULL,
    "employer_name" "text" NOT NULL,
    "employer_address" "text" NOT NULL,
    "employer_phone" "text" NOT NULL,
    "job_title" "text" NOT NULL,
    "work_schedule" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "parent_name" "text" NOT NULL,
    "parent_phone" "text" NOT NULL,
    "parent_email" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "work_permits_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."work_permits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_samples" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "course_id" "uuid",
    "student_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "file_path" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "file_size" integer NOT NULL,
    "ai_review_requested" boolean DEFAULT false,
    "ai_review_completed" boolean DEFAULT false,
    "ai_feedback" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "public_url" "text"
);


ALTER TABLE "public"."work_samples" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."youredu_courses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "hs_subject" "text",
    "units" "text",
    "total_hours" "text",
    "instruction_method" "text",
    "materials" "text"[],
    "evaluation_method" "text",
    "days" "text",
    "times" "text",
    "dates" "text",
    "textbooks" "text"[],
    "teachers" "uuid"[] DEFAULT ARRAY[]::"uuid"[],
    "students" "uuid"[] DEFAULT ARRAY[]::"uuid"[],
    "year" integer,
    "term_start" "text",
    "term_duration" "text",
    "is_published" boolean DEFAULT false,
    "enrollment_capacity" integer DEFAULT 20,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "teacher_name" "text",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone
);


ALTER TABLE "public"."youredu_courses" OWNER TO "postgres";


COMMENT ON COLUMN "public"."youredu_courses"."teacher_name" IS 'Text field for storing teacher name';



CREATE TABLE IF NOT EXISTS "public"."youredu_courses_assignments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "course_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "due_date" timestamp with time zone,
    "submission_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "youredu_courses_assignments_submission_type_check" CHECK (("submission_type" = ANY (ARRAY['file'::"text", 'text'::"text"])))
);


ALTER TABLE "public"."youredu_courses_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."youredu_courses_assignments_submissions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "assignment_id" "uuid",
    "user_id" "uuid",
    "text_content" "text",
    "file_id" "text",
    "submitted_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."youredu_courses_assignments_submissions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."college_courses_schedules" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."courseschedules_id_seq"'::"regclass");



ALTER TABLE ONLY "app_settings"."secrets"
    ADD CONSTRAINT "secrets_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."account_profiles"
    ADD CONSTRAINT "account_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assignment_submissions"
    ADD CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assignments"
    ADD CONSTRAINT "assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_student_id_date_key" UNIQUE ("student_id", "date");



ALTER TABLE ONLY "public"."california_psa"
    ADD CONSTRAINT "california_psa_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_user_course_unique" UNIQUE ("user_id", "college", "course_id", "crn");



ALTER TABLE ONLY "public"."chat_conversations"
    ADD CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_documents"
    ADD CONSTRAINT "compliance_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_assignments"
    ADD CONSTRAINT "course_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_attendance"
    ADD CONSTRAINT "course_attendance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_descriptions"
    ADD CONSTRAINT "course_descriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_descriptions"
    ADD CONSTRAINT "course_descriptions_student_id_key" UNIQUE ("student_id");



ALTER TABLE ONLY "public"."course_files"
    ADD CONSTRAINT "course_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_materials"
    ADD CONSTRAINT "course_materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_notes"
    ADD CONSTRAINT "course_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_todos"
    ADD CONSTRAINT "course_todos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."college_courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("code");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey1" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."college_courses_schedules"
    ADD CONSTRAINT "courseschedules_crn_term_key" UNIQUE ("crn", "term");



ALTER TABLE ONLY "public"."college_courses_schedules"
    ADD CONSTRAINT "courseschedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_invites"
    ADD CONSTRAINT "event_invites_event_id_invitee_id_key" UNIQUE ("event_id", "invitee_id");



ALTER TABLE ONLY "public"."event_invites"
    ADD CONSTRAINT "event_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_registrations"
    ADD CONSTRAINT "event_registrations_event_id_user_id_key" UNIQUE ("event_id", "user_id");



ALTER TABLE ONLY "public"."event_registrations"
    ADD CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_responses"
    ADD CONSTRAINT "event_responses_event_id_user_id_key" UNIQUE ("event_id", "user_id");



ALTER TABLE ONLY "public"."event_responses"
    ADD CONSTRAINT "event_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."folders"
    ADD CONSTRAINT "folders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."folders"
    ADD CONSTRAINT "folders_user_id_name_key" UNIQUE ("user_id", "name");



ALTER TABLE ONLY "public"."four_year_plans"
    ADD CONSTRAINT "four_year_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."four_year_plans"
    ADD CONSTRAINT "four_year_plans_student_id_key" UNIQUE ("student_id");



ALTER TABLE ONLY "public"."grading_rubrics"
    ADD CONSTRAINT "grading_rubrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."grading_rubrics"
    ADD CONSTRAINT "grading_rubrics_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_group_id_user_id_key" UNIQUE ("group_id", "user_id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_posts"
    ADD CONSTRAINT "group_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."household_invitations"
    ADD CONSTRAINT "household_invitations_invitation_token_key" UNIQUE ("invitation_token");



ALTER TABLE ONLY "public"."household_invitations"
    ADD CONSTRAINT "household_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."household_members"
    ADD CONSTRAINT "household_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."households"
    ADD CONSTRAINT "households_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."id_cards"
    ADD CONSTRAINT "id_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ledger_entries"
    ADD CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ledger_entry_skills"
    ADD CONSTRAINT "ledger_entry_skills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ledger_settings"
    ADD CONSTRAINT "ledger_settings_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."my_courses"
    ADD CONSTRAINT "my_courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."my_terms"
    ADD CONSTRAINT "my_terms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_progress"
    ADD CONSTRAINT "onboarding_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_progress"
    ADD CONSTRAINT "onboarding_progress_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_drafts"
    ADD CONSTRAINT "post_drafts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_favorites"
    ADD CONSTRAINT "post_favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."psa_submissions"
    ADD CONSTRAINT "psa_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."school_philosophies"
    ADD CONSTRAINT "school_philosophies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."school_profiles"
    ADD CONSTRAINT "school_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."school_profiles"
    ADD CONSTRAINT "school_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_messages"
    ADD CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_favorites"
    ADD CONSTRAINT "unique_post_favorite" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "unique_post_like" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."user_calendars"
    ADD CONSTRAINT "user_calendars_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_college_list"
    ADD CONSTRAINT "user_college_list_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_college_list"
    ADD CONSTRAINT "user_college_list_user_id_college_name_key" UNIQUE ("user_id", "college_name");



ALTER TABLE ONLY "public"."user_courses"
    ADD CONSTRAINT "user_courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_courses_todos"
    ADD CONSTRAINT "user_courses_todos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_scholarships"
    ADD CONSTRAINT "user_scholarships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_scholarships"
    ADD CONSTRAINT "user_scholarships_user_id_name_key" UNIQUE ("user_id", "name");



ALTER TABLE ONLY "public"."work_permits"
    ADD CONSTRAINT "work_permits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."work_samples"
    ADD CONSTRAINT "work_samples_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."youredu_courses_assignments"
    ADD CONSTRAINT "youredu_courses_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."youredu_courses_assignments_submissions"
    ADD CONSTRAINT "youredu_courses_assignments_submissio_assignment_id_user_id_key" UNIQUE ("assignment_id", "user_id");



ALTER TABLE ONLY "public"."youredu_courses_assignments_submissions"
    ADD CONSTRAINT "youredu_courses_assignments_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."youredu_courses"
    ADD CONSTRAINT "youredu_courses_pkey" PRIMARY KEY ("id");



CREATE INDEX "account_profiles_account_status_idx" ON "public"."account_profiles" USING "btree" ("account_status");



CREATE INDEX "account_profiles_account_type_idx" ON "public"."account_profiles" USING "btree" ("account_type");



CREATE INDEX "account_profiles_sierra_college_id_idx" ON "public"."account_profiles" USING "btree" ("sierra_college_id");



CREATE INDEX "attendance_records_student_id_date_idx" ON "public"."attendance_records" USING "btree" ("student_id", "date");



CREATE UNIQUE INDEX "california_psa_user_id_key" ON "public"."california_psa" USING "btree" ("user_id");



CREATE INDEX "cart_items_user_id_idx" ON "public"."cart_items" USING "btree" ("user_id");



CREATE INDEX "chat_conversations_user_id_idx" ON "public"."chat_conversations" USING "btree" ("user_id");



CREATE INDEX "chat_messages_conversation_id_idx" ON "public"."chat_messages" USING "btree" ("conversation_id");



CREATE INDEX "event_registrations_event_id_idx" ON "public"."event_registrations" USING "btree" ("event_id");



CREATE INDEX "event_registrations_user_id_idx" ON "public"."event_registrations" USING "btree" ("user_id");



CREATE INDEX "household_invitations_email_idx" ON "public"."household_invitations" USING "btree" ("invitee_email");



CREATE INDEX "household_invitations_token_idx" ON "public"."household_invitations" USING "btree" ("invitation_token");



CREATE INDEX "household_members_household_id_idx" ON "public"."household_members" USING "btree" ("household_id");



CREATE INDEX "household_members_user_id_idx" ON "public"."household_members" USING "btree" ("user_id");



CREATE INDEX "idx_assignment_submissions_assignment_id" ON "public"."assignment_submissions" USING "btree" ("assignment_id");



CREATE INDEX "idx_assignment_submissions_student_id" ON "public"."assignment_submissions" USING "btree" ("student_id");



CREATE INDEX "idx_college_courses_code_college" ON "public"."college_courses" USING "btree" ("code", "college");



CREATE INDEX "idx_college_courses_schedules_course_code_college" ON "public"."college_courses_schedules" USING "btree" ("course_code", "college");



CREATE INDEX "idx_comments_post_id" ON "public"."post_comments" USING "btree" ("post_id");



CREATE INDEX "idx_comments_user_id" ON "public"."post_comments" USING "btree" ("user_id");



CREATE INDEX "idx_course_assignments_course_id" ON "public"."course_assignments" USING "btree" ("course_id");



CREATE INDEX "idx_course_attendance_user_course" ON "public"."course_attendance" USING "btree" ("user_id", "course_id");



CREATE INDEX "idx_course_descriptions_student_id" ON "public"."course_descriptions" USING "btree" ("student_id");



CREATE INDEX "idx_course_descriptions_user_id" ON "public"."course_descriptions" USING "btree" ("user_id");



CREATE INDEX "idx_course_notes_user_course" ON "public"."course_notes" USING "btree" ("user_id", "course_id");



CREATE INDEX "idx_course_todos_user_course" ON "public"."course_todos" USING "btree" ("user_id", "course_id");



CREATE INDEX "idx_courses_transcript_id" ON "public"."courses" USING "btree" ("transcript_id");



CREATE INDEX "idx_drafts_user_id" ON "public"."post_drafts" USING "btree" ("user_id");



CREATE INDEX "idx_event_invites_event_id" ON "public"."event_invites" USING "btree" ("event_id");



CREATE INDEX "idx_event_invites_invitee_id" ON "public"."event_invites" USING "btree" ("invitee_id");



CREATE INDEX "idx_event_responses_event_id" ON "public"."event_responses" USING "btree" ("event_id");



CREATE INDEX "idx_event_responses_user_id" ON "public"."event_responses" USING "btree" ("user_id");



CREATE INDEX "idx_favorites_post_id" ON "public"."post_favorites" USING "btree" ("post_id");



CREATE INDEX "idx_favorites_user_id" ON "public"."post_favorites" USING "btree" ("user_id");



CREATE INDEX "idx_four_year_plans_student_id" ON "public"."four_year_plans" USING "btree" ("student_id");



CREATE INDEX "idx_four_year_plans_user_id" ON "public"."four_year_plans" USING "btree" ("user_id");



CREATE INDEX "idx_ledger_entries_user_id" ON "public"."ledger_entries" USING "btree" ("user_id");



CREATE INDEX "idx_ledger_entry_skills_entry_id" ON "public"."ledger_entry_skills" USING "btree" ("entry_id");



CREATE INDEX "idx_likes_post_id" ON "public"."post_likes" USING "btree" ("post_id");



CREATE INDEX "idx_likes_user_id" ON "public"."post_likes" USING "btree" ("user_id");



CREATE INDEX "idx_posts_user_id" ON "public"."posts" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_id" ON "public"."profiles" USING "btree" ("id");



CREATE INDEX "idx_transcripts_student_id" ON "public"."transcripts" USING "btree" ("student_id");



CREATE INDEX "idx_transcripts_user_id" ON "public"."transcripts" USING "btree" ("user_id");



CREATE INDEX "idx_user_courses_student_id" ON "public"."user_courses" USING "btree" ("student_id");



CREATE INDEX "idx_user_courses_teacher_name" ON "public"."user_courses" USING "btree" ("teacher_name");



CREATE INDEX "idx_user_courses_uid" ON "public"."user_courses" USING "btree" ("uid");



CREATE INDEX "idx_work_samples_course_id" ON "public"."work_samples" USING "btree" ("course_id");



CREATE INDEX "idx_work_samples_student_id" ON "public"."work_samples" USING "btree" ("student_id");



CREATE INDEX "idx_youredu_courses_creator_id" ON "public"."youredu_courses" USING "btree" ("creator_id");



CREATE INDEX "idx_youredu_courses_student_id" ON "public"."youredu_courses" USING "btree" ("student_id");



CREATE INDEX "idx_youredu_courses_teacher_name" ON "public"."youredu_courses" USING "btree" ("teacher_name");



CREATE INDEX "my_terms_user_id_idx" ON "public"."my_terms" USING "btree" ("user_id");



CREATE INDEX "notifications_created_at_idx" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "onboarding_progress_user_id_idx" ON "public"."onboarding_progress" USING "btree" ("user_id");



CREATE INDEX "psa_submissions_submitted_at_idx" ON "public"."psa_submissions" USING "btree" ("submitted_at");



CREATE INDEX "psa_submissions_user_id_idx" ON "public"."psa_submissions" USING "btree" ("user_id");



CREATE INDEX "students_parent_id_idx" ON "public"."students" USING "btree" ("parent_id");



CREATE INDEX "students_user_id_idx" ON "public"."students" USING "btree" ("user_id");



CREATE INDEX "support_messages_category_idx" ON "public"."support_messages" USING "btree" ("category");



CREATE INDEX "support_messages_status_idx" ON "public"."support_messages" USING "btree" ("status");



CREATE INDEX "support_messages_user_id_idx" ON "public"."support_messages" USING "btree" ("user_id");



CREATE INDEX "user_calendars_student_id_idx" ON "public"."user_calendars" USING "btree" ("student_id");



CREATE INDEX "user_college_list_user_id_idx" ON "public"."user_college_list" USING "btree" ("user_id");



CREATE INDEX "user_courses_todos_completed_idx" ON "public"."user_courses_todos" USING "btree" ("completed");



CREATE INDEX "user_courses_todos_importance_idx" ON "public"."user_courses_todos" USING "btree" ("importance" DESC);



CREATE INDEX "user_courses_todos_uid_idx" ON "public"."user_courses_todos" USING "btree" ("uid");



CREATE INDEX "user_scholarships_user_id_idx" ON "public"."user_scholarships" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "assignment_submissions_updated_at" BEFORE UPDATE ON "public"."assignment_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "course_assignments_updated_at" BEFORE UPDATE ON "public"."course_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "course_descriptions_updated_at" BEFORE UPDATE ON "public"."course_descriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "courses_updated_at" BEFORE UPDATE ON "public"."courses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "ensure_transcript_defaults" BEFORE INSERT OR UPDATE ON "public"."transcripts" FOR EACH ROW EXECUTE FUNCTION "public"."initialize_transcript_defaults"();



CREATE OR REPLACE TRIGGER "four_year_plans_updated_at" BEFORE UPDATE ON "public"."four_year_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "handle_assignments_updated_at" BEFORE UPDATE ON "public"."assignments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_course_files_updated_at" BEFORE UPDATE ON "public"."course_files" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_documents_updated_at" BEFORE UPDATE ON "public"."documents" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_folders_updated_at" BEFORE UPDATE ON "public"."folders" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_submissions_updated_at" BEFORE UPDATE ON "public"."submissions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "transcripts_updated_at" BEFORE UPDATE ON "public"."transcripts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_attendance_records_updated_at" BEFORE UPDATE ON "public"."attendance_records" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_chat_conversation_timestamp" AFTER INSERT ON "public"."chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_chat_conversation_timestamp"();



CREATE OR REPLACE TRIGGER "update_event_attendees_trigger" AFTER INSERT OR DELETE ON "public"."event_registrations" FOR EACH ROW EXECUTE FUNCTION "public"."update_event_attendees"();



CREATE OR REPLACE TRIGGER "update_ledger_entries_updated_at" BEFORE UPDATE ON "public"."ledger_entries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ledger_settings_updated_at" BEFORE UPDATE ON "public"."ledger_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notifications_updated_at" BEFORE UPDATE ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_onboarding_progress_updated_at" BEFORE UPDATE ON "public"."onboarding_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_post_comments_updated_at" BEFORE UPDATE ON "public"."post_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_post_drafts_updated_at" BEFORE UPDATE ON "public"."post_drafts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_students_updated_at" BEFORE UPDATE ON "public"."students" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "user_courses_updated_at" BEFORE UPDATE ON "public"."user_courses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "work_samples_updated_at" BEFORE UPDATE ON "public"."work_samples" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "youredu_courses_updated_at" BEFORE UPDATE ON "public"."youredu_courses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."account_profiles"
    ADD CONSTRAINT "account_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."assignment_submissions"
    ADD CONSTRAINT "assignment_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."course_assignments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assignment_submissions"
    ADD CONSTRAINT "assignment_submissions_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."assignment_submissions"
    ADD CONSTRAINT "assignment_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assignments"
    ADD CONSTRAINT "assignments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."youredu_courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assignments"
    ADD CONSTRAINT "assignments_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."california_psa"
    ADD CONSTRAINT "california_psa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."chat_conversations"
    ADD CONSTRAINT "chat_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compliance_documents"
    ADD CONSTRAINT "compliance_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_assignments"
    ADD CONSTRAINT "course_assignments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."youredu_courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_assignments"
    ADD CONSTRAINT "course_assignments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."course_attendance"
    ADD CONSTRAINT "course_attendance_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."my_courses"("id");



ALTER TABLE ONLY "public"."course_attendance"
    ADD CONSTRAINT "course_attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."course_descriptions"
    ADD CONSTRAINT "course_descriptions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_descriptions"
    ADD CONSTRAINT "course_descriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_files"
    ADD CONSTRAINT "course_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."course_materials"
    ADD CONSTRAINT "course_materials_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."youredu_courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_materials"
    ADD CONSTRAINT "course_materials_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."course_notes"
    ADD CONSTRAINT "course_notes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."my_courses"("id");



ALTER TABLE ONLY "public"."course_notes"
    ADD CONSTRAINT "course_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."course_todos"
    ADD CONSTRAINT "course_todos_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."my_courses"("id");



ALTER TABLE ONLY "public"."course_todos"
    ADD CONSTRAINT "course_todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_transcript_id_fkey" FOREIGN KEY ("transcript_id") REFERENCES "public"."transcripts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."event_invites"
    ADD CONSTRAINT "event_invites_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_invites"
    ADD CONSTRAINT "event_invites_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_responses"
    ADD CONSTRAINT "event_responses_user_id_fkey_cascade" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "fk_auth_user" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "fk_comment_author" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "fk_comment_post" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_drafts"
    ADD CONSTRAINT "fk_draft_author" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_favorites"
    ADD CONSTRAINT "fk_favorite_post" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_favorites"
    ADD CONSTRAINT "fk_favorite_user" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "fk_like_post" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "fk_like_user" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "fk_post_author" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."folders"
    ADD CONSTRAINT "folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."four_year_plans"
    ADD CONSTRAINT "four_year_plans_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."four_year_plans"
    ADD CONSTRAINT "four_year_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."grading_rubrics"
    ADD CONSTRAINT "grading_rubrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."account_profiles"("id");



ALTER TABLE ONLY "public"."group_posts"
    ADD CONSTRAINT "group_posts_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_posts"
    ADD CONSTRAINT "group_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."account_profiles"("id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."account_profiles"("id");



ALTER TABLE ONLY "public"."household_invitations"
    ADD CONSTRAINT "household_invitations_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."household_invitations"
    ADD CONSTRAINT "household_invitations_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."household_members"
    ADD CONSTRAINT "household_members_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."household_members"
    ADD CONSTRAINT "household_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."households"
    ADD CONSTRAINT "households_primary_account_id_fkey" FOREIGN KEY ("primary_account_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."id_cards"
    ADD CONSTRAINT "id_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ledger_entries"
    ADD CONSTRAINT "ledger_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ledger_entry_skills"
    ADD CONSTRAINT "ledger_entry_skills_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."ledger_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ledger_settings"
    ADD CONSTRAINT "ledger_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."my_courses"
    ADD CONSTRAINT "my_courses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."my_terms"
    ADD CONSTRAINT "my_terms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."onboarding_progress"
    ADD CONSTRAINT "onboarding_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."account_profiles"("id");



ALTER TABLE ONLY "public"."post_drafts"
    ADD CONSTRAINT "post_drafts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."account_profiles"("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."account_profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey_cascade" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."psa_submissions"
    ADD CONSTRAINT "psa_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."school_philosophies"
    ADD CONSTRAINT "school_philosophies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."school_profiles"
    ADD CONSTRAINT "school_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."support_messages"
    ADD CONSTRAINT "support_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_calendars"
    ADD CONSTRAINT "user_calendars_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id");



ALTER TABLE ONLY "public"."user_college_list"
    ADD CONSTRAINT "user_college_list_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_courses"
    ADD CONSTRAINT "user_courses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_courses_todos"
    ADD CONSTRAINT "user_courses_todos_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id");



ALTER TABLE ONLY "public"."user_courses_todos"
    ADD CONSTRAINT "user_courses_todos_uid_fkey" FOREIGN KEY ("uid") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_courses"
    ADD CONSTRAINT "user_courses_uid_fkey" FOREIGN KEY ("uid") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_scholarships"
    ADD CONSTRAINT "user_scholarships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."work_permits"
    ADD CONSTRAINT "work_permits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."work_samples"
    ADD CONSTRAINT "work_samples_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."youredu_courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_samples"
    ADD CONSTRAINT "work_samples_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."youredu_courses_assignments_submissions"
    ADD CONSTRAINT "youredu_courses_assignments_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."youredu_courses_assignments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."youredu_courses_assignments_submissions"
    ADD CONSTRAINT "youredu_courses_assignments_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."youredu_courses"
    ADD CONSTRAINT "youredu_courses_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."youredu_courses"
    ADD CONSTRAINT "youredu_courses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



CREATE POLICY "Comments are viewable by everyone" ON "public"."post_comments" FOR SELECT USING (true);



CREATE POLICY "Enable delete for group creators" ON "public"."groups" FOR DELETE USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Enable delete for group members" ON "public"."group_members" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable delete for post creators" ON "public"."group_posts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable delete for primary account" ON "public"."household_invitations" FOR DELETE TO "authenticated" USING (("household_id" IN ( SELECT "households"."id"
   FROM "public"."households"
  WHERE ("households"."primary_account_id" = "auth"."uid"()))));



CREATE POLICY "Enable delete for primary account" ON "public"."household_members" FOR DELETE TO "authenticated" USING (("household_id" IN ( SELECT "households"."id"
   FROM "public"."households"
  WHERE ("households"."primary_account_id" = "auth"."uid"()))));



CREATE POLICY "Enable delete for primary account" ON "public"."households" FOR DELETE TO "authenticated" USING (("primary_account_id" = "auth"."uid"()));



CREATE POLICY "Enable insert for authenticated users" ON "public"."group_members" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable insert for authenticated users" ON "public"."households" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."groups" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Enable insert for group members" ON "public"."group_posts" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."group_members"
  WHERE (("group_members"."group_id" = "group_posts"."group_id") AND ("group_members"."user_id" = "auth"."uid"()) AND ("group_members"."status" = 'accepted'::"text")))));



CREATE POLICY "Enable insert for primary account" ON "public"."household_invitations" FOR INSERT TO "authenticated" WITH CHECK (("household_id" IN ( SELECT "households"."id"
   FROM "public"."households"
  WHERE ("households"."primary_account_id" = "auth"."uid"()))));



CREATE POLICY "Enable read access for all users" ON "public"."group_members" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."groups" FOR SELECT USING (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."household_invitations" FOR SELECT TO "authenticated" USING ((("inviter_id" = "auth"."uid"()) OR ("invitee_email" = ("auth"."jwt"() ->> 'email'::"text"))));



CREATE POLICY "Enable read access for authenticated users" ON "public"."household_members" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."households" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for group members" ON "public"."group_posts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."group_members"
  WHERE (("group_members"."group_id" = "group_posts"."group_id") AND ("group_members"."user_id" = "auth"."uid"()) AND ("group_members"."status" = 'accepted'::"text")))));



CREATE POLICY "Enable read access for invitation token" ON "public"."household_invitations" FOR SELECT TO "anon" USING ((("status" = 'pending'::"text") AND ("invitation_token" IS NOT NULL)));



CREATE POLICY "Enable read access for invitation verification" ON "public"."households" FOR SELECT TO "anon" USING (("id" IN ( SELECT "household_invitations"."household_id"
   FROM "public"."household_invitations"
  WHERE ("household_invitations"."status" = 'pending'::"text"))));



CREATE POLICY "Enable update for group creators" ON "public"."groups" FOR UPDATE USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Enable update for group members" ON "public"."group_members" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update for invitation recipient" ON "public"."household_invitations" FOR UPDATE TO "authenticated" USING (("invitee_email" = ("auth"."jwt"() ->> 'email'::"text")));



CREATE POLICY "Enable update for post creators" ON "public"."group_posts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update for primary account" ON "public"."household_members" FOR UPDATE TO "authenticated" USING (("household_id" IN ( SELECT "households"."id"
   FROM "public"."households"
  WHERE ("households"."primary_account_id" = "auth"."uid"()))));



CREATE POLICY "Enable update for primary account" ON "public"."households" FOR UPDATE TO "authenticated" USING (("primary_account_id" = "auth"."uid"()));



CREATE POLICY "Favorites are viewable by everyone" ON "public"."post_favorites" FOR SELECT USING (true);



CREATE POLICY "Invitees can update their invite status" ON "public"."event_invites" FOR UPDATE USING (("auth"."uid"() = "invitee_id"));



CREATE POLICY "Likes are viewable by everyone" ON "public"."post_likes" FOR SELECT USING (true);



CREATE POLICY "Parents can delete course descriptions for their students" ON "public"."course_descriptions" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "course_descriptions"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Parents can delete plans for their students" ON "public"."four_year_plans" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "four_year_plans"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Parents can delete transcripts for their students" ON "public"."transcripts" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "transcripts"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Parents can insert course descriptions for their students" ON "public"."course_descriptions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "course_descriptions"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Parents can insert plans for their students" ON "public"."four_year_plans" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "four_year_plans"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Parents can insert transcripts for their students" ON "public"."transcripts" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "transcripts"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Parents can manage their students" ON "public"."students" USING (("auth"."uid"() = "parent_id"));



CREATE POLICY "Parents can update course descriptions for their students" ON "public"."course_descriptions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "course_descriptions"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Parents can update plans for their students" ON "public"."four_year_plans" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "four_year_plans"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Parents can update transcripts for their students" ON "public"."transcripts" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "transcripts"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Parents can view their own students" ON "public"."students" FOR SELECT USING (("auth"."uid"() = "parent_id"));



CREATE POLICY "Parents can view their students' course descriptions" ON "public"."course_descriptions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "course_descriptions"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Parents can view their students' plans" ON "public"."four_year_plans" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "four_year_plans"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Parents can view their students' transcripts" ON "public"."transcripts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "transcripts"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Posts are viewable by everyone" ON "public"."posts" FOR SELECT USING (true);



CREATE POLICY "Prevent direct inserts" ON "public"."household_members" FOR INSERT TO "authenticated" WITH CHECK (false);



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Students can create their own submissions" ON "public"."submissions" FOR INSERT WITH CHECK ((("student_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."assignments" "a"
     JOIN "public"."youredu_courses" "c" ON (("a"."course_id" = "c"."id")))
  WHERE (("a"."id" = "submissions"."assignment_id") AND (EXISTS ( SELECT 1
           FROM "public"."user_courses" "uc"
          WHERE (("uc"."id" = "c"."id") AND ("uc"."student_id" = "auth"."uid"())))))))));



CREATE POLICY "Students can manage their submissions" ON "public"."assignment_submissions" USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "assignment_submissions"."student_id") AND (("students"."parent_id" = "auth"."uid"()) OR ("students"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Students can manage their work samples" ON "public"."work_samples" USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "work_samples"."student_id") AND (("students"."parent_id" = "auth"."uid"()) OR ("students"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Students can update their own submissions" ON "public"."submissions" FOR UPDATE USING (("student_id" = "auth"."uid"())) WITH CHECK (("student_id" = "auth"."uid"()));



CREATE POLICY "Students can view their own course descriptions" ON "public"."course_descriptions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "course_descriptions"."student_id") AND ("students"."user_id" = "auth"."uid"())))));



CREATE POLICY "Students can view their own data" ON "public"."students" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Students can view their own plans" ON "public"."four_year_plans" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "four_year_plans"."student_id") AND ("students"."user_id" = "auth"."uid"())))));



CREATE POLICY "Students can view their own transcripts" ON "public"."transcripts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "transcripts"."student_id") AND ("students"."user_id" = "auth"."uid"())))));



CREATE POLICY "Super admins can manage all notifications" ON "public"."notifications" TO "authenticated" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Teachers can create assignments" ON "public"."assignments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."youredu_courses"
  WHERE (("youredu_courses"."id" = "assignments"."course_id") AND ("youredu_courses"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Teachers can delete their assignments" ON "public"."assignments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."youredu_courses"
  WHERE (("youredu_courses"."id" = "assignments"."course_id") AND ("youredu_courses"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Teachers can grade submissions" ON "public"."assignment_submissions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."course_assignments" "a"
     JOIN "public"."youredu_courses" "c" ON (("a"."course_id" = "c"."id")))
  WHERE (("a"."id" = "assignment_submissions"."assignment_id") AND (("c"."creator_id" = "auth"."uid"()) OR ("auth"."uid"() = ANY ("c"."teachers")))))));



CREATE POLICY "Teachers can grade submissions" ON "public"."submissions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."assignments" "a"
     JOIN "public"."youredu_courses" "c" ON (("a"."course_id" = "c"."id")))
  WHERE (("a"."id" = "submissions"."assignment_id") AND ("c"."creator_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."assignments" "a"
     JOIN "public"."youredu_courses" "c" ON (("a"."course_id" = "c"."id")))
  WHERE (("a"."id" = "submissions"."assignment_id") AND ("c"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Teachers can manage course assignments" ON "public"."course_assignments" USING ((EXISTS ( SELECT 1
   FROM "public"."youredu_courses" "c"
  WHERE (("c"."id" = "course_assignments"."course_id") AND (("c"."creator_id" = "auth"."uid"()) OR ("auth"."uid"() = ANY ("c"."teachers")))))));



CREATE POLICY "Teachers can manage course materials" ON "public"."course_materials" USING ((EXISTS ( SELECT 1
   FROM "public"."youredu_courses" "c"
  WHERE (("c"."id" = "course_materials"."course_id") AND (("c"."creator_id" = "auth"."uid"()) OR ("auth"."uid"() = ANY ("c"."teachers")))))));



CREATE POLICY "Teachers can update their assignments" ON "public"."assignments" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."youredu_courses"
  WHERE (("youredu_courses"."id" = "assignments"."course_id") AND ("youredu_courses"."creator_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."youredu_courses"
  WHERE (("youredu_courses"."id" = "assignments"."course_id") AND ("youredu_courses"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Users can add skills to their entries" ON "public"."ledger_entry_skills" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."ledger_entries"
  WHERE (("ledger_entries"."id" = "ledger_entry_skills"."entry_id") AND ("ledger_entries"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can cancel their own registrations" ON "public"."event_registrations" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create messages" ON "public"."support_messages" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own conversations" ON "public"."chat_conversations" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own documents" ON "public"."documents" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own entries" ON "public"."ledger_entries" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own folders" ON "public"."folders" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own onboarding progress" ON "public"."onboarding_progress" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own settings" ON "public"."ledger_settings" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own todos" ON "public"."user_courses_todos" FOR INSERT WITH CHECK (("auth"."uid"() = "uid"));



CREATE POLICY "Users can delete courses for their transcripts" ON "public"."courses" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."transcripts"
     JOIN "public"."students" ON (("students"."id" = "transcripts"."student_id")))
  WHERE (("transcripts"."id" = "courses"."transcript_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete own submissions" ON "public"."psa_submissions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete skills from their entries" ON "public"."ledger_entry_skills" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."ledger_entries"
  WHERE (("ledger_entries"."id" = "ledger_entry_skills"."entry_id") AND ("ledger_entries"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete their courses" ON "public"."user_courses" FOR DELETE USING ((("uid" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "user_courses"."student_id") AND ("students"."parent_id" = "auth"."uid"()))))));



CREATE POLICY "Users can delete their own comments" ON "public"."post_comments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own documents" ON "public"."compliance_documents" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own documents" ON "public"."documents" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own drafts" ON "public"."post_drafts" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own entries" ON "public"."ledger_entries" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own favorites" ON "public"."post_favorites" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own grading rubric" ON "public"."grading_rubrics" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own id cards" ON "public"."id_cards" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own ledger entries" ON "public"."ledger_entries" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own ledger entry skills" ON "public"."ledger_entry_skills" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."ledger_entries"
  WHERE (("ledger_entries"."id" = "ledger_entry_skills"."entry_id") AND ("ledger_entries"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete their own likes" ON "public"."post_likes" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own non-default folders" ON "public"."folders" FOR DELETE USING ((("auth"."uid"() = "user_id") AND (NOT "is_default")));



CREATE POLICY "Users can delete their own posts" ON "public"."posts" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own responses" ON "public"."event_responses" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own school profile" ON "public"."school_profiles" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own todos" ON "public"."user_courses_todos" FOR DELETE USING (("auth"."uid"() = "uid"));



CREATE POLICY "Users can delete their own work permits" ON "public"."work_permits" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their youredu courses" ON "public"."youredu_courses" FOR DELETE USING ((("creator_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "youredu_courses"."student_id") AND ("students"."parent_id" = "auth"."uid"()))))));



CREATE POLICY "Users can insert attendance records for their students" ON "public"."attendance_records" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "attendance_records"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert courses for their transcripts" ON "public"."courses" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."transcripts"
     JOIN "public"."students" ON (("students"."id" = "transcripts"."student_id")))
  WHERE (("transcripts"."id" = "courses"."transcript_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert messages to their conversations" ON "public"."chat_messages" FOR INSERT TO "authenticated" WITH CHECK (("conversation_id" IN ( SELECT "chat_conversations"."id"
   FROM "public"."chat_conversations"
  WHERE ("chat_conversations"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert own submissions" ON "public"."psa_submissions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their courses" ON "public"."user_courses" FOR INSERT WITH CHECK ((("uid" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "user_courses"."student_id") AND ("students"."parent_id" = "auth"."uid"()))))));



CREATE POLICY "Users can insert their own account profile" ON "public"."account_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own comments" ON "public"."post_comments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own documents" ON "public"."compliance_documents" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own drafts" ON "public"."post_drafts" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own favorites" ON "public"."post_favorites" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own grading rubric" ON "public"."grading_rubrics" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own id cards" ON "public"."id_cards" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own ledger entries" ON "public"."ledger_entries" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own ledger entry skills" ON "public"."ledger_entry_skills" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."ledger_entries"
  WHERE (("ledger_entries"."id" = "ledger_entry_skills"."entry_id") AND ("ledger_entries"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert their own ledger settings" ON "public"."ledger_settings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own likes" ON "public"."post_likes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own posts" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own responses" ON "public"."event_responses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own school profile" ON "public"."school_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own submissions" ON "public"."psa_submissions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own work permits" ON "public"."work_permits" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their youredu courses" ON "public"."youredu_courses" FOR INSERT WITH CHECK ((("creator_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "youredu_courses"."student_id") AND ("students"."parent_id" = "auth"."uid"()))))));



CREATE POLICY "Users can read their own submissions" ON "public"."psa_submissions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can send invites" ON "public"."event_invites" FOR INSERT WITH CHECK (("auth"."uid"() = "inviter_id"));



CREATE POLICY "Users can update attendance records for their students" ON "public"."attendance_records" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "attendance_records"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Users can update courses for their transcripts" ON "public"."courses" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."transcripts"
     JOIN "public"."students" ON (("students"."id" = "transcripts"."student_id")))
  WHERE (("transcripts"."id" = "courses"."transcript_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own submissions" ON "public"."psa_submissions" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their courses" ON "public"."user_courses" FOR UPDATE USING ((("uid" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "user_courses"."student_id") AND ("students"."parent_id" = "auth"."uid"()))))));



CREATE POLICY "Users can update their own account profile" ON "public"."account_profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own comments" ON "public"."post_comments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own documents" ON "public"."compliance_documents" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own documents" ON "public"."documents" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own drafts" ON "public"."post_drafts" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own entries" ON "public"."ledger_entries" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own folders" ON "public"."folders" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own grading rubric" ON "public"."grading_rubrics" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own id cards" ON "public"."id_cards" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own ledger entries" ON "public"."ledger_entries" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own ledger settings" ON "public"."ledger_settings" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own onboarding progress" ON "public"."onboarding_progress" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own posts" ON "public"."posts" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own responses" ON "public"."event_responses" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own school profile" ON "public"."school_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own settings" ON "public"."ledger_settings" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own todos" ON "public"."user_courses_todos" FOR UPDATE USING (("auth"."uid"() = "uid")) WITH CHECK (("auth"."uid"() = "uid"));



CREATE POLICY "Users can update their own work permits" ON "public"."work_permits" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their youredu courses" ON "public"."youredu_courses" FOR UPDATE USING ((("creator_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "youredu_courses"."student_id") AND ("students"."parent_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view all active notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING ((("is_active" = true) AND ("target_all_users" = true)));



CREATE POLICY "Users can view all event responses" ON "public"."event_responses" FOR SELECT USING (true);



CREATE POLICY "Users can view assignments for their courses" ON "public"."assignments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."youredu_courses"
  WHERE (("youredu_courses"."id" = "assignments"."course_id") AND (("youredu_courses"."creator_id" = "auth"."uid"()) OR ("youredu_courses"."id" IN ( SELECT "user_courses"."id"
           FROM "public"."user_courses"
          WHERE ("user_courses"."student_id" = "auth"."uid"()))))))));



CREATE POLICY "Users can view course assignments" ON "public"."course_assignments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."youredu_courses" "c"
  WHERE (("c"."id" = "course_assignments"."course_id") AND (("c"."creator_id" = "auth"."uid"()) OR ("auth"."uid"() = ANY ("c"."teachers")) OR (EXISTS ( SELECT 1
           FROM "public"."students"
          WHERE (("students"."id" = "c"."student_id") AND (("students"."parent_id" = "auth"."uid"()) OR ("students"."user_id" = "auth"."uid"()))))))))));



CREATE POLICY "Users can view course materials" ON "public"."course_materials" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."youredu_courses" "c"
  WHERE (("c"."id" = "course_materials"."course_id") AND (("c"."creator_id" = "auth"."uid"()) OR ("auth"."uid"() = ANY ("c"."teachers")) OR (EXISTS ( SELECT 1
           FROM "public"."students"
          WHERE (("students"."id" = "c"."student_id") AND (("students"."parent_id" = "auth"."uid"()) OR ("students"."user_id" = "auth"."uid"()))))))))));



CREATE POLICY "Users can view courses for their transcripts" ON "public"."courses" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."transcripts"
     JOIN "public"."students" ON (("students"."id" = "transcripts"."student_id")))
  WHERE (("transcripts"."id" = "courses"."transcript_id") AND (("students"."parent_id" = "auth"."uid"()) OR ("students"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view messages from their conversations" ON "public"."chat_messages" FOR SELECT TO "authenticated" USING (("conversation_id" IN ( SELECT "chat_conversations"."id"
   FROM "public"."chat_conversations"
  WHERE ("chat_conversations"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view own submissions" ON "public"."psa_submissions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view profiles" ON "public"."account_profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view relevant submissions" ON "public"."assignment_submissions" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "assignment_submissions"."student_id") AND (("students"."parent_id" = "auth"."uid"()) OR ("students"."user_id" = "auth"."uid"()))))) OR (EXISTS ( SELECT 1
   FROM ("public"."course_assignments" "a"
     JOIN "public"."youredu_courses" "c" ON (("a"."course_id" = "c"."id")))
  WHERE (("a"."id" = "assignment_submissions"."assignment_id") AND (("c"."creator_id" = "auth"."uid"()) OR ("auth"."uid"() = ANY ("c"."teachers"))))))));



CREATE POLICY "Users can view relevant submissions" ON "public"."submissions" FOR SELECT USING ((("student_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM ("public"."assignments" "a"
     JOIN "public"."youredu_courses" "c" ON (("a"."course_id" = "c"."id")))
  WHERE (("a"."id" = "submissions"."assignment_id") AND ("c"."creator_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view skills for their entries" ON "public"."ledger_entry_skills" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."ledger_entries"
  WHERE (("ledger_entries"."id" = "ledger_entry_skills"."entry_id") AND ("ledger_entries"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their courses" ON "public"."user_courses" FOR SELECT USING ((("uid" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "user_courses"."student_id") AND (("students"."parent_id" = "auth"."uid"()) OR ("students"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Users can view their invites" ON "public"."event_invites" FOR SELECT USING ((("auth"."uid"() = "invitee_id") OR ("auth"."uid"() = "inviter_id")));



CREATE POLICY "Users can view their own account profile" ON "public"."account_profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own conversations" ON "public"."chat_conversations" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own documents" ON "public"."compliance_documents" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own documents" ON "public"."documents" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own drafts" ON "public"."post_drafts" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own entries" ON "public"."ledger_entries" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own folders" ON "public"."folders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own grading rubric" ON "public"."grading_rubrics" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own id cards" ON "public"."id_cards" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own ledger entries" ON "public"."ledger_entries" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own ledger entry skills" ON "public"."ledger_entry_skills" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."ledger_entries"
  WHERE (("ledger_entries"."id" = "ledger_entry_skills"."entry_id") AND ("ledger_entries"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own ledger settings" ON "public"."ledger_settings" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own messages" ON "public"."support_messages" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own onboarding progress" ON "public"."onboarding_progress" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own registrations" ON "public"."event_registrations" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own school profile" ON "public"."school_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own settings" ON "public"."ledger_settings" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own todos" ON "public"."user_courses_todos" FOR SELECT USING (("auth"."uid"() = "uid"));



CREATE POLICY "Users can view their own work permits" ON "public"."work_permits" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their students' attendance records" ON "public"."attendance_records" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "attendance_records"."student_id") AND ("students"."parent_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their work samples" ON "public"."work_samples" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "work_samples"."student_id") AND (("students"."parent_id" = "auth"."uid"()) OR ("students"."user_id" = "auth"."uid"()))))) OR (EXISTS ( SELECT 1
   FROM "public"."youredu_courses" "c"
  WHERE (("c"."id" = "work_samples"."course_id") AND (("c"."creator_id" = "auth"."uid"()) OR ("auth"."uid"() = ANY ("c"."teachers"))))))));



CREATE POLICY "Users can view their youredu courses" ON "public"."youredu_courses" FOR SELECT USING ((("creator_id" = "auth"."uid"()) OR ("auth"."uid"() = ANY ("teachers")) OR (EXISTS ( SELECT 1
   FROM "public"."students"
  WHERE (("students"."id" = "youredu_courses"."student_id") AND (("students"."parent_id" = "auth"."uid"()) OR ("students"."user_id" = "auth"."uid"())))))));



ALTER TABLE "public"."account_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assignment_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."attendance_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compliance_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_descriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_materials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_invites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_registrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."folders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."four_year_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."grading_rubrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."household_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."household_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."households" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."id_cards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ledger_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ledger_entry_skills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ledger_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."onboarding_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_drafts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."psa_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."school_philosophies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."school_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transcripts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_courses_todos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."work_permits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."work_samples" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."youredu_courses" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


CREATE PUBLICATION "supabase_realtime_messages_publication" WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION "supabase_realtime_messages_publication" OWNER TO "supabase_admin";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."cleanup_expired_household_invitations"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_household_invitations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_household_invitations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_folders"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_folders"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_folders"() TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_comment_count"("post_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_comment_count"("post_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_comment_count"("post_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_like_count"("post_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_like_count"("post_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_like_count"("post_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user_data"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_data"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_data"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user_account"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_account"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_account"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_comment_count"("post_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_comment_count"("post_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_comment_count"("post_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_like_count"("post_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_like_count"("post_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_like_count"("post_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."initialize_transcript_defaults"() TO "anon";
GRANT ALL ON FUNCTION "public"."initialize_transcript_defaults"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."initialize_transcript_defaults"() TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_household_member_from_invitation"("p_user_id" "uuid", "p_household_id" "uuid", "p_member_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_household_member_from_invitation"("p_user_id" "uuid", "p_household_id" "uuid", "p_member_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_household_member_from_invitation"("p_user_id" "uuid", "p_household_id" "uuid", "p_member_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."migrate_existing_accounts"() TO "anon";
GRANT ALL ON FUNCTION "public"."migrate_existing_accounts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."migrate_existing_accounts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_household_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_household_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_household_access"() TO "service_role";



GRANT ALL ON FUNCTION "public"."send_email"("to_email" "text", "subject" "text", "html_content" "text", "from_email" "text", "from_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."send_email"("to_email" "text", "subject" "text", "html_content" "text", "from_email" "text", "from_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_email"("to_email" "text", "subject" "text", "html_content" "text", "from_email" "text", "from_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_claim"("claim" "text", "value" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_claim"("claim" "text", "value" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_claim"("claim" "text", "value" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_chat_conversation_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_chat_conversation_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_chat_conversation_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_event_attendees"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_event_attendees"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_event_attendees"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_password_hash"("user_email" "text", "password_hash" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_password_hash"("user_email" "text", "password_hash" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_password_hash"("user_email" "text", "password_hash" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_password_hash"("user_email" "text", "hashed_password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_password_hash"("user_email" "text", "hashed_password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_password_hash"("user_email" "text", "hashed_password" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."account_profiles" TO "anon";
GRANT ALL ON TABLE "public"."account_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."account_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."assignment_submissions" TO "anon";
GRANT ALL ON TABLE "public"."assignment_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."assignment_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."assignments" TO "anon";
GRANT ALL ON TABLE "public"."assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."assignments" TO "service_role";



GRANT ALL ON TABLE "public"."attendance_records" TO "anon";
GRANT ALL ON TABLE "public"."attendance_records" TO "authenticated";
GRANT ALL ON TABLE "public"."attendance_records" TO "service_role";



GRANT ALL ON TABLE "public"."california_psa" TO "anon";
GRANT ALL ON TABLE "public"."california_psa" TO "authenticated";
GRANT ALL ON TABLE "public"."california_psa" TO "service_role";



GRANT ALL ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."chat_conversations" TO "anon";
GRANT ALL ON TABLE "public"."chat_conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_conversations" TO "service_role";



GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."college_courses" TO "anon";
GRANT ALL ON TABLE "public"."college_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."college_courses" TO "service_role";



GRANT ALL ON TABLE "public"."college_courses_schedules" TO "anon";
GRANT ALL ON TABLE "public"."college_courses_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."college_courses_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."college_courses_schedules_backup" TO "anon";
GRANT ALL ON TABLE "public"."college_courses_schedules_backup" TO "authenticated";
GRANT ALL ON TABLE "public"."college_courses_schedules_backup" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_documents" TO "anon";
GRANT ALL ON TABLE "public"."compliance_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_documents" TO "service_role";



GRANT ALL ON TABLE "public"."course_assignments" TO "anon";
GRANT ALL ON TABLE "public"."course_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."course_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."course_attendance" TO "anon";
GRANT ALL ON TABLE "public"."course_attendance" TO "authenticated";
GRANT ALL ON TABLE "public"."course_attendance" TO "service_role";



GRANT ALL ON TABLE "public"."course_descriptions" TO "anon";
GRANT ALL ON TABLE "public"."course_descriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."course_descriptions" TO "service_role";



GRANT ALL ON TABLE "public"."course_files" TO "anon";
GRANT ALL ON TABLE "public"."course_files" TO "authenticated";
GRANT ALL ON TABLE "public"."course_files" TO "service_role";



GRANT ALL ON TABLE "public"."course_materials" TO "anon";
GRANT ALL ON TABLE "public"."course_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."course_materials" TO "service_role";



GRANT ALL ON TABLE "public"."course_notes" TO "anon";
GRANT ALL ON TABLE "public"."course_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."course_notes" TO "service_role";



GRANT ALL ON TABLE "public"."course_offerings" TO "anon";
GRANT ALL ON TABLE "public"."course_offerings" TO "authenticated";
GRANT ALL ON TABLE "public"."course_offerings" TO "service_role";



GRANT ALL ON TABLE "public"."course_todos" TO "anon";
GRANT ALL ON TABLE "public"."course_todos" TO "authenticated";
GRANT ALL ON TABLE "public"."course_todos" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."courseschedules_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."courseschedules_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."courseschedules_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."event_invites" TO "anon";
GRANT ALL ON TABLE "public"."event_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."event_invites" TO "service_role";



GRANT ALL ON TABLE "public"."event_registrations" TO "anon";
GRANT ALL ON TABLE "public"."event_registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."event_registrations" TO "service_role";



GRANT ALL ON TABLE "public"."event_responses" TO "anon";
GRANT ALL ON TABLE "public"."event_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."event_responses" TO "service_role";



GRANT ALL ON TABLE "public"."folders" TO "anon";
GRANT ALL ON TABLE "public"."folders" TO "authenticated";
GRANT ALL ON TABLE "public"."folders" TO "service_role";



GRANT ALL ON TABLE "public"."four_year_plans" TO "anon";
GRANT ALL ON TABLE "public"."four_year_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."four_year_plans" TO "service_role";



GRANT ALL ON TABLE "public"."grading_rubrics" TO "anon";
GRANT ALL ON TABLE "public"."grading_rubrics" TO "authenticated";
GRANT ALL ON TABLE "public"."grading_rubrics" TO "service_role";



GRANT ALL ON TABLE "public"."group_members" TO "anon";
GRANT ALL ON TABLE "public"."group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."group_members" TO "service_role";



GRANT ALL ON TABLE "public"."group_posts" TO "anon";
GRANT ALL ON TABLE "public"."group_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."group_posts" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."household_invitations" TO "anon";
GRANT ALL ON TABLE "public"."household_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."household_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."household_members" TO "anon";
GRANT ALL ON TABLE "public"."household_members" TO "authenticated";
GRANT ALL ON TABLE "public"."household_members" TO "service_role";



GRANT ALL ON TABLE "public"."households" TO "anon";
GRANT ALL ON TABLE "public"."households" TO "authenticated";
GRANT ALL ON TABLE "public"."households" TO "service_role";



GRANT ALL ON TABLE "public"."id_cards" TO "anon";
GRANT ALL ON TABLE "public"."id_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."id_cards" TO "service_role";



GRANT ALL ON TABLE "public"."ledger_entries" TO "anon";
GRANT ALL ON TABLE "public"."ledger_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."ledger_entries" TO "service_role";



GRANT ALL ON TABLE "public"."ledger_entry_skills" TO "anon";
GRANT ALL ON TABLE "public"."ledger_entry_skills" TO "authenticated";
GRANT ALL ON TABLE "public"."ledger_entry_skills" TO "service_role";



GRANT ALL ON TABLE "public"."ledger_settings" TO "anon";
GRANT ALL ON TABLE "public"."ledger_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."ledger_settings" TO "service_role";



GRANT ALL ON TABLE "public"."my_courses" TO "anon";
GRANT ALL ON TABLE "public"."my_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."my_courses" TO "service_role";



GRANT ALL ON TABLE "public"."my_terms" TO "anon";
GRANT ALL ON TABLE "public"."my_terms" TO "authenticated";
GRANT ALL ON TABLE "public"."my_terms" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_progress" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_progress" TO "service_role";



GRANT ALL ON TABLE "public"."post_comments" TO "anon";
GRANT ALL ON TABLE "public"."post_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."post_comments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."post_comments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."post_comments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."post_comments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."post_drafts" TO "anon";
GRANT ALL ON TABLE "public"."post_drafts" TO "authenticated";
GRANT ALL ON TABLE "public"."post_drafts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."post_drafts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."post_drafts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."post_drafts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."post_favorites" TO "anon";
GRANT ALL ON TABLE "public"."post_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."post_favorites" TO "service_role";



GRANT ALL ON SEQUENCE "public"."post_favorites_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."post_favorites_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."post_favorites_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."post_likes" TO "anon";
GRANT ALL ON TABLE "public"."post_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."post_likes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."post_likes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."post_likes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."post_likes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."psa_submissions" TO "anon";
GRANT ALL ON TABLE "public"."psa_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."psa_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."school_philosophies" TO "anon";
GRANT ALL ON TABLE "public"."school_philosophies" TO "authenticated";
GRANT ALL ON TABLE "public"."school_philosophies" TO "service_role";



GRANT ALL ON TABLE "public"."school_profiles" TO "anon";
GRANT ALL ON TABLE "public"."school_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."school_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."students" TO "anon";
GRANT ALL ON TABLE "public"."students" TO "authenticated";
GRANT ALL ON TABLE "public"."students" TO "service_role";



GRANT ALL ON TABLE "public"."submissions" TO "anon";
GRANT ALL ON TABLE "public"."submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."submissions" TO "service_role";



GRANT ALL ON TABLE "public"."support_messages" TO "anon";
GRANT ALL ON TABLE "public"."support_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."support_messages" TO "service_role";



GRANT ALL ON TABLE "public"."transcripts" TO "anon";
GRANT ALL ON TABLE "public"."transcripts" TO "authenticated";
GRANT ALL ON TABLE "public"."transcripts" TO "service_role";



GRANT ALL ON TABLE "public"."user_calendars" TO "anon";
GRANT ALL ON TABLE "public"."user_calendars" TO "authenticated";
GRANT ALL ON TABLE "public"."user_calendars" TO "service_role";



GRANT ALL ON TABLE "public"."user_college_list" TO "anon";
GRANT ALL ON TABLE "public"."user_college_list" TO "authenticated";
GRANT ALL ON TABLE "public"."user_college_list" TO "service_role";



GRANT ALL ON TABLE "public"."user_courses" TO "anon";
GRANT ALL ON TABLE "public"."user_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."user_courses" TO "service_role";



GRANT ALL ON TABLE "public"."user_courses_todos" TO "anon";
GRANT ALL ON TABLE "public"."user_courses_todos" TO "authenticated";
GRANT ALL ON TABLE "public"."user_courses_todos" TO "service_role";



GRANT ALL ON TABLE "public"."user_scholarships" TO "anon";
GRANT ALL ON TABLE "public"."user_scholarships" TO "authenticated";
GRANT ALL ON TABLE "public"."user_scholarships" TO "service_role";



GRANT ALL ON TABLE "public"."work_permits" TO "anon";
GRANT ALL ON TABLE "public"."work_permits" TO "authenticated";
GRANT ALL ON TABLE "public"."work_permits" TO "service_role";



GRANT ALL ON TABLE "public"."work_samples" TO "anon";
GRANT ALL ON TABLE "public"."work_samples" TO "authenticated";
GRANT ALL ON TABLE "public"."work_samples" TO "service_role";



GRANT ALL ON TABLE "public"."youredu_courses" TO "anon";
GRANT ALL ON TABLE "public"."youredu_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."youredu_courses" TO "service_role";



GRANT ALL ON TABLE "public"."youredu_courses_assignments" TO "anon";
GRANT ALL ON TABLE "public"."youredu_courses_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."youredu_courses_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."youredu_courses_assignments_submissions" TO "anon";
GRANT ALL ON TABLE "public"."youredu_courses_assignments_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."youredu_courses_assignments_submissions" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
