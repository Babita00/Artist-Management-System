import { type User } from '../../types'

export function isSuperAdmin(user: User): boolean {
  return Boolean(user) && user.role === 'super_admin'
}

export function isArtistManager(user: User): boolean {
  return Boolean(user) && user.role === 'artist_manager'
}

export function isArtist(user: User): boolean {
  return Boolean(user) && user.role === 'artist'
}

export function isArtistManagerOrSuperAdmin(user: User): boolean {
  return (
    Boolean(user) &&
    (user.role === 'artist_manager' || user.role === 'super_admin')
  )
}
