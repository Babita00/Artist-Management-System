import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getArtistByIdAPI } from '../services/artist.api'
import { getAllSongsAPI, deleteSongAPI } from '../services/song.api'
import { Artist, Song } from '~/types'
import { useAuthStore } from '../store'
import SongFormModal from '../components/SongFormModal'
import DeleteModal from '../components/DeleteModal'
import { handleAPIError } from '@/lib/handleError'
import { toast } from 'sonner'
import { deleteDataSuccessMessage } from '@/constants/messages'

const SongsPage = () => {
  const { artistId } = useParams<{ artistId: string }>()
  const navigate = useNavigate()

  const [artist, setArtist] = useState<Artist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const currentUser = useAuthStore((state) => state.user)
  const isArtistUser = currentUser?.role === 'artist'
  const canManageSongs = isArtistUser

  const loadArtistContext = async () => {
    if (!artistId) return
    try {
      const dbArtist = await getArtistByIdAPI(artistId)
      setArtist((dbArtist as any).data || dbArtist)
    } catch (err) {
      handleAPIError(err)
    }
  }

  const loadSongs = async () => {
    if (!artistId) return
    setLoading(true)
    try {
      const resp = await getAllSongsAPI({ page, limit: 10, artist_id: artistId })
      const songList = Array.isArray(resp)
        ? resp
        : (resp as any).songs || (resp as any).data || []
      setSongs(songList)
    } catch (err) {
      handleAPIError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadArtistContext() }, [artistId])
  useEffect(() => { loadSongs() }, [page, artistId])

  const handleDelete = async (id: string) => {
    try {
      await deleteSongAPI(id)
      toast.success(deleteDataSuccessMessage('Song'))
      loadSongs()
    } catch (err) {
      handleAPIError(err)
    } finally {
      setDeletingSongId(null)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          ← Back to Artists
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isArtistUser ? 'My Songs' : `Songs by ${artist?.name || 'Artist'}`}
          </h1>
          {!isArtistUser && artist && (
            <p className="text-muted-foreground mt-1 text-sm">Viewing read-only for {artist.name}</p>
          )}
        </div>

        {canManageSongs && (
          <Button onClick={() => { setEditingSong(null); setIsModalOpen(true) }}>
            + Add Song
          </Button>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Album</TableHead>
              <TableHead>Genre</TableHead>
              {canManageSongs && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={canManageSongs ? 4 : 3} className="text-center py-10">Loading songs...</TableCell>
              </TableRow>
            ) : songs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageSongs ? 4 : 3} className="text-center py-10">No songs published yet.</TableCell>
              </TableRow>
            ) : (
              songs.map((song) => (
                <TableRow key={song.id}>
                  <TableCell className="font-semibold">{song.title}</TableCell>
                  <TableCell>{song.album_name}</TableCell>
                  <TableCell>
                    <span className="capitalize px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs font-semibold">
                      {song.genre}
                    </span>
                  </TableCell>
                  {canManageSongs && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingSong(song); setIsModalOpen(true) }}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeletingSongId(song.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button variant="outline" size="sm" disabled={songs.length < 10} onClick={() => setPage(page + 1)}>Next</Button>
      </div>

      <SongFormModal
        isOpen={isModalOpen}
        initialValue={editingSong}
        artistId={artistId!}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadSongs}
      />

      <DeleteModal
        isOpen={!!deletingSongId}
        title="Song"
        onClose={() => setDeletingSongId(null)}
        onConfirm={() => deletingSongId && handleDelete(deletingSongId)}
      />
    </div>
  )
}

export default SongsPage
