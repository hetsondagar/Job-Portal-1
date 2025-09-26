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
  MessageCircle,
  ArrowLeft,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
          <div className="pt-20 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-20">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Something went wrong
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mb-8">
                  We encountered an error while loading the company page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function CompanyDetailPage() {
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
  const getLocationDisplay = () => {
      if (!company) return '—'
      
    try {
      const city = company.city ? String(company.city).trim() : ''
      const state = company.state ? String(company.state).trim() : ''
      const country = company.country ? String(company.country).trim() : ''
      const address = company.address ? String(company.address).split(',')[0].trim() : ''
      
      // Get location from first job if available
      let jobLocation = ''
      if (Array.isArray(companyJobs) && companyJobs.length > 0) {
        const firstJob = companyJobs[0]
        if (firstJob && (firstJob.city || firstJob.location)) {
          jobLocation = String(firstJob.city || firstJob.location || '').trim()
        }
      }
      
      const location = city || address || jobLocation || state || (country && country.toLowerCase() !== 'india' ? country : '')
      return location || '—'
    } catch (error) {
      console.error('Error computing location display:', error)
      return '—'
    }
  }

  const getSafeBenefits = () => {
    if (!company) return []
    
    try {
      const benefits = company.benefits
      return Array.isArray(benefits) ? benefits : []
    } catch (error) {
      console.error('Error computing safe benefits:', error)
      return []
    }
  }
  
  const getSafeJobs = () => {
    try {
      return Array.isArray(companyJobs) ? companyJobs : []
    } catch (error) {
      console.error('Error computing safe jobs:', error)
      return []
    }
  }

  // Use the computed values
  const locationDisplay = getLocationDisplay()
  const safeBenefits = getSafeBenefits()
  const safeJobs = getSafeJobs()

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Add error boundary for the entire component
  const [hasRenderError, setHasRenderError] = useState(false)

  // Initialize follow state from localStorage
  useEffect(() => {
    try {
      const key = 'followedCompanies'
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
      const set: Record<string, boolean> = raw ? JSON.parse(raw) : {}
      if (companyId && set[companyId]) setIsFollowing(true)
    } catch {}
  }, [companyId])

  const toggleFollow = useCallback(() => {
    try {
      const key = 'followedCompanies'
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
      const set: Record<string, boolean> = raw ? JSON.parse(raw) : {}
      const next = !isFollowing
      if (companyId) {
        if (next) set[companyId] = true; else delete set[companyId]
        localStorage.setItem(key, JSON.stringify(set))
      }
      setIsFollowing(next)
    } catch {
      setIsFollowing((v) => !v)
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

  const fetchCompanyJobs = useCallback(async () => {
    setLoadingJobs(true)
    setJobsError("")
    try {
      if (!isValidUuid) {
        setCompanyJobs([])
        setJobsError('Invalid company id')
      } else {
        try {
        const response = await apiService.getCompanyJobs(companyId)
          if (response && response.success) {
          const d: any = response.data
          const jobs = Array.isArray(d)
            ? d
            : Array.isArray(d?.jobs)
              ? d.jobs
              : Array.isArray(d?.rows)
                ? d.rows
                : []
          setCompanyJobs(jobs)
          if (!Array.isArray(jobs)) {
            setJobsError('Failed to parse jobs list')
          }
        } else {
          setCompanyJobs([])
            setJobsError(response?.message || 'Failed to load company jobs')
          }
        } catch (error: any) {
          console.log('Company jobs endpoint failed:', error?.message || error)
          // Try alternative endpoint
          try {
            const altResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/jobs/company/${companyId}`)
            if (altResponse.ok) {
              const altData = await altResponse.json()
              if (altData && altData.success) {
                const jobs = Array.isArray(altData.data) ? altData.data : []
                setCompanyJobs(jobs)
                return
              }
            }
          } catch (altError) {
            console.log('Alternative jobs endpoint also failed:', altError)
          }
          setCompanyJobs([])
          setJobsError('Failed to load company jobs')
        }
      }
    } catch (error) {
      console.error('Error fetching company jobs:', error)
      setCompanyJobs([])
      setJobsError('Failed to load company jobs')
    } finally {
      setLoadingJobs(false)
    }
  }, [companyId, isValidUuid])

  useEffect(() => {
    if (companyId) {
      fetchCompanyData()
      fetchCompanyJobs()
    }
  }, [companyId, fetchCompanyData, fetchCompanyJobs])

  const handleApply = useCallback(async (jobId: number) => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }

    if (user.userType !== 'jobseeker') {
      toast.error('Only jobseekers can apply for jobs')
      return
    }

    // Find the job details
    const job = companyJobs.find(j => j.id === jobId)
    if (job) {
      setSelectedJob(job)
      setShowApplicationDialog(true)
    }
  }, [user, companyJobs])

  const handleSubmitApplication = useCallback(async () => {
    if (!selectedJob) return

    setSubmitting(true)
    try {
      const response = await apiService.applyJob(selectedJob.id.toString(), {
        coverLetter: applicationData.coverLetter,
        expectedSalary: applicationData.expectedSalary ? parseInt(applicationData.expectedSalary) : undefined,
        noticePeriod: applicationData.noticePeriod ? parseInt(applicationData.noticePeriod) : undefined,
        isWillingToRelocate: applicationData.willingToRelocate
      })
      
      if (response.success) {
        toast.success(`Application submitted successfully for ${selectedJob.title}!`, {
          description: 'Your application has been submitted and is under review.',
          duration: 5000,
        })
        setShowApplicationDialog(false)
        setApplicationData({
          expectedSalary: '',
          noticePeriod: '',
          coverLetter: '',
          willingToRelocate: false
        })
        // Refresh jobs to update application status
        fetchCompanyJobs()
      } else {
        toast.error(response.message || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying for job:', error)
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [selectedJob, applicationData, fetchCompanyJobs])

  const getSectorColor = (sector: string) => {
    const colors = {
      technology: {
        bg: "from-blue-500 to-cyan-500",
        text: "text-blue-600",
        border: "border-blue-200",
        light: "bg-blue-50",
      },
      finance: {
        bg: "from-green-500 to-emerald-500",
        text: "text-green-600",
        border: "border-green-200",
        light: "bg-green-50",
      },
      automotive: {
        bg: "from-orange-500 to-red-500",
        text: "text-orange-600",
        border: "border-orange-200",
        light: "bg-orange-50",
      },
      healthcare: {
        bg: "from-teal-500 to-cyan-500",
        text: "text-teal-600",
        border: "border-teal-200",
        light: "bg-teal-50",
      },
      energy: {
        bg: "from-purple-500 to-pink-500",
        text: "text-purple-600",
        border: "border-purple-200",
        light: "bg-purple-50",
      },
      fintech: {
        bg: "from-blue-500 to-green-500",
        text: "text-blue-600",
        border: "border-blue-200",
        light: "bg-blue-50",
      },
    }
    return colors[sector as keyof typeof colors] || colors.technology
  }



  // Removed mock company data

  // Handle render errors first
  if (hasRenderError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />
        <div className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <p className="text-red-600 dark:text-red-400">Something went wrong loading this company page.</p>
              <Button 
                onClick={() => {
                  setHasRenderError(false)
                  window.location.reload()
                }}
                className="mt-4"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle loading states early to avoid any render errors
  if (loadingCompany || loadingJobs) {
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

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />
        
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Building2 className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Company Not Found</h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">{companyError || 'The company you\'re looking for doesn\'t exist or may have been removed. Please check the URL or browse our companies directory.'}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/companies">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-2xl">
                    Browse All Companies
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="font-semibold px-8 py-3 rounded-2xl">
                    Go to Homepage
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Simple computed departments without useMemo to avoid React error #310
  const getDepartments = () => {
    try {
      const groups: Record<string, { name: string; openings: number; description: string; growth: string }> = {}
      const jobs = Array.isArray(companyJobs) ? companyJobs : []
      jobs.forEach((job) => {
        const deptName = (job.department || job.category || 'Other').toString()
        if (!groups[deptName]) {
          groups[deptName] = { name: deptName, openings: 0, description: '', growth: '' }
        }
        groups[deptName].openings += 1
      })
      return Object.values(groups).sort((a, b) => b.openings - a.openings)
    } catch (error) {
      console.error('Error computing departments:', error)
      return []
    }
  }

  const departments = getDepartments()

  // Use companyJobs state from API

  const employeeSpeak = [
    {
      category: "Company Culture",
      rating: 4.2,
      reviews: 45,
      highlights: ["Collaborative environment", "Learning opportunities", "Work-life balance"],
    },
    {
      category: "Skill Development",
      rating: 4.0,
      reviews: 38,
      highlights: ["Training programs", "Mentorship", "Technology exposure"],
    },
    {
      category: "Salary & Benefits",
      rating: 3.8,
      reviews: 42,
      highlights: ["Competitive salary", "Health benefits", "Performance bonus"],
    },
    {
      category: "Work Satisfaction",
      rating: 4.1,
      reviews: 40,
      highlights: ["Challenging projects", "Recognition", "Career growth"],
    },
  ]

  const reviewsByProfile = [
    {
      profile: "Software Developer",
      count: 45,
      rating: 4.2,
      reviews: [
        {
          title: "Great place for learning",
          rating: 4,
          experience: "2 years",
          pros: "Good learning environment, supportive team, latest technologies",
          cons: "Work pressure during project deadlines",
          date: "2 months ago",
        },
      ],
    },
    {
      profile: "Project Manager",
      count: 12,
      rating: 4.0,
      reviews: [
        {
          title: "Good growth opportunities",
          rating: 4,
          experience: "3 years",
          pros: "Career growth, good management, client interaction",
          cons: "Sometimes long working hours",
          date: "1 month ago",
        },
      ],
    },
    {
      profile: "Business Analyst",
      count: 8,
      rating: 3.9,
      reviews: [
        {
          title: "Decent work culture",
          rating: 4,
          experience: "1.5 years",
          pros: "Learning opportunities, good colleagues, flexible timing",
          cons: "Limited growth in initial years",
          date: "3 weeks ago",
        },
      ],
    },
  ]

  

  const handleShare = (platform: string) => {
    const companyUrl = `${window.location.origin}/companies/${company.id}`
    const shareText = `Check out ${company.name} - ${companyJobs.length} job openings available!`

    switch (platform) {
      case "link":
        navigator.clipboard.writeText(companyUrl)
        // Show toast notification
        break
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${companyUrl}`)}`)
        break
      case "email":
        window.open(`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(companyUrl)}`)
        break
    }
  }

  

  // Simple computed sector key without useMemo to avoid React error #310
  const getSectorKey = () => {
    try {
      const ind = (company?.industry || '').toLowerCase()
      if (ind.includes('tech')) return 'technology'
      if (ind.includes('fin')) return 'finance'
      if (ind.includes('health')) return 'healthcare'
      if (ind.includes('auto')) return 'automotive'
      if (ind.includes('energy')) return 'energy'
      if (ind.includes('consult')) return 'fintech'
      return 'technology'
    } catch (error) {
      console.error('Error computing sector key:', error)
      return 'technology'
    }
  }

  const sectorKey = getSectorKey()
  const sectorColors = getSectorColor(sectorKey)

  const toDisplayText = (value: any): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (Array.isArray(value)) return value.map((v) => toDisplayText(v)).filter(Boolean).join(', ')
    // object
    if (value.title) return String(value.title)
    if (value.name) return String(value.name)
    try { return JSON.stringify(value) } catch { return '' }
  }

  return (
    <CompanyErrorBoundary>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />

      {/* Company Header */}
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </Button>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className={`h-32 bg-gradient-to-r ${sectorColors.bg} relative`}>
                <div className="absolute inset-0 bg-black/10" />
              </div>

              <CardContent className="p-8 -mt-16 relative">
                <div className="flex flex-col lg:flex-row items-start lg:items-end space-y-6 lg:space-y-0 lg:space-x-8">
                  <Avatar className="w-32 h-32 ring-4 ring-white dark:ring-slate-800 shadow-xl">
                    <AvatarImage src={company.logo || "/placeholder.svg"} alt={company.name} />
                    <AvatarFallback className={`text-4xl font-bold ${sectorColors.text}`}>
                      {(company.name||'')[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{toDisplayText(company.name) || 'Company'}</h1>
                        <div className="flex items-center space-x-4 mb-3">
                          <Badge
                            className={`${sectorColors.text} ${sectorColors.border} bg-gradient-to-r ${sectorColors.bg} bg-opacity-10`}
                          >
                            {company.companyType}
                          </Badge>
                          <Badge variant="secondary">Private</Badge>
                          <Badge variant="secondary">Corporate</Badge>
                        </div>
                        <div className="flex items-center space-x-6 text-slate-600 dark:text-slate-300">
                          <div className="flex items-center">
                            <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                            <span className="font-semibold text-lg">{company.rating || 0}</span>
                            <span className="ml-1">({company.reviews || 0} reviews)</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            {locationDisplay}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            {company.employees || '—'} employees
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <Button
                          variant="outline"
                          onClick={toggleFollow}
                          className={`${isFollowing ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white/50 dark:bg-slate-700/50"} backdrop-blur-sm`}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${isFollowing ? "fill-current" : ""}`} />
                          {isFollowing ? "Following" : "Follow"}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleShare("link")}>
                              <LinkIcon className="w-4 h-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare("email")}>
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Company Details Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Jobs ({companyJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* About Company */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">About {company.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">{company.description || ''}</p>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-3 text-slate-400" />
                        <div>
                          <div className="font-medium">Founded</div>
                          <div className="text-slate-600 dark:text-slate-400">{toDisplayText(company.founded) || '—'}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-3 text-slate-400" />
                        <div>
                          <div className="font-medium">Open Positions</div>
                          <div className="text-slate-600 dark:text-slate-400">{company.activeJobsCount ?? companyJobs.length}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Globe className="w-5 h-5 mr-3 text-slate-400" />
                        <div>
                          <div className="font-medium">Website</div>
                          <div className="text-blue-600">{toDisplayText(company.website) || '—'}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Building2 className="w-5 h-5 mr-3 text-slate-400" />
                        <div>
                          <div className="font-medium">Headquarters</div>
                          <div className="text-slate-600 dark:text-slate-400">{toDisplayText(company.headquarters) || '—'}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-3 text-slate-400" />
                        <div>
                          <div className="font-medium">Profile Views</div>
                          <div className="text-slate-600 dark:text-slate-400">{toDisplayText(company.profileViews) || '—'}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-3 text-slate-400" />
                        <div>
                          <div className="font-medium">Revenue</div>
                          <div className="text-slate-600 dark:text-slate-400">{toDisplayText(company.revenue) || '—'}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Departments Hiring */}
                <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">Departments hiring at {company.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {departments.map((dept, index) => (
                        <Link key={dept.name + index} href={`/companies/${companyId}/departments/${encodeURIComponent(dept.name)}`}>
                          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer group">
                            <div className="flex-1">
                              <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                {dept.name}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Open roles in {dept.name}</div>
                              <div className="text-sm text-slate-500 mt-1">{dept.openings} openings</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-blue-600 bg-blue-50 dark:bg-blue-900/20">
                                {dept.openings}
                              </Badge>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Employee Speak removed (mock) */}
              </div>

              {/* Right Sidebar */}
              <div className="space-y-8">
                {/* Live jobs by Company */}
                <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Live jobs by {company.name}</span>
                      <Badge className={`bg-gradient-to-r ${sectorColors.bg} text-white`}>{companyJobs.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className={`w-full bg-gradient-to-r ${sectorColors.bg} hover:shadow-lg transition-all duration-300`}
                    >
                      Register now
                    </Button>
                  </CardContent>
                </Card>

                {/* Company Benefits */}
                <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Benefits reported by employees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {safeBenefits.slice(0, 8).map((benefit: string, index: number) => (
                        <Badge key={index} variant="secondary" className="justify-center py-2 text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                    {safeBenefits.length > 8 && (
                      <div className="mt-3 text-center">
                        <Button variant="link" className="text-sm text-blue-600">
                          View all benefits
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Reviews by Job Profile removed (mock) */}

                {/* More Information */}
                <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>More Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Company Size</span>
                      <span className="font-medium">{toDisplayText(company.employees) || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Founded</span>
                      <span className="font-medium">{toDisplayText(company.founded) || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Website</span>
                      <span className="font-medium text-blue-600">{toDisplayText(company.website) || '—'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {safeJobs.length} job openings at {company.name}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">Departments hiring at {company.name}</p>
              </div>
              <Badge
                className={`${sectorColors.text} ${sectorColors.border} bg-gradient-to-r ${sectorColors.bg} bg-opacity-10`}
              >
                {safeJobs.length} Active Jobs
              </Badge>
            </div>

            {/* Department Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-600">
                Quantity category (4)
              </Button>
              <Button variant="outline" size="sm">
                Department (1)
              </Button>
              <Button variant="outline" size="sm">
                Location (1)
              </Button>
              <Button variant="outline" size="sm">
                Experience (1)
              </Button>
            </div>

            <div className="space-y-4">
              {loadingJobs ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
                        <CardContent className="p-6">
                          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : safeJobs.length > 0 ? (
                safeJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Link href={`/jobs/${String(job.id)}`}>
                    <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mb-2">
                                  {job.title}
                                </h3>
                                <div className="text-slate-600 dark:text-slate-400 font-medium mb-2">
                                  {company.name}
                                </div>
                                <div className="flex items-center space-x-4 text-slate-600 dark:text-slate-400 mb-4">
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {job.location || job.city || job.state || job.country || '—'}
                                  </div>
                                  <div className="flex items-center">
                                    <Briefcase className="w-4 h-4 mr-1" />
                                    {job.experience || job.experienceLevel || '—'}
                                  </div>
                                  <div className="flex items-center">
                                    <IndianRupee className="w-4 h-4 mr-1" />
                                    {job.salary || (job.salaryMin && job.salaryMax ? `${job.salaryMin}-${job.salaryMax}` : '—')}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {job.type || job.jobType || '—'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col space-y-2">
                                <Button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleApply(job.id)
                                  }}
                                  className={`h-10 px-6 ${
                                    sampleJobManager.hasApplied(job.id.toString())
                                      ? 'bg-green-600 hover:bg-green-700 cursor-default'
                                      : `bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transition-all duration-300`
                                  }`}
                                  disabled={sampleJobManager.hasApplied(job.id.toString())}
                                >
                                  {sampleJobManager.hasApplied(job.id.toString()) ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Applied
                                    </>
                                  ) : (
                                    'Apply now'
                                  )}
                                </Button>
                                {!isAuthenticated && (
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setShowAuthDialog(true)
                                      }}
                                      className="text-xs"
                                    >
                                      Register
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setShowAuthDialog(true)
                                      }}
                                      className="text-xs"
                                    >
                                      Login
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">{job.description || ''}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {(() => {
                                const reqs = Array.isArray(job.requirements)
                                  ? job.requirements
                                  : typeof job.requirements === 'string'
                                    ? job.requirements.split(/[,\n\r]+/).map((s: string) => s.trim()).filter(Boolean)
                                    : []
                                return reqs.map((requirement: any, reqIndex: number) => (
                                  <Badge key={reqIndex} variant="secondary" className="text-xs">
                                    {requirement}
                                  </Badge>
                                ))
                              })()}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                              <div className="flex items-center space-x-4 text-sm text-slate-500">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {job.postedDate || job.createdAt || ''}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {job.urgent ? "Urgent" : "Regular"}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  Save
                                </Button>
                                {user && user.userType === 'jobseeker' ? (
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                    onClick={() => handleApply(job.id)}
                                  >
                                    Apply Now
                                  </Button>
                                ) : !user ? (
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                    onClick={() => setShowAuthDialog(true)}
                                  >
                                    Apply Now
                                  </Button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Open Positions</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">{jobsError || "This company doesn't have any open positions at the moment."}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Check Again
                  </Button>
                </div>
              )}
            </div>

            {/* Interview Questions */}
            <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl mt-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Interview Questions</span>
                  <Button variant="link" className="text-sm text-blue-600 p-0">
                    View all
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    Software Engineer (5)
                  </Badge>
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    Data Software Engineer (5)
                  </Badge>
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    Software Developer (5)
                  </Badge>
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    Data Analyst (1)
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to apply for jobs. Please register or login to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 mt-6">
            <Link href="/register">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Register Now
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full bg-transparent">
                Login
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Submit your application for this position. Make sure your profile and resume are up to date.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Expected Salary (LPA)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 8-12"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  value={applicationData.expectedSalary}
                  onChange={(e) => setApplicationData({...applicationData, expectedSalary: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Notice Period (Days)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 30"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  value={applicationData.noticePeriod}
                  onChange={(e) => setApplicationData({...applicationData, noticePeriod: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Cover Letter
              </label>
              <textarea
                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                value={applicationData.coverLetter}
                onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="willingToRelocate"
                checked={applicationData.willingToRelocate}
                onChange={(e) => setApplicationData({...applicationData, willingToRelocate: e.target.checked})}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              <label htmlFor="willingToRelocate" className="text-sm text-slate-700 dark:text-slate-300">
                I am willing to relocate for this position
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowApplicationDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={handleSubmitApplication}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">JobPortal</span>
              </div>
              <p className="text-slate-400 mb-6">India's leading job portal connecting talent with opportunities.</p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>

            {[
              {
                title: "For Job Seekers",
                links: ["Browse Jobs", "Career Advice", "Resume Builder", "Salary Guide"],
              },
              {
                title: "For Employers",
                links: ["Post Jobs", "Search Resumes", "Recruitment Solutions", "Pricing"],
              },
              {
                title: "Company",
                links: ["About Us", "Contact", "Privacy Policy", "Terms of Service"],
              },
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-6 text-lg">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href="#" className="text-slate-400 hover:text-white transition-colors hover:underline">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2025 JobPortal. All rights reserved. Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
    </CompanyErrorBoundary>
  )
}

export default dynamic(() => Promise.resolve(CompanyDetailPage), { 
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
