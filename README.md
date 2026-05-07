# terracotta

> A private, mobile-first movie rating library for two.

George and Isabelle each rate films on a half-star scale (0.5–10), maintain
personal watchlists, and curate a shared **Queue** of films to watch next —
where the partner can register a thumbs up/down on every pick.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Postgres, Auth, RLS) — magic-link email auth
- TMDB v3 for movie metadata
- Vitest + React Testing Library

## Local development

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up Supabase

You can either use a hosted Supabase project or run the local stack via Docker.

**Hosted (recommended for the real app):**

1. Create a new project at <https://supabase.com>.
2. In **Auth → Providers**, leave Email enabled and disable signups (this
   project is invite-only).
3. **Auth → Users → Invite user** for `george@…` and `isabelle@…`. The
   `on_auth_user_created` trigger will seed their `profiles` rows.
4. Apply the migration:
   ```bash
   pnpm dlx supabase link --project-ref <your-ref>
   pnpm dlx supabase db push
   ```

**Local (for development):**

```bash
pnpm dlx supabase start    # requires Docker
pnpm dlx supabase db reset # applies migrations + seed.sql
```

### 3. Configure environment

```bash
cp .env.example .env.local
# fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_TMDB_TOKEN
```

A TMDB v4 read-access token can be created at
<https://www.themoviedb.org/settings/api>.

### 4. Run

```bash
pnpm dev          # dev server on http://localhost:5173
pnpm test         # vitest
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm build        # production build to dist/
```

## Repository layout

```
src/
  components/ui/   shadcn/ui primitives
  lib/             utilities (cn, supabase client, tmdb client)
  styles/          Tailwind entry + theme variables
supabase/
  migrations/      SQL migrations applied via `supabase db push`
  seed.sql         seed notes
  config.toml      Supabase CLI config for local dev
```
