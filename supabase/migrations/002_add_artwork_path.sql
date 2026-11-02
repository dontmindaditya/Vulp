-- ========================================================
-- ADD ARTWORK_PATH TO TRACKS FOR PRIVATE B2 STORAGE
-- ========================================================

-- Add artwork_path for private B2 artwork storage
alter table public.tracks
add column if not exists artwork_path text;

-- Keep artwork_url temporarily for backward compatibility.

