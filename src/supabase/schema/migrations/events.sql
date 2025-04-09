-- Update events table with new fields
alter table events add column if not exists host_id uuid references auth.users(id);
alter table events add column if not exists about_text text;
alter table events add column if not exists venue_name text;
alter table events add column if not exists street_address text;
alter table events add column if not exists city text;
alter table events add column if not exists state text;
alter table events add column if not exists zip text;
alter table events add column if not exists latitude numeric;
alter table events add column if not exists longitude numeric;
alter table events add column if not exists ticket_url text;
alter table events add column if not exists ticket_price numeric;
alter table events add column if not exists is_free boolean default true;

-- Create event_responses table for Going/Interested status
create table if not exists event_responses (
    id uuid default uuid_generate_v4() primary key,
    event_id uuid references events(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    response_type text check (response_type in ('going', 'interested')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(event_id, user_id)
);

-- Add RLS policies for event_responses
alter table event_responses enable row level security;

create policy "Users can view all event responses"
    on event_responses for select
    using (true);

create policy "Users can insert their own responses"
    on event_responses for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own responses"
    on event_responses for update
    using (auth.uid() = user_id);

create policy "Users can delete their own responses"
    on event_responses for delete
    using (auth.uid() = user_id);

-- Create event_invites table
create table if not exists event_invites (
    id uuid default uuid_generate_v4() primary key,
    event_id uuid references events(id) on delete cascade,
    inviter_id uuid references auth.users(id) on delete cascade,
    invitee_id uuid references auth.users(id) on delete cascade,
    status text check (status in ('pending', 'accepted', 'declined')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(event_id, invitee_id)
);

-- Add RLS policies for event_invites
alter table event_invites enable row level security;

create policy "Users can view their invites"
    on event_invites for select
    using (auth.uid() = invitee_id or auth.uid() = inviter_id);

create policy "Users can send invites"
    on event_invites for insert
    with check (auth.uid() = inviter_id);

create policy "Invitees can update their invite status"
    on event_invites for update
    using (auth.uid() = invitee_id);

-- Add indexes for performance
create index if not exists idx_event_responses_event_id on event_responses(event_id);
create index if not exists idx_event_responses_user_id on event_responses(user_id);
create index if not exists idx_event_invites_event_id on event_invites(event_id);
create index if not exists idx_event_invites_invitee_id on event_invites(invitee_id); 