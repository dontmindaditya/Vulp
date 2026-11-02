-- ==========================================
-- VULP INITIAL DATABASE SCHEMA
-- ==========================================

create extension if not exists pgcrypto;

-- ==========================================
-- UPDATED AT TRIGGER
-- ==========================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ==========================================
-- PLAYLISTS
-- ==========================================

create table public.playlists (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  slug text not null unique,
  description text default '',

  cover_url text,
  cover_path text,

  is_published boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint playlist_name_length
    check (char_length(name) between 2 and 60),

  constraint playlist_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create trigger playlists_updated_at
before update on public.playlists
for each row
execute function public.set_updated_at();

-- ==========================================
-- TRACKS
-- ==========================================

create table public.tracks (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  artist text not null,

  audio_path text not null unique,
  artwork_url text,
  artwork_path text,

  duration integer not null default 0,

  -- Record the authorization status for every recording.
  rights_status text not null default 'pending',

  rights_holder text,
  license_reference text,
  rights_verified_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint track_title_length
    check (char_length(title) between 1 and 120),

  constraint track_artist_length
    check (char_length(artist) between 1 and 120),

  constraint track_duration_nonnegative
    check (duration >= 0),

  constraint track_rights_status
    check (rights_status in ('pending', 'authorized', 'rejected'))
);

create trigger tracks_updated_at
before update on public.tracks
for each row
execute function public.set_updated_at();

-- ==========================================
-- PLAYLIST TRACKS
-- ==========================================

create table public.playlist_tracks (
  id uuid primary key default gen_random_uuid(),

  playlist_id uuid not null
    references public.playlists(id)
    on delete cascade,

  track_id uuid not null
    references public.tracks(id)
    on delete cascade,

  position integer not null default 0,

  added_at timestamptz not null default now(),

  constraint playlist_track_unique
    unique (playlist_id, track_id),

  constraint playlist_position_nonnegative
    check (position >= 0)
);

create index playlist_tracks_order_idx
on public.playlist_tracks (playlist_id, position);

create index playlist_tracks_track_idx
on public.playlist_tracks (track_id);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

alter table public.playlists enable row level security;
alter table public.tracks enable row level security;
alter table public.playlist_tracks enable row level security;

-- Admins are identified by a trusted app_metadata role.
-- Never let users grant themselves this role through
-- user-editable metadata.

create policy "Public can view published playlists"
on public.playlists
for select
to anon, authenticated
using (is_published = true);

create policy "Admins can manage playlists"
on public.playlists
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Only authorized recordings can be read publicly.

create policy "Public can view authorized tracks"
on public.tracks
for select
to anon, authenticated
using (rights_status = 'authorized');

create policy "Admins can manage tracks"
on public.tracks
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Playlist membership is public only for published playlists
-- and authorized tracks.

create policy "Public can view published playlist tracks"
on public.playlist_tracks
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.playlists p
    where p.id = playlist_tracks.playlist_id
      and p.is_published = true
  )
  and exists (
    select 1
    from public.tracks t
    where t.id = playlist_tracks.track_id
      and t.rights_status = 'authorized'
  )
);

create policy "Admins can manage playlist tracks"
on public.playlist_tracks
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ==========================================
-- GRANTS
-- ==========================================

grant select on public.playlists to anon, authenticated;
grant select on public.tracks to anon, authenticated;
grant select on public.playlist_tracks to anon, authenticated;

grant all on public.playlists to authenticated;
grant all on public.tracks to authenticated;
grant all on public.playlist_tracks to authenticated;