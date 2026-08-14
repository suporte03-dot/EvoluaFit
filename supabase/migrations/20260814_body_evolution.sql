-- Espelho Evolutivo / Body Evolution
-- Run in the Supabase SQL editor (or via CLI) before using the module.
-- Does not alter existing workout, profile, or auth tables.

create table if not exists public.body_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  height numeric(5, 1),
  goal_type text,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.body_photo_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  consent_version text not null,
  accepted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, consent_version)
);

create table if not exists public.body_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  checkin_date date not null default current_date,
  weight numeric(5, 1),
  body_fat_percentage numeric(4, 1),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists body_checkins_user_date_idx
  on public.body_checkins (user_id, checkin_date desc, created_at desc);

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid not null unique references public.body_checkins (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  chest numeric(5, 1),
  waist numeric(5, 1),
  hips numeric(5, 1),
  right_arm numeric(5, 1),
  left_arm numeric(5, 1),
  right_thigh numeric(5, 1),
  left_thigh numeric(5, 1),
  right_calf numeric(5, 1),
  left_calf numeric(5, 1),
  created_at timestamptz not null default now()
);

create table if not exists public.body_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  checkin_id uuid not null references public.body_checkins (id) on delete cascade,
  photo_type text not null check (photo_type in ('front', 'side', 'back')),
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique (checkin_id, photo_type)
);

create table if not exists public.body_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  target_weight numeric(5, 1),
  target_waist numeric(5, 1),
  target_chest numeric(5, 1),
  target_arm numeric(5, 1),
  target_hips numeric(5, 1),
  target_thigh numeric(5, 1),
  goal_type text,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.body_profiles enable row level security;
alter table public.body_photo_consents enable row level security;
alter table public.body_checkins enable row level security;
alter table public.body_measurements enable row level security;
alter table public.body_photos enable row level security;
alter table public.body_goals enable row level security;

drop policy if exists body_profiles_select_own on public.body_profiles;
drop policy if exists body_profiles_insert_own on public.body_profiles;
drop policy if exists body_profiles_update_own on public.body_profiles;
drop policy if exists body_profiles_delete_own on public.body_profiles;

create policy body_profiles_select_own on public.body_profiles
  for select to authenticated using (auth.uid() = user_id);
create policy body_profiles_insert_own on public.body_profiles
  for insert to authenticated with check (auth.uid() = user_id);
create policy body_profiles_update_own on public.body_profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy body_profiles_delete_own on public.body_profiles
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists body_photo_consents_select_own on public.body_photo_consents;
drop policy if exists body_photo_consents_insert_own on public.body_photo_consents;
drop policy if exists body_photo_consents_update_own on public.body_photo_consents;
drop policy if exists body_photo_consents_delete_own on public.body_photo_consents;

create policy body_photo_consents_select_own on public.body_photo_consents
  for select to authenticated using (auth.uid() = user_id);
create policy body_photo_consents_insert_own on public.body_photo_consents
  for insert to authenticated with check (auth.uid() = user_id);
create policy body_photo_consents_update_own on public.body_photo_consents
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy body_photo_consents_delete_own on public.body_photo_consents
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists body_checkins_select_own on public.body_checkins;
drop policy if exists body_checkins_insert_own on public.body_checkins;
drop policy if exists body_checkins_update_own on public.body_checkins;
drop policy if exists body_checkins_delete_own on public.body_checkins;

create policy body_checkins_select_own on public.body_checkins
  for select to authenticated using (auth.uid() = user_id);
create policy body_checkins_insert_own on public.body_checkins
  for insert to authenticated with check (auth.uid() = user_id);
create policy body_checkins_update_own on public.body_checkins
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy body_checkins_delete_own on public.body_checkins
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists body_measurements_select_own on public.body_measurements;
drop policy if exists body_measurements_insert_own on public.body_measurements;
drop policy if exists body_measurements_update_own on public.body_measurements;
drop policy if exists body_measurements_delete_own on public.body_measurements;

create policy body_measurements_select_own on public.body_measurements
  for select to authenticated using (auth.uid() = user_id);
create policy body_measurements_insert_own on public.body_measurements
  for insert to authenticated with check (auth.uid() = user_id);
create policy body_measurements_update_own on public.body_measurements
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy body_measurements_delete_own on public.body_measurements
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists body_photos_select_own on public.body_photos;
drop policy if exists body_photos_insert_own on public.body_photos;
drop policy if exists body_photos_update_own on public.body_photos;
drop policy if exists body_photos_delete_own on public.body_photos;

create policy body_photos_select_own on public.body_photos
  for select to authenticated using (auth.uid() = user_id);
create policy body_photos_insert_own on public.body_photos
  for insert to authenticated with check (auth.uid() = user_id);
create policy body_photos_update_own on public.body_photos
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy body_photos_delete_own on public.body_photos
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists body_goals_select_own on public.body_goals;
drop policy if exists body_goals_insert_own on public.body_goals;
drop policy if exists body_goals_update_own on public.body_goals;
drop policy if exists body_goals_delete_own on public.body_goals;

create policy body_goals_select_own on public.body_goals
  for select to authenticated using (auth.uid() = user_id);
create policy body_goals_insert_own on public.body_goals
  for insert to authenticated with check (auth.uid() = user_id);
create policy body_goals_update_own on public.body_goals
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy body_goals_delete_own on public.body_goals
  for delete to authenticated using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'body-progress',
  'body-progress',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists body_progress_select_own on storage.objects;
drop policy if exists body_progress_insert_own on storage.objects;
drop policy if exists body_progress_update_own on storage.objects;
drop policy if exists body_progress_delete_own on storage.objects;

create policy body_progress_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'body-progress'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy body_progress_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'body-progress'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy body_progress_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'body-progress'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'body-progress'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy body_progress_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'body-progress'
    and split_part(name, '/', 1) = auth.uid()::text
  );
