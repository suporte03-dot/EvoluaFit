-- Painel da Área de Foco por usuário autenticado.

create table if not exists public.user_dashboard_layouts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  layout_version integer not null default 1,
  layout jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_dashboard_layouts enable row level security;

drop policy if exists user_dashboard_layouts_own on public.user_dashboard_layouts;
create policy user_dashboard_layouts_own on public.user_dashboard_layouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
