import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getArtistByIdAPI } from '../services/artist.api'
import {
  getAllSongsAPI,
  createSongAPI,
  updateSongAPI,
  deleteSongAPI,
} from '../services/song.api'
import { Artist, Song } from '~/types'
import { AxiosError } from 'axios'
import { useAuthStore } from '../store'

const SongsPage = () => {
  const { artistId } = useParams<{ artistId: string }>()
  const navigate = useNavigate()

  const [artist, setArtist] = useState<Artist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')

  const currentUser = useAuthStore((state) => state.user)

  // Artists can manage THEIR songs. Admins/Managers can only VIEW.
  const isArtistUser = currentUser?.role === 'artist'
  const canManageSongs = isArtistUser

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      title: '',
      album_name: '',
      genre: 'pop',
    },
  })

  const loadArtistContext = async () => {
    if (!artistId) return
    try {
      const dbArtist = await getArtistByIdAPI(artistId)
      setArtist((dbArtist as any).data || dbArtist)
    } catch {
      setError('Could not load artist details.')
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
      console.error('Failed to load songs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArtistContext()
  }, [artistId])

  useEffect(() => {
    loadSongs()
  }, [page, artistId])

  const handleOpenDialog = (song?: Song) => {
    setError('')
    if (song) {
      setEditingSong(song)
      reset({
        title: song.title,
        album_name: song.album_name,
        genre: song.genre || 'pop',
      })
      setValue('genre', song.genre || 'pop')
    } else {
      setEditingSong(null)
      reset({
        title: '',
        album_name: '',
        genre: 'pop',
      })
      setValue('genre', 'pop')
    }
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: any) => {
    setError('')
    try {
      if (editingSong) {
        // According to our revised backend, artist_id must be supplied in the body for updates too, or at least inherited
        await updateSongAPI(editingSong.id, { ...data, artist_id: artistId })
      } else {
        await createSongAPI({ ...data, artist_id: artistId })
      }
      setIsDialogOpen(false)
      loadSongs()
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Operation failed')
      } else {
        setError('Unexpected error occurred')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this song?')) {
      try {
        await deleteSongAPI(id)
        loadSongs()
      } catch (err) {
        alert('Failed to delete song')
      }
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          &larr; Back to Artists
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isArtistUser ? 'My Songs' : `Songs by ${artist?.name || 'Artist'}`}
          </h1>
          {!isArtistUser && artist && (
            <p className="text-muted-foreground mt-1">Viewing read-only access for {artist.name}</p>
          )}
        </div>

        {canManageSongs && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>Add New Song</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] glass">
              <DialogHeader>
                <DialogTitle>{editingSong ? 'Edit Song' : 'Publish Song'}</DialogTitle>
              </DialogHeader>
              {error && <div className="text-destructive text-sm font-semibold mb-4">{error}</div>}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Song Title</Label>
                  <Input id="title" {...register('title', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="album_name">Album Name</Label>
                  <Input id="album_name" {...register('album_name', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select onValueChange={(val) => setValue('genre', val)} defaultValue="pop">
                    <SelectTrigger><SelectValue placeholder="Genre" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rnb">R&B</SelectItem>
                      <SelectItem value="country">Country</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="jazz">Jazz</SelectItem>
                      <SelectItem value="pop">Pop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingSong ? 'Save Updates' : 'Publish'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="border border-border/40 rounded-md glass">
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
                <TableCell colSpan={canManageSongs ? 4 : 3} className="text-center py-10">No songs have been published yet.</TableCell>
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
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(song)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(song.id)}>Delete</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span>Page {page}</span>
        <Button variant="outline" size="sm" disabled={songs.length < 10} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  )
}

export default SongsPage
