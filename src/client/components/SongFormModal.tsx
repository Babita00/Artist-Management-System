import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createSongAPI, updateSongAPI } from '../services/song.api'
import { getAllArtistsAPI } from '../services/artist.api'
import { handleFormError, handleAPIError } from '@/lib/handleError'
import { Song, Artist } from '~/types'
import { SONG_GENRES, GenreValue } from '@/constants/constants'

type SongFormValues = Omit<Song, 'id' | 'created_at' | 'updated_at' | 'artist_id' | 'genre'> & {
  genre: GenreValue
  artist_id?: string
}

interface SongFormModalProps {
  isOpen: boolean
  initialValue: Song | null
  artistId?: string
  onClose: () => void
  onSuccess: () => void
}

const SongFormModal: React.FC<SongFormModalProps> = ({
  isOpen,
  initialValue,
  artistId,
  onClose,
  onSuccess,
}) => {
  const [isPending, setIsPending] = useState(false)
  const isEdit = !!initialValue
  const [artists, setArtists] = useState<Artist[]>([])
  const [loadingArtists, setLoadingArtists] = useState(false)

  const form = useForm<SongFormValues>({
    defaultValues: { title: '', album_name: '', genre: 'pop' },
  })

  useEffect(() => {
    const fetchArtists = async () => {
      setLoadingArtists(true)
      try {
        const resp = await getAllArtistsAPI({ page: 1, limit: 1000 })
        const artistList = Array.isArray(resp)
          ? resp
          : (resp as any).artists || (resp as any).data || []
        setArtists(artistList)
      } catch (err) {
        handleAPIError(err)
      } finally {
        setLoadingArtists(false)
      }
    }

    if (isOpen && !artistId) {
      fetchArtists()
    }
  }, [isOpen, artistId])

  useEffect(() => {
    if (!isOpen) return
    if (initialValue) {
      form.reset({
        title: initialValue.title,
        album_name: initialValue.album_name,
        genre: (initialValue.genre as GenreValue) ?? 'pop',
        artist_id: initialValue.artist_id,
      })
    } else {
      form.reset({ title: '', album_name: '', genre: 'pop', artist_id: artistId ?? '' })
    }
  }, [isOpen, initialValue, artistId])

  const onFinish = async (values: SongFormValues) => {
    const finalArtistId = artistId || values.artist_id
    if (!finalArtistId) {
      toast.error('Please select an artist')
      return
    }

    setIsPending(true)
    try {
      if (isEdit) {
        await updateSongAPI(initialValue!.id, { ...values, artist_id: finalArtistId })
      } else {
        await createSongAPI({ ...values, artist_id: finalArtistId })
      }
      onSuccess()
      onClose()
    } catch (err) {
      handleFormError(form, err)
    } finally {
      setIsPending(false)
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Song' : 'Add New Song'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update song details below.' : 'Fill in the details to publish a new song.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
            {!artistId && (
              <FormField
                control={form.control}
                name="artist_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={loadingArtists || isEdit}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={loadingArtists ? "Loading..." : "Select artist"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {artists.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Song Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter song title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="album_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Album Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter album name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SONG_GENRES.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : isEdit ? 'Update Song' : 'Publish Song'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default SongFormModal
