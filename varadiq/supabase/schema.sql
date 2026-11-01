-- VaradIQ database: one row per person with their goals, plan progress and
-- saved finds. Run this once in Supabase → SQL Editor → New query → Run.

create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Signed-in people may use this table (needed when "Automatically expose new
-- tables" is off); the policies below limit each person to their own row.
grant select, insert, update, delete on public.user_state to authenticated;
revoke all on public.user_state from anon;

-- Row Level Security: each person can only read and change their own row.
alter table public.user_state enable row level security;

drop policy if exists "read own state" on public.user_state;
create policy "read own state" on public.user_state
  for select using (auth.uid() = user_id);

drop policy if exists "insert own state" on public.user_state;
create policy "insert own state" on public.user_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own state" on public.user_state;
create policy "update own state" on public.user_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own state" on public.user_state;
create policy "delete own state" on public.user_state
  for delete using (auth.uid() = user_id);
