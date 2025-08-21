"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft,
  Bookmark,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Save,
  Star,
  Eye,
  Briefcase
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { toast } from 'sonner'
import { apiService, JobBookmark } from '@/lib/api'

export default function BookmarksPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<JobBookmark[]>([])
  const [bookmarksLoading, setBookmarksLoading] = useState(true)
  const [editingBookmark, setEditingBookmark] = useState<JobBookmark | null>(null)
  const [formData, setFormData] = useState({
    folder: '',
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })
  const [filterFolder, setFilterFolder] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to view your bookmarks')
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !loading) {
      fetchBookmarks()
    }
  }, [user, loading])

  const fetchBookmarks = async () => {
    try {
      setBookmarksLoading(true)
      const response = await apiService.getBookmarks()
      if (response.success && response.data) {
        setBookmarks(response.data)
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      toast.error('Failed to load bookmarks')
    } finally {
      setBookmarksLoading(false)
    }
  }

  const handleUpdateBookmark = async () => {
    if (!editingBookmark) return

    try {
      const response = await apiService.updateBookmark(editingBookmark.id, formData)
      if (response.success) {
        toast.success('Bookmark updated successfully')
        setEditingBookmark(null)
        resetForm()
        fetchBookmarks()
      }
    } catch (error) {
      console.error('Error updating bookmark:', error)
      toast.error('Failed to update bookmark')
    }
  }

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      const response = await apiService.deleteBookmark(bookmarkId)
      if (response.success) {
        toast.success('Bookmark deleted successfully')
        fetchBookmarks()
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      toast.error('Failed to delete bookmark')
    }
  }

  const handleEditBookmark = (bookmark: JobBookmark) => {
    setEditingBookmark(bookmark)
    setFormData({
      folder: bookmark.folder || '',
      notes: bookmark.notes || '',
      priority: bookmark.priority
    })
  }

  const resetForm = () => {
    setFormData({
      folder: '',
      notes: '',
      priority: 'medium'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Star className="w-4 h-4 fill-current" />
      case 'medium': return <Star className="w-4 h-4" />
      case 'low': return <Star className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = searchTerm === '' || 
      bookmark.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.job?.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFolder = filterFolder === 'all' || bookmark.folder === filterFolder
    
    return matchesSearch && matchesFolder
  })

  const folders = Array.from(new Set(bookmarks.map(b => b.folder).filter(Boolean)))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />
      
      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Saved Jobs
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage your bookmarked jobs and organize them with folders and notes
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search bookmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterFolder} onValueChange={setFilterFolder}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Edit Form */}
          {editingBookmark && (
            <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Edit Bookmark</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="folder">Folder</Label>
                    <Input
                      id="folder"
                      value={formData.folder}
                      onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                      placeholder="e.g., Frontend Jobs, Remote Work"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add your personal notes about this job..."
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleUpdateBookmark}>
                    <Save className="w-4 h-4 mr-2" />
                    Update Bookmark
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setEditingBookmark(null)
                    resetForm()
                  }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bookmarks List */}
          {bookmarksLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <Bookmark className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {searchTerm || filterFolder !== 'all' ? 'No matching bookmarks' : 'No bookmarks yet'}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {searchTerm || filterFolder !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start bookmarking jobs to save them for later review'
                  }
                </p>
                <Link href="/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookmarks.map((bookmark) => (
                <Card key={bookmark.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {bookmark.job?.title || 'Job Title'}
                          </h3>
                          <Badge className={getPriorityColor(bookmark.priority)}>
                            <span className="flex items-center space-x-1">
                              {getPriorityIcon(bookmark.priority)}
                              <span className="capitalize">{bookmark.priority}</span>
                            </span>
                          </Badge>
                          {bookmark.folder && (
                            <Badge variant="outline">
                              {bookmark.folder}
                            </Badge>
                          )}
                          {bookmark.isApplied && (
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Applied
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-300 mb-3">
                          <div className="flex items-center space-x-1">
                            <Building2 className="w-4 h-4" />
                            <span>{bookmark.job?.company?.name || 'Company Name'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{bookmark.job?.location || 'Location'}</span>
                          </div>
                          {bookmark.job?.salaryMin && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>
                                ${bookmark.job.salaryMin.toLocaleString()}
                                {bookmark.job.salaryMax && ` - $${bookmark.job.salaryMax.toLocaleString()}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {bookmark.notes && (
                          <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              <strong>Notes:</strong> {bookmark.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Saved: {new Date(bookmark.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Link href={`/jobs/${bookmark.jobId}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View Job
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => handleEditBookmark(bookmark)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteBookmark(bookmark.id)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

