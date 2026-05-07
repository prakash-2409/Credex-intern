-- Add referral_code column to audits table
alter table public.audits add column if not exists referral_code text unique;

-- Create referrals tracking table
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_audit_id text not null references public.audits (id) on delete cascade,
  referred_audit_id text not null references public.audits (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(referrer_audit_id, referred_audit_id)
);

-- Enable RLS on referrals table
alter table public.referrals enable row level security;

-- Only service_role can insert referrals
drop policy if exists "service role insert referrals" on public.referrals;
create policy "service role insert referrals"
on public.referrals
for insert
to service_role
with check (true);

-- Only service_role can read referrals (these are sensitive)
drop policy if exists "service role read referrals" on public.referrals;
create policy "service role read referrals"
on public.referrals
for select
to service_role
using (true);
