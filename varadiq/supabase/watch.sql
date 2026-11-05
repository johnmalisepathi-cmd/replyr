-- VaradIQ daily watch: each morning the server searches the web again for the
-- goals people asked it to watch, and emails them when something is cheaper
-- or better. Run once in Supabase → SQL Editor → New query → Run.
--
-- Limits (change any time in Table Editor → app_settings):
--   watched_goals_per_person   (default 2)
--   auto_checks_per_day_total  (default 30, everyone together)

insert into public.app_settings (key, value) values
  ('watched_goals_per_person', 2),
  ('auto_checks_per_day_total', 30)
on conflict (key) do nothing;

-- The latest automatic check of each watched goal. Written only by the
-- server; each person can read their own rows (the app shows the results).
create table if not exists public.goal_watch (
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_id text not null,
  checked_at timestamptz not null default now(),
  checks int not null default 0,
  items jsonb not null default '[]'::jsonb,
  news jsonb not null default '[]'::jsonb,
  last_alert_at timestamptz,
  primary key (user_id, goal_id)
);
alter table public.goal_watch enable row level security;
revoke all on public.goal_watch from anon, authenticated;
grant select on public.goal_watch to authenticated;
drop policy if exists "read own watch" on public.goal_watch;
create policy "read own watch" on public.goal_watch
  for select using (auth.uid() = user_id);

-- Whether a person wants alert emails at all. The app's switch and the
-- "Stop alerts" link in each email both set this.
create table if not exists public.alert_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  emails_off boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.alert_prefs enable row level security;
revoke all on public.alert_prefs from anon, authenticated;
grant select, insert, update on public.alert_prefs to authenticated;
drop policy if exists "read own prefs" on public.alert_prefs;
create policy "read own prefs" on public.alert_prefs
  for select using (auth.uid() = user_id);
drop policy if exists "insert own prefs" on public.alert_prefs;
create policy "insert own prefs" on public.alert_prefs
  for insert with check (auth.uid() = user_id);
drop policy if exists "update own prefs" on public.alert_prefs;
create policy "update own prefs" on public.alert_prefs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
