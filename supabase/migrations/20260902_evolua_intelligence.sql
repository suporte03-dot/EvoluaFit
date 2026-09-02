-- Evolua intelligence, engagement and community (phases 2–4).
-- Client already derives these locally; these tables are the persistence target.

create table if not exists public.evolua_score_weights (
  id uuid primary key default gen_random_uuid(),
  version integer not null unique,
  consistency numeric not null default 0.28,
  goals numeric not null default 0.22,
  frequency numeric not null default 0.18,
  progression numeric not null default 0.18,
  performance numeric not null default 0.14,
  created_at timestamptz not null default now()
);

insert into public.evolua_score_weights (version)
values (1)
on conflict (version) do nothing;

create table if not exists public.coach_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  evidence jsonb not null default '{}'::jsonb,
  cta_label text,
  cta_section text,
  period_start date,
  period_end date,
  created_at timestamptz not null default now()
);

create index if not exists coach_insights_user_idx
  on public.coach_insights (user_id, created_at desc);

create table if not exists public.weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  workouts integer not null default 0,
  volume numeric not null default 0,
  duration integer not null default 0,
  prs integer not null default 0,
  goal integer,
  goal_pct integer,
  source text not null default 'local',
  created_at timestamptz not null default now(),
  unique (user_id, period_start)
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null,
  delta integer not null,
  source_id text,
  created_at timestamptz not null default now()
);

create index if not exists xp_events_user_idx
  on public.xp_events (user_id, created_at desc);

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  detail text
);

insert into public.achievements (id, title, detail) values
  ('start', 'Primeiro treino', 'A jornada começou com uma sessão registrada.'),
  ('five', '5 treinos', 'Consistência começando a aparecer.'),
  ('ten', '10 treinos', 'Rotina consolidando.'),
  ('goal', 'Primeira meta', 'Uma meta saiu do papel.'),
  ('streak3', '3 dias evoluindo', 'Sequência curta, sem punição — só presença.'),
  ('streak7', '7 dias evoluindo', 'Uma semana de consistência saudável.')
on conflict (id) do nothing;

create table if not exists public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table if not exists public.challenges (
  id text primary key,
  title text not null,
  target integer not null,
  window_days integer not null
);

insert into public.challenges (id, title, target, window_days) values
  ('12-in-4', '12 treinos em 4 semanas', 12, 28)
on conflict (id) do nothing;

create table if not exists public.challenge_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_id text not null references public.challenges (id) on delete cascade,
  current integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, challenge_id)
);

create table if not exists public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null,
  title text not null,
  detail text,
  source_id text,
  created_at timestamptz not null default now()
);

create index if not exists activity_feed_user_idx
  on public.activity_feed (user_id, created_at desc);

create table if not exists public.feed_reactions (
  user_id uuid not null references auth.users (id) on delete cascade,
  feed_id uuid not null references public.activity_feed (id) on delete cascade,
  reaction text not null default 'evoluiu',
  created_at timestamptz not null default now(),
  primary key (user_id, feed_id)
);

alter table public.evolua_score_weights enable row level security;
alter table public.coach_insights enable row level security;
alter table public.weekly_summaries enable row level security;
alter table public.xp_events enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_progress enable row level security;
alter table public.activity_feed enable row level security;
alter table public.feed_reactions enable row level security;

drop policy if exists evolua_score_weights_read on public.evolua_score_weights;
create policy evolua_score_weights_read on public.evolua_score_weights
  for select using (true);

drop policy if exists coach_insights_own on public.coach_insights;
create policy coach_insights_own on public.coach_insights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists weekly_summaries_own on public.weekly_summaries;
create policy weekly_summaries_own on public.weekly_summaries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists xp_events_own on public.xp_events;
create policy xp_events_own on public.xp_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists achievements_read on public.achievements;
create policy achievements_read on public.achievements
  for select using (true);

drop policy if exists user_achievements_own on public.user_achievements;
create policy user_achievements_own on public.user_achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists challenges_read on public.challenges;
create policy challenges_read on public.challenges
  for select using (true);

drop policy if exists challenge_progress_own on public.challenge_progress;
create policy challenge_progress_own on public.challenge_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists activity_feed_own on public.activity_feed;
create policy activity_feed_own on public.activity_feed
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists feed_reactions_own on public.feed_reactions;
create policy feed_reactions_own on public.feed_reactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
