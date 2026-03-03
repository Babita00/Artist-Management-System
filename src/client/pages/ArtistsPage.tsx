import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import {
  getAllArtistsAPI,
  createArtistAPI,
  updateArtistAPI,
  deleteArtistAPI,
  exportArtistsAPI,
  importArtistsAPI,
} from '../services/artist.api'
import { Artist } from '~/types'
import { AxiosError } from 'axios'
import { useAuthStore } from '../store'

const ArtistsPage = () => {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)

  const currentUser = useAuthStore((state) => state.user)
  const isManagerOrAdmin =
    currentUser?.role === 'super_admin' || currentUser?.role === 'artist_manager'
  const canManageArtists = currentUser?.role === 'artist_manager'

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      name: '',
      dob: '',
      gender: 'M',
      address: '',
      first_release_year: new Date().getFullYear(),
      no_of_albums_released: 0,
    },
  })

  // We load artists for super_admin and artist_manager
  const loadArtists = async () => {
    if (!isManagerOrAdmin) return
    setLoading(true)
    try {
      const resp = await getAllArtistsAPI({ page, limit: 10 })
      // Handle the wrapping structure from our _axios setup
      const artistList = Array.isArray(resp)
        ? resp
        : (resp as any).artists || (resp as any).data || []
      setArtists(artistList)
    } catch (err) {
      console.error('Failed to load artists:', err)
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

  const handleOpenDialog = (artist?: Artist) => {
    setError('')
    if (artist) {
      setEditingArtist(artist)
      reset({
        ...artist,
        dob: typeof artist.dob === 'string' ? artist.dob : new Date(artist.dob).toISOString().split('T')[0],
        gender: artist.gender || 'M',
      })
      setValue('gender', artist.gender || 'M')
    } else {
      setEditingArtist(null)
      reset({
        name: '',
        dob: '',
        gender: 'M',
        address: '',
        first_release_year: new Date().getFullYear(),
        no_of_albums_released: 0,
      })
      setValue('gender', 'M')
    }
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: any) => {
    setError('')
    try {
      // Cast integers correctly before sending
      const payload = {
        ...data,
        first_release_year: parseInt(data.first_release_year, 10),
        no_of_albums_released: parseInt(data.no_of_albums_released, 10),
      }

      if (editingArtist) {
        await updateArtistAPI(editingArtist.id, payload)
      } else {
        await createArtistAPI(payload)
      }
      setIsDialogOpen(false)
      loadArtists()
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Operation failed')
      } else {
        setError('Unexpected error occurred')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this artist?')) {
      try {
        await deleteArtistAPI(id)
        loadArtists()
      } catch (err) {
        alert('Failed to delete artist')
      }
    }
  }

  const handleExport = async () => {
    try {
      const response = await exportArtistsAPI()
      // Create a blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'artists_export.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Failed to export CSV')
    }
  }

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) return

    const formData = new FormData()
    formData.append('file', importFile)

    try {
      await importArtistsAPI(formData)
      setIsImportOpen(false)
      setImportFile(null)
      loadArtists()
      alert('Import successful!')
    } catch (error) {
      alert('Import failed. Please check the CSV format.')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Artist Management</h1>
        
        {canManageArtists && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              Export CSV
            </Button>
            
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" onClick={() => setIsImportOpen(true)}>Import CSV</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] glass">
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
                  <Button type="submit" disabled={!importFile} className="w-full">Upload</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>Add New Artist</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] glass">
                <DialogHeader>
                  <DialogTitle>{editingArtist ? 'Edit Artist' : 'Register Artist'}</DialogTitle>
                </DialogHeader>
                {error && <div className="text-destructive text-sm font-semibold mb-4">{error}</div>}
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="name">Artist Name</Label>
                      <Input id="name" {...register('name', { required: true })} />
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
                      <Label htmlFor="first_release_year">First Release Year</Label>
                      <Input id="first_release_year" type="number" {...register('first_release_year', { required: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="no_of_albums_released">Albums Released</Label>
                      <Input id="no_of_albums_released" type="number" {...register('no_of_albums_released', { required: true })} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address">Address / Location</Label>
                      <Input id="address" {...register('address', { required: true })} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingArtist ? 'Save Updates' : 'Create'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="border border-border/40 rounded-md glass">
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
                    {typeof artist.dob === 'string' ? artist.dob : new Date(artist.dob).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{artist.first_release_year}</TableCell>
                  <TableCell>
                    <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md text-xs font-medium">
                      {artist.no_of_albums_released}
                    </span>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Link to={`/dashboard/artists/${artist.id}/songs`}>
                      <Button variant="secondary" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
                        View Songs
                      </Button>
                    </Link>
                    
                    {canManageArtists && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(artist)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(artist.id)}>Delete</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span>Page {page}</span>
        <Button variant="outline" size="sm" disabled={artists.length < 10} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  )
}

export default ArtistsPage
