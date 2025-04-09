-- Drop existing tables and triggers
DROP TRIGGER IF EXISTS update_event_attendees_trigger ON public.event_registrations;
DROP FUNCTION IF EXISTS public.update_event_attendees();
DROP TABLE IF EXISTS public.event_registrations;
DROP TABLE IF EXISTS public.events;

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    category text NOT NULL,
    description text,
    date date NOT NULL,
    time time NOT NULL,
    location text NOT NULL,
    max_attendees integer NOT NULL,
    current_attendees integer DEFAULT 0,
    is_public boolean DEFAULT true,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create event registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(event_id, user_id)
);

-- Create RLS policies for events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public events are viewable by everyone" ON public.events
    FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can view their own private events" ON public.events
    FOR SELECT
    USING (created_by = auth.uid());

CREATE POLICY "Users can create events" ON public.events
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own events" ON public.events
    FOR UPDATE
    USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own events" ON public.events
    FOR DELETE
    USING (created_by = auth.uid());

-- Create RLS policies for event registrations table
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registrations" ON public.event_registrations
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can register for events" ON public.event_registrations
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = event_id
            AND (e.is_public = true OR e.created_by = auth.uid())
            AND e.current_attendees < e.max_attendees
        )
    );

CREATE POLICY "Users can cancel their own registrations" ON public.event_registrations
    FOR DELETE
    USING (user_id = auth.uid());

-- Create function to update current_attendees count
CREATE OR REPLACE FUNCTION public.update_event_attendees()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating current_attendees
CREATE TRIGGER update_event_attendees_trigger
AFTER INSERT OR DELETE ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_event_attendees();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS events_created_by_idx ON public.events(created_by);
CREATE INDEX IF NOT EXISTS events_is_public_idx ON public.events(is_public);
CREATE INDEX IF NOT EXISTS event_registrations_user_id_idx ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS event_registrations_event_id_idx ON public.event_registrations(event_id); 