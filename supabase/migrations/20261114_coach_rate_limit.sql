-- Rate limit persistente do Coach IA (/api/coach): uma linha por pergunta aceita.
-- O endpoint conta as linhas do usuário na última hora e insere uma nova, usando o token
-- do próprio usuário (RLS). Sem service role: só SELECT/INSERT das próprias linhas.
--
-- Como aplicar no Supabase:
-- 1. Abra o projeto em https://supabase.com/dashboard → SQL Editor.
-- 2. Cole e execute este arquivo inteiro (idempotente: IF NOT EXISTS / DROP POLICY IF EXISTS).
-- 3. Confirme em Table Editor que public.coach_requests existe com RLS ligado.
-- Alternativa CLI: supabase db push (ou supabase migration up) com o projeto linkado.
-- Sem esta migração, /api/coach continua funcionando com limite em memória por instância.

create table if not exists public.coach_requests (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists coach_requests_user_created_idx
  on public.coach_requests (user_id, created_at desc);

alter table public.coach_requests enable row level security;

drop policy if exists "coach_requests_select_own" on public.coach_requests;
create policy "coach_requests_select_own"
  on public.coach_requests
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "coach_requests_insert_own" on public.coach_requests;
create policy "coach_requests_insert_own"
  on public.coach_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

grant select, insert on public.coach_requests to authenticated;
grant usage, select on sequence public.coach_requests_id_seq to authenticated;
