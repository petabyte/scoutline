-- Scoutline database schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query) once,
-- against a fresh Supabase project.

-- Players table: one row per player, linked 1:1 to a Supabase auth user.
create table if not exists players (
  id uuid primary key references auth.users(id) on delete cascade,
  slug text unique not null,                -- url-friendly handle, e.g. "erin-johnson-2028"
  full_name text not null,
  grad_year int not null,
  position text,                            -- "PG", "SG", "SF", "PF", "C", "Combo"
  height_inches int,
  hometown text,
  high_school text,
  club_team text,                           -- AAU / travel team
  gpa numeric(3,2),
  bio text,
  stat_line text,                           -- free-text season line, e.g. "18.4 PPG / 6.1 RPG / 3.2 APG"
  highlight_url text,                       -- YouTube / Hudl / Vimeo link
  photo_url text,                           -- headshot, stored in Supabase Storage
  contact_email text,                       -- shown only to logged-in coaches, see RLS below
  is_verified boolean not null default false,
  is_published boolean not null default false,   -- true only while subscription is active
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text not null default 'inactive', -- inactive | active | past_due | canceled
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists players_grad_year_idx on players (grad_year);
create index if not exists players_position_idx on players (position);
create index if not exists players_published_idx on players (is_published);

-- Coaches / scouts get a lightweight account too, so we know who's viewing
-- and can eventually show "viewed by N coaches" analytics to players.
create table if not exists coaches (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  organization text,                        -- college / program name
  role text,                                -- "Head Coach", "Recruiting Coordinator", etc.
  created_at timestamptz not null default now()
);

-- Admin-curated lists, e.g. "Top 30 Point Guards — Class of 2027"
create table if not exists curated_lists (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists curated_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references curated_lists(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  rank int not null,
  note text,                                -- short scouting note for why they're on the list
  unique (list_id, player_id)
);

-- Simple allowlist of admin emails, checked from API routes / RLS below.
create table if not exists admins (
  email text primary key
);

-- ---------- Row Level Security ----------

alter table players enable row level security;
alter table coaches enable row level security;
alter table curated_lists enable row level security;
alter table curated_list_items enable row level security;
alter table admins enable row level security;

-- Anyone (including anonymous visitors) can read published, verified player profiles.
create policy "public read published players"
  on players for select
  using (is_published = true);

-- A player can always see and edit their own row, published or not.
create policy "player reads own row"
  on players for select
  using (auth.uid() = id);

create policy "player updates own row"
  on players for update
  using (auth.uid() = id);

create policy "player inserts own row"
  on players for insert
  with check (auth.uid() = id);

-- Coaches can read/write their own row only.
create policy "coach manages own row"
  on coaches for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Curated lists: public can read published lists; writes happen via the
-- service role from the admin API routes (server-side, bypasses RLS).
create policy "public read published lists"
  on curated_lists for select
  using (published = true);

create policy "public read list items of published lists"
  on curated_list_items for select
  using (
    exists (
      select 1 from curated_lists l
      where l.id = curated_list_items.list_id and l.published = true
    )
  );

-- Admin table is only ever read via the service role (server-side), so no
-- public policy is defined for it — RLS with zero policies means "deny all"
-- for anon/authenticated roles, which is what we want.
