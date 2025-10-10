"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Users,
  Eye,
  Award,
  Briefcase,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  Database,
  FileText,
  MessageCircle,
  Calendar,
  Mail,
  Phone,
  Loader2,
  RefreshCw,
  Flame,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { CompanyInfoDisplay } from "@/components/company-info-display"
import { CompanyRegistration } from "@/components/company-registration"
import { CompanyManagement } from "@/components/company-management"
import { CompanyJobsDisplay } from "@/components/company-jobs-display"
import { toast } from "sonner"

import { apiService } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { EmployerAuthGuard } from "@/components/employer-auth-guard"
import { EmployerProfileCompletionDialog } from "@/components/profile-completion-dialog"

export default function EmployerDashboard() {
  const { user, refreshUser } = useAuth()

  return (
    <EmployerAuthGuard>
      <EmployerDashboardContent user={user} refreshUser={refreshUser} />
    </EmployerAuthGuard>
  )
}

function EmployerDashboardContent({ user, refreshUser }: { user: any; refreshUser: () => Promise<void> }) {
  const router = useRouter()
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [companyData, setCompanyData] = useState<any>(null)
  const [recentApplications, setRecentApplications] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [hotVacancies, setHotVacancies] = useState<any[]>([])
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([])
  const [showProfileCompletion, setShowProfileCompletion] = useState(false)
  const [profileCheckDone, setProfileCheckDone] = useState(false)

  // Redirect unverified agencies to KYC verification page
  useEffect(() => {
    const checkAgencyVerification = async () => {
      try {
        if (user?.companyId) {
          const companyResponse = await apiService.getCompany(user.companyId)
          if (companyResponse.success && companyResponse.data) {
            const company = companyResponse.data
            const isAgency = company.companyAccountType === 'recruiting_agency' || 
                           company.companyAccountType === 'consulting_firm'
            const needsKYC = company.verificationStatus === 'pending' || 
                           company.verificationStatus === 'unverified'
            
            if (isAgency && needsKYC) {
              toast.info('⚠️ KYC verification required to post jobs and access features')
              setTimeout(() => {
                router.push('/employer-dashboard/kyc-verification')
              }, 1500)
            }
          }
        }
      } catch (error) {
        console.error('Agency verification check error:', error)
      }
    }
    
    checkAgencyVerification()
  }, [user, router])

  // Check profile completion separately (runs on every user update)
  useEffect(() => {
    if (user && !profileCheckDone) {
      // Check if profile is incomplete and show completion dialog
      const isIncomplete = () => {
        // Check if user has marked profile as complete
        if (user.preferences?.profileCompleted === true) {
          return false
        }
        
        // Check if user has skipped and the skip period hasn't expired
        if (user.preferences?.profileCompletionSkippedUntil) {
          const skipUntil = new Date(user.preferences.profileCompletionSkippedUntil)
          const skipSession = user.preferences?.profileCompletionSkipSession
          const currentSession = user.lastLoginAt
          const now = new Date()
          
          // Only honor skip if it's the SAME login session
          if (skipSession === currentSession && skipUntil > now) {
            console.log('⏰ Profile completion skipped until:', skipUntil, '(same session)')
            return false // Don't show dialog yet
          } else if (skipSession !== currentSession) {
            console.log('🔄 New login session detected - showing popup again')
          }
        }
        
        // Required fields for employer
        return !user.phone || !(user as any).designation || !user.companyId
      }
      
      const incomplete = isIncomplete()
      console.log('🔍 Employer profile completion check:', { incomplete, user: { phone: user.phone, designation: (user as any).designation, companyId: user.companyId } })
      
      if (incomplete) {
        // Show dialog after a short delay to avoid UI conflicts
        const timeoutId = setTimeout(() => {
          console.log('✅ Showing employer profile completion dialog')
          setShowProfileCompletion(true)
        }, 1000)
        return () => clearTimeout(timeoutId)
      } else {
        setShowProfileCompletion(false)
      }
      setProfileCheckDone(true)
    }
  }, [user, profileCheckDone])
  
  // Reset profile check when user updates (after skip or completion)
  useEffect(() => {
    if (user) {
      setProfileCheckDone(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  // Debounced dashboard data loading to prevent rapid API calls
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const loadDashboardData = async () => {
    // Prevent multiple simultaneous refresh calls
    if (isRefreshing) {
      console.log('🔄 Dashboard refresh already in progress, skipping...')
      return
    }
    
    try {
      setIsRefreshing(true)
      setLoading(true)
      console.log('🔄 Loading employer dashboard data for user:', user.id)

      // Load dashboard stats
      const statsResponse = await apiService.getEmployerDashboardStats()
      if (statsResponse.success && statsResponse.data) {
        const dashboardStats = [
          {
            title: "Active Jobs",
            value: (statsResponse.data.activeJobs || 0).toString(),
            change: (statsResponse.data.activeJobs || 0) > 0 ? `+${statsResponse.data.activeJobs} active` : "No active jobs",
            icon: Briefcase,
            color: "from-blue-500 to-blue-600",
            link: "/employer-dashboard/manage-jobs",
          },
          {
            title: "Total Applications",
            value: (statsResponse.data.totalApplications || 0).toString(),
            change: (statsResponse.data.totalApplications || 0) > 0 ? `${statsResponse.data.totalApplications} received` : "No applications yet",
            icon: Users,
            color: "from-green-500 to-green-600",
            link: "/employer-dashboard/applications",
          },
          {
            title: "Under Review",
            value: (statsResponse.data.reviewingApplications || 0).toString(),
            change: (statsResponse.data.reviewingApplications || 0) > 0 ? `${statsResponse.data.reviewingApplications} reviewing` : "No applications under review",
            icon: Clock,
            color: "from-yellow-500 to-yellow-600",
            link: "/employer-dashboard/applications?status=reviewing",
          },
          {
            title: "Shortlisted",
            value: (statsResponse.data.shortlistedApplications || 0).toString(),
            change: (statsResponse.data.shortlistedApplications || 0) > 0 ? `${statsResponse.data.shortlistedApplications} shortlisted` : "No shortlisted candidates",
            icon: Star,
            color: "from-indigo-500 to-indigo-600",
            link: "/employer-dashboard/applications?status=shortlisted",
          },
          {
            title: "Interviews Scheduled",
            value: (statsResponse.data.interviewScheduledApplications || 0).toString(),
            change: (statsResponse.data.interviewScheduledApplications || 0) > 0 ? `${statsResponse.data.interviewScheduledApplications} scheduled` : "No interviews scheduled",
            icon: Calendar,
            color: "from-pink-500 to-pink-600",
            link: "/employer-dashboard/applications?status=interview_scheduled",
          },
          {
            title: "Profile Views",
            value: (statsResponse.data.profileViews || 0).toString(),
            change: (statsResponse.data.profileViews || 0) > 0 ? `${statsResponse.data.profileViews} views` : "No profile views",
            icon: Eye,
            color: "from-purple-500 to-purple-600",
          },
          {
            title: "Hired Candidates",
            value: (statsResponse.data.hiredCandidates || 0).toString(),
            change: (statsResponse.data.hiredCandidates || 0) > 0 ? `${statsResponse.data.hiredCandidates} hired` : "No hires yet",
            icon: Award,
            color: "from-orange-500 to-orange-600",
            link: "/employer-dashboard/applications?status=hired",
          },
        ]
        setStats(dashboardStats)
        console.log('✅ Dashboard stats loaded:', dashboardStats)
      }

      // Load company data if user has a company
      if (user.companyId) {
        try {
          const companyResponse = await apiService.getCompany(user.companyId)
          if (companyResponse.success && companyResponse.data) {
            setCompanyData(companyResponse.data)
            console.log('✅ Company data loaded:', companyResponse.data)
          }
        } catch (error) {
          console.error('❌ Error loading company data:', error)
        }
      }

      // Load recent applications and jobs for activity feed
      try {
        // Use data from dashboard stats if available
        let applications = []
        let jobs = []
        let hotVacancies = []
        
        if (statsResponse.success && statsResponse.data) {
          applications = statsResponse.data.recentApplications || []
          jobs = statsResponse.data.recentJobs || []
          hotVacancies = statsResponse.data.recentHotVacancies || []
          setRecentApplications(applications)
          setHotVacancies(hotVacancies)
          console.log('✅ Recent applications loaded from dashboard stats:', applications.length)
          console.log('✅ Recent hot vacancies loaded from dashboard stats:', hotVacancies.length)
        } else {
          // Fallback to separate API calls
          const applicationsResponse = await apiService.getEmployerApplications()
          const jobsResponse = await apiService.getEmployerJobs({ limit: 5 })
          const hotVacanciesResponse = await apiService.getEmployerHotVacancies()
          
          if (applicationsResponse.success && applicationsResponse.data) {
            applications = applicationsResponse.data.slice(0, 5)
            setRecentApplications(applications)
            console.log('✅ Recent applications loaded from API:', applications.length)
          }
          
          if (jobsResponse.success && jobsResponse.data) {
            jobs = jobsResponse.data.slice(0, 5)
            console.log('✅ Recent jobs loaded from API:', jobs.length)
          }

          if (hotVacanciesResponse.success && hotVacanciesResponse.data) {
            setHotVacancies(hotVacanciesResponse.data.slice(0, 5))
            console.log('✅ Recent hot vacancies loaded from API:', hotVacanciesResponse.data.length)
          }
        }
        
        // Generate recent activity from real data
        const activityData = generateRecentActivity(applications, jobs, hotVacancies)
        setRecentActivity(activityData)
        console.log('✅ Recent activity generated:', activityData.length)
        
      } catch (error) {
        console.error('❌ Error loading recent data:', error)
        // Set default activity if loading fails
        setRecentActivity([{
          id: 1,
          type: "placeholder",
          title: "No recent activity",
          description: "Your recent activities will appear here",
          time: "Just now",
          icon: Clock,
        }])
      }

      // Load upcoming interviews
      try {
        const interviewsResponse = await apiService.getUpcomingInterviews(5)
        console.log('🔍 Upcoming interviews API response:', interviewsResponse)
        if (interviewsResponse.success && interviewsResponse.data && interviewsResponse.data.interviews) {
          console.log('🔍 Interview data structure:', interviewsResponse.data.interviews[0])
          setUpcomingInterviews(interviewsResponse.data.interviews)
          console.log('✅ Upcoming interviews loaded:', interviewsResponse.data.interviews.length)
        } else {
          setUpcomingInterviews([])
          console.log('✅ No upcoming interviews found - response:', interviewsResponse)
        }
      } catch (error) {
        console.error('❌ Error loading upcoming interviews:', error)
        setUpcomingInterviews([])
      }

      // For Google OAuth users, display Google account details directly
      if (user.oauth_provider === 'google') {
        console.log('✅ Google OAuth user detected, using Google account details')
        toast.success('Welcome! Your Google account details are loaded.')
        
        // Update user data with Google profile information if available
        if (user.firstName || user.lastName || user.email) {
          const updatedUser = {
            ...user,
            // Use Google profile data if available
            displayName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
            avatar: user.avatar || null,
            email: user.email
          }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          console.log('✅ Google account details updated in dashboard')
        }
      }

    } catch (error: any) {
      console.error('❌ Error loading dashboard data:', error)
      
      // Handle rate limiting specifically
      if (error.message && error.message.includes('Rate limit exceeded')) {
        toast.error('Too many requests. Please wait a moment before refreshing.')
      } else {
        toast.error('Failed to load dashboard data')
      }
      
      // Set default stats if loading fails
      setStats([
        {
          title: "Active Jobs",
          value: "0",
          change: "No data",
          icon: Briefcase,
          color: "from-blue-500 to-blue-600",
          link: "/employer-dashboard/manage-jobs",
        },
        {
          title: "Total Applications",
          value: "0",
          change: "No data",
          icon: Users,
          color: "from-green-500 to-green-600",
        },
        {
          title: "Under Review",
          value: "0",
          change: "No data",
          icon: Clock,
          color: "from-yellow-500 to-yellow-600",
        },
        {
          title: "Shortlisted",
          value: "0",
          change: "No data",
          icon: Star,
          color: "from-indigo-500 to-indigo-600",
        },
        {
          title: "Interviews Scheduled",
          value: "0",
          change: "No data",
          icon: Calendar,
          color: "from-pink-500 to-pink-600",
        },
        {
          title: "Profile Views",
          value: "0",
          change: "No data",
          icon: Eye,
          color: "from-purple-500 to-purple-600",
        },
        {
          title: "Hired Candidates",
          value: "0",
          change: "No data",
          icon: Award,
          color: "from-orange-500 to-orange-600",
        },
      ])
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const allQuickActions = [
    {
      title: "Post a Job",
      description: "Create a new job posting",
      icon: Plus,
      href: "/employer-dashboard/post-job",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "View Applications",
      description: "Review job applications",
      icon: Users,
      href: "/employer-dashboard/applications",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Job Templates",
      description: "Use reusable job templates",
      icon: FileText,
      href: "/employer-dashboard/job-templates",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Bulk Import",
      description: "Import multiple jobs at once",
      icon: Database,
      href: "/employer-dashboard/bulk-import",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Featured Jobs",
      description: "Promote your job listings",
      icon: TrendingUp,
      href: "/employer-dashboard/featured-jobs",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Search Database",
      description: "Find candidates in our database",
      icon: Users,
      href: "/employer-dashboard/create-requirement",
      color: "from-teal-500 to-teal-600",
    },
    {
      title: "Analytics",
      description: "View search performance metrics",
      icon: BarChart3,
      href: "/employer-dashboard/analytics",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Messages",
      description: "Chat with your team",
      icon: MessageCircle,
      href: "/messages",
      color: "from-sky-500 to-sky-600",
    },
    {
      title: "Usage Pulse",
      description: "Monitor quota usage and activity",
      icon: TrendingUp,
      href: "/admin/usage-pulse",
      color: "from-red-500 to-red-600",
      adminOnly: true, // Only show for admin users
    },
  ]

  // Filter quick actions based on user type
  const quickActions = allQuickActions.filter(action => {
    if (action.adminOnly) {
      // Show Usage Pulse for admin users (both system admins and company admins)
      return user?.userType === 'admin' || user?.userType === 'superadmin'
    }
    return true
  })

  // Calculate profile completion based on user and company data
  const calculateProfileCompletion = () => {
    if (!user) return 0
    
    let completion = 0
    
    // User profile fields (40% of total)
    const userFields = [
      user.firstName, user.lastName, user.email, user.phone,
      user.currentLocation, user.headline, user.summary
    ]
    userFields.forEach(field => {
      if (field && field.trim() !== '') completion += 5.7
    })
    
    // Company profile fields (60% of total)
    if (user.companyId && companyData) {
      const companyFields = [
        companyData.name, companyData.industry, companyData.companySize,
        companyData.website, companyData.description, companyData.address
      ]
      companyFields.forEach(field => {
        if (field && field.trim() !== '') completion += 10
      })
    } else if (user.companyId) {
      // If user has companyId but companyData is not loaded yet, show partial completion
      completion += 30
    }
    
    return Math.min(100, Math.round(completion))
  }

  const handleProfileUpdated = async (updatedData: any) => {
    // Refresh user data to get updated profile
    await refreshUser()
    setShowProfileCompletion(false)
    // Reload dashboard data to reflect changes
    loadDashboardData()
  }

  const generateRecentActivity = (applications: any[], jobs: any[], hotVacancies: any[] = []) => {
    const activities = []
    
    // Add recent applications
    applications.slice(0, 3).forEach((app, index) => {
      activities.push({
        id: `app-${index}`,
        type: "application",
        title: "New application received",
        description: `${app.applicantName || 'A candidate'} applied for ${app.job?.title || 'a job'}`,
        time: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently',
        icon: Users,
      })
    })
    
    // Add recent hot vacancy postings (prioritize these as they're premium)
    hotVacancies.slice(0, 2).forEach((hotVacancy, index) => {
      const isDraft = hotVacancy.status === 'draft'
      activities.push({
        id: `hot-vacancy-${index}`,
        type: "hot_vacancy",
        title: isDraft ? "Hot Vacancy Created as Draft" : "Hot Vacancy Posted",
        description: isDraft 
          ? `${hotVacancy.title} created as draft - complete payment to go live`
          : `${hotVacancy.title} is now featured as a hot vacancy`,
        time: hotVacancy.createdAt ? new Date(hotVacancy.createdAt).toLocaleDateString() : 'Recently',
        icon: Flame,
      })
    })
    
    // Add recent job postings
    jobs.slice(0, 2).forEach((job, index) => {
      activities.push({
        id: `job-${index}`,
        type: "job",
        title: "Job posted successfully",
        description: `${job.title} position is now live`,
        time: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently',
        icon: Briefcase,
      })
    })
    
    // If no real data, show placeholder
    if (activities.length === 0) {
      activities.push({
        id: 1,
        type: "placeholder",
        title: "No recent activity",
        description: "Your recent activities will appear here",
        time: "Just now",
        icon: Clock,
      })
    }
    
    return activities
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 overflow-x-hidden">
      <EmployerNavbar />

              {/* Welcome Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white overflow-hidden mb-8"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.firstName ? user.firstName.toUpperCase() : 'EMPLOYER'}!
                  </h1>
                  <p className="text-blue-100 text-lg mb-4">Ready to find your next great hire?</p>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-200" />
                      <span className="text-sm">{stats.find(s => s.title === "Active Jobs")?.value || "0"} Active Jobs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-200" />
                      <span className="text-sm">{stats.find(s => s.title === "Total Applications")?.value || "0"} Applications</span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                    <Briefcase className="w-16 h-16 text-white/80" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90"></div>
          </motion.div>

        {/* Company Registration Section */}
        {!user?.companyId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <CompanyRegistration 
              onCompanyCreated={async () => {
                // Wait a moment for backend to complete user update
                setTimeout(async () => {
                  try {
                    await refreshUser()
                    toast.success('Company created successfully! User data refreshed.')
                  } catch (error) {
                    console.error('Error refreshing user data:', error)
                    // Fallback to page reload
                    window.location.reload()
                  }
                }, 1000) // Wait 1 second for backend to complete
              }}
              userId={user?.id || ''}
            />
            <div className="mt-4 text-sm text-slate-700">
              Already have a company?{' '}
              <Link href="/employer-join-company" className="text-blue-600 hover:underline">Join existing company</Link>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Dashboard Statistics</h2>
          <button
            onClick={loadDashboardData}
            disabled={loading || isRefreshing}
            className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            title={isRefreshing ? "Refresh in progress..." : "Refresh dashboard data"}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
          ) : stats.length > 0 ? (
            stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                {stat.link ? (
                  <Link href={stat.link}>
                    <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-sm text-green-600">{stat.change}</p>
                          </div>
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                          >
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                          <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                          <p className="text-sm text-green-600">{stat.change}</p>
                        </div>
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                        >
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-600">No dashboard data available.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Jobs Section */}
            {user?.companyId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <CompanyJobsDisplay 
                  companyId={user.companyId}
                  onJobUpdated={() => {
                    // Refresh dashboard data
                    loadDashboardData()
                  }}
                />
              </motion.div>
            )}

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900 flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                  <button
                    onClick={loadDashboardData}
                    disabled={loading || isRefreshing}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    title={isRefreshing ? "Refresh in progress..." : "Refresh dashboard data"}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <Link href={action.href}>
                        <Card className="h-full hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer border-slate-200">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center`}
                              >
                                <action.icon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                                <p className="text-sm text-slate-600">{action.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                  <button
                    onClick={loadDashboardData}
                    disabled={loading || isRefreshing}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    title={isRefreshing ? "Refresh in progress..." : "Refresh activity data"}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <activity.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{activity.title}</h4>
                        <p className="text-sm text-slate-600">{activity.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile & Support */}
          <div className="space-y-8">
                          {/* Company Information */}
              {user?.companyId && (
                              <CompanyInfoDisplay companyId={user.companyId} />
            )}



            {/* Profile Completion */}
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Profile Completion
                  </CardTitle>
                  <button
                    onClick={loadDashboardData}
                    disabled={loading || isRefreshing}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    title={isRefreshing ? "Refresh in progress..." : "Refresh dashboard data"}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Company Profile</span>
                      <span className="text-sm font-medium text-slate-900">{calculateProfileCompletion()}%</span>
                    </div>
                    <Progress value={calculateProfileCompletion()} className="h-2" />
                  </div>
                  <div className="text-sm text-slate-600">
                    {calculateProfileCompletion() >= 80 ? 'Great! Your profile is well completed.' : 'Complete your profile to attract better candidates'}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full bg-transparent"
                    onClick={() => router.push('/employer-dashboard/settings')}
                  >
                    {calculateProfileCompletion() >= 80 ? 'View Profile' : 'Complete Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Upcoming Interviews
                  </CardTitle>
                  <button
                    onClick={loadDashboardData}
                    disabled={loading || isRefreshing}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    title={isRefreshing ? "Refresh in progress..." : "Refresh interviews data"}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingInterviews.length > 0 ? (
                    upcomingInterviews.slice(0, 3).map((interview, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{interview.title}</p>
                          <p className="text-xs text-slate-600">
                            {interview.jobApplication?.applicant?.first_name && interview.jobApplication?.applicant?.last_name 
                              ? `${interview.jobApplication.applicant.first_name} ${interview.jobApplication.applicant.last_name}`
                              : interview.jobApplication?.applicant?.email || 'Unknown Candidate'
                            }
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(interview.scheduledAt).toLocaleDateString()} at {new Date(interview.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                          {interview.interviewType && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                              {interview.interviewType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">No upcoming interviews</p>
                        <p className="text-xs text-slate-600">Your scheduled interviews will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                <p className="text-blue-100 text-sm mb-4">Our support team is here to help you succeed</p>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Support
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <EmployerFooter />

      {/* Profile Completion Dialog */}
      {user && (
        <EmployerProfileCompletionDialog
          isOpen={showProfileCompletion}
          onClose={() => setShowProfileCompletion(false)}
          user={user}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  )
}
