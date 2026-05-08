-- terracotta: avatars storage bucket + RLS
--
-- Apply via the Supabase dashboard SQL editor. `supabase db push`
-- runs as a role that can't see the `storage` schema, so this file
-- is intentionally NOT a migration.
--
-- Alternatively: create the bucket from the dashboard UI
-- (Storage -> New bucket -> name "avatars", public toggle ON), then
-- only paste the four `create policy` blocks below.

-- Public bucket so <img src="…"> works without auth headers; security
-- comes from the RLS on uploads/updates/deletes.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Anyone can read avatars.
create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Each user owns the folder named after their UUID.
create policy "Users can upload to their own avatar folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own avatars"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
