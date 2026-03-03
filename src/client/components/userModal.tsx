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
import { createUserAPI, updateUserAPI } from '../services/user.api'
import { handleFormError } from '@/lib/handleError'
import { addDataSuccessMessage, editDataSuccessMessage } from '@/constants/messages'
import { User } from '~/types'

const userSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  phone: z.string().min(1, 'Phone is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['M', 'F', 'O']),
  address: z.string().min(1, 'Address is required'),
  role: z.enum(['super_admin', 'artist_manager', 'artist']),
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormModalProps {
  isOpen: boolean
  initialValue: User | null
  onClose: () => void
  onSuccess: () => void
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  initialValue,
  onClose,
  onSuccess,
}) => {
  const [isPending, setIsPending] = useState(false)
  const isEdit = !!initialValue

  const form = useForm<UserFormValues>({
    resolver: zodResolver(
      isEdit
        ? userSchema.extend({ password: z.string().optional() })
        : userSchema.extend({ password: z.string().min(8, 'Password must be at least 8 characters') })
    ),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      dob: '',
      gender: 'M',
      address: '',
      role: 'artist',
    },
  })

  useEffect(() => {
    if (!isOpen) return
    if (initialValue) {
      form.reset({
        ...initialValue,
        password: '',
        gender: initialValue.gender ?? 'M',
        role: initialValue.role ?? 'artist',
        dob:
          typeof initialValue.dob === 'string'
            ? initialValue.dob.split('T')[0]
            : new Date(initialValue.dob).toISOString().split('T')[0],
      })
    } else {
      form.reset({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        dob: '',
        gender: 'M',
        address: '',
        role: 'artist',
      })
    }
  }, [isOpen, initialValue])

  const onFinish = async (values: UserFormValues) => {
    setIsPending(true)
    try {
      if (isEdit) {
        const payload = { ...values }
        if (!payload.password) delete payload.password
        await updateUserAPI(initialValue!.id, payload)
        toast.success(editDataSuccessMessage('User'))
      } else {
        await createUserAPI(values)
        toast.success(addDataSuccessMessage('User'))
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
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update user details below.' : 'Fill in the details to create a new user.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password {isEdit && <span className="text-muted-foreground font-normal">(leave blank to keep)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+977-..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="artist">Artist</SelectItem>
                        <SelectItem value="artist_manager">Artist Manager</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default UserFormModal
