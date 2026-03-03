import { useAuthStore } from '../store'

export const usePermissions = () => {
  const currentUser = useAuthStore((state) => state.user)

  const isSuperAdmin = currentUser?.role === 'super_admin'
  const isArtistManager = currentUser?.role === 'artist_manager'
  const isArtist = currentUser?.role === 'artist'

  const isManagerOrAdmin = isSuperAdmin || isArtistManager
  const canManageArtists = isArtistManager
  const canManageSongs = isArtistManager || isArtist

  return {
    currentUser,
    isSuperAdmin,
    isArtistManager,
    isArtist,
    isManagerOrAdmin,
    canManageArtists,
    canManageSongs,
  }
}
