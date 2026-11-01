-- VaradIQ live search limits: protects your AI credit.
-- Run once in Supabase → SQL Editor → New query → Run (after schema.sql).
--
-- Change the limits any time in Supabase → Table Editor → app_settings:
--   live_searches_per_person_per_day  (default 5)
--   live_searches_per_day_total       (default 60, everyone together)
-- Days reset at midnight UTC (about 10–11am in Sydney).

create table if not exists public.app_settings (
  key text primary key,
  value int not null
);
insert into public.app_settings (key, value) values
  ('live_searches_per_person_per_day', 5),
  ('live_searches_per_day_total', 60)
on conflict (key) do nothing;
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;

-- How many live searches each person used each day. Nobody can read or edit
-- this directly; only the function below changes it.
create table if not exists public.search_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (user_id, day)
);
alter table public.search_usage enable row level security;
revoke all on public.search_usage from anon, authenticated;

-- Called by the website's server before each live search, as the signed-in
-- person. Counts the search if they (and everyone together) are under today's
-- limits. Returns {ok, reason, used, limit}.
create or replace function public.use_live_search()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  today date := (now() at time zone 'utc')::date;
  per_person int;
  total_cap int;
  mine int;
  everyone int;
begin
  if uid is null then
    return json_build_object('ok', false, 'reason', 'signin');
  end if;
  select value into per_person from app_settings where key = 'live_searches_per_person_per_day';
  select value into total_cap from app_settings where key = 'live_searches_per_day_total';
  per_person := coalesce(per_person, 5);
  total_cap := coalesce(total_cap, 60);

  -- One search counted at a time, so two clicks can't both slip under a limit.
  perform pg_advisory_xact_lock(hashtext('varadiq_live_search'));
  select count into mine from search_usage where user_id = uid and day = today;
  mine := coalesce(mine, 0);
  select coalesce(sum(count), 0) into everyone from search_usage where day = today;

  if mine >= per_person then
    return json_build_object('ok', false, 'reason', 'person', 'used', mine, 'limit', per_person);
  end if;
  if everyone >= total_cap then
    return json_build_object('ok', false, 'reason', 'total', 'used', mine, 'limit', per_person);
  end if;

  insert into search_usage (user_id, day, count) values (uid, today, 1)
  on conflict (user_id, day) do update set count = search_usage.count + 1;
  return json_build_object('ok', true, 'used', mine + 1, 'limit', per_person);
end;
$$;

revoke all on function public.use_live_search() from public, anon;
grant execute on function public.use_live_search() to authenticated;
