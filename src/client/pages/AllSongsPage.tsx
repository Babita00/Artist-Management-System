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
import { useAuthStore } from '../store'
import { handleAPIError } from '@/lib/handleError'

const AllSongsPage = () => {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const currentUser = useAuthStore((state) => state.user)
  const isManagerOrAdmin =
    currentUser?.role === 'super_admin' || currentUser?.role === 'artist_manager'

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

  if (!isManagerOrAdmin) {
    return <div className="p-6">You do not have permission to view songs.</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Songs</h1>
      </div>

      <div className="border border-border/40 rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Album</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Artist</TableHead>
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
                  <TableCell>
                    <Link
                      to={`/dashboard/artists/${song.artist_id}/songs`}
                      className="text-primary hover:underline text-sm"
                    >
                      View Artist Songs
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/dashboard/artists/${song.artist_id}/songs`}>
                      <Button variant="secondary" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
                        View
                      </Button>
                    </Link>
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
    </div>
  )
}

export default AllSongsPage
