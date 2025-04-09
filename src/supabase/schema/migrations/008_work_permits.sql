-- Create work_permits table
create table if not exists work_permits (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    student_name text not null,
    date_of_birth date not null,
    address text not null,
    phone_number text not null,
    employer_name text not null,
    employer_address text not null,
    employer_phone text not null,
    job_title text not null,
    work_schedule text not null,
    start_date date not null,
    parent_name text not null,
    parent_phone text not null,
    parent_email text not null,
    status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS policies
alter table work_permits enable row level security;

-- Policy for users to view their own work permits
create policy "Users can view their own work permits"
    on work_permits for select
    using (auth.uid() = user_id);

-- Policy for users to insert their own work permits
create policy "Users can insert their own work permits"
    on work_permits for insert
    with check (auth.uid() = user_id);

-- Policy for users to update their own work permits
create policy "Users can update their own work permits"
    on work_permits for update
    using (auth.uid() = user_id);

-- Policy for users to delete their own work permits
create policy "Users can delete their own work permits"
    on work_permits for delete
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
create trigger update_work_permits_updated_at
    before update on work_permits
    for each row
    execute function update_updated_at_column();