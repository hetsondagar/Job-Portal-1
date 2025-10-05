"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Search,
  MapPin,
  Briefcase,
  Filter,
  SlidersHorizontal,
  Clock,
  Users,
  IndianRupee,
  Zap,
  Sparkles,
  Star,
  ArrowRight,
  X,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  Camera,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { apiService } from "@/lib/api"
import { JobApplicationDialog } from "@/components/job-application-dialog"

// Types for state management
interface FilterState {
  search: string
  location: string
  experienceLevels: string[]
  jobTypes: string[]
  locations: string[]
  salaryRange: string
  category: string
  type: string
  industry?: string
  department?: string
  role?: string
  skills?: string
  companyType?: string
  workMode?: string
  education?: string
  companyName?: string
  recruiterType?: string
  salaryMin?: number
}

interface Job {
  id: string
  title: string
  company: {
    name: string
    id?: string
  }
  location: string
  experience: string
  salary: string
  skills: string[]
  logo: string
  posted: string
  applicants: number
  description: string
  type: string
  remote: boolean
  urgent: boolean
  featured: boolean
  companyRating: number
  category: string
  photos?: any[]
  // Internship-specific fields
  duration?: string
  startDate?: string
  workMode?: string
  learningObjectives?: string
  mentorship?: string
}

