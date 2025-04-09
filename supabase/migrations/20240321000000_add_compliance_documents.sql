-- Drop existing policies if they exist
drop policy if exists "Users can view their own documents" on storage.objects;
drop policy if exists "Users can upload their own documents" on storage.objects;
drop policy if exists "Users can update their own documents" on storage.objects;
drop policy if exists "Users can delete their own documents" on storage.objects;

-- Create compliance_documents table if it doesn't exist
create table if not exists public.compliance_documents (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    state text not null,
    document_type text not null,
    file_name text not null,
    file_path text not null,
    file_url text not null,
    status text not null default 'pending',
    uploaded_at timestamp with time zone not null default now(),
    emailed_at timestamp with time zone,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.compliance_documents enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own documents" on public.compliance_documents;
drop policy if exists "Users can insert their own documents" on public.compliance_documents;
drop policy if exists "Users can update their own documents" on public.compliance_documents;
drop policy if exists "Users can delete their own documents" on public.compliance_documents;

-- Create policies
create policy "Users can view their own documents"
    on public.compliance_documents for select
    using (auth.uid() = user_id);

create policy "Users can insert their own documents"
    on public.compliance_documents for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own documents"
    on public.compliance_documents for update
    using (auth.uid() = user_id);

create policy "Users can delete their own documents"
    on public.compliance_documents for delete
    using (auth.uid() = user_id);

-- Create storage bucket for compliance documents if it doesn't exist
insert into storage.buckets (id, name, public)
select 'compliance_documents', 'compliance_documents', true
where not exists (
    select 1 from storage.buckets where id = 'compliance_documents'
);

-- Create storage policies
create policy "Users can view their own documents"
    on storage.objects for select
    using (bucket_id = 'compliance_documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload their own documents"
    on storage.objects for insert
    with check (bucket_id = 'compliance_documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own documents"
    on storage.objects for update
    using (bucket_id = 'compliance_documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own documents"
    on storage.objects for delete
    using (bucket_id = 'compliance_documents' and auth.uid()::text = (storage.foldername(name))[1]); 