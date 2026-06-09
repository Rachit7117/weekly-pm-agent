-- Update profiles to support multiple PM focus areas and locations
alter table public.profiles
  drop column if exists pm_focus,
  drop column if exists preferred_location;

alter table public.profiles
  add column pm_focus text[] default '{}',
  add column preferred_locations text[] default '{}';
