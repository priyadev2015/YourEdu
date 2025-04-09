-- Create id_cards table
create table if not exists id_cards (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    type text check (type in ('student', 'teacher')) not null,
    first_name text not null,
    last_name text not null,
    grade text,
    school_name text not null,
    school_logo_url text,
    school_address text not null,
    school_phone text not null,
    photo_url text,
    expiration_date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS policies
alter table id_cards enable row level security;

-- Policy for users to view their own id cards
create policy "Users can view their own id cards"
    on id_cards for select
    using (auth.uid() = user_id);

-- Policy for users to insert their own id cards
create policy "Users can insert their own id cards"
    on id_cards for insert
    with check (auth.uid() = user_id);

-- Policy for users to update their own id cards
create policy "Users can update their own id cards"
    on id_cards for update
    using (auth.uid() = user_id);

-- Policy for users to delete their own id cards
create policy "Users can delete their own id cards"
    on id_cards for delete
    using (auth.uid() = user_id);

-- Create function to automatically update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_id_cards_updated_at
    before update on id_cards
    for each row
    execute function update_updated_at_column(); 