"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { constructAvatarUrl } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  FileText, 
  Building2, 
  Bell, 
  Settings, 
  LogOut,
  Search,
  TrendingUp,
  Bookmark,
  X,
  Upload,
  RefreshCw,
  Star,
  ThumbsUp,
  Calendar,
  Zap,
  CheckCircle,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'

import { toast } from 'sonner'
import { apiService, Resume, JobBookmark, JobAlert, CoverLetter } from '@/lib/api'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RecentNotifications } from '@/components/recent-notifications'

export default function DashboardPage() {
  const { user, loading, logout, refreshUser, debouncedRefreshUser } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [bookmarks, setBookmarks] = useState<JobBookmark[]>([])
  const [bookmarksLoading, setBookmarksLoading] = useState(true)
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([])
  const [jobAlertsLoading, setJobAlertsLoading] = useState(true)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([])
  const [interviewsLoading, setInterviewsLoading] = useState(true)
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([])
  const [coverLettersLoading, setCoverLettersLoading] = useState(true)
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false)
  const [coverLetterUploading, setCoverLetterUploading] = useState(false)
  const coverLetterFileInputRef = useRef<HTMLInputElement>(null)
  const [showCoverLetterSelect, setShowCoverLetterSelect] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    if (loading) return;
    if (user) {
      if (user.userType === 'employer' || user.userType === 'admin') {
      console.log('🔄 Employer/Admin detected on jobseeker dashboard, redirecting to employer dashboard')
        router.replace(user.region === 'gulf' ? '/gulf-dashboard' : '/employer-dashboard')
      }
      return;
    }
    // No user yet
    if (typeof window !== 'undefined' && apiService.isAuthenticated()) {
      // Token present; avoid redirecting to login while profile is loading
      return;
    }
    router.replace('/login')
  }, [user, loading, router])

  // Single useEffect to handle all data fetching with proper debouncing
  useEffect(() => {
    if (user && !loading && !dataLoaded) {
      setCurrentUser(user)
      
      // Debounce all API calls to prevent excessive requests
      const timeoutId = setTimeout(async () => {
        try {
          // Fetch critical data first
          await Promise.all([
            fetchDashboardStats(),
            fetchApplications(),
            fetchBookmarks()
          ])
          
          // Then fetch secondary data
          await Promise.all([
            fetchResumes(),
            fetchJobAlerts(),
            fetchCoverLetters(),
            fetchInterviews()
          ])
          
          setDataLoaded(true)
        } catch (error) {
          console.error('Error loading dashboard data:', error)
        }
      }, 500) // 500ms delay to prevent rapid-fire API calls

      return () => clearTimeout(timeoutId)
    }
  }, [user, loading, dataLoaded])

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true)
      const response = await apiService.getDashboardStats()
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      toast.error('Failed to load dashboard stats')
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true)
      
      // Fetch applications from database only
      const response = await apiService.getApplications()
      if (response.success && response.data) {
        setApplications(response.data)
      } else {
        setApplications([])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      setApplications([])
    } finally {
      setApplicationsLoading(false)
    }
  }

  const fetchInterviews = async () => {
    try {
      setInterviewsLoading(true)
      
      // Fetch all interviews first, then filter for upcoming ones
      const response = await apiService.getCandidateInterviews('', 1, 10)
      
      console.log('🔍 Interview fetch response:', response)
      
      if (response.success && response.data && response.data.interviews) {
        const allInterviews = response.data.interviews
        console.log('🔍 All interviews:', allInterviews)
        
        // Filter for upcoming interviews (scheduled, confirmed, or any future interviews)
        const upcoming = allInterviews.filter((interview: any) => {
          const interviewDate = new Date(interview.scheduledAt)
          const now = new Date()
          return interviewDate >= now && 
                 (interview.status === 'scheduled' || 
                  interview.status === 'confirmed' || 
                  interview.status === 'pending')
        })
        
        console.log('🔍 Upcoming interviews:', upcoming)
        setUpcomingInterviews(upcoming)
      } else {
        console.log('No interviews found or response format issue:', response)
        setUpcomingInterviews([])
      }
    } catch (error) {
      console.error('Error fetching interviews:', error)
      // Don't show error to user for interviews as it's not critical
      setUpcomingInterviews([])
    } finally {
      setInterviewsLoading(false)
    }
  }

  // Function to refresh dashboard data with rate limiting
  const refreshDashboard = async () => {
    // Prevent rapid successive refreshes
    if (statsLoading || applicationsLoading || bookmarksLoading) {
      toast.info('Please wait, data is already being refreshed...')
      return
    }

    try {
      // Show loading state
      setStatsLoading(true)
      setDataLoaded(false) // Reset data loaded state
      
      // Fetch critical data first, then others
      await Promise.all([
        fetchDashboardStats(),
        fetchApplications(),
        fetchBookmarks()
      ])
      
      // Fetch secondary data
      await Promise.all([
        fetchResumes(),
        fetchJobAlerts(),
        fetchCoverLetters(),
        fetchInterviews()
      ])
      
      setDataLoaded(true)
      toast.success('Dashboard refreshed successfully!')
    } catch (error) {
      console.error('Error refreshing dashboard:', error)
      toast.error('Failed to refresh dashboard data')
    }
  }

  // Removed excessive refresh useEffect - data is now fetched only once on mount

  const fetchResumes = async () => {
    try {
      const response = await apiService.getResumes()
      if (response.success && response.data) {
        setResumes(response.data)
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
    }
  }

  const fetchBookmarks = async () => {
    try {
      setBookmarksLoading(true)
      
      // Fetch bookmarks from database only
      const response = await apiService.getBookmarks()
      if (response.success && response.data) {
        setBookmarks(response.data)
      } else {
        setBookmarks([])
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      setBookmarks([])
    } finally {
      setBookmarksLoading(false)
    }
  }

  const fetchJobAlerts = async () => {
    try {
      setJobAlertsLoading(true)
      const response = await apiService.getJobAlerts()
      if (response.success && response.data) {
        setJobAlerts(response.data)
      }
    } catch (error) {
      console.error('Error fetching job alerts:', error)
    } finally {
      setJobAlertsLoading(false)
    }
  }

  const fetchCoverLetters = async () => {
    try {
      setCoverLettersLoading(true)
      const response = await apiService.getCoverLetters()
      if (response.success && response.data) {
        setCoverLetters(response.data)
      }
    } catch (error) {
      console.error('Error fetching cover letters:', error)
    } finally {
      setCoverLettersLoading(false)
    }
  }


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // File validation
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, DOC, or DOCX files only.')
      return
    }

    if (file.size > maxSize) {
      toast.error('File size too large. Please upload a file smaller than 5MB.')
      return
    }

    try {
      setUploading(true)
      const response = await apiService.uploadResumeFile(file)
      if (response.success) {
        toast.success('Resume uploaded successfully!')
        fetchResumes()
        setShowResumeModal(false)
        
        // If this is the first resume, show additional info
        if (resumes.length === 0) {
          toast.success('This resume has been set as your default resume.')
        }
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      toast.error('Failed to upload resume. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUndoApplication = async (application: any) => {
    try {
      // Update application status to withdrawn in database
      const response = await apiService.updateApplicationStatus(application.id, 'withdrawn')
      if (response.success) {
        toast.success('Application withdrawn successfully')
        fetchApplications() // Refresh applications list
        fetchDashboardStats() // Refresh dashboard stats
      } else {
        toast.error(response.message || 'Failed to withdraw application')
      }
    } catch (error) {
      console.error('Error withdrawing application:', error)
      toast.error('Failed to withdraw application')
    }
  }

  const handleEditProfile = () => {
    router.push('/account')
  }

  const handleNotificationSettings = () => {
    router.push('/notifications')
  }

  const handleUploadResume = () => {
    setShowResumeModal(true)
  }

  const handleCoverLetterFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // File validation
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, DOC, or DOCX files only.')
      return
    }

    if (file.size > maxSize) {
      toast.error('File size too large. Please upload a file smaller than 5MB.')
      return
    }

    try {
      setCoverLetterUploading(true)
      const response = await apiService.uploadCoverLetterFile(file)
      if (response.success) {
        toast.success('Cover letter uploaded successfully!')
        fetchCoverLetters()
        setShowCoverLetterModal(false)
        
        // If this is the first cover letter, show additional info
        if (coverLetters.length === 0) {
          toast.success('This cover letter has been set as your default cover letter.')
        }
      }
    } catch (error) {
      console.error('Error uploading cover letter:', error)
      toast.error('Failed to upload cover letter. Please try again.')
    } finally {
      setCoverLetterUploading(false)
      if (coverLetterFileInputRef.current) {
        coverLetterFileInputRef.current.value = ''
      }
    }
  }

  const handleUploadCoverLetter = () => {
    setShowCoverLetterModal(true)
  }

  const handleViewCoverLetter = () => {
    setShowCoverLetterSelect(true)
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Logout failed')
    }
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

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />
      
      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Welcome back, {user.firstName}!
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Here's what's happening with your job search
                </p>
                {!dataLoaded && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading dashboard data...</span>
                  </div>
                )}
              </div>
              <Button
                onClick={refreshDashboard}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                disabled={statsLoading || applicationsLoading || bookmarksLoading}
              >
                <RefreshCw className={`w-4 h-4 ${(statsLoading || applicationsLoading || bookmarksLoading) ? 'animate-spin' : ''}`} />
                <span>
                  {(statsLoading || applicationsLoading || bookmarksLoading) ? 'Refreshing...' : 'Refresh'}
                </span>
              </Button>
            </div>
          </div>

          {/* User Info Card */}
          <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex-shrink-0">
                  <Avatar className="w-16 h-16 border-4 border-white dark:border-slate-700 shadow-lg">
                    <AvatarImage 
                      src={constructAvatarUrl(user.avatar)} 
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {`${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                      <p className="font-medium text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                      <p className="font-medium text-slate-900 dark:text-white truncate">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Account Type</p>
                      <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {user.userType}
                      </Badge>
                        {/* Premium Badge */}
                        {(user.verification_level === 'premium' || user.verificationLevel === 'premium' || user?.preferences?.premium) && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                      <Badge variant={user.accountStatus === 'active' ? 'default' : 'destructive'}>
                        {user.accountStatus}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Profile Upvotes</p>
                      <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                        <svg className="w-4 h-4 fill-green-600 text-green-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 5l7 12H5l7-12z"/></svg>
                        {statsLoading ? '—' : (stats?.profileLikes || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Link href="/jobs">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">Find Jobs</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Browse opportunities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/applications">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">My Applications</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {statsLoading ? 'Loading...' : `${applications.length} applications submitted`}
                      </p>
                      {applications.length > 0 && (
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {applications.filter(app => app.status === 'reviewing' || app.status === 'shortlisted').length} under review
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/interviews">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">My Interviews</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {interviewsLoading ? 'Loading...' : `${upcomingInterviews.length} upcoming interview${upcomingInterviews.length !== 1 ? 's' : ''}`}
                      </p>
                      {upcomingInterviews.length > 0 && (
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Next: {new Date(upcomingInterviews[0]?.scheduledAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/job-alerts">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">Job Alerts</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {jobAlertsLoading ? 'Loading...' : `${jobAlerts.length} alert${jobAlerts.length !== 1 ? 's' : ''} active`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/bookmarks">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Bookmark className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">Saved Jobs</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {bookmarksLoading ? 'Loading...' : `${bookmarks.length} jobs saved`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
              <CardContent className="p-6 h-full flex flex-col justify-center">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base">Search History</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {statsLoading ? 'Loading...' : `${stats?.stats?.totalSearches || 0} searches performed`}
                    </p>
                    {stats?.stats?.savedSearches > 0 && (
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {stats.stats.savedSearches} saved searches
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => router.push('/search-history')}
                      className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
                    >
                      View History
                    </Button>
                    {stats?.stats?.savedSearches > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push('/search-history?tab=saved')}
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
                      >
                        Saved Searches
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full"
              onClick={() => router.push('/resumes')}
            >
              <CardContent className="p-6 h-full flex flex-col justify-center">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base">My Resumes</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {resumes.length === 0 ? 'Upload your first resume' : `${resumes.length} resume${resumes.length !== 1 ? 's' : ''} uploaded`}
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleUploadResume()
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </Button>
                    {resumes.length > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          router.push('/resumes')
                        }}
                      >
                        View All
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full"
              onClick={() => router.push('/cover-letters')}
            >
              <CardContent className="p-6 h-full flex flex-col justify-center">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base">My Cover Letters</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {coverLetters.length === 0 ? 'Upload your first cover letter' : `${coverLetters.length} cover letter${coverLetters.length !== 1 ? 's' : ''} uploaded`}
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleUploadCoverLetter()
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </Button>
                      {coverLetters.length > 0 && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            router.push('/cover-letters')
                          }}
                        >
                          View All
                        </Button>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link href="/companies">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">Companies</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Explore employers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/notifications">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">Notifications</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Stay updated</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/gulf-opportunities">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full border-2 border-green-200 dark:border-green-800">
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">Gulf Opportunities</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Explore jobs in Gulf region</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Hot Vacancy Section */}
          <Card className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 backdrop-blur-xl border-red-200 dark:border-red-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🔥</span>
                  </div>
                  <span>Hot Vacancy Jobs</span>
                  <Badge variant="destructive" className="animate-pulse">Premium</Badge>
                </CardTitle>
                <Link href="/jobs?hot=true">
                  <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20">
                    View All Hot Jobs
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sample Hot Vacancy Cards */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse text-xs">
                          🔥 Hot
                        </Badge>
                        <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse text-xs">
                          URGENT
                        </Badge>
                      </div>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Senior Software Engineer</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">TechCorp Solutions</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>📍 Mumbai</span>
                      <span>💼 3-5 years</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">₹8-12 LPA</span>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse text-xs">
                          🔥 Hot
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                          Super Featured
                        </Badge>
                      </div>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Product Manager</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">InnovateTech</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>📍 Bangalore</span>
                      <span>💼 5-7 years</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">₹12-18 LPA</span>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse text-xs">
                          🔥 Hot
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          Boosted
                        </Badge>
                      </div>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Data Scientist</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">AnalyticsPro</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>📍 Delhi</span>
                      <span>💼 2-4 years</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">₹6-10 LPA</span>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800 dark:text-red-200">Hot Vacancy Benefits</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-red-700 dark:text-red-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>Priority visibility in search results</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>Proactive candidate alerts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>Enhanced company branding</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>Faster hiring process</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Interviews Section */}
          {upcomingInterviews.length > 0 && (
            <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Upcoming Interviews</span>
                  </CardTitle>
                  <Link href="/interviews">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingInterviews.slice(0, 3).map((interview) => {
                    const { date, time } = {
                      date: new Date(interview.scheduledAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }),
                      time: new Date(interview.scheduledAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })
                    }
                    
                    return (
                      <div key={interview.id} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">{interview.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {interview.jobApplication?.job?.title && (
                              <span>Position: {interview.jobApplication.job.title}</span>
                            )}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                            <span>{date}</span>
                            <span>{time}</span>
                            {interview.duration && (
                              <span>({interview.duration} minutes)</span>
                            )}
                          </div>
                          {interview.interviewType && (
                            <Badge variant="secondary" className="mt-2">
                              {interview.interviewType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Stats Overview - Enhanced for Jobseekers */}
          {user.userType === 'jobseeker' && (
            <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Application Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {applicationsLoading ? (
                        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-8 rounded mx-auto"></div>
                      ) : (
                        applications.length
                      )}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Total Applications</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                      {applicationsLoading ? (
                        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-8 rounded mx-auto"></div>
                      ) : (
                        applications.filter(app => app.status === 'reviewing' || app.status === 'shortlisted').length
                      )}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Under Review</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      {interviewsLoading ? (
                        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-8 rounded mx-auto"></div>
                      ) : (
                        upcomingInterviews.length
                      )}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Interviews</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                      {applicationsLoading ? (
                        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-8 rounded mx-auto"></div>
                      ) : (
                        applications.filter(app => app.status === 'offered' || app.status === 'hired').length
                      )}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Offers</div>
                  </div>
                </div>
                
                {/* Quick Actions for Applications */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/applications">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <FileText className="w-4 h-4 mr-2" />
                      View All Applications
                    </Button>
                  </Link>
                  <Link href="/jobs">
                    <Button variant="outline">
                      <Search className="w-4 h-4 mr-2" />
                      Find More Jobs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* General Stats Overview */}
          <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Activity Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {applicationsLoading ? (
                      <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-8 rounded mx-auto"></div>
                    ) : (
                      applications.length
                    )}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Applications</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {statsLoading ? (
                      <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-8 rounded mx-auto"></div>
                    ) : (
                      stats?.profileViews || 0
                    )}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Profile Views</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {bookmarks.length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Saved Jobs</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 fill-green-600 text-green-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 5l7 12H5l7-12z"/></svg>
                    {statsLoading ? (
                      <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-8 rounded"></div>
                    ) : (
                      stats?.profileLikes || 0
                    )}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Profile Upvotes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Account Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-3 flex-col items-start space-y-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  onClick={handleEditProfile}
                >
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">Account Settings</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-3 flex-col items-start space-y-1 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  onClick={handleUploadResume}
                >
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">Upload Resume</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-3 flex-col items-start space-y-1 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                  onClick={handleNotificationSettings}
                >
                  <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium">Notifications</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-3 flex-col items-start space-y-1 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 hover:text-red-700"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Sign Out</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <div className="mb-8">
            <RecentNotifications limit={3} showViewAll={true} />
          </div>

          {/* Gulf Opportunities Banner */}
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Explore Gulf Opportunities</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Discover high-paying jobs in the Gulf region with tax-free salaries</p>
                  </div>
                </div>
                <Link href="/gulf-opportunities">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Explore Gulf Jobs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Recent Applications</span>
                {applications.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {applications.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : applications && applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((application, index) => (
                    <div key={application.id || index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            application.status === 'applied' ? 'bg-blue-500' :
                            application.status === 'reviewing' ? 'bg-yellow-500' :
                            application.status === 'shortlisted' ? 'bg-green-500' :
                            application.status === 'interviewed' ? 'bg-purple-500' :
                            application.status === 'offered' ? 'bg-emerald-500' :
                            application.status === 'hired' ? 'bg-green-600' :
                            application.status === 'rejected' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}></div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {application.job?.title || application.jobTitle || 'Job Title'}
                          </p>
                          {application.isSample && (
                            <Badge variant="outline" className="text-xs">Sample</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {application.job?.company?.name || application.companyName || 'Company'} • {application.job?.location || application.location || 'Location'} • {application.status || 'Applied'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'N/A'}
                        </div>
                        {application.isSample && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUndoApplication(application)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Undo
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {applications.length > 5 && (
                    <div className="text-center pt-2">
                      <Link href="/applications">
                        <Button variant="outline" size="sm" className="text-xs">
                          View All ({applications.length})
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">No applications yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Start applying to jobs to see your applications here</p>
                  <Link href="/jobs" className="mt-3 inline-block">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>


                    </div>
                </div>

      {/* Resume Upload Modal */}
      {showResumeModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Upload Resume
                      </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowResumeModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
                </div>
                
            <div className="space-y-4">
              <div>
                <Label htmlFor="resume-file">Select File</Label>
                <Input
                  id="resume-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  disabled={uploading}
                />
                <p className="text-sm text-slate-500 mt-1">
                  Supported formats: PDF, DOC, DOCX (max 5MB)
                          </p>
                        </div>

              {uploading && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-600 dark:text-blue-400">Uploading resume...</span>
                    </div>
                  )}

              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Upload Tips:</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  <li>• Use PDF format for best compatibility</li>
                  <li>• Keep file size under 5MB</li>
                  <li>• Ensure your resume is up-to-date</li>
                  <li>• First upload will be set as default</li>
                </ul>
                </div>
                
              <div className="flex justify-end space-x-2">
                  <Button
                  variant="outline" 
                  onClick={() => setShowResumeModal(false)}
                  disabled={uploading}
                >
                  Cancel
                  </Button>
                </div>
              </div>
            </div>
        </div>
      )}

      {/* Cover Letter Upload Modal */}
      {showCoverLetterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Upload Cover Letter
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowCoverLetterModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="cover-letter-file">Select File</Label>
                <Input
                  id="cover-letter-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCoverLetterFileUpload}
                  ref={coverLetterFileInputRef}
                  disabled={coverLetterUploading}
                />
                <p className="text-sm text-slate-500 mt-1">
                  Supported formats: PDF, DOC, DOCX (max 5MB)
                </p>
              </div>

              {coverLetterUploading && (
                <div className="flex items-center space-x-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span className="text-sm text-indigo-600 dark:text-indigo-400">Uploading cover letter...</span>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Upload Tips:</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  <li>• Use PDF format for best compatibility</li>
                  <li>• Keep file size under 5MB</li>
                  <li>• Ensure your cover letter is tailored to the job</li>
                  <li>• First upload will be set as default</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCoverLetterModal(false)}
                  disabled={coverLetterUploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Cover Letter Selector Dialog */}
      <Dialog open={showCoverLetterSelect} onOpenChange={setShowCoverLetterSelect}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a cover letter to view</DialogTitle>
            <DialogDescription>Choose one of your uploaded cover letters to open.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {coverLetters.length === 0 && (
              <div className="text-sm text-slate-600 dark:text-slate-300">You have no cover letters yet. Upload one first.</div>
            )}
            {coverLetters.map((cl) => (
              <div key={(cl as any).id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <div className="font-medium">{(cl as any).title || 'Untitled Cover Letter'}</div>
                  {(cl as any).summary && (
                    <div className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[420px]">{(cl as any).summary}</div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      await apiService.downloadCoverLetter((cl as any).id)
                      setShowCoverLetterSelect(false)
                    } catch (err) {
                      console.error('Failed to open cover letter:', err)
                      toast.error('Failed to open cover letter')
                    }
                  }}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
