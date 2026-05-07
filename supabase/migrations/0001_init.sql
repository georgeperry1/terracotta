-- terracotta: initial schema
-- Tables, row-level security, and triggers for movies, ratings,
-- watchlist, and a shared queue.

set check_function_bodies = off;

------------------------------------------------------------------
-- profiles: one row per household member, FK to auth.users.
--   Seeded automatically by a trigger on auth.users.
------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- When a new auth user is created (via dashboard invite), seed a
-- profiles row using the email local-part as the initial display_name.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

------------------------------------------------------------------
-- movies: shared TMDB metadata cache.
------------------------------------------------------------------
create table public.movies (
  tmdb_id integer primary key,
  title text not null,
  year integer,
  director text,
  poster_path text,
  overview text,
  runtime integer,
  genres text[] not null default '{}',
  fetched_at timestamptz not null default now()
);

alter table public.movies enable row level security;

create policy "movies are readable by authenticated users"
  on public.movies for select
  to authenticated
  using (true);

create policy "authenticated users can upsert movies"
  on public.movies for insert
  to authenticated
  with check (true);

create policy "authenticated users can refresh movies"
  on public.movies for update
  to authenticated
  using (true)
  with check (true);

------------------------------------------------------------------
-- ratings: one row per (movie, user). Score is 0.5–10 in 0.5 steps.
------------------------------------------------------------------
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  tmdb_id integer not null references public.movies(tmdb_id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score numeric(3,1) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tmdb_id, user_id),
  constraint ratings_score_range check (score >= 0.5 and score <= 10),
  constraint ratings_score_half_step check ((score * 2) = floor(score * 2))
);

create index ratings_user_id_idx on public.ratings(user_id);
create index ratings_tmdb_id_idx on public.ratings(tmdb_id);

alter table public.ratings enable row level security;

create policy "ratings are readable by authenticated users"
  on public.ratings for select
  to authenticated
  using (true);

create policy "users insert their own ratings"
  on public.ratings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users update their own ratings"
  on public.ratings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users delete their own ratings"
  on public.ratings for delete
  to authenticated
  using (auth.uid() = user_id);

-- Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger ratings_set_updated_at
  before update on public.ratings
  for each row execute function public.set_updated_at();

------------------------------------------------------------------
-- watchlist: personal "want to watch" markers.
------------------------------------------------------------------
create table public.watchlist (
  id uuid primary key default gen_random_uuid(),
  tmdb_id integer not null references public.movies(tmdb_id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (tmdb_id, user_id)
);

create index watchlist_user_id_idx on public.watchlist(user_id);

alter table public.watchlist enable row level security;

create policy "watchlist rows are readable by authenticated users"
  on public.watchlist for select
  to authenticated
  using (true);

create policy "users add their own watchlist entries"
  on public.watchlist for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users remove their own watchlist entries"
  on public.watchlist for delete
  to authenticated
  using (auth.uid() = user_id);

------------------------------------------------------------------
-- queue: shared list, oldest-first. Partner can register a
-- thumbs-up/down vote; informational only.
------------------------------------------------------------------
create type public.queue_vote as enum ('up', 'down');

create table public.queue (
  id uuid primary key default gen_random_uuid(),
  tmdb_id integer not null unique references public.movies(tmdb_id) on delete cascade,
  added_by uuid not null references public.profiles(id) on delete cascade,
  added_at timestamptz not null default now(),
  partner_vote public.queue_vote,
  partner_voted_at timestamptz,
  constraint queue_partner_vote_consistency
    check ((partner_vote is null) = (partner_voted_at is null))
);

create index queue_added_at_idx on public.queue(added_at);

alter table public.queue enable row level security;

create policy "queue rows are readable by authenticated users"
  on public.queue for select
  to authenticated
  using (true);

create policy "users add to queue (as themselves)"
  on public.queue for insert
  to authenticated
  with check (auth.uid() = added_by);

-- Only the partner (i.e. the user who did NOT add the movie) may set
-- partner_vote. The adder cannot vote on their own pick.
create policy "partner registers their vote"
  on public.queue for update
  to authenticated
  using (auth.uid() <> added_by)
  with check (auth.uid() <> added_by);

create policy "either user can remove a queue item"
  on public.queue for delete
  to authenticated
  using (true);

-- Auto-remove a movie from the queue once anyone has rated it.
create or replace function public.remove_from_queue_on_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.queue where tmdb_id = new.tmdb_id;
  return new;
end;
$$;

create trigger ratings_remove_from_queue
  after insert on public.ratings
  for each row execute function public.remove_from_queue_on_rating();
