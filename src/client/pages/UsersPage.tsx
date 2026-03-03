import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getAllUsersAPI, deleteUserAPI } from '../services/user.api'
import { User } from '~/types'
import { useAuthStore } from '../store'
import { Navigate } from 'react-router-dom'
import UserFormModal from '../components/userModal'
import DeleteModal from '../components/DeleteModal'
import { handleAPIError } from '@/lib/handleError'
import { toast } from 'sonner'
import { deleteDataSuccessMessage } from '@/constants/messages'

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const currentUser = useAuthStore(state => state.user)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const resp = await getAllUsersAPI({ page, limit: 10 })
      const userList = Array.isArray(resp) ? resp : (resp as any).users || (resp as any).data || []
      setUsers(userList)
    } catch (err) {
      handleAPIError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      loadUsers()
    }
  }, [page, currentUser])

  if (currentUser?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />
  }

  const handleOpenCreate = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteUserAPI(id)
      toast.success(deleteDataSuccessMessage('User'))
      loadUsers()
    } catch (err) {
      handleAPIError(err)
    } finally {
      setDeletingUserId(null)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} total users</p>
        </div>
        <Button onClick={handleOpenCreate}>+ Add New User</Button>
      </div>

      <div className="border rounded-md">
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
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-semibold capitalize">
                      {user.role?.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(user)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeletingUserId(user.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button variant="outline" size="sm" disabled={users.length < 10} onClick={() => setPage(page + 1)}>Next</Button>
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        initialValue={editingUser}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadUsers}
      />

      <DeleteModal
        isOpen={!!deletingUserId}
        title="User"
        onClose={() => setDeletingUserId(null)}
        onConfirm={() => deletingUserId && handleDelete(deletingUserId)}
      />
    </div>
  )
}

export default UsersPage
