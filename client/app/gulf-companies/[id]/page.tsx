"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import {
  Star,
  MapPin,
  Users,
  Building2,
  Globe,
  Calendar,
  TrendingUp,
  Heart,
  Share2,
  ChevronRight,
  Briefcase,
  IndianRupee,
  Clock,
  LinkIcon,
  Mail,
  Phone,
  MessageCircle,
  ArrowLeft,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { apiService, Job, Company } from '@/lib/api'
import { sampleJobManager } from '@/lib/sampleJobManager'
import { toast } from "sonner"
import React from "react"

// Simple error boundary component
class CompanyErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Company page error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <Navbar />
          <div className="pt-20 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Company</h1>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  There was an error loading the company information. Please try again.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function GulfCompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  
  // Safely get user data without causing errors
  let user = null
  let loading = false
  try {
    const authContext = useAuth()
    user = authContext.user
    loading = authContext.loading
  } catch (error) {
    console.log('Auth context not available, proceeding without authentication')
  }
  
  const companyId = String((params as any)?.id || '')
  const isValidUuid = /^[0-9a-fA-F-]{36}$/.test(companyId)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [company, setCompany] = useState<any>(null)
  const [companyJobs, setCompanyJobs] = useState<any[]>([])
  const [loadingCompany, setLoadingCompany] = useState(true)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [companyError, setCompanyError] = useState<string>("")
  const [jobsError, setJobsError] = useState<string>("")
  const [showApplicationDialog, setShowApplicationDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [applicationData, setApplicationData] = useState({
    expectedSalary: '',
    noticePeriod: '',
    coverLetter: '',
    willingToRelocate: false
  })

  // Simple computed values without useMemo to avoid React error #310
  const safeJobs = Array.isArray(companyJobs) ? companyJobs : []
  const hasJobs = safeJobs.length > 0
  const isLoggedIn = !!user && !loading

  // Check if user is authenticated
  useEffect(() => {
    if (user && !loading) {
      setIsAuthenticated(true)
    }
  }, [user, loading])

  const toggleFollow = useCallback(async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }

    try {
      // Toggle follow status
      setIsFollowing((v) => !v)
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('Failed to update follow status')
    }
  }, [companyId, isFollowing])

  // Fetch company data (public fallback via listCompanies if direct endpoint is protected)
  const fetchCompanyData = useCallback(async () => {
    setLoadingCompany(true)
    setCompanyError("")
    try {
      // Try direct company endpoint only if id looks valid
      if (isValidUuid) {
        try {
          const response = await apiService.getCompany(companyId)
          if (response && response.success && response.data) {
            setCompany(response.data)
            return
          }
        } catch (error: any) {
          console.log('Direct company endpoint failed, trying fallback methods:', error?.message || error)
        }
      }
      
      // Fallback: fetch public companies list and find by id
      try {
        const list = await apiService.listCompanies({ limit: 1000, offset: 0, search: '' } as any)
        if (list && list.success && Array.isArray(list.data)) {
          const found = list.data.find((c: any) => String(c.id) === companyId)
          if (found) {
            setCompany(found)
            return
          }
        }
      } catch (error) {
        console.log('Companies list fallback failed:', error)
      }
      
      // Last-resort fallback: infer minimal company info from its jobs (public)
      try {
        const jobsResp = await apiService.getCompanyJobs(companyId)
        if (jobsResp && jobsResp.success) {
          const arr = Array.isArray((jobsResp as any).data) ? (jobsResp as any).data : (Array.isArray((jobsResp as any).data?.rows) ? (jobsResp as any).data.rows : [])
          if (arr.length > 0) {
            const name = arr[0]?.companyName || 'Company'
            setCompany({ id: companyId, name, industry: '', companySize: '', website: '', description: '', city: '', state: '', country: '', activeJobsCount: arr.length, profileViews: undefined })
            return
          }
        }
      } catch (error) {
        console.log('Jobs fallback failed:', error)
      }
      
      setCompany(null)
      setCompanyError('Company not found')
    } catch (error) {
      console.error('Error fetching company data:', error)
      setCompanyError('Failed to load company information')
    } finally {
      setLoadingCompany(false)
    }
  }, [companyId, isValidUuid])

  // Fetch company jobs
  const fetchCompanyJobs = useCallback(async () => {
    setLoadingJobs(true)
    setJobsError("")
    try {
      // Fetch active and expired jobs explicitly and combine
      const [activeResp, expiredResp] = await Promise.all([
        apiService.getCompanyJobs(companyId, { status: 'active' } as any),
        apiService.getCompanyJobs(companyId, { status: 'expired' } as any)
      ])

      if ((activeResp && activeResp.success) || (expiredResp && expiredResp.success)) {
        const toArray = (resp: any) => Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp?.data?.rows) ? resp.data.rows : [])
        const active = toArray(activeResp)
        const expired = toArray(expiredResp)
        // Merge and sort by createdAt desc
        const merged = [...active, ...expired]
          .filter((j, idx, arr) => j && j.id && arr.findIndex(x => x.id === j.id) === idx)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        if (merged.length > 0) {
          setCompanyJobs(merged)
        } else {
          // Fallback: fetch without status to get any visible jobs from API
          const anyResp = await apiService.getCompanyJobs(companyId)
          const anyArr = toArray(anyResp)
          setCompanyJobs(anyArr)
        }
      } else {
        setJobsError('Failed to load company jobs')
      }
    } catch (error) {
      console.error('Error fetching company jobs:', error)
      setJobsError('Failed to load company jobs')
    } finally {
      setLoadingJobs(false)
    }
  }, [companyId])

  useEffect(() => {
    if (companyId) {
      fetchCompanyData()
      fetchCompanyJobs()
    }
  }, [companyId, fetchCompanyData, fetchCompanyJobs])

  const handleJobClick = (job: any) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }
    router.push(`/gulf-jobs/${job.id}`)
  }

  const handleApplyNow = (job: any) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }
    setSelectedJob(job)
    setShowApplicationDialog(true)
  }

  const handleApplicationSubmit = async () => {
    if (!selectedJob || !user) return

    try {
      setSubmitting(true)
      const response = await apiService.applyJob(selectedJob.id, {
        expectedSalary: applicationData.expectedSalary ? Number(applicationData.expectedSalary) : undefined,
        noticePeriod: applicationData.noticePeriod ? Number(applicationData.noticePeriod) : undefined,
        coverLetter: applicationData.coverLetter,
        isWillingToRelocate: applicationData.willingToRelocate
      })

      if (response.success) {
        toast.success('Application submitted successfully!')
        setShowApplicationDialog(false)
        setApplicationData({
          expectedSalary: '',
          noticePeriod: '',
          coverLetter: '',
          willingToRelocate: false
        })
      } else {
        toast.error(response.message || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatSalary = (salary: any) => {
    if (!salary) return 'Salary not specified'
    if (typeof salary === 'number') return `$${salary.toLocaleString()}`
    if (typeof salary === 'string') return salary
    return 'Salary not specified'
  }

  const getSectorColor = (sector: string) => {
    const colors: { [key: string]: string } = {
      'Technology': 'from-blue-500 to-cyan-500',
      'Healthcare': 'from-green-500 to-emerald-500',
      'Finance': 'from-purple-500 to-violet-500',
      'Education': 'from-orange-500 to-amber-500',
      'Manufacturing': 'from-gray-500 to-slate-500',
      'Retail': 'from-pink-500 to-rose-500',
      'Consulting': 'from-indigo-500 to-blue-500',
      'Marketing': 'from-yellow-500 to-orange-500',
      'Real Estate': 'from-teal-500 to-green-500',
      'Other': 'from-slate-500 to-gray-500'
    }
    return colors[sector] || 'from-slate-500 to-gray-500'
  }

  if (loadingCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-300">Loading company information...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (companyError || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Company Not Found</h1>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                {companyError || 'The company you are looking for does not exist or has been removed.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button variant="outline" onClick={() => router.push('/gulf-opportunities')}>
                  Browse Gulf Opportunities
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />
      
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder-logo.png" alt={company.name} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    {getInitials(company.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{company.name}</h1>
                    {company.isVerified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-slate-600 dark:text-slate-300 mb-4">
                    {company.industry && (
                      <div className="flex items-center space-x-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{company.industry}</span>
                      </div>
                    )}
                    {company.companySize && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{company.companySize} employees</span>
                      </div>
                    )}
                    {company.city && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{company.city}, {company.country}</span>
                      </div>
                    )}
                  </div>

                  {company.description && (
                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-3xl">
                      {company.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={toggleFollow}
                  className={`flex items-center space-x-2 ${
                    isFollowing ? 'bg-red-50 text-red-700 border-red-200' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Share via Message
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Company Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{safeJobs.length}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Active Jobs</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{company.companySize || 'N/A'}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Employees</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{company.rating || 'N/A'}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Rating</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{company.foundedYear || 'N/A'}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Founded</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="jobs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jobs">Jobs ({safeJobs.length})</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="jobs" className="space-y-6">
              {loadingJobs ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-slate-600 dark:text-slate-300">Loading jobs...</p>
                </div>
              ) : jobsError ? (
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Error Loading Jobs</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">{jobsError}</p>
                    <Button onClick={fetchCompanyJobs}>Try Again</Button>
                  </CardContent>
                </Card>
              ) : !hasJobs ? (
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Jobs Available</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                      This company doesn't have any active job openings at the moment.
                    </p>
                    <Button variant="outline" onClick={() => router.push('/gulf-opportunities')}>
                      Browse Other Gulf Opportunities
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {safeJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300 group cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                    {job.title}
                                  </h3>
                                  <div className="flex items-center space-x-4 mt-2 text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center space-x-1">
                                      <MapPin className="w-4 h-4" />
                                      <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-4 h-4" />
                                      <span>{job.jobType || 'Full-time'}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <IndianRupee className="w-4 h-4" />
                                      <span>{formatSalary(job.salary)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {job.isUrgent && (
                                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                                      Urgent
                                    </Badge>
                                  )}
                                  {job.isRemote && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                      Remote
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {job.description && (
                                <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                                  {job.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                  {job.validTill && (
                                    <span>
                                      {new Date() > new Date(job.validTill)
                                        ? `Applications closed: ${new Date(job.validTill).toLocaleDateString()}`
                                        : `Valid till: ${new Date(job.validTill).toLocaleDateString()}`}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleJobClick(job)}
                                  >
                                    View Details
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApplyNow(job)}
                                    disabled={job.validTill && new Date() > new Date(job.validTill)}
                                    className={`$${' '}
                                      ${job.validTill && new Date() > new Date(job.validTill)
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                      }`}
                                  >
                                    {job.validTill && new Date() > new Date(job.validTill) ? 'Applications Closed' : 'Apply Now'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" />
                    <span>Company Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Company Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-300">Name:</span>
                            <span className="font-medium">{company.name}</span>
                          </div>
                          {company.industry && (
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-300">Industry:</span>
                              <span className="font-medium">{company.industry}</span>
                            </div>
                          )}
                          {company.companySize && (
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-300">Size:</span>
                              <span className="font-medium">{company.companySize} employees</span>
                            </div>
                          )}
                          {company.foundedYear && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-300">Founded:</span>
                              <span className="font-medium">{company.foundedYear}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Contact Information</h4>
                        <div className="space-y-2 text-sm">
                          {company.website && (
                            <div className="flex items-center space-x-2">
                              <Globe className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-300">Website:</span>
                              <a 
                                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {company.website}
                              </a>
                            </div>
                          )}
                          {company.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-300">Email:</span>
                              <span className="font-medium">{company.email}</span>
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-300">Phone:</span>
                              <span className="font-medium">{company.phone}</span>
                            </div>
                          )}
                          {(company.address || company.city) && (
                            <div className="flex items-start space-x-2">
                              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                              <span className="text-slate-600 dark:text-slate-300">Address:</span>
                              <span className="font-medium">
                                {[company.address, company.city, company.state, company.country]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {company.description && (
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">About {company.name}</h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {company.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply to {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Complete your application for this Gulf opportunity.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="expectedSalary">Expected Salary (USD)</Label>
              <Input
                id="expectedSalary"
                type="number"
                value={applicationData.expectedSalary}
                onChange={(e) => setApplicationData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                placeholder="Enter your expected salary"
              />
            </div>
            
            <div>
              <Label htmlFor="noticePeriod">Notice Period (Days)</Label>
              <Input
                id="noticePeriod"
                type="number"
                value={applicationData.noticePeriod}
                onChange={(e) => setApplicationData(prev => ({ ...prev, noticePeriod: e.target.value }))}
                placeholder="Enter your notice period"
              />
            </div>
            
            <div>
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <textarea
                id="coverLetter"
                className="w-full p-3 border border-slate-200 rounded-md resize-none"
                rows={4}
                value={applicationData.coverLetter}
                onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                placeholder="Write your cover letter here..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="willingToRelocate"
                checked={applicationData.willingToRelocate}
                onChange={(e) => setApplicationData(prev => ({ ...prev, willingToRelocate: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="willingToRelocate">I am willing to relocate for this position</Label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowApplicationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplicationSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              You need to sign in to view job details and apply for positions.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => router.push('/login')}>
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default dynamic(() => Promise.resolve(CompanyErrorBoundary), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Loading company information...</p>
          </div>
        </div>
      </div>
    </div>
  )
})
