create table public.student_invitations (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    parent_id uuid references auth.users(id) on delete cascade not null,
    student_name text not null,
    student_email text not null,
    birthday date not null,
    grade_level text not null,
    status text not null default 'pending',
    invitation_token uuid not null unique,
    expires_at timestamp with time zone not null,
    accepted_at timestamp with time zone
);

-- Add RLS policies
alter table public.student_invitations enable row level security;

create policy "Parents can view their own invitations"
    on public.student_invitations for select
    using (auth.uid() = parent_id);

create policy "Parents can create invitations"
    on public.student_invitations for insert
    with check (auth.uid() = parent_id);

create policy "Parents can update their own invitations"
    on public.student_invitations for update
    using (auth.uid() = parent_id);

-- Create index for faster lookups
create index student_invitations_token_idx on public.student_invitations(invitation_token);
create index student_invitations_parent_id_idx on public.student_invitations(parent_id);

-- Add function to clean up expired invitations
create or replace function cleanup_expired_invitations()
returns void
language plpgsql
security definer
as $$
begin
    delete from public.student_invitations
    where status = 'pending'
    and expires_at < now();
end;
$$; 