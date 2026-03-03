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
import { ROLE_COLORS, ROLE_LABELS } from '@/constants/roleColors'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import SearchInput from '../components/SearchInput'
import Pagination from '../components/Pagination'
import { PAGE_LIMIT } from '@/constants/pagination'

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const limit = PAGE_LIMIT

  const currentUser = useAuthStore(state => state.user)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const resp = await getAllUsersAPI({ page, limit })
      const userList = Array.isArray(resp) ? resp : (resp as any).users || (resp as any).data || []
      const total = (resp as any).total ?? userList.length
      setUsers(userList)
      setTotalUsers(total)
    } catch (err) {
      handleAPIError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser?.role === 'super_admin') loadUsers()
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


  const totalPages = Math.max(1, Math.ceil(totalUsers / limit))

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return (
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.role ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{totalUsers} total users</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Card */}
      <div className="bg-card rounded-xl border shadow-sm">
        {/* Search */}
        <div className="p-4 border-b">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search users..."
          />
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14 text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14 text-muted-foreground">
                  {search ? 'No users match your search.' : 'No users found.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id} className="group">
                  <TableCell className="pl-6 font-semibold">
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.gender }
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8  text-foreground"
                        onClick={() => handleOpenEdit(user)}
                        title="Edit user"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8  text-destructive"
                        onClick={() => setDeletingUserId(user.id)}
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
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
