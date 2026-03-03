import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formatDate } from '@/lib/utils'
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
import { createArtistAPI, updateArtistAPI } from '../services/artist.api'
import { handleFormError } from '@/lib/handleError'
import { Artist } from '~/types'

type ArtistFormValues = Omit<Artist, 'id' | 'created_at' | 'updated_at' | 'dob'> & {
  dob: string
}

interface ArtistFormModalProps {
  isOpen: boolean
  initialValue: Artist | null
  onClose: () => void
  onSuccess: () => void
}

const ArtistFormModal: React.FC<ArtistFormModalProps> = ({
  isOpen,
  initialValue,
  onClose,
  onSuccess,
}) => {
  const [isPending, setIsPending] = useState(false)
  const isEdit = !!initialValue

  const form = useForm<ArtistFormValues>({
    defaultValues: {
      name: '',
      dob: '',
      gender: 'M',
      address: '',
      first_release_year: new Date().getFullYear(),
      no_of_albums_released: 0,
    },
  })

  useEffect(() => {
    if (!isOpen) return
    if (initialValue) {
      form.reset({
        name: initialValue.name,
        gender: initialValue.gender ?? 'M',
        address: initialValue.address,
        first_release_year: initialValue.first_release_year,
        no_of_albums_released: initialValue.no_of_albums_released,
        dob: formatDate(initialValue.dob),
      })
    } else {
      form.reset({
        name: '',
        dob: '',
        gender: 'M',
        address: '',
        first_release_year: new Date().getFullYear(),
        no_of_albums_released: 0,
      })
    }
  }, [isOpen, initialValue])

  const onFinish = async (values: ArtistFormValues) => {
    setIsPending(true)
    try {
      if (isEdit) {
        await updateArtistAPI(initialValue!.id, values)
      } else {
        await createArtistAPI(values)
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
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Artist' : 'Register Artist'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update artist details below.' : 'Fill in the details to register a new artist.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter artist name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                        <SelectItem value="O">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="first_release_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Release Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2020"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="no_of_albums_released"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Albums Released</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address / Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : isEdit ? 'Update Artist' : 'Register Artist'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ArtistFormModal
