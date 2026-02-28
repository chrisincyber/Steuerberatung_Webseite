-- ============================================================
-- Petertil Tax – Client Portal Schema v2
-- Run this against your Supabase project to set up the portal.
-- ============================================================

-- 1. Extend profiles table with address fields
alter table profiles
  add column if not exists address_street text,
  add column if not exists address_zip text,
  add column if not exists address_city text,
  add column if not exists address_canton text;

-- 2. Create tax_years table (replaces declarations)
create table if not exists tax_years (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  year integer not null,

  status text not null default 'preis_berechnen'
    check (status in (
      'preis_berechnen', 'dokumente_hochladen', 'angebot_ausstehend',
      'angebot_gesendet', 'in_bearbeitung', 'warten_auf_pruefung', 'erledigt'
    )),

  tier smallint check (tier in (1, 2, 3)),
  price numeric(10,2),
  offer_amount numeric(10,2),
  offer_message text,

  canton text,
  zivilstand text check (zivilstand in ('einzelperson', 'verheiratet')),
  basisdaten_confirmed boolean not null default false,

  address_per_31dec_street text,
  address_per_31dec_zip text,
  address_per_31dec_city text,
  address_is_same_as_on_file boolean not null default true,

  -- Person 1 (always present)
  p1_dob date,
  p1_religion text,
  p1_job_status text,
  p1_company text,
  p1_job_title text,

  -- Person 2 (only if verheiratet)
  p2_dob date,
  p2_religion text,
  p2_job_status text,
  p2_company text,
  p2_job_title text,

  admin_notes text,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- One record per user per year
  unique(user_id, year)
);

-- Auto-update updated_at
create or replace function update_tax_years_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tax_years_updated_at on tax_years;
create trigger tax_years_updated_at
  before update on tax_years
  for each row execute function update_tax_years_updated_at();

-- 3. Create documents table (new version with category/status)
create table if not exists portal_documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tax_year_id uuid references tax_years(id) on delete cascade not null,

  file_name text not null,
  original_name text not null,
  file_size integer not null,
  file_type text not null,
  storage_path text not null,

  category text not null default 'sonstige',
  remarks text,
  status text not null default 'offen'
    check (status in ('offen', 'in_bearbeitung', 'vollstaendig')),

  uploaded_at timestamptz default now() not null
);

-- 4. Row Level Security

-- tax_years RLS
alter table tax_years enable row level security;

create policy "Users can view own tax years"
  on tax_years for select
  using (auth.uid() = user_id);

create policy "Users can insert own tax years"
  on tax_years for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tax years"
  on tax_years for update
  using (auth.uid() = user_id);

create policy "Admins can view all tax years"
  on tax_years for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can update all tax years"
  on tax_years for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- portal_documents RLS
alter table portal_documents enable row level security;

create policy "Users can view own documents"
  on portal_documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on portal_documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on portal_documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on portal_documents for delete
  using (auth.uid() = user_id);

create policy "Admins can view all documents"
  on portal_documents for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can update all documents"
  on portal_documents for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 5. Storage bucket for portal documents
-- Run in Supabase SQL editor or via dashboard:
-- insert into storage.buckets (id, name, public) values ('portal-documents', 'portal-documents', false);

-- Storage policies
-- create policy "Users can upload to own folder"
--   on storage.objects for insert
--   with check (bucket_id = 'portal-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- create policy "Users can read own files"
--   on storage.objects for select
--   using (bucket_id = 'portal-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- create policy "Users can delete own files"
--   on storage.objects for delete
--   using (bucket_id = 'portal-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- create policy "Admins can read all files"
--   on storage.objects for select
--   using (
--     bucket_id = 'portal-documents' and
--     exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
--   );
