create table if not exists public.user_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_workspaces enable row level security;

create policy "users can read their workspace"
on public.user_workspaces for select
using (auth.uid() = user_id);

create policy "users can create their workspace"
on public.user_workspaces for insert
with check (auth.uid() = user_id);

create policy "users can update their workspace"
on public.user_workspaces for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can delete their workspace"
on public.user_workspaces for delete
using (auth.uid() = user_id);
