-- Assumed workout core used by the EvoluaFit client.
-- Safe to run on environments that already have these objects (IF NOT EXISTS / OR REPLACE).
-- Does not create a generic user_progress table.

create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Planilha ativa',
  plan_data jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists workout_plans_one_active_idx
  on public.workout_plans (user_id)
  where is_active;

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id text not null,
  workout_plan_id uuid references public.workout_plans (id) on delete set null,
  plan_day_key text,
  workout_name text not null default 'Treino',
  status text not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  perceived_effort numeric,
  notes text,
  workout_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists workout_sessions_user_started_idx
  on public.workout_sessions (user_id, started_at desc);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  client_id text not null,
  exercise_key text not null default '',
  exercise_name text not null default '',
  exercise_order integer not null default 0,
  set_number integer not null default 1,
  set_type text not null default 'working',
  planned_reps integer,
  repetitions integer,
  weight numeric,
  duration_seconds integer,
  distance_meters numeric,
  rpe numeric,
  completed boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, client_id)
);

create or replace view public.workout_session_summaries
with (security_invoker = true) as
select
  s.id,
  s.user_id,
  s.workout_name,
  s.status,
  s.started_at,
  s.completed_at,
  s.duration_seconds,
  s.perceived_effort,
  s.notes,
  count(st.id) filter (where st.completed) as completed_sets,
  count(distinct st.exercise_key) filter (where st.exercise_key <> '') as exercises_completed,
  coalesce(sum(st.repetitions), 0) as total_repetitions,
  coalesce(sum(coalesce(st.weight, 0) * coalesce(st.repetitions, 0)), 0) as total_volume
from public.workout_sessions s
left join public.workout_sets st on st.session_id = s.id
group by s.id;

create or replace view public.exercise_session_progress
with (security_invoker = true) as
select
  s.id as session_id,
  s.user_id,
  s.workout_name,
  s.started_at,
  s.completed_at,
  st.exercise_key,
  max(st.exercise_name) as exercise_name,
  count(st.id) filter (where st.completed) as completed_sets,
  max(st.weight) as max_weight,
  max(st.repetitions) as max_repetitions,
  max(coalesce(st.weight, 0) * coalesce(st.repetitions, 0)) as best_set_volume,
  sum(coalesce(st.weight, 0) * coalesce(st.repetitions, 0)) as session_volume,
  sum(st.repetitions) as session_repetitions
from public.workout_sessions s
join public.workout_sets st on st.session_id = s.id
where coalesce(st.exercise_key, '') <> ''
group by s.id, s.user_id, s.workout_name, s.started_at, s.completed_at, st.exercise_key;

create or replace view public.exercise_personal_records
with (security_invoker = true) as
select
  user_id,
  exercise_key,
  max(exercise_name) as exercise_name,
  max(max_weight) as record_weight,
  max(max_repetitions) as record_repetitions,
  max(best_set_volume) as record_set_volume,
  count(*) as sessions_count,
  max(completed_at) as last_performed_at
from public.exercise_session_progress
group by user_id, exercise_key;

alter table public.workout_plans enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;

drop policy if exists workout_plans_own on public.workout_plans;
create policy workout_plans_own on public.workout_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists workout_sessions_own on public.workout_sessions;
create policy workout_sessions_own on public.workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists workout_sets_own on public.workout_sets;
create policy workout_sets_own on public.workout_sets
  for all using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
