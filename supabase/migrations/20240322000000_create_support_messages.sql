-- Create support_messages table
create table public.support_messages (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    name text not null,
    email text not null,
    category text not null,
    message text not null,
    status text not null default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.support_messages enable row level security;

-- Create policies
create policy "Users can view their own messages"
    on public.support_messages for select
    using (auth.uid() = user_id);

create policy "Anyone can create messages"
    on public.support_messages for insert
    with check (true);

-- Create indexes
create index support_messages_user_id_idx on public.support_messages(user_id);
create index support_messages_status_idx on public.support_messages(status);
create index support_messages_category_idx on public.support_messages(category); 