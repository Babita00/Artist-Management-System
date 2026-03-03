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
import { Input } from '@/components/ui/input'
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
import SearchInput from '../components/SearchInput'
import { handleAPIError } from '@/lib/handleError'
import { downloadCsv, submitCsvImport } from '@/lib/csvUtils'
import { toast } from 'sonner'
import { deleteDataSuccessMessage } from '@/constants/messages'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Music, Pencil, Plus, Trash2, Upload, Download } from 'lucide-react'
import Pagination from '../components/Pagination'
import { PAGE_LIMIT } from '@/constants/pagination'

const ArtistsPage = () => {
  const [artists, setArtists] = useState<Artist[]>([])
  const [totalArtists, setTotalArtists] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
  const [deletingArtistId, setDeletingArtistId] = useState<string | null>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [page, setPage] = useState(1)
  const limit = PAGE_LIMIT

  const currentUser = useAuthStore((state) => state.user)
  const isManagerOrAdmin =
    currentUser?.role === 'super_admin' || currentUser?.role === 'artist_manager'
  const canManageArtists = currentUser?.role === 'artist_manager'

  const loadArtists = async () => {
    if (!isManagerOrAdmin) return
    setLoading(true)
    try {
      const resp = await getAllArtistsAPI({ page, limit })
      const artistList = Array.isArray(resp)
        ? resp
        : (resp as any).artists || (resp as any).data || []
      const total = (resp as any).total ?? artistList.length
      setArtists(artistList)
      setTotalArtists(total)
    } catch (err) {
      handleAPIError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadArtists() }, [page, currentUser])

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

  const handleExport = () =>
    downloadCsv(exportArtistsAPI, 'artists_export.csv')

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) return
    const ok = await submitCsvImport(importFile, importArtistsAPI)
    if (ok) {
      toast.success('Artists imported successfully!')
      setIsImportOpen(false)
      setImportFile(null)
      loadArtists()
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalArtists / limit))

  const filtered = artists.filter((a) => {
    const q = search.toLowerCase()
    return (
      a.name.toLowerCase().includes(q) ||
      String(a.first_release_year).includes(q)
    )
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Artist Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{totalArtists} total artists</p>
        </div>

        {canManageArtists && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
            <Button variant="outline" onClick={() => setIsImportOpen(true)} className="gap-2">
              <Upload className="w-4 h-4" /> Import CSV
            </Button>
            <Button className="gap-2" onClick={() => { setEditingArtist(null); setIsModalOpen(true) }}>
              <Plus className="w-4 h-4" /> Add Artist
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <div className="p-4 border-b">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search artists..."
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Albums Released</TableHead>
              <TableHead>First Release</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-14 text-muted-foreground">
                  Loading artists...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-14 text-muted-foreground">
                  {search ? 'No artists match your search.' : 'No artists found.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell className="pl-6 font-semibold">{artist.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {artist.no_of_albums_released} {artist.no_of_albums_released === 1 ? 'album' : 'albums'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {artist.first_release_year}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end items-center gap-2 ">
                      <Link to={`/dashboard/artists/${artist.id}/songs`}>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10 hover:cursor-pointer">
                          <Music className="w-3.5 h-3.5" />
                          View Songs
                        </Button>
                      </Link>
                      {canManageArtists && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-foreground"
                            onClick={() => { setEditingArtist(artist); setIsModalOpen(true) }}
                            title="Edit artist"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeletingArtistId(artist.id)}
                            title="Delete artist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Import Artists via CSV</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Upload CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                required
              />
            </div>
            <Button type="submit" disabled={!importFile} className="w-full">
              Upload
            </Button>
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
