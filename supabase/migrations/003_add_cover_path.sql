-- Store the private Backblaze B2 object key for playlist artwork.
ALTER TABLE public.playlists
ADD COLUMN IF NOT EXISTS cover_path text;

-- Existing cover_url remains available for legacy or external images.
COMMENT ON COLUMN public.playlists.cover_path
IS 'Private Backblaze B2 object key for playlist cover artwork';

