create extension if not exists pgcrypto;

create table if not exists public.audits (
  id text primary key,
  team_size integer not null,
  use_case text not null,
  tools jsonb not null,
  results jsonb not null,
  total_monthly_savings numeric(12,2) not null,
  total_annual_savings numeric(12,2) not null,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company text,
  role text,
  audit_id text not null references public.audits (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.audits enable row level security;
alter table public.leads enable row level security;

drop policy if exists "public read audits" on public.audits;
drop policy if exists "public insert audits" on public.audits;
drop policy if exists "public insert leads" on public.leads;

create policy "public read audits"
on public.audits
for select
to anon, authenticated
using (true);

create policy "public insert audits"
on public.audits
for insert
to anon, authenticated
with check (true);

create policy "public insert leads"
on public.leads
for insert
to anon, authenticated
with check (true);