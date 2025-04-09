-- Add delete policy for student_invitations
create policy "Parents can delete their own invitations"
    on public.student_invitations for delete
    using (auth.uid() = parent_id); 