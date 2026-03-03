import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { getAllUsersAPI, createUserAPI, updateUserAPI, deleteUserAPI } from '../services/user.api'
import { User } from '~/types'
import { AxiosError } from 'axios'
import { useAuthStore } from '../store'
import { Navigate } from 'react-router-dom'

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')

  const currentUser = useAuthStore(state => state.user)

  const { register, handleSubmit, reset, setValue } = useForm({
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

  const loadUsers = async () => {
    setLoading(true)
    try {
      const resp = await getAllUsersAPI({ page, limit: 10 })
      // Assuming paginated response shape is { data: User[], ... } 
      // Due to _axios unwrap, we might get just the array or the paginated object depending on the backend unwrap
      const userList = Array.isArray(resp) ? resp : (resp as any).users || (resp as any).data || []
      setUsers(userList)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      loadUsers()
    }
  }, [page, currentUser])

  // RBAC standard check
  if (currentUser?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />
  }

  const handleOpenDialog = (user?: User) => {
    setError('')
    if (user) {
      setEditingUser(user)
      reset({
        ...user,
        password: '', // Blank out password on edit intentionally
        gender: user.gender || 'M',
        role: user.role || 'artist',
        dob: typeof user.dob === 'string' ? user.dob : new Date(user.dob).toISOString().split('T')[0]
      })
    } else {
      setEditingUser(null)
      reset({
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
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: any) => {
    setError('')
    try {
      if (editingUser) {
        // Remove password from payload if it's left blank
        const payload = { ...data }
        if (!payload.password) delete payload.password
        await updateUserAPI(editingUser.id, payload)
      } else {
        await createUserAPI(data)
      }
      setIsDialogOpen(false)
      loadUsers()
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Operation failed')
      } else {
        setError('Unexpected error occurred')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUserAPI(id)
        loadUsers()
      } catch (err) {
        alert('Failed to delete user')
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>Add New User</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] glass">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
            </DialogHeader>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" {...register('first_name', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" {...register('last_name', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password {editingUser && '(Leave blank to keep)'}</Label>
                  <Input id="password" type="password" {...register('password', { required: !editingUser })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register('phone', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" {...register('dob', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(val) => setValue('gender', val)} defaultValue="M">
                    <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="O">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select onValueChange={(val) => setValue('role', val)} defaultValue="artist">
                    <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="artist">Artist</SelectItem>
                      <SelectItem value="artist_manager">Artist Manager</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...register('address', { required: true })} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingUser ? 'Save Changes' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md glass">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">Loading users...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">No users found.</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-primary/20 text-primary-foreground text-xs rounded uppercase font-semibold">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(user)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span className="text-sm font-medium">Page {page}</span>
        {/* We would typically disable next based on total pages, assuming if < 10 records we reached the end */}
        <Button variant="outline" disabled={users.length < 10} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  )
}

export default UsersPage
