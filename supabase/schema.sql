-- ============================================================
-- Packsmith — Supabase Schema
-- Run this in your Supabase SQL editor to set up the database
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────
-- Auto-created when a user signs up via a trigger
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: create profile row on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Modpacks ─────────────────────────────────────────────────
create table if not exists public.modpacks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  minecraft_version text not null,
  mod_loader text not null check (mod_loader in ('forge', 'fabric', 'quilt', 'neoforge')),
  mod_loader_version text not null,
  logo_url text,
  version text not null default '1.0.0',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.modpacks enable row level security;

create policy "Users can CRUD own modpacks"
  on public.modpacks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Modpack Mods ─────────────────────────────────────────────
create table if not exists public.modpack_mods (
  id uuid default uuid_generate_v4() primary key,
  modpack_id uuid references public.modpacks(id) on delete cascade not null,
  project_id integer not null,
  file_id integer not null,
  name text not null,
  summary text,
  logo_url text,
  authors text[] default '{}',
  download_count bigint,
  added_at timestamptz default now() not null,
  -- Prevent duplicate mods per pack
  unique (modpack_id, project_id)
);

alter table public.modpack_mods enable row level security;

create policy "Users can CRUD mods in own modpacks"
  on public.modpack_mods for all
  using (
    exists (
      select 1 from public.modpacks
      where id = modpack_mods.modpack_id
      and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.modpacks
      where id = modpack_mods.modpack_id
      and user_id = auth.uid()
    )
  );

-- ─── Auto-update updated_at ───────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger modpacks_updated_at
  before update on public.modpacks
  for each row execute function public.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─── Storage bucket for logos ─────────────────────────────────
-- Run this separately in the Supabase Storage section, or via:
insert into storage.buckets (id, name, public)
values ('modpack-logos', 'modpack-logos', true)
on conflict do nothing;

create policy "Anyone can view logos"
  on storage.objects for select
  using (bucket_id = 'modpack-logos');

create policy "Authenticated users can upload logos"
  on storage.objects for insert
  with check (bucket_id = 'modpack-logos' and auth.role() = 'authenticated');

create policy "Users can update own logos"
  on storage.objects for update
  using (bucket_id = 'modpack-logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own logos"
  on storage.objects for delete
  using (bucket_id = 'modpack-logos' and auth.uid()::text = (storage.foldername(name))[1]);
