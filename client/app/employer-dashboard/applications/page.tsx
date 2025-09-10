"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Eye,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  GraduationCap,
  Briefcase,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  User,
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { EmployerAuthGuard } from "@/components/employer-auth-guard"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

export default function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth()

  return (
    <EmployerAuthGuard>
      <ApplicationsPageContent user={user} authLoading={authLoading} />
    </EmployerAuthGuard>
  )
}

function ApplicationsPageContent({ user, authLoading }: { user: any; authLoading: boolean }) {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    if (user && !authLoading) {
      fetchApplications()
    }
  }, [user, authLoading, searchQuery, statusFilter, pagination.page])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Fetching employer applications for user:', user?.id, 'type:', user?.user_type)
      
      const response = await apiService.getEmployerApplications()
      
      console.log('📊 Employer applications API response:', response)
      
      if (response.success) {
        console.log('✅ Applications fetched successfully:', response.data)
        console.log('📋 Number of applications:', response.data?.length || 0)
        setApplications(response.data || [])
      } else {
        console.error('❌ Failed to fetch applications:', response)
        setError(response.message || 'Failed to fetch applications')
        toast.error(response.message || 'Failed to fetch applications')
      }
    } catch (error: any) {
      console.error('❌ Error fetching applications:', error)
      setError('Failed to fetch applications')
      toast.error('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const debugApplications = async () => {
    try {
      console.log('🔍 Debug: Fetching all applications...')
      const response = await apiService.debugApplications()
      console.log('📊 Debug response:', response)
      toast.success(`Debug: Found ${response.data?.length || 0} total applications`)
    } catch (error) {
      console.error('❌ Debug error:', error)
      toast.error('Debug failed')
    }
  }

  const testEmployerApplications = async () => {
    try {
      console.log('🧪 Testing employer applications endpoint...')
      const response = await apiService.testEmployerApplications()
      console.log('🧪 Test response:', response)
      if (response.success) {
        toast.success(`Test: Found ${response.data?.count || 0} applications for employer`)
      } else {
        toast.error(`Test failed: ${response.message}`)
      }
    } catch (error) {
      console.error('❌ Test error:', error)
      toast.error('Test failed')
    }
  }

  const handleDownloadResume = async (resume: any) => {
    if (!resume?.id) {
      toast.error('Resume not available for download')
      return
    }

    try {
      // For applications, we need to use the application-based download endpoint
      const response = await apiService.downloadApplicationResume(resume.id)
      
      // Get the filename from the response headers or use a default
      const contentDisposition = response.headers.get('content-disposition')
      let filename = resume.metadata?.filename || `${resume.title || 'Resume'}.pdf`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Resume downloaded successfully')
    } catch (error) {
      console.error('Error downloading resume:', error)
      toast.error('Failed to download resume')
    }
  }

  const handleDownloadCoverLetter = async (coverLetter: any) => {
    if (!coverLetter?.id) {
      toast.error('Cover letter not available for download')
      return
    }

    try {
      // Use the cover letter download endpoint
      const response = await apiService.downloadCoverLetter(coverLetter.id)
      
      // Get the filename from the response headers or use a default
      const contentDisposition = response.headers.get('content-disposition')
      let filename = coverLetter.metadata?.filename || `${coverLetter.title || 'CoverLetter'}.pdf`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Cover letter downloaded successfully')
    } catch (error) {
      console.error('Error downloading cover letter:', error)
      toast.error('Failed to download cover letter')
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      applied: "bg-blue-100 text-blue-800",
      reviewing: "bg-yellow-100 text-yellow-800",
      shortlisted: "bg-green-100 text-green-800",
      interview_scheduled: "bg-purple-100 text-purple-800",
      interviewed: "bg-indigo-100 text-indigo-800",
      offered: "bg-emerald-100 text-emerald-800",
      hired: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      withdrawn: "bg-gray-100 text-gray-800"
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      applied: Clock,
      reviewing: Eye,
      shortlisted: Star,
      interview_scheduled: Calendar,
      interviewed: CheckCircle,
      offered: Award,
      hired: CheckCircle,
      rejected: XCircle,
      withdrawn: AlertCircle
    }
    return icons[status as keyof typeof icons] || Clock
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchQuery || 
      app.applicant?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = async (application: any) => {
    try {
      const response = await apiService.getEmployerApplicationDetails(application.id)
      if (response.success) {
        setSelectedApplication(response.data)
        setIsDetailModalOpen(true)
      } else {
        toast.error('Failed to load application details')
      }
    } catch (error) {
      console.error('Error fetching application details:', error)
      toast.error('Failed to load application details')
    }
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const response = await apiService.updateApplicationStatus(applicationId, newStatus)
      if (response.success) {
        toast.success('Application status updated successfully')
        fetchApplications()
      } else {
        toast.error('Failed to update application status')
      }
    } catch (error) {
      console.error('Error updating application status:', error)
      toast.error('Failed to update application status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployerNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading applications...</p>
            </div>
          </div>
        </div>
        <EmployerFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
              <p className="text-gray-600 mt-2">
                Manage and review applications from job seekers
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={debugApplications}>
                <Search className="w-4 h-4 mr-2" />
                Debug
              </Button>
              <Button variant="outline" size="sm" onClick={testEmployerApplications}>
                <Search className="w-4 h-4 mr-2" />
                Test
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Link href="/employer-dashboard/manage-jobs">
                <Button variant="outline" size="sm">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Manage Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by candidate name, job title, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="reviewing">Under Review</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="offered">Offer Made</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600">
                  {searchQuery || statusFilter !== "all" 
                    ? "No applications match your current filters."
                    : "You haven't received any job applications yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => {
              const StatusIcon = getStatusIcon(application.status)
              const applicant = application.applicant
              const job = application.job
              
              return (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={applicant?.avatar} />
                          <AvatarFallback>
                            {applicant?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {applicant?.fullName || 'Unknown Candidate'}
                            </h3>
                            <Badge className={getStatusColor(application.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {application.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <Briefcase className="w-4 h-4 mr-2" />
                                <span className="truncate">{job?.title || 'Unknown Position'}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-4 h-4 mr-2" />
                                <span className="truncate">{applicant?.email || 'No email'}</span>
                              </div>
                              {applicant?.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="w-4 h-4 mr-2" />
                                  <span>{applicant.phone}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              {applicant?.current_location && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  <span>{applicant.current_location}</span>
                                </div>
                              )}
                              {applicant?.totalExperienceDisplay && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="w-4 h-4 mr-2" />
                                  <span>{applicant.totalExperienceDisplay} experience</span>
                                </div>
                              )}
                              {applicant?.highestEducation && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <GraduationCap className="w-4 h-4 mr-2" />
                                  <span className="truncate">{applicant.highestEducation.fullDegree}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {applicant?.headline && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {applicant.headline}
                            </p>
                          )}
                          
                          {applicant?.allSkills && applicant.allSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {applicant.allSkills.slice(0, 5).map((skill: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {applicant.allSkills.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{applicant.allSkills.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            Applied {new Date(application.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(application)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, 'reviewing')}>
                              Mark as Reviewing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, 'shortlisted')}>
                              Shortlist
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, 'interview_scheduled')}>
                              Schedule Interview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, 'rejected')}>
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Application Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <ApplicationDetailView application={selectedApplication} />
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <EmployerFooter />
    </div>
  )
}

function ApplicationDetailView({ application }: { application: any }) {
  const applicant = application.applicant
  const job = application.job
  const jobResume = application.jobResume

  return (
    <div className="space-y-6">
      {/* Candidate Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={applicant?.avatar} />
              <AvatarFallback>
                {applicant?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{applicant?.fullName}</h2>
              {applicant?.headline && (
                <p className="text-gray-600 mt-1">{applicant.headline}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {applicant?.email}
                </div>
                {applicant?.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {applicant.phone}
                  </div>
                )}
                {applicant?.current_location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {applicant.current_location}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {applicant?.summary && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-600">{applicant.summary}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{applicant?.totalExperienceYears || 0}</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{applicant?.allSkills?.length || 0}</div>
              <div className="text-sm text-gray-600">Skills</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{applicant?.profile_completion || 0}%</div>
              <div className="text-sm text-gray-600">Profile Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Experience */}
      {applicant?.workExperiences && applicant.workExperiences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applicant.workExperiences.map((exp: any, index: number) => (
                <div key={index} className="border-l-2 border-blue-200 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{exp.jobTitle}</h4>
                      <p className="text-gray-600">{exp.companyName}</p>
                      <p className="text-sm text-gray-500">{exp.formattedPeriod}</p>
                    </div>
                    {exp.isCurrent && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </div>
                  {exp.description && (
                    <p className="text-gray-600 mt-2">{exp.description}</p>
                  )}
                  {exp.skills && exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {exp.skills.map((skill: string, skillIndex: number) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {applicant?.educations && applicant.educations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applicant.educations.map((edu: any, index: number) => (
                <div key={index} className="border-l-2 border-green-200 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{edu.fullDegree}</h4>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.formattedPeriod}</p>
                    </div>
                    {edu.gradeDisplay && (
                      <Badge variant="secondary">{edu.gradeDisplay}</Badge>
                    )}
                  </div>
                  {edu.description && (
                    <p className="text-gray-600 mt-2">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {applicant?.allSkills && applicant.allSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {applicant.allSkills.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Application Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Job Applied For</h4>
              <p className="text-gray-600">{job?.title}</p>
              <p className="text-sm text-gray-500">{job?.company?.name}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Application Date</h4>
              <p className="text-gray-600">{new Date(application.appliedAt).toLocaleDateString()}</p>
            </div>
            {application.expectedSalary && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Expected Salary</h4>
                <p className="text-gray-600">₹{application.expectedSalary.toLocaleString()}</p>
              </div>
            )}
            {application.noticePeriod && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notice Period</h4>
                <p className="text-gray-600">{application.noticePeriod} days</p>
              </div>
            )}
          </div>
          
          {application.coverLetter && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Cover Letter</h4>
                {application.jobCoverLetter?.metadata?.fileUrl && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={application.jobCoverLetter.metadata.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-2" />
                        View File
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadCoverLetter(application.jobCoverLetter)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 whitespace-pre-wrap">{application.coverLetter}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume */}
      {jobResume && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Resume/CV
              </div>
              <div className="flex space-x-2">
                {jobResume.metadata?.fileUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={jobResume.metadata.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadResume(jobResume)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">{jobResume.title}</h4>
                {jobResume.summary && (
                  <p className="text-gray-600 mt-2">{jobResume.summary}</p>
                )}
              </div>
              
              {jobResume.skills && jobResume.skills.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Resume Skills</h5>
                  <div className="flex flex-wrap gap-1">
                    {jobResume.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                Last updated: {new Date(jobResume.lastUpdated).toLocaleDateString()}
              </div>
              
              {jobResume.metadata?.filename && (
                <div className="flex items-center text-sm text-gray-500">
                  <FileText className="w-4 h-4 mr-1" />
                  File: {jobResume.metadata.filename}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
