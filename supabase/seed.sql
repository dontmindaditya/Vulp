-- ==========================================
-- VULP DEMO PLAYLISTS
-- ==========================================

insert into public.playlists (
  name,
  slug,
  description,
  cover_url,
  is_published
)
values
(
  'Late Night',
  'late-night',
  'For the hours when everything slows down.',
  '/images/late-night.jpg',
  true
),
(
  'Indie Mood',
  'indie-mood',
  'Sounds that feel a little different.',
  '/images/indie-mood.jpg',
  true
),
(
  'Nostalgia',
  'nostalgia',
  'Somewhere between memories and melodies.',
  '/images/nostalgia.jpg',
  true
),
(
  'Deep Focus',
  'focus',
  'Find your rhythm. Stay in your zone.',
  '/images/focus.jpg',
  true
),
(
  'Melancholy',
  'melancholy',
  'For feelings that words cannot explain.',
  '/images/melancholy.jpg',
  true
),
(
  'Personal Favorites',
  'favorites',
  'The songs that stay with you.',
  '/images/favorites.jpg',
  true
)
on conflict (slug) do nothing;