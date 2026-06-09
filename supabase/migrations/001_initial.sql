-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  linkedin_url text,
  current_role_title text,
  years_experience integer,
  pm_focus text check (pm_focus in ('product', 'growth', 'platform', 'ai')),
  work_preference text check (work_preference in ('remote', 'hybrid', 'onsite', 'open')),
  preferred_location text,
  resume_url text,
  resume_text text,
  ai_model text default 'gemini-2.0-flash',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Funded companies table
create table public.funded_companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  website text,
  funding_amount text,
  funding_round text,
  funding_date date,
  description text,
  industry text,
  team_size text,
  stage text,
  source text,
  raw_data jsonb,
  created_at timestamptz default now()
);

alter table public.funded_companies enable row level security;
create policy "Authenticated users can read companies" on public.funded_companies
  for select using (auth.role() = 'authenticated');

-- Agent results table
create table public.agent_results (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.funded_companies on delete cascade,
  user_id uuid references auth.users on delete cascade,
  hiring_score integer,
  hiring_reasoning text[],
  fit_score integer,
  fit_reasons text[],
  application_path jsonb,
  outreach_strategy jsonb,
  week_of date,
  created_at timestamptz default now()
);

alter table public.agent_results enable row level security;

create policy "Users can read own results" on public.agent_results
  for select using (auth.uid() = user_id);

create policy "Service role can insert results" on public.agent_results
  for insert with check (true);

-- Weekly runs log
create table public.weekly_runs (
  id uuid default uuid_generate_v4() primary key,
  run_at timestamptz default now(),
  companies_found integer default 0,
  status text default 'running',
  error text
);

alter table public.weekly_runs enable row level security;
create policy "Authenticated users can read runs" on public.weekly_runs
  for select using (auth.role() = 'authenticated');

-- Function to auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();
