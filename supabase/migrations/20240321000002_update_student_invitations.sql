-- Add metadata column to student_invitations
ALTER TABLE public.student_invitations
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb; 