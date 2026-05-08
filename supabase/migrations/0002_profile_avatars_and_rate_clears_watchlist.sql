-- terracotta: profile avatars + rate-clears-watchlist trigger
--
-- Storage bucket and storage RLS live in supabase/storage_setup.sql,
-- applied separately via the dashboard SQL editor — `db push` cannot
-- write to the storage schema.

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
