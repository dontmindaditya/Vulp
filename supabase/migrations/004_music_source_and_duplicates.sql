-- VULP: Music source and duplicate detection

-- Identify where each track comes from.
ALTER TABLE public.tracks
ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'upload';

ALTER TABLE public.tracks
ADD COLUMN IF NOT EXISTS source_id TEXT;

ALTER TABLE public.tracks
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Embedded tracks may not have a B2 audio file.
ALTER TABLE public.tracks
ALTER COLUMN audio_path DROP NOT NULL;

-- Validate supported source types.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tracks_source_type_check'
  ) THEN
    ALTER TABLE public.tracks
    ADD CONSTRAINT tracks_source_type_check
    CHECK (source_type IN ('upload', 'youtube', 'spotify', 'direct_url'));
  END IF;
END $$;

-- A track must have either a stored audio file or a source link.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tracks_audio_or_source_check'
  ) THEN
    ALTER TABLE public.tracks
    ADD CONSTRAINT tracks_audio_or_source_check
    CHECK (audio_path IS NOT NULL OR source_url IS NOT NULL);
  END IF;
END $$;

-- Prevent duplicate source IDs within the same platform.
CREATE UNIQUE INDEX IF NOT EXISTS
tracks_unique_source_identity
ON public.tracks (source_type, source_id)
WHERE source_id IS NOT NULL;

-- Faster source URL lookup.
CREATE INDEX IF NOT EXISTS
tracks_source_url_idx
ON public.tracks (source_url);

