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
import {
  getAllArtistsAPI,
  deleteArtistAPI,
  exportArtistsAPI,
  importArtistsAPI,
} from '../services/artist.api'
import { Artist } from '~/types'
import { useAuthStore } from '../store'
import ArtistFormModal from '../components/ArtistFormModal'
import DeleteModal from '../components/DeleteModal'
import { handleAPIError } from '@/lib/handleError'
import { toast } from 'sonner'
import { deleteDataSuccessMessage } from '@/constants/messages'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const ArtistsPage = () => {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
  const [deletingArtistId, setDeletingArtistId] = useState<string | null>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [page, setPage] = useState(1)

  const currentUser = useAuthStore((state) => state.user)
  const isManagerOrAdmin =
    currentUser?.role === 'super_admin' || currentUser?.role === 'artist_manager'
  const canManageArtists = currentUser?.role === 'artist_manager'

  const loadArtists = async () => {
    if (!isManagerOrAdmin) return
    setLoading(true)
    try {
      const resp = await getAllArtistsAPI({ page, limit: 10 })
      const artistList = Array.isArray(resp)
        ? resp
        : (resp as any).artists || (resp as any).data || []
      setArtists(artistList)
    } catch (err) {
      handleAPIError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArtists()
  }, [page, currentUser])

  if (!isManagerOrAdmin) {
    return <div className="p-6">You do not have permission to view artists.</div>
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteArtistAPI(id)
      toast.success(deleteDataSuccessMessage('Artist'))
      loadArtists()
    } catch (err) {
      handleAPIError(err)
    } finally {
      setDeletingArtistId(null)
    }
  }

  const handleExport = async () => {
    try {
      const response = await exportArtistsAPI()
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'artists_export.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      handleAPIError(err)
    }
  }

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) return
    const formData = new FormData()
    formData.append('file', importFile)
    try {
      await importArtistsAPI(formData)
      toast.success('Artists imported successfully!')
      setIsImportOpen(false)
      setImportFile(null)
      loadArtists()
    } catch (err) {
      handleAPIError(err)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artist Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{artists.length} total artists</p>
        </div>

        {canManageArtists && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>Export CSV</Button>
            <Button variant="secondary" onClick={() => setIsImportOpen(true)}>Import CSV</Button>
            <Button onClick={() => { setEditingArtist(null); setIsModalOpen(true) }}>+ Add Artist</Button>
          </div>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artist Name</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>First Release</TableHead>
              <TableHead>Albums</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">Loading artists...</TableCell>
              </TableRow>
            ) : artists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">No artists found.</TableCell>
              </TableRow>
            ) : (
              artists.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell className="font-semibold">{artist.name}</TableCell>
                  <TableCell>
                    {typeof artist.dob === 'string'
                      ? artist.dob
                      : new Date(artist.dob).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{artist.first_release_year}</TableCell>
                  <TableCell>
                    <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md text-xs font-medium">
                      {artist.no_of_albums_released}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Link to={`/dashboard/artists/${artist.id}/songs`}>
                        <Button variant="secondary" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
                          Songs
                        </Button>
                      </Link>
                      {canManageArtists && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => { setEditingArtist(artist); setIsModalOpen(true) }}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => setDeletingArtistId(artist.id)}>Delete</Button>
                        </>
                      )}
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
        <Button variant="outline" size="sm" disabled={artists.length < 10} onClick={() => setPage(page + 1)}>Next</Button>
      </div>

      {/* Import CSV Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Import Artists via CSV</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Upload CSV File</Label>
              <Input id="file" type="file" accept=".csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} required />
            </div>
            <Button type="submit" disabled={!importFile} className="w-full">Upload</Button>
          </form>
        </DialogContent>
      </Dialog>

      <ArtistFormModal
        isOpen={isModalOpen}
        initialValue={editingArtist}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadArtists}
      />

      <DeleteModal
        isOpen={!!deletingArtistId}
        title="Artist"
        onClose={() => setDeletingArtistId(null)}
        onConfirm={() => deletingArtistId && handleDelete(deletingArtistId)}
      />
    </div>
  )
}

export default ArtistsPage
