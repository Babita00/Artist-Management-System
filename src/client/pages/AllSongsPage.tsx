import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getAllSongsAPI } from '../services/song.api'
import { Song } from '~/types'
import { usePermissions } from '../hooks/usePermissions'
import { handleAPIError } from '@/lib/handleError'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import SongFormModal from '../components/SongFormModal'
import DeleteModal from '../components/DeleteModal'
import { deleteSongAPI } from '../services/song.api'

const AllSongsPage = () => {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [songToDelete, setSongToDelete] = useState<Song | null>(null)

  const { isManagerOrAdmin, canManageSongs } = usePermissions()

  const handleDelete = async () => {
    if (!songToDelete) return
    try {
      await deleteSongAPI(songToDelete.id)
      if (songs.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        loadSongs()
      }
    } catch (err) {
      handleAPIError(err)
    } finally {
      setIsDeleteModalOpen(false)
      setSongToDelete(null)
    }
  }

  const loadSongs = async () => {
    setLoading(true)
    try {
      const resp = await getAllSongsAPI({ page, limit: 10 })
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

  useEffect(() => {
    loadSongs()
  }, [page])

  if (!isManagerOrAdmin && !canManageSongs) {
    return <div className="p-6">You do not have permission to view songs.</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Music</h1>
        {canManageSongs && (
          <Button
            className="gap-2"
            onClick={() => {
              setEditingSong(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="w-4 h-4" /> Add Song
          </Button>
        )}
      </div>

      <div className="border border-border/40 rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Album</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Loading songs...
                </TableCell>
              </TableRow>
            ) : songs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  No songs found.
                </TableCell>
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
             
                  <TableCell className="text-right">
                    {canManageSongs ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingSong(song)
                            setIsModalOpen(true)
                          }}
                        >
                          <Pencil className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setSongToDelete(song)
                            setIsDeleteModalOpen(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Link to={`/dashboard/artists/${song.artist_id}/songs`}>
                        <Button variant="secondary" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
                          View
                        </Button>
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          disabled={songs.length < 10}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
      <SongFormModal
        isOpen={isModalOpen}
        initialValue={editingSong}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false)
          setPage(1)
          loadSongs()
        }}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSongToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Song"
      />
    </div>
  )
}

export default AllSongsPage
