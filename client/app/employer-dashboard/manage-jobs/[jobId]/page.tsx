"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  Eye,
  Share2,
  Bookmark,
  Building2,
  Clock,
  CheckCircle,
  Star,
  ExternalLink,
  Download,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Edit,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import { EmployerAuthGuard } from "@/components/employer-auth-guard"

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [companyJobs, setCompanyJobs] = useState<any[]>([])
  const [companyJobsLoading, setCompanyJobsLoading] = useState(false)
  const [applications, setApplications] = useState<any[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(false)

  useEffect(() => {
    if (params.jobId) {
      fetchJobDetails()
      fetchJobApplications()
    }
  }, [params.jobId])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching job details for ID:', params.jobId)
      const response = await apiService.getJobForEdit(params.jobId as string)
      
      if (response.success && response.data) {
        console.log('✅ Job details fetched:', response.data)
        
        // Extract consultancy metadata
        const metadata = response.data.metadata || {};
        const enrichedJob = {
          ...response.data,
          isConsultancy: metadata.postingType === 'consultancy',
          consultancyName: metadata.consultancyName || null,
          hiringCompany: metadata.hiringCompany || null,
          showHiringCompanyDetails: metadata.showHiringCompanyDetails || false,
          companyName: metadata.companyName || response.data.company?.name || null,
          industryType: response.data.industryType || metadata.hiringCompany?.industry || response.data.company?.industry || null,
        };
        
        setJob(enrichedJob)
        
        // Fetch other jobs from same company
        const companyId = (response.data as any).companyId || response.data?.company?.id
        await fetchCompanyJobs(companyId)
      } else {
        console.error('❌ Failed to fetch job details:', response)
        setError(response.message || 'Failed to fetch job details')
        toast.error(response.message || 'Failed to fetch job details')
      }
    } catch (error: any) {
      console.error('❌ Error fetching job details:', error)
      setError('Failed to fetch job details')
      toast.error('Failed to fetch job details')
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanyJobs = async (companyId?: string) => {
    try {
      if (!companyId) return
      setCompanyJobsLoading(true)
      const response = await apiService.getCompanyJobs(companyId, { limit: 5 })
      if (response.success && response.data) {
        const jobs = (response.data.jobs || response.data || []) as any[]
        const filtered = jobs.filter(j => String(j.id) !== String(params.jobId))
        setCompanyJobs(filtered)
      } else {
        setCompanyJobs([])
      }
    } catch (error) {
      setCompanyJobs([])
    } finally {
      setCompanyJobsLoading(false)
    }
  }

  const fetchJobApplications = async () => {
    try {
      setApplicationsLoading(true)
      const response = await apiService.getEmployerApplications()
      if (response.success && Array.isArray(response.data)) {
        const list = (response.data as any[]).filter(app => String(app.jobId) === String(params.jobId))
        setApplications(list)
      } else {
        setApplications([])
      }
    } catch (e) {
      setApplications([])
    } finally {
      setApplicationsLoading(false)
    }
  }

  if (loading) {
    return (
    <EmployerAuthGuard>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <EmployerNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading job details...</p>
            </div>
          </div>
        </div>
        <EmployerFooter />
      </div>
    </EmployerAuthGuard>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <EmployerNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Job not found'}</p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
        <EmployerFooter />
      </div>
    )
  }

  // Transform job data for display
  const transformedJob = {
    id: job.id,
    title: job.title || 'Untitled Job',
    // Company name - check for consultancy first
    company: job.isConsultancy && job.showHiringCompanyDetails
      ? job.hiringCompany?.name || 'Hiring Company'
      : job.isConsultancy
        ? job.consultancyName || 'Consultancy'
        : job.companyName || job.company?.name || 'Company Name',
    companyLogo: job.company?.logo || "/placeholder-logo.png",
    // Consultancy-specific fields
    isConsultancy: job.isConsultancy || false,
    consultancyName: job.consultancyName || null,
    hiringCompany: job.hiringCompany || null,
    showHiringCompanyDetails: job.showHiringCompanyDetails || false,
    location: job.location || 'Location not specified',
    type: job.jobType || job.type || 'Full-time',
    experience: job.experienceLevel || job.experience || 'Experience not specified',
    salary: job.salary || (job.salaryMin && job.salaryMax ? `${(job.salaryMin / 100000).toFixed(0)}-${(job.salaryMax / 100000).toFixed(0)} LPA` : 'Not specified'),
    postedDate: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Date not available',
    applications: (job.applicationsCount ?? applications.length) || applications.length || 0,
    views: job.views || 0,
    status: job.status || 'draft',
    department: job.department || 'Department not specified',
    skills: Array.isArray(job.skills) ? job.skills : (job.skills ? job.skills.split(',').map((s: string) => s.trim()) : []),
    description: job.description || 'No description provided',
    benefits: Array.isArray(job.benefits) ? job.benefits : (job.benefits ? job.benefits.split('\n').filter((b: string) => b.trim()) : []),
    companyInfo: {
      description: job.isConsultancy && job.showHiringCompanyDetails
        ? job.hiringCompany?.description || 'Company description not available'
        : job.company?.description || 'Company description not available',
      founded: job.company?.founded || 'N/A',
      employees: job.company?.employees || 'N/A',
      industry: job.industryType || job.hiringCompany?.industry || job.company?.industry || 'N/A',
      website: job.company?.website || '',
      linkedin: job.company?.linkedin || '',
      location: job.company?.location || job.location || 'Location not specified'
    }
  }


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <EmployerNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jobs</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {transformedJob.title}
                      </h1>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                        {transformedJob.company}
                      </p>
                        {transformedJob.isConsultancy && (
                          <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700">
                            Posted by {transformedJob.consultancyName}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{transformedJob.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{transformedJob.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{transformedJob.postedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        const shareUrl = `${window.location.origin}/jobs/${transformedJob.id}`
                        const shareText = `Check out this job: ${transformedJob.title} at ${transformedJob.company}`
                        
                        if (navigator.share) {
                          navigator.share({
                            title: transformedJob.title,
                            text: shareText,
                            url: shareUrl
                          }).catch(err => console.log('Error sharing:', err))
                        } else {
                          navigator.clipboard.writeText(shareUrl)
                          toast.success('Job link copied to clipboard!')
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{transformedJob.applications}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Applications</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{transformedJob.views}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Views</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{transformedJob.status}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{transformedJob.department}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Department</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {transformedJob.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Job Details Tabs */}
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="company">Company</TabsTrigger>
                    <TabsTrigger value="applications">Applications</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Job Description</h3>
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        <div className="whitespace-pre-line text-slate-600 dark:text-slate-400 leading-relaxed">
                          {transformedJob.description}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Benefits & Perks</h3>
                      {transformedJob.benefits && transformedJob.benefits.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {transformedJob.benefits.map((benefit: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-slate-600 dark:text-slate-400">{benefit}</span>
                          </div>
                        ))}
                      </div>
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400 italic">No benefits information provided</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="company" className="space-y-6">
                    <div>
                      {/* Consultancy Job Badge */}
                      {transformedJob.isConsultancy && (
                        <div className="bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-5 h-5 text-purple-600" />
                            <span className="font-semibold text-purple-900 dark:text-purple-100">Consultancy Job</span>
                          </div>
                          <p className="text-sm text-purple-800 dark:text-purple-200">
                            Posted by: <span className="font-medium">{transformedJob.consultancyName}</span>
                          </p>
                          {!transformedJob.showHiringCompanyDetails && (
                            <p className="text-xs text-purple-700 dark:text-purple-300 mt-2">
                              Hiring company details are confidential
                            </p>
                          )}
                        </div>
                      )}
                      
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        About {transformedJob.isConsultancy && transformedJob.showHiringCompanyDetails ? 'the Hiring Company' : transformedJob.company}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        {transformedJob.companyInfo.description}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Founded</p>
                          <p className="font-medium">{transformedJob.companyInfo.founded}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Employees</p>
                          <p className="font-medium">{transformedJob.companyInfo.employees}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Industry</p>
                          <p className="font-medium">{transformedJob.companyInfo.industry}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                          <p className="font-medium">{transformedJob.companyInfo.location}</p>
                        </div>
                      </div>

                      <div className="flex space-x-4 mt-6">
                        {transformedJob.companyInfo.website && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={`https://${transformedJob.companyInfo.website}`} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4 mr-2" />
                            Website
                          </a>
                        </Button>
                        )}
                        {transformedJob.companyInfo.linkedin && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={`https://${transformedJob.companyInfo.linkedin}`} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="w-4 h-4 mr-2" />
                            LinkedIn
                          </a>
                        </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="applications" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Applications</h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        View and manage applications for this job posting. You have received {transformedJob.applications} applications so far.
                      </p>
                      <div className="mt-4">
                        {applicationsLoading ? (
                          <div className="text-sm text-slate-500">Loading applications...</div>
                        ) : applications.length > 0 ? (
                          <div className="space-y-3">
                            {applications.slice(0,5).map(app => (
                              <div key={app.id} className="p-3 border rounded-lg flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-slate-900">{app.applicant?.fullName || `${app.applicant?.first_name || ''} ${app.applicant?.last_name || ''}`.trim() || app.applicant?.email || 'Candidate'}</div>
                                  <div className="text-xs text-slate-500">{app.status?.replace('_',' ') || 'applied'} • {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</div>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => router.push(`/employer-dashboard/applications?jobId=${transformedJob.id}`)}>View</Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500">No applications yet.</div>
                        )}
                      </div>
                      
                      <div className="mt-6">
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => router.push(`/employer-dashboard/applications?jobId=${transformedJob.id}`)}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          View All Applications
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Job Actions</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push(`/employer-dashboard/post-job?draft=${transformedJob.id}`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Job
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/jobs/${transformedJob.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Job
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Job
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Applications
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Job Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Job Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Applications</span>
                    <span className="font-semibold">{transformedJob.applications}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Views</span>
                    <span className="font-semibold">{transformedJob.views}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Status</span>
                    <Badge variant={transformedJob.status === 'active' ? 'default' : 'secondary'}>
                      {transformedJob.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Posted</span>
                    <span className="font-semibold">{transformedJob.postedDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other Jobs from Your Company */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Other Jobs from Your Company</h3>
                  {companyJobsLoading && (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  )}
                </div>
                
                {companyJobsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4 border rounded-lg animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                        <div className="flex justify-between">
                          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : companyJobs.length > 0 ? (
                  <div className="space-y-4">
                    {companyJobs.map((recJob) => (
                      <Link
                        key={recJob.id}
                        href={`/employer-dashboard/manage-jobs/${recJob.id}`}
                        className="block p-4 border rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                      >
                        <h4 className="font-medium text-slate-900 dark:text-white mb-1">{recJob.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{recJob.company?.name || transformedJob.company}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {recJob.location}
                          </span>
                          <span>{recJob.salary || (recJob.salaryMin && recJob.salaryMax ? `${(recJob.salaryMin / 100000).toFixed(0)}-${(recJob.salaryMax / 100000).toFixed(0)} LPA` : '')}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {recJob.jobType || recJob.type}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {(recJob.applicationsCount ?? 0)} applications
                          </span>
                        </div>
                        {recJob.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                            {recJob.description}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">No other jobs from your company</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <EmployerFooter />
    </div>
    </EmployerAuthGuard>
  )
} 