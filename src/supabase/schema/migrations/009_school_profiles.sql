-- Drop existing constraints and triggers first
drop trigger if exists update_school_profiles_updated_at on school_profiles;
drop function if exists update_updated_at_column cascade;

-- Drop existing policies
drop policy if exists "Users can view their own school profile" on school_profiles;
drop policy if exists "Users can insert their own school profile" on school_profiles;
drop policy if exists "Users can update their own school profile" on school_profiles;
drop policy if exists "Users can delete their own school profile" on school_profiles;

-- Drop existing table if it exists (this will also drop its constraints)
drop table if exists school_profiles;

-- Create school_profiles table
create table school_profiles (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null unique,
    prefix text,
    first_name text,
    middle_initial text,
    last_name text,
    title text,
    phone_number text,
    fax text,
    email_address text,
    profile_url text,
    graduating_class_size text,
    block_schedule text,
    graduation_date date,
    outside_us text,
    volunteer_service text,
    school_address text,
    one_sentence_philosophy text,
    why_homeschool text,
    types_of_learning text,
    course_structure text,
    success_measurement text,
    extracurricular_opportunities text,
    ai_philosophy text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS policies
alter table school_profiles enable row level security;

-- Policy for users to view their own school profile
create policy "Users can view their own school profile"
    on school_profiles for select
    using (auth.uid() = user_id);

-- Policy for users to insert their own school profile
create policy "Users can insert their own school profile"
    on school_profiles for insert
    with check (auth.uid() = user_id);

-- Policy for users to update their own school profile
create policy "Users can update their own school profile"
    on school_profiles for update
    using (auth.uid() = user_id);

-- Policy for users to delete their own school profile
create policy "Users can delete their own school profile"
    on school_profiles for delete
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
create trigger update_school_profiles_updated_at
    before update on school_profiles
    for each row
    execute function update_updated_at_column(); 