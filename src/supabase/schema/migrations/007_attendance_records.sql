-- Create attendance_records table
create table if not exists attendance_records (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references students(id) on delete cascade,
    date date not null,
    status text check (status in ('present', 'absent', 'not_marked')) default 'not_marked',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    -- Ensure one record per student per day
    unique(student_id, date)
);

-- Create index for faster lookups
create index if not exists attendance_records_student_id_date_idx on attendance_records(student_id, date);

-- Add RLS policies
alter table attendance_records enable row level security;

-- Policy to allow users to read their own students' attendance records
create policy "Users can view their students' attendance records"
    on attendance_records for select
    using (
        exists (
            select 1 from students
            where students.id = attendance_records.student_id
            and students.parent_id = auth.uid()
        )
    );

-- Policy to allow users to insert attendance records for their students
create policy "Users can insert attendance records for their students"
    on attendance_records for insert
    with check (
        exists (
            select 1 from students
            where students.id = attendance_records.student_id
            and students.parent_id = auth.uid()
        )
    );

-- Policy to allow users to update attendance records for their students
create policy "Users can update attendance records for their students"
    on attendance_records for update
    using (
        exists (
            select 1 from students
            where students.id = attendance_records.student_id
            and students.parent_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at on record update
create trigger update_attendance_records_updated_at
    before update on attendance_records
    for each row
    execute function update_updated_at_column(); 