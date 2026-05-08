-- terracotta: profile avatars + rate-clears-watchlist trigger

-- 1) Profiles get an avatar path that resolves to an object in the
--    `avatars` storage bucket. Path layout: <user_id>/<filename>.
alter table public.profiles
  add column avatar_path text;

-- 2) When you rate a movie, drop it from your own watchlist (you've
--    now watched it). Doesn't touch your partner's watchlist row —
--    they may still want to watch it themselves.
create or replace function public.remove_from_watchlist_on_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.watchlist
  where tmdb_id = new.tmdb_id and user_id = new.user_id;
  return new;
end;
$$;

create trigger ratings_remove_from_watchlist
  after insert on public.ratings
  for each row execute function public.remove_from_watchlist_on_rating();

-- 3) Storage bucket for avatars. Public so <img src="…"> works without
--    auth headers; security comes from RLS on uploads/updates/deletes.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 4) Storage RLS — each user owns the folder named after their UUID.
create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

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
