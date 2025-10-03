"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import {
  Briefcase,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  ArrowLeft,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building2,
  Calendar,
  DollarSign
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

export default function IndiaJobsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterJobType, setFilterJobType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showJobDialog, setShowJobDialog] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user || user.userType !== 'admin') {
      router.push('/admin-login')
      return
    }

    loadIndiaJobs()
  }, [user, authLoading, router, currentPage, filterStatus, filterJobType])

  const loadIndiaJobs = async () => {
    try {
      setLoading(true)
      const response = await apiService.getJobsByRegion('india', {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: filterStatus === 'all' ? undefined : filterStatus,
        jobType: filterJobType === 'all' ? undefined : filterJobType
      })
      
      if (response.success) {
        setJobs(response.data.jobs)
        setTotalPages(response.data.totalPages)
      } else {
        toast.error('Failed to load India jobs')
      }
    } catch (error) {
      console.error('Failed to load India jobs:', error)
      toast.error('Failed to load India jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadIndiaJobs()
  }

  const updateJobStatus = async (jobId: string, status: string) => {
    try {
      const response = await apiService.updateJobStatus(jobId, status)
      
      if (response.success) {
        toast.success(`Job ${status} successfully`)
        loadIndiaJobs()
      } else {
        toast.error('Failed to update job status')
      }
    } catch (error) {
      console.error('Failed to update job status:', error)
      toast.error('Failed to update job status')
    }
  }

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiService.deleteJob(jobId)
      
      if (response.success) {
        toast.success('Job deleted successfully')
        loadIndiaJobs()
      } else {
        toast.error('Failed to delete job')
      }
    } catch (error) {
      console.error('Failed to delete job:', error)
      toast.error('Failed to delete job')
    }
  }

  const exportIndiaJobs = async () => {
    try {
      const response = await apiService.exportJobs({
        region: 'india',
        status: filterStatus === 'all' ? undefined : filterStatus,
        jobType: filterJobType === 'all' ? undefined : filterJobType
      })
      
      if (response.success) {
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `india-jobs-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast.success('India jobs exported successfully')
      } else {
        toast.error('Failed to export jobs')
      }
    } catch (error) {
      console.error('Failed to export jobs:', error)
      toast.error('Failed to export jobs')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading India Jobs...</p>
        </div>
      </div>
    )
  }

  if (!user || user.userType !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-orange-400" />
                  India Jobs
                </h1>
                <p className="text-sm text-gray-400">Manage jobs from India region</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportIndiaJobs}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadIndiaJobs}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search India jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterJobType} onValueChange={setFilterJobType}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-400" />
                India Jobs ({jobs.length})
              </span>
              <div className="flex space-x-2">
                <Link href="/admin/jobs/all">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    All Jobs
                  </Button>
                </Link>
                <Link href="/admin/jobs/gulf">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    Gulf Jobs
                  </Button>
                </Link>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No India jobs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-lg">{job.title}</h3>
                            <p className="text-sm text-gray-400">{job.company?.name}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className="bg-orange-600">
                                <MapPin className="w-3 h-3 mr-1" />
                                India
                              </Badge>
                              <Badge 
                                variant={job.status === 'active' ? 'default' : 'destructive'}
                                className={job.status === 'active' ? 'bg-green-600' : 'bg-red-600'}
                              >
                                {job.status}
                              </Badge>
                              <Badge variant="outline" className="border-white/20 text-white">
                                {job.jobType}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {job.location}
                              </div>
                              {job.salaryMin && job.salaryMax && (
                                <div className="flex items-center">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} {job.salaryCurrency}
                                </div>
                              )}
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(job.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            {job.description && (
                              <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                                {job.description.substring(0, 150)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedJob(job)
                            setShowJobDialog(true)
                          }}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateJobStatus(job.id, job.status === 'active' ? 'inactive' : 'active')}
                          className={`border-white/20 text-white hover:bg-white/10 ${
                            job.status === 'active' ? 'hover:text-red-400' : 'hover:text-green-400'
                          }`}
                        >
                          {job.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setSelectedJob(job)
                              setShowJobDialog(true)
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateJobStatus(job.id, 'active')}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateJobStatus(job.id, 'inactive')}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteJob(job.id)}
                              className="text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Details Dialog */}
        <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
          <DialogContent className="max-w-4xl bg-slate-800 border-white/20 text-white max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>India Job Details</DialogTitle>
              <DialogDescription>
                Complete information about {selectedJob?.title}
              </DialogDescription>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">{selectedJob.title}</h2>
                    <p className="text-gray-400">{selectedJob.company?.name}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className="bg-orange-600">India</Badge>
                      <Badge 
                        variant={selectedJob.status === 'active' ? 'default' : 'destructive'}
                        className={selectedJob.status === 'active' ? 'bg-green-600' : 'bg-red-600'}
                      >
                        {selectedJob.status}
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white">
                        {selectedJob.jobType}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Location</label>
                      <p className="text-white">{selectedJob.location}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Experience Level</label>
                      <p className="text-white">{selectedJob.experienceLevel || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Experience Range</label>
                      <p className="text-white">
                        {selectedJob.experienceMin && selectedJob.experienceMax 
                          ? `${selectedJob.experienceMin} - ${selectedJob.experienceMax} years`
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Department</label>
                      <p className="text-white">{selectedJob.department || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Category</label>
                      <p className="text-white">{selectedJob.category || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Salary Range</label>
                      <p className="text-white">
                        {selectedJob.salaryMin && selectedJob.salaryMax 
                          ? `${selectedJob.salaryMin.toLocaleString()} - ${selectedJob.salaryMax.toLocaleString()} ${selectedJob.salaryCurrency}`
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Salary Period</label>
                      <p className="text-white">{selectedJob.salaryPeriod || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Remote Work</label>
                      <p className="text-white">{selectedJob.remoteWork || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Shift Timing</label>
                      <p className="text-white">{selectedJob.shiftTiming || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Education</label>
                      <p className="text-white">{selectedJob.education || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {selectedJob.description && (
                  <div>
                    <label className="text-sm text-gray-400">Description</label>
                    <p className="text-white mt-1 whitespace-pre-wrap">{selectedJob.description}</p>
                  </div>
                )}

                {selectedJob.requirements && (
                  <div>
                    <label className="text-sm text-gray-400">Requirements</label>
                    <p className="text-white mt-1 whitespace-pre-wrap">{selectedJob.requirements}</p>
                  </div>
                )}

                {selectedJob.responsibilities && (
                  <div>
                    <label className="text-sm text-gray-400">Responsibilities</label>
                    <p className="text-white mt-1 whitespace-pre-wrap">{selectedJob.responsibilities}</p>
                  </div>
                )}

                {selectedJob.skills && (
                  <div>
                    <label className="text-sm text-gray-400">Skills</label>
                    <p className="text-white mt-1">{selectedJob.skills}</p>
                  </div>
                )}

                {selectedJob.benefits && (
                  <div>
                    <label className="text-sm text-gray-400">Benefits</label>
                    <p className="text-white mt-1">{selectedJob.benefits}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-sm text-gray-400">
                    Created: {new Date(selectedJob.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateJobStatus(selectedJob.id, selectedJob.status === 'active' ? 'inactive' : 'active')}
                      className={`border-white/20 text-white hover:bg-white/10 ${
                        selectedJob.status === 'active' ? 'hover:text-red-400' : 'hover:text-green-400'
                      }`}
                    >
                      {selectedJob.status === 'active' ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
