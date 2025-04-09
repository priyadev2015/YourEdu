-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.user_onboarding_progress;
DROP TABLE IF EXISTS public.onboarding_progress;

-- Create new onboarding_progress table that matches NewOnboarding.js
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    watched_video BOOLEAN DEFAULT false,
    completed_profile BOOLEAN DEFAULT false,
    added_students BOOLEAN DEFAULT false,
    created_course BOOLEAN DEFAULT false,
    submitted_feedback BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own onboarding progress"
    ON public.onboarding_progress FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding progress"
    ON public.onboarding_progress FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding progress"
    ON public.onboarding_progress FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_onboarding_progress_updated_at
    BEFORE UPDATE ON public.onboarding_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index
CREATE INDEX onboarding_progress_user_id_idx ON public.onboarding_progress(user_id); 