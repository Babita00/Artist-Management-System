import { useState, useEffect, useMemo } from 'react'
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
import { usePermissions } from '../hooks/usePermissions'
import SongFormModal from '../components/SongFormModal'
import DeleteModal from '../components/DeleteModal'
import SearchInput from '../components/SearchInput'
import Pagination from '../components/Pagination'
import { PAGE_LIMIT } from '@/constants/pagination'
import { handleAPIError } from '@/lib/handleError'
import { toast } from 'sonner'
import { deleteDataSuccessMessage } from '@/constants/messages'
import { GENRE_COLORS } from '@/constants/themeColors'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'

const SongsPage = () => {
  const { artistId } = useParams<{ artistId: string }>()
  const navigate = useNavigate()

  const { canManageSongs } = usePermissions()

  const [artist, setArtist] = useState<Artist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [totalSongs, setTotalSongs] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null)

  const limit = PAGE_LIMIT

  useEffect(() => {
    if (!artistId) return

    const fetchArtist = async () => {
      try {
        const resp = await getArtistByIdAPI(artistId)
        setArtist((resp as any).data || resp)
      } catch (err) {
        handleAPIError(err)
      }
    }

    fetchArtist()
  }, [artistId])

 
  useEffect(() => {
    if (!artistId) return

    const fetchSongs = async () => {
      setLoading(true)
      try {
        const resp = await getAllSongsAPI({
          page,
          limit,
          artist_id: artistId,
        })

        const list = Array.isArray(resp)
          ? resp
          : (resp as any).songs || (resp as any).data || []

        const total = (resp as any).total ?? list.length

        setSongs(list)
        setTotalSongs(total)
      } catch (err) {
        handleAPIError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSongs()
  }, [artistId, page])

  const filteredSongs = useMemo(() => {
    const q = search.toLowerCase()
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.album_name.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q)
    )
  }, [songs, search])

  const dominantGenre = useMemo(() => {
    if (!songs.length) return null

    const counts = songs.reduce<Record<string, number>>((acc, s) => {
      acc[s.genre] = (acc[s.genre] ?? 0) + 1
      return acc
    }, {})

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
  }, [songs])

  const totalPages = Math.max(1, Math.ceil(totalSongs / limit))
  const colSpan = canManageSongs ? 4 : 3

  const handleDelete = async (id: string) => {
    try {
      await deleteSongAPI(id)
      toast.success(deleteDataSuccessMessage('Song'))
      setDeletingSongId(null)
      setPage(1)
    } catch (err) {
      handleAPIError(err)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h1 className="text-2xl font-bold tracking-tight">
              {artist?.name ?? (canManageSongs ? 'My Songs' : 'Songs')}
            </h1>
          </div>

          <p className="text-sm text-muted-foreground mt-0.5 ml-7">
            {dominantGenre && (
              <span className="capitalize">{dominantGenre} · </span>
            )}
            {totalSongs} {totalSongs === 1 ? 'song' : 'songs'}
          </p>
        </div>

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

      {/* Card */}
      <div className="bg-card rounded-xl border shadow-sm">
        {/* Search */}
        <div className="p-4 border-b">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search songs..."
          />
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Title</TableHead>
              <TableHead>Album</TableHead>
              <TableHead>Genre</TableHead>
              {canManageSongs && (
                <TableHead className="pr-6 text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center py-14 text-muted-foreground">
                  Loading songs...
                </TableCell>
              </TableRow>
            ) : filteredSongs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center py-14 text-muted-foreground">
                  {search
                    ? 'No songs match your search.'
                    : 'No songs published yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredSongs.map((song) => (
                <TableRow key={song.id}>
                  <TableCell className="pl-6 font-semibold text-primary">
                    {song.title}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {song.album_name}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        GENRE_COLORS[song.genre] ??
                        'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {song.genre}
                    </span>
                  </TableCell>

                  {canManageSongs && (
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingSong(song)
                            setIsModalOpen(true)
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() =>
                            setDeletingSongId(song.id)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Modals */}
      <SongFormModal
        isOpen={isModalOpen}
        initialValue={editingSong}
        artistId={artistId!}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false)
          setPage(1)
        }}
      />

      <DeleteModal
        isOpen={!!deletingSongId}
        title="Song"
        onClose={() => setDeletingSongId(null)}
        onConfirm={() =>
          deletingSongId && handleDelete(deletingSongId)
        }
      />
    </div>
  )
}

export default SongsPage