export default function JobsPage() {
  const { user, loading } = useAuth()
  const [showFilters, setShowFilters] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState("recent")
  const [isStickyVisible, setIsStickyVisible] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [showApplicationDialog, setShowApplicationDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [preferredJobs, setPreferredJobs] = useState<Job[]>([])
  const [preferredJobsLoading, setPreferredJobsLoading] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "",
    experienceLevels: [],
    jobTypes: [],
    locations: [],
    salaryRange: "",
    category: "",
    type: "",
    industry: "",
    department: "",
    role: "",
    skills: "",
    companyType: "",
    workMode: "",
    education: "",
    companyName: "",
    recruiterType: "",
    salaryMin: undefined,
  })

  // Check URL parameters for filters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const category = urlParams.get('category')
      const type = urlParams.get('type')
      const location = urlParams.get('location')

      if (category || type || location) {
        setFilters(prev => ({
          ...prev,
          category: category || "",
          type: type || "",
          location: location || "",
        }))
      }
    }
  }, [])


  // Fetch jobs from backend and user data
  useEffect(() => {
    fetchJobs()
    
    // Fetch existing bookmarks and applications if user is logged in
    if (user) {
      fetchUserData()
      fetchPreferredJobs()
    }
  }, [user])

  // Refetch when filters change (debounced) and sync URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.location) params.set('location', filters.location)
    if (filters.jobTypes.length === 1) params.set('jobType', filters.jobTypes[0].toLowerCase())
    if (filters.experienceLevels.length > 0) params.set('experienceRange', filters.experienceLevels.join(','))
    if (filters.salaryRange) params.set('salaryRange', filters.salaryRange)
    if (filters.industry) params.set('industry', filters.industry)
    if (filters.department) params.set('department', filters.department)
    if (filters.role) params.set('role', filters.role)
    if (filters.skills) params.set('skills', filters.skills)
    if (filters.companyType) params.set('companyType', filters.companyType)
    if (filters.workMode) params.set('workMode', filters.workMode)
    if (filters.education) params.set('education', filters.education)
    if (filters.companyName) params.set('companyName', filters.companyName)
    if (filters.recruiterType) params.set('recruiterType', filters.recruiterType)

    const qs = params.toString()
    const url = qs ? `/jobs?${qs}` : '/jobs'
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', url)
    }

    const t = setTimeout(() => {
      fetchJobs()
    }, 400)
    return () => clearTimeout(t)
  }, [filters])

  const fetchJobs = async () => {
    try {
      setJobsLoading(true)
      
      // Fetch jobs from backend - get all active jobs
      // Map UI filters to backend query params
      const params: Record<string, string | number | boolean | undefined> = {
        status: 'active',
        limit: 100,
        search: filters.search || undefined,
        location: filters.location || undefined,
        jobType: filters.jobTypes.length > 0 ? filters.jobTypes.map(t => t.toLowerCase().replace(/\s+/g, '-')).join(',') : undefined,
        experienceRange: filters.experienceLevels.length > 0 ? filters.experienceLevels.map(r => r.includes('+') ? r.replace('+','-100') : r).join(',') : undefined,
        ...(filters.salaryRange ? (() => {
          const sr = filters.salaryRange;
          if (sr.includes('+')) {
            const min = parseInt(sr);
            return { salaryMin: min * 100000 };
          }
          const [minStr, maxStr] = sr.split('-');
          const min = parseInt(minStr);
          const max = parseInt(maxStr);
          return {
            salaryMin: isNaN(min) ? undefined : min * 100000,
            salaryMax: isNaN(max) ? undefined : max * 100000,
          };
        })() : {}),
        industry: filters.industry || undefined,
        department: filters.department || undefined,
        role: filters.role || undefined,
        skills: filters.skills || undefined,
        companyType: filters.companyType || undefined,
        workMode: filters.workMode ? (filters.workMode.toLowerCase().includes('home') ? 'remote' : filters.workMode) : undefined,
        education: filters.education || undefined,
        companyName: filters.companyName || undefined,
        recruiterType: filters.recruiterType || undefined,
      }

      const response = await apiService.getJobs(params)
      
      if (response.success && response.data) {
        // Double-check: Filter to ensure ONLY non-Gulf jobs are shown
        const nonGulfJobs = response.data.filter((job: any) => job.region !== 'gulf')
        
        // Transform backend jobs to match frontend format
        const transformedJobs = nonGulfJobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          company: {
            id: job.company?.id || 'unknown',
            name: job.company?.name || 'Unknown Company'
          },
          location: job.location,
          experience: job.experienceLevel || job.experience || 'Not specified',
          salary: job.salary || (job.salaryMin && job.salaryMax 
            ? `₹${(job.salaryMin / 100000).toFixed(0)}-${(job.salaryMax / 100000).toFixed(0)} LPA`
            : 'Not specified'),
          skills: job.skills || [],
          logo: job.company?.logo || '/placeholder-logo.png',
          posted: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently',
          applicants: job.applications || job.application_count || 0,
          description: job.description,
          type: job.jobType ? job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1) : 'Full-time',
          remote: job.remoteWork === 'remote',
          urgent: job.isUrgent || false,
          featured: job.isFeatured || false,
          companyRating: 4.5, // Default rating
          category: job.category || 'General',
          photos: job.photos || [], // Include job photos
          // Internship-specific fields
          duration: job.duration,
          startDate: job.startDate,
          workMode: job.workMode,
          learningObjectives: job.learningObjectives,
          mentorship: job.mentorship
        }))
        
        // Use only real jobs from database, no sample data
        setJobs(transformedJobs)
        console.log('✅ Loaded', transformedJobs.length, 'jobs from database')
      } else {
        console.error('❌ Failed to fetch jobs:', response.message)
        // Show empty state instead of sample data
        setJobs([])
      }
    } catch (error) {
      console.error('❌ Error fetching jobs:', error)
      // Show empty state instead of sample data
      setJobs([])
    } finally {
      setJobsLoading(false)
    }
  }

  const fetchUserData = async () => {
    try {
      console.log('🔄 Fetching user data...')
      
      // Fetch applications - only include non-withdrawn applications
      const applicationsResponse = await apiService.getApplications()
      console.log('📊 Applications response:', applicationsResponse)
      
      if (applicationsResponse.success && applicationsResponse.data) {
        console.log('📋 All applications:', applicationsResponse.data.map((app: any) => ({ 
          id: app.id, 
          jobId: app.jobId, 
          status: app.status 
        })))
        
        const activeApplications = applicationsResponse.data.filter((app: any) => 
          app.status && app.status !== 'withdrawn'
        )
        console.log('✅ Active applications:', activeApplications.map((app: any) => ({ 
          id: app.id, 
          jobId: app.jobId, 
          status: app.status 
        })))
        
        const appliedJobIds = new Set(activeApplications.map((app: any) => app.jobId))
        setAppliedJobs(appliedJobIds)
        
        // Store application IDs for undo functionality (including withdrawn ones for lookup)
        const jobIdToAppId: Record<string, string> = {}
        applicationsResponse.data.forEach((app: any) => {
          if (app.jobId && app.id) {
            jobIdToAppId[app.jobId] = app.id
          }
        })
        setJobIdToApplicationId(jobIdToAppId)
        console.log('🗂️ JobId to ApplicationId mapping:', jobIdToAppId)
      }

      // Fetch bookmarks
      const bookmarksResponse = await apiService.getBookmarks()
      if (bookmarksResponse.success && bookmarksResponse.data) {
        const savedJobIds = new Set(bookmarksResponse.data.map((bookmark: any) => bookmark.jobId))
        setSavedJobs(savedJobIds)
        console.log('🔖 Saved jobs:', Array.from(savedJobIds))
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error)
    }
  }

  const fetchPreferredJobs = async () => {
    try {
      setPreferredJobsLoading(true)
      const response = await apiService.getMatchingJobs(1, 20)
      
      if (response.success && response.data) {
        const transformedJobs = response.data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          company: {
            id: job.company?.id || 'unknown',
            name: job.company?.name || 'Unknown Company'
          },
          location: job.location,
          experience: job.experienceLevel || job.experience || 'Not specified',
          salary: job.salary || (job.salaryMin && job.salaryMax 
            ? `₹${(job.salaryMin / 100000).toFixed(0)}-${(job.salaryMax / 100000).toFixed(0)} LPA`
            : 'Not specified'),
          skills: job.skills || [],
          logo: job.company?.logo || '/placeholder-logo.png',
          posted: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently',
          applicants: job.applications || job.application_count || 0,
          description: job.description,
          type: job.jobType ? job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1) : 'Full-time',
          remote: job.remoteWork === 'remote',
          urgent: job.isUrgent || false,
          featured: job.isFeatured || false,
          companyRating: 4.5,
          category: job.category || 'General',
          photos: job.photos || [],
          duration: job.duration,
          startDate: job.startDate,
          workMode: job.workMode,
          learningObjectives: job.learningObjectives,
          mentorship: job.mentorship,
          isPreferred: true
        }))
        
        setPreferredJobs(transformedJobs)
      }
    } catch (error) {
      console.error('Error fetching preferred jobs:', error)
    } finally {
      setPreferredJobsLoading(false)
    }
  }

  const handleSaveJob = async (jobId: string) => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }

    try {
      // Find the job data
      const job = jobs.find(j => j.id === jobId)
      if (!job) {
        toast.error('Job not found')
        return
      }

      // Save job to database for all jobs
      const response = await apiService.createBookmark({ jobId })
      if (response.success) {
        setSavedJobs(prev => new Set([...prev, jobId]))
        toast.success('Job saved successfully!')
        console.log('Job saved:', jobId)
      } else {
        toast.error(response.message || 'Failed to save job. Please try again.')
      }
    } catch (error) {
      console.error('Error saving job:', error)
      toast.error('Failed to save job')
    }
  }

  const handleApply = async (jobId: string) => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }

    // Find the job data
    const job = jobs.find(j => j.id === jobId)
    if (!job) {
      toast.error('Job not found')
      return
    }

    // Show application dialog
    setSelectedJob(job)
    setShowApplicationDialog(true)
  }

  const handleApplicationSuccess = () => {
    if (selectedJob) {
      // Update applied jobs state
      setAppliedJobs(prev => new Set([...prev, selectedJob.id]))
      // Force re-render to update button state
      setJobs([...jobs])
    }
  }

  const [jobIdToApplicationId, setJobIdToApplicationId] = useState<Record<string, string>>({})
  const [withdrawingJobs, setWithdrawingJobs] = useState<Set<string>>(new Set())

  const handleUndoApply = async (jobId: string) => {
    try {
      // Prevent multiple simultaneous withdrawals
      if (withdrawingJobs.has(jobId)) {
        return
      }
      
      setWithdrawingJobs(prev => new Set([...prev, jobId]))
      console.log('🔄 Attempting to withdraw application for job:', jobId)
      
      // Try known applicationId first
      let applicationId = jobIdToApplicationId[jobId]
      console.log('📋 Known applicationId:', applicationId)

      // Fallback: fetch applications and find by jobId
      if (!applicationId) {
        console.log('🔍 ApplicationId not found, fetching applications...')
        
        // First try to refresh user data to get the latest application mapping
        try {
          await fetchUserData()
        } catch (fetchError) {
          console.error('❌ Error fetching user data:', fetchError)
          // Continue with the withdrawal attempt even if we can't fetch user data
        }
        
        // Check again after refresh
        applicationId = jobIdToApplicationId[jobId]
        console.log('📋 ApplicationId after refresh:', applicationId)
        
        // If still not found, do a direct API call
        if (!applicationId) {
          try {
            const appsResp = await apiService.getApplications()
            console.log('📊 Applications response:', appsResp)
            
            if (appsResp && appsResp.success && Array.isArray(appsResp.data)) {
              console.log('📋 All applications:', appsResp.data.map((a: any) => ({ id: a.id, jobId: a.jobId, status: a.status })))
              
              // Look for any application with this jobId (including withdrawn ones for debugging)
              const found = appsResp.data.find((a: any) => a.jobId === jobId)
              console.log('🎯 Found application:', found)
              
              if (found?.id) {
                applicationId = found.id
                setJobIdToApplicationId(prev => ({ ...prev, [jobId]: found.id }))
                console.log('✅ Using applicationId:', applicationId)
              }
            }
          } catch (apiError) {
            console.error('❌ Error fetching applications:', apiError)
            // Continue with the withdrawal attempt even if we can't fetch applications
          }
        }
      }

      if (!applicationId) {
        console.error('❌ No application found for jobId:', jobId)
        toast.error('Could not locate your application to withdraw. Please refresh the page and try again.')
        return
      }

      console.log('🚀 Withdrawing application:', applicationId)
      const resp = await apiService.updateApplicationStatus(applicationId, 'withdrawn')
      
      if (resp && resp.success) {
        toast.success('Application withdrawn successfully')
        // Reflect in UI: mark as not applied
        setAppliedJobs(prev => {
          const next = new Set(prev)
          next.delete(jobId)
          return next
        })
        // Remove from application ID mapping
        setJobIdToApplicationId(prev => {
          const next = { ...prev }
          delete next[jobId]
          return next
        })
        setJobs([...jobs])
        console.log('✅ Application withdrawn successfully')
      } else {
        console.error('❌ Withdrawal failed:', resp)
        toast.error(resp?.message || 'Failed to withdraw application')
      }
    } catch (error) {
      console.error('❌ Error withdrawing application:', error)
      toast.error('Failed to withdraw application. Please try again.')
    } finally {
      // Remove from withdrawing state
      setWithdrawingJobs(prev => {
        const next = new Set(prev)
        next.delete(jobId)
        return next
      })
    }
  }

  // Scroll event listener for sticky search bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsStickyVisible(scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const experienceLevels = [
    "0-1",
    "2-5",
    "6-10",
    "11-15",
    "16+",
  ]

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Freelance",
  ]

  const locations = [
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Gurgaon",
    "Noida",
    "Kolkata",
    "Ahmedabad",
    "Remote",
    "Work from home",
  ]

  // Curated lists for better UX
  const industries = [
    'Information Technology', 'Banking', 'Financial Services', 'Insurance', 'Healthcare', 'Pharmaceuticals',
    'Education', 'E-Learning', 'Manufacturing', 'Automotive', 'Aerospace', 'Telecommunications', 'Retail',
    'E-Commerce', 'FMCG', 'Hospitality', 'Travel & Tourism', 'Construction', 'Real Estate', 'Energy', 'Oil & Gas',
    'Media & Entertainment', 'Logistics & Supply Chain', 'Consulting', 'Government', 'Non-Profit', 'Agriculture'
  ]

  const departments = [
    'Engineering', 'Information Technology', 'Product Management', 'Design', 'Data Science', 'Analytics', 'Quality Assurance',
    'DevOps', 'Cloud', 'Cybersecurity', 'Human Resources', 'Talent Acquisition', 'Learning & Development', 'Finance',
    'Accounting', 'Legal', 'Compliance', 'Sales', 'Business Development', 'Marketing', 'Digital Marketing', 'Content',
    'Operations', 'Administration', 'Customer Support', 'Technical Support', 'Supply Chain', 'Procurement', 'Logistics',
    'Research & Development', 'Project Management', 'Strategy', 'Corporate Communications'
  ]

  const commonRoles = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Data Analyst',
    'Data Scientist', 'ML Engineer', 'QA Engineer', 'Automation Engineer', 'UI/UX Designer', 'Product Manager',
    'Project Manager', 'Business Analyst', 'HR Manager', 'Talent Acquisition Specialist', 'Finance Executive',
    'Accountant', 'Legal Counsel', 'Compliance Officer', 'Sales Executive', 'Sales Manager', 'Marketing Manager',
    'Digital Marketing Executive', 'Content Writer', 'Customer Support Executive', 'Operations Manager'
  ]

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.company.name.toLowerCase().includes(searchLower) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchLower))
      )
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Experience level filter
    if (filters.experienceLevels.length > 0) {
      // UI is now sending experienceRange to backend; client-side list still filters by substring for safety
      filtered = filtered.filter(job =>
        filters.experienceLevels.some(level => job.experience.toLowerCase().includes(level.toLowerCase()))
      )
    }

    // Job type filter
    if (filters.jobTypes.length > 0) {
      filtered = filtered.filter(job =>
        filters.jobTypes.some(filterType => job.type.toLowerCase() === filterType.toLowerCase())
      )
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(job => job.category === filters.category)
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(job => job.type.toLowerCase() === filters.type.toLowerCase())
    }

    // Sort jobs
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime())
        break
      case "salary":
        filtered.sort((a, b) => {
          const salaryA = parseInt(a.salary.split('-')[0].replace(/\D/g, ''))
          const salaryB = parseInt(b.salary.split('-')[0].replace(/\D/g, ''))
          return salaryB - salaryA
        })
        break
      case "applicants":
        filtered.sort((a, b) => b.applicants - a.applicants)
        break
      case "rating":
        filtered.sort((a, b) => b.companyRating - a.companyRating)
        break
    }

    return filtered
  }, [jobs, filters, sortBy])

  // Record search in database
  const recordSearch = useCallback(async (searchQuery: string) => {
    if (!user || !searchQuery.trim()) return;

    try {
      const searchData = {
        searchQuery: searchQuery.trim(),
        filters: {
          location: filters.location,
          experienceLevels: filters.experienceLevels,
          jobTypes: filters.jobTypes,
          salaryRange: filters.salaryRange,
          category: filters.category,
          type: filters.type
        },
        resultsCount: filteredJobs.length,
        searchType: 'job_search'
      };

      await apiService.recordSearch(searchData);
    } catch (error) {
      console.error('Error recording search:', error);
      // Don't show error to user as this is background functionality
    }
  }, [user, filters, filteredJobs.length]);

  // Filter functions
  const handleFilterChange = useCallback((filterType: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))

    // Record search when search query changes
    if (filterType === 'search' && value && user) {
      recordSearch(value);
    }
  }, [user, recordSearch])

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      location: "",
      experienceLevels: [],
      jobTypes: [],
      locations: [],
      salaryRange: "",
      category: "",
      type: "",
      industry: "",
      department: "",
      role: "",
      skills: "",
      companyType: "",
      workMode: "",
      education: "",
      companyName: "",
      recruiterType: "",
      salaryMin: undefined,
    })
  }, [])

  const getSectorColor = (sector: string) => {
    const colors: { [key: string]: string } = {
      software: "from-blue-500 to-cyan-500",
      product: "from-purple-500 to-pink-500",
      data: "from-green-500 to-emerald-500",
      design: "from-orange-500 to-red-500",
      devops: "from-indigo-500 to-purple-500",
      sales: "from-yellow-500 to-orange-500",
      marketing: "from-pink-500 to-rose-500",
      default: "from-slate-500 to-gray-500"
    }
    return colors[sector] || colors.default
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-16 pb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Find Your Dream Job
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              Discover thousands of job opportunities with all the information you need
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Search Bar */}
        <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-8 transition-all duration-300 ${isStickyVisible ? 'sticky top-4 z-50' : ''}`}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search jobs, companies, or keywords..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 h-12 border-0 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                <SelectTrigger className="w-48 h-12 border-0 bg-slate-50 dark:bg-slate-700">
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="h-12 px-6 border-0 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Experience Level */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Experience Level</h3>
                <div className="space-y-2">
                  {experienceLevels.map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={level}
                        checked={filters.experienceLevels.includes(level)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange('experienceLevels', [...filters.experienceLevels, level])
                          } else {
                            handleFilterChange('experienceLevels', filters.experienceLevels.filter(l => l !== level))
                          }
                        }}
                      />
                      <label htmlFor={level} className="text-sm text-slate-600 dark:text-slate-300">
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Job Type</h3>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.jobTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange('jobTypes', [...filters.jobTypes, type])
                          } else {
                            handleFilterChange('jobTypes', filters.jobTypes.filter(t => t !== type))
                          }
                        }}
                      />
                      <label htmlFor={type} className="text-sm text-slate-600 dark:text-slate-300">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Salary Range</h3>
                <Select value={filters.salaryRange} onValueChange={(value) => handleFilterChange('salaryRange', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-5">0-5 LPA</SelectItem>
                    <SelectItem value="5-10">5-10 LPA</SelectItem>
                    <SelectItem value="10-20">10-20 LPA</SelectItem>
                    <SelectItem value="20-50">20-50 LPA</SelectItem>
                    <SelectItem value="50+">50+ LPA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Industry */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Industry</h3>
                <Select value={filters.industry} onValueChange={(v) => handleFilterChange('industry', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department / Functional Area */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Department</h3>
                <Select value={filters.department} onValueChange={(v) => handleFilterChange('department', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dep) => (
                      <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role / Designation */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Role / Designation</h3>
                <Select value={filters.role} onValueChange={(v) => handleFilterChange('role', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonRoles.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skills / Keywords */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Skills / Keywords</h3>
                <Input placeholder="e.g., React, Java" value={filters.skills} onChange={(e) => handleFilterChange('skills', e.target.value)} />
              </div>

              {/* Company Type */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Company Type</h3>
                <Select value={filters.companyType} onValueChange={(v) => handleFilterChange('companyType', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="midsize">Midsize</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="multinational">MNC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Work Mode */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Work Mode</h3>
                <Select value={filters.workMode} onValueChange={(v) => handleFilterChange('workMode', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on-site">On-site</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="work from home">Work from Home</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Education / Qualification */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Education</h3>
                <Input placeholder="e.g., Any Graduate, B.Tech, MBA" value={filters.education} onChange={(e) => handleFilterChange('education', e.target.value)} />
              </div>

              {/* Company Name */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Company Name</h3>
                <Input placeholder="e.g., TCS, Infosys" value={filters.companyName} onChange={(e) => handleFilterChange('companyName', e.target.value)} />
              </div>

              {/* Recruiter Type */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Recruiter Type</h3>
                <Select value={filters.recruiterType} onValueChange={(v) => handleFilterChange('recruiterType', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Company Recruiter</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {filteredJobs.length} Jobs Found
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Showing results for your search
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <span className="text-sm text-slate-600 dark:text-slate-300">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="salary">Highest Salary</SelectItem>
                <SelectItem value="applicants">Most Applicants</SelectItem>
                <SelectItem value="rating">Company Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preferred Jobs Section */}
        {user && preferredJobs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Jobs Matching Your Preferences
              </h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {preferredJobs.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {preferredJobs.slice(0, 3).map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/jobs/${job.id}`}>
                    <Card className="group cursor-pointer border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <Avatar className="w-12 h-12 ring-2 ring-blue-200 group-hover:ring-4 transition-all duration-300">
                              <AvatarImage src={job.logo} alt={job.company.name} />
                              <AvatarFallback className="text-sm font-bold">{job.company.name[0]}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {job.title}
                                  </h3>
                                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                                    {job.company.name}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Preferred
                                  </Badge>
                                  {job.urgent && (
                                    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                      Urgent
                                    </Badge>
                                  )}
                                  {job.featured && (
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Briefcase className="w-4 h-4" />
                                  <span>{job.experience}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <IndianRupee className="w-4 h-4" />
                                  <span>{job.salary}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{job.posted}</span>
                                </div>
                              </div>

                              {job.skills && job.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {job.skills.slice(0, 3).map((skill, skillIndex) => (
                                    <Badge key={skillIndex} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {job.skills.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{job.skills.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}

                              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                                {job.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
            {preferredJobs.length > 3 && (
              <div className="text-center mt-4">
                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                  View All {preferredJobs.length} Preferred Jobs
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Jobs Grid */}
        <div className="space-y-6">
          {jobsLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          <div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                          </div>
                        </div>
                      </div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No jobs found
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/jobs/${job.id}`}>
                    <Card className="group cursor-pointer border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <Avatar className="w-12 h-12 ring-2 ring-white/50 group-hover:ring-4 transition-all duration-300">
                              <AvatarImage src={job.logo} alt={job.company.name} />
                              <AvatarFallback className="text-sm font-bold">{job.company.name[0]}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {job.title}
                                  </h3>
                                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                                    {job.company.name}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  {job.urgent && (
                                    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                      Urgent
                                    </Badge>
                                  )}
                                  {job.featured && (
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Briefcase className="w-4 h-4" />
                                  <span>{job.experience}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <IndianRupee className="w-4 h-4" />
                                  <span>{job.salary}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{job.posted}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="w-4 h-4" />
                                  <span>{job.applicants} applicants</span>
                                </div>
                              </div>

                              {/* Internship-specific information */}
                              {job.type.toLowerCase() === 'internship' && (job.duration || job.startDate || job.workMode) && (
                                <div className="flex flex-wrap items-center gap-4 text-sm text-blue-600 dark:text-blue-400 mb-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                  {job.duration && (
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="w-4 h-4" />
                                      <span className="font-medium">{job.duration}</span>
                                    </div>
                                  )}
                                  {job.startDate && (
                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-4 h-4" />
                                      <span>Starts {new Date(job.startDate).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                  {job.workMode && (
                                    <div className="flex items-center space-x-1">
                                      <MapPin className="w-4 h-4" />
                                      <span className="capitalize">{job.workMode.replace('-', ' ')}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2 mb-4">
                                {job.skills.slice(0, 3).map((skill, skillIndex) => (
                                  <Badge key={skillIndex} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills.length > 3 && (
                                  <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-200 text-xs">
                                    +{job.skills.length - 3} more
                                  </Badge>
                                )}
                              </div>

                              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">
                                {job.description}
                              </p>

                              {/* Job Photos Showcase */}
                              {job.photos && job.photos.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Camera className="w-4 h-4 text-slate-500" />
                                    <span className="text-xs text-slate-500 font-medium">Job Showcase</span>
                                  </div>
                                  <div className="flex space-x-2 overflow-x-auto">
                                    {job.photos.slice(0, 3).map((photo: any, photoIndex: number) => (
                                      <div key={photo.id} className="flex-shrink-0">
                                        <img
                                          src={photo.fileUrl}
                                          alt={photo.altText || `Job photo ${photoIndex + 1}`}
                                          className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                                        />
                                      </div>
                                    ))}
                                    {job.photos.length > 3 && (
                                      <div className="flex-shrink-0 w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                        <span className="text-xs text-slate-500 font-medium">
                                          +{job.photos.length - 3}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleSaveJob(job.id)
                              }}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              {savedJobs.has(job.id) ? (
                                <>
                                  <BookmarkCheck className="w-4 h-4 mr-1" />
                                  Saved
                                </>
                              ) : (
                                <>
                                  <Bookmark className="w-4 h-4 mr-1" />
                                  Save
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleApply(job.id)
                              }}
                              className={`text-xs sm:text-sm ${
                                appliedJobs.has(job.id)
                                  ? 'bg-green-600 hover:bg-green-700 cursor-default' 
                                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                              }`}
                              disabled={appliedJobs.has(job.id)}
                            >
                              {appliedJobs.has(job.id) ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Applied
                                </>
                              ) : (
                                'Apply Now'
                              )}
                            </Button>
                            
                            {/* Show undo button if already applied */}
                            {appliedJobs.has(job.id) && (
                              <Button
                                onClick={async (e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  await handleUndoApply(job.id)
                                }}
                                variant="outline"
                                size="sm"
                                disabled={withdrawingJobs.has(job.id)}
                                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-700 disabled:opacity-50"
                              >
                                <X className="w-3 h-3 mr-1" />
                                {withdrawingJobs.has(job.id) ? 'Withdrawing...' : 'Undo'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to save jobs and apply for positions. Please register or login to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 mt-6">
            <Link href="/register" className="w-full">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Register Now
              </Button>
            </Link>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full bg-transparent">
                Login
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">JobPortal</h3>
              <p className="text-slate-400">
                Find your dream job with the best companies and opportunities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link href="/companies" className="hover:text-white transition-colors">Companies</Link></li>
                <li><Link href="/salary-guide" className="hover:text-white transition-colors">Salary Guide</Link></li>
                <li><Link href="/career-advice" className="hover:text-white transition-colors">Career Advice</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/post-job" className="hover:text-white transition-colors">Post a Job</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/recruitment-solutions" className="hover:text-white transition-colors">Recruitment Solutions</Link></li>
                <li><Link href="/employer-resources" className="hover:text-white transition-colors">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 JobPortal. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Job Application Dialog */}
      {selectedJob && (
        <JobApplicationDialog
          isOpen={showApplicationDialog}
          onClose={() => setShowApplicationDialog(false)}
          job={selectedJob}
          onSuccess={handleApplicationSuccess}
          isGulfJob={false}
        />
      )}

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              You need to sign in to apply for jobs and access all features.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
