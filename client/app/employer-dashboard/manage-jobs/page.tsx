"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Pause,
  Play,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Briefcase,
  Loader2,
  AlertCircle,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export default function ManageJobsPage() {
  const { user, loading: authLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all-jobs")
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  // Fetch jobs on component mount and when filters change
  useEffect(() => {
    if (user && !authLoading) {
      fetchJobs()
    }
  }, [user, authLoading, searchQuery, statusFilter, pagination.page])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching jobs with params:', {
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined
      })

      const response = await apiService.getEmployerJobs({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      })

      if (response.success) {
        console.log('✅ Jobs fetched successfully:', response.data)
        setJobs(response.data)
        setPagination(prev => ({
          ...prev,
          total: (response as any).pagination?.total || 0,
          pages: (response as any).pagination?.pages || 0
        }))
      } else {
        console.error('❌ Failed to fetch jobs:', response)
        setError(response.message || 'Failed to fetch jobs')
        toast.error(response.message || 'Failed to fetch jobs')
      }
    } catch (error: any) {
      console.error('❌ Error fetching jobs:', error)
      
      // Handle specific error types
      if (error.message?.includes('DATABASE_CONNECTION_ERROR')) {
        setError('Database connection error. Please try again later.')
        toast.error('Database connection error. Please try again later.')
      } else if (error.message?.includes('401') || error.message?.includes('403')) {
        setError('Authentication required. Please log in again.')
        toast.error('Authentication required. Please log in again.')
      } else {
        setError(error.message || 'Failed to fetch jobs')
        toast.error(error.message || 'Failed to fetch jobs')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handleSearchChange = (newSearch: string) => {
    setSearchQuery(newSearch)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'all-jobs') {
      setStatusFilter('all')
    } else {
      setStatusFilter(tab)
    }
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleJobStatusUpdate = async (jobId: string, newStatus: string) => {
    try {
      console.log('🔄 Updating job status:', jobId, newStatus)
      
      const response = await apiService.updateJobStatus(jobId, newStatus)
      
      if (response.success) {
        console.log('✅ Job status updated successfully')
        toast.success('Job status updated successfully')
        fetchJobs() // Refresh the jobs list
      } else {
        console.error('❌ Failed to update job status:', response)
        toast.error(response.message || 'Failed to update job status')
      }
    } catch (error: any) {
      console.error('❌ Error updating job status:', error)
      toast.error(error.message || 'Failed to update job status')
    }
  }

  const handleJobDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }

    try {
      console.log('🗑️ Deleting job:', jobId)
      
      const response = await apiService.deleteJob(jobId)
      
      if (response.success) {
        console.log('✅ Job deleted successfully')
        toast.success('Job deleted successfully')
        fetchJobs() // Refresh the jobs list
      } else {
        console.error('❌ Failed to delete job:', response)
        toast.error(response.message || 'Failed to delete job')
      }
    } catch (error: any) {
      console.error('❌ Error deleting job:', error)
      toast.error(error.message || 'Failed to delete job')
    }
  }

  const handlePublishDraft = async (jobId: string) => {
    if (!confirm('Are you sure you want to publish this draft? It will become visible to job seekers.')) {
      return
    }

    try {
      console.log('📤 Publishing draft:', jobId)
      
      const response = await apiService.updateJobStatus(jobId, 'active')
      
      if (response.success) {
        console.log('✅ Draft published successfully')
        toast.success('Draft published successfully')
        fetchJobs() // Refresh the jobs list
      } else {
        console.error('❌ Failed to publish draft:', response)
        toast.error(response.message || 'Failed to publish draft')
      }
    } catch (error: any) {
      console.error('❌ Error publishing draft:', error)
      toast.error(error.message || 'Failed to publish draft')
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  // Calculate expiry date (21 days default if active and no validTill)
  const getExpiryDate = (createdAt: string, validTill?: string) => {
    if (validTill) {
      const expiryDate = new Date(validTill)
      const now = new Date()
      const diffTime = expiryDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'Expired'
      if (diffDays === 1) return '1 day left'
      return `${diffDays} days left`
    }
    
    // Default 21 days from creation
    const createdDate = new Date(createdAt)
    const expiryDate = new Date(createdDate.getTime() + (21 * 24 * 60 * 60 * 1000))
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Expired'
    if (diffDays === 1) return '1 day left'
    return `${diffDays} days left`
  }

  const handleEditExpiry = async (job: any) => {
    const current = job.validTill ? new Date(job.validTill) : new Date(new Date(job.createdAt).getTime() + (21 * 24 * 60 * 60 * 1000))
    const iso = current.toISOString().slice(0, 10)
    const input = prompt('Set application deadline (YYYY-MM-DD):', iso)
    if (!input) return
    const parsed = new Date(input)
    if (isNaN(parsed.getTime())) {
      toast.error('Invalid date')
      return
    }
    try {
      const res = await apiService.updateJobExpiry(job.id, parsed.toISOString())
      if (res.success) {
        toast.success('Expiry updated')
        fetchJobs()
      } else {
        toast.error(res.message || 'Failed to update expiry')
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to update expiry')
    }
  }

  const handleExpireNow = async (jobId: string) => {
    if (!confirm('Expire this job immediately? Jobseekers will no longer be able to apply.')) return
    try {
      const res = await apiService.expireJobNow(jobId)
      if (res.success) {
        toast.success('Job expired')
        fetchJobs()
      } else {
        toast.error(res.message || 'Failed to expire job')
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to expire job')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Paused</Badge>
      case "closed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Closed</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
      case "active":
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case "paused":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      case "closed":
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      case "expired":
        return <div className="w-2 h-2 bg-red-600 rounded-full"></div>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <EmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage Jobs</h1>
            <p className="text-slate-600">View and manage all your job postings</p>
          </div>
          <Link href="/employer-dashboard/post-job">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search jobs by title, department..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Drafts</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
                          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-xl border border-slate-200/50">
                  <TabsTrigger value="all-jobs">All Jobs ({pagination.total})</TabsTrigger>
                  <TabsTrigger value="draft">Drafts ({jobs.filter((j) => j.status === "draft").length})</TabsTrigger>
                  <TabsTrigger value="active">Active ({jobs.filter((j) => j.status === "active").length})</TabsTrigger>
                  <TabsTrigger value="paused">Paused ({jobs.filter((j) => j.status === "paused").length})</TabsTrigger>
                  <TabsTrigger value="closed">Closed ({jobs.filter((j) => j.status === "closed").length})</TabsTrigger>
                </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Loading State */}
                  {loading && (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-slate-600">Loading your jobs...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {error && !loading && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {error}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-2"
                          onClick={fetchJobs}
                        >
                          Try Again
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Jobs List */}
                  {!loading && !error && jobs.length > 0 ? (
                    jobs.map((job: any, index: number) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              {getStatusIcon(job.status)}
                              <Link
                                href={`/employer-dashboard/manage-jobs/${job.id}`}
                                className="text-xl font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                {job.title}
                              </Link>
                              {getStatusBadge(job.status)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <Briefcase className="w-4 h-4" />
                                <span>{job.department || 'Not specified'}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <MapPin className="w-4 h-4" />
                                <span>
                                  {job.location} • {job.jobType || job.type || 'Not specified'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(job.createdAt)}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-slate-600">
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{job.jobApplications?.length || job.applications || 0} applications</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{job.views || 0} views</span>
                              </div>
                              <span>•</span>
                              <span>{job.salary || (job.salaryMin && job.salaryMax ? `₹${job.salaryMin}-${job.salaryMax} LPA` : 'Not specified')}</span>
                              <span>•</span>
                              <span className={getExpiryDate(job.createdAt, job.validTill) === 'Expired' ? "text-red-600" : "text-green-600"}>
                                {getExpiryDate(job.createdAt, job.validTill)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Link href={`/employer-dashboard/manage-jobs/${job.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                                                             <DropdownMenuContent align="end">
                                 <DropdownMenuItem asChild>
                                   <Link href={`/employer-dashboard/post-job?draft=${job.id}`}>
                                     <Edit className="w-4 h-4 mr-2" />
                                     Edit Job
                                   </Link>
                                 </DropdownMenuItem>
                                 {job.status !== "draft" && (
                                   <DropdownMenuItem asChild>
                                     <Link href={`/employer-dashboard/applications?jobId=${job.id}`}>
                                       <Users className="w-4 h-4 mr-2" />
                                       View Applications
                                     </Link>
                                   </DropdownMenuItem>
                                 )}
                                 <DropdownMenuItem asChild>
                                   <Link href={`/jobs/${job.id}`}>
                                     <Eye className="w-4 h-4 mr-2" />
                                     Preview Job
                                   </Link>
                                 </DropdownMenuItem>
                                 <DropdownMenuSeparator />
                                {job.status === "draft" ? (
                                   <DropdownMenuItem onClick={() => handlePublishDraft(job.id)}>
                                     <Send className="w-4 h-4 mr-2" />
                                     Publish Draft
                                   </DropdownMenuItem>
                                ) : job.status === "active" ? (
                                   <DropdownMenuItem onClick={() => handleJobStatusUpdate(job.id, 'paused')}>
                                     <Pause className="w-4 h-4 mr-2" />
                                     Pause Job
                                   </DropdownMenuItem>
                                ) : job.status === "paused" ? (
                                   <DropdownMenuItem onClick={() => handleJobStatusUpdate(job.id, 'active')}>
                                     <Play className="w-4 h-4 mr-2" />
                                     Resume Job
                                   </DropdownMenuItem>
                                ) : job.status === "expired" ? (
                                  <DropdownMenuItem onClick={() => handleJobStatusUpdate(job.id, 'active')}>
                                    <Play className="w-4 h-4 mr-2" />
                                    Make Active
                                  </DropdownMenuItem>
                                 ) : null}
                                <DropdownMenuItem onClick={() => handleEditExpiry(job)}>
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Edit Expiry
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExpireNow(job.id)}>
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Expire Now
                                </DropdownMenuItem>
                                 <DropdownMenuItem 
                                   className="text-red-600"
                                   onClick={() => handleJobDelete(job.id)}
                                 >
                                   <Trash2 className="w-4 h-4 mr-2" />
                                   Delete Job
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : !loading && !error && jobs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
                      <p className="text-slate-600 mb-4">
                        {searchQuery || statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Get started by posting your first job"}
                      </p>
                      <Link href="/employer-dashboard/post-job">
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Post Your First Job
                        </Button>
                      </Link>
                    </div>
                  ) : null}

                  {/* Pagination */}
                  {!loading && !error && jobs.length > 0 && pagination.pages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                      <div className="text-sm text-slate-600">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} jobs
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page <= 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-slate-600">
                          Page {pagination.page} of {pagination.pages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page >= pagination.pages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <EmployerFooter />
    </div>
  )
}
