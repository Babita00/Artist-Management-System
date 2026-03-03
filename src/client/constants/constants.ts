export const SONG_GENRES = [
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'rnb', label: 'R&B' },
  { value: 'country', label: 'Country' },
  { value: 'classic', label: 'Classical' },
  { value: 'hiphop', label: 'Hip Hop' },
  { value: 'metal', label: 'Metal' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'folk', label: 'Folk' },
  { value: 'reggae', label: 'Reggae' },
  { value: 'indie', label: 'Indie' },
  { value: 'blues', label: 'Blues' },
  { value: 'soul', label: 'Soul' },
] as const

export type GenreValue = (typeof SONG_GENRES)[number]['value']

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  artist_manager: 'Artist Manager',
  artist: 'Artist',
}
