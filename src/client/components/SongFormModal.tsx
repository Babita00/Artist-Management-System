import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { handleFormError } from '@/lib/handleError'
import { addDataSuccessMessage, editDataSuccessMessage } from '@/constants/messages'
import { Song } from '~/types'

const songSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  album_name: z.string().min(1, 'Album name is required'),
  genre: z.enum(['rnb', 'country', 'classic', 'rock', 'jazz', 'pop'] as const, {
    message: 'Genre is required',
  }),
})

type SongFormValues = z.infer<typeof songSchema>

interface SongFormModalProps {
  isOpen: boolean
  initialValue: Song | null
  artistId: string
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

  const form = useForm<SongFormValues>({
    resolver: zodResolver(songSchema),
    defaultValues: { title: '', album_name: '', genre: 'pop' },
  })

  useEffect(() => {
    if (!isOpen) return
    if (initialValue) {
      form.reset({
        title: initialValue.title,
        album_name: initialValue.album_name,
        genre: (initialValue.genre as SongFormValues['genre']) ?? 'pop',
      })
    } else {
      form.reset({ title: '', album_name: '', genre: 'pop' })
    }
  }, [isOpen, initialValue])

  const onFinish = async (values: SongFormValues) => {
    setIsPending(true)
    try {
      if (isEdit) {
        await updateSongAPI(initialValue!.id, { ...values, artist_id: artistId })
        toast.success(editDataSuccessMessage('Song'))
      } else {
        await createSongAPI({ ...values, artist_id: artistId })
        toast.success(addDataSuccessMessage('Song'))
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
                      <SelectItem value="pop">Pop</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="jazz">Jazz</SelectItem>
                      <SelectItem value="rnb">R&B</SelectItem>
                      <SelectItem value="country">Country</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
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
