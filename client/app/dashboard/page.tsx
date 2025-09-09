"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
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
  MessageSquare,
  Send
} from 'lucide-react'
import { Navbar } from '@/components/navbar'

import { toast } from 'sonner'
import { apiService, Resume, JobBookmark, JobAlert } from '@/lib/api'

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
  const [conversations, setConversations] = useState<any[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to access the dashboard')
      router.push('/login')
    } else if (user && user.userType === 'employer') {
      // Redirect employers to their dashboard
      console.log('🔄 Employer detected on jobseeker dashboard, redirecting to employer dashboard')
      toast.info('Redirecting to employer dashboard...')
      router.push('/employer-dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !loading) {
      setCurrentUser(user)
      fetchDashboardStats()
      fetchResumes()
      fetchBookmarks()
      fetchJobAlerts()
      fetchApplications()
      fetchConversations()
      fetchUnreadCount()
    }
  }, [user, loading])

  // Refresh user data when component mounts to ensure we have the latest data
  useEffect(() => {
    if (!loading && user) {
      debouncedRefreshUser()
    }
  }, [loading, user, debouncedRefreshUser])

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

  const fetchConversations = async () => {
    try {
      setConversationsLoading(true)
      const response = await apiService.getConversations()
      if (response.success && response.data) {
        setConversations(response.data)
      } else {
        setConversations([])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setConversations([])
    } finally {
      setConversationsLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true)
      const response = await apiService.getMessages(conversationId)
      if (response.success && response.data) {
        setMessages(response.data.messages || [])
        // Mark conversation as read
        await apiService.markConversationAsRead(conversationId)
        // Refresh unread count
        fetchUnreadCount()
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadCount()
      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setSendingMessage(true)
      const response = await apiService.sendMessage(selectedConversation.id, newMessage.trim())
      if (response.success) {
        setNewMessage('')
        // Refresh messages
        fetchMessages(selectedConversation.id)
        // Refresh conversations to update last message
        fetchConversations()
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  // Function to refresh dashboard data
  const refreshDashboard = async () => {
    await fetchDashboardStats()
    await fetchResumes()
    await fetchBookmarks()
    await fetchJobAlerts()
    await fetchApplications()
  }

  // Listen for user changes to refresh dashboard data
  useEffect(() => {
    if (user) {
      refreshDashboard()
    }
  }, [user])

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
              </div>
              <Button
                onClick={refreshDashboard}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                disabled={statsLoading}
              >
                <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
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
                      src={user.avatar ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.avatar}` : undefined} 
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
                      <Badge variant="secondary" className="capitalize">
                        {user.userType}
                      </Badge>
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
          </div>

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
                      {applicationsLoading ? (
                        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-8 rounded mx-auto"></div>
                      ) : (
                        applications.filter(app => app.status === 'interviewed').length
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

          {/* Messages Section */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conversationsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : conversations && conversations.length > 0 ? (
                <div className="space-y-3">
                  {conversations.slice(0, 5).map((conversation, index) => (
                    <div 
                      key={conversation.id || index} 
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                          : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation)
                        fetchMessages(conversation.id)
                      }}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                            {conversation.otherParticipant.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {conversation.otherParticipant.name}
                            </p>
                            {conversation.isUnread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                            {conversation.lastMessage ? (
                              conversation.lastMessage.isFromMe ? `You: ${conversation.lastMessage.content}` : conversation.lastMessage.content
                            ) : 'No messages yet'}
                          </p>
                          {conversation.otherParticipant.company && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {conversation.otherParticipant.company.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleDateString() : 'N/A'}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">No messages yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Employers will contact you here when they're interested in your profile</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Detail Modal */}
          {selectedConversation && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                        {selectedConversation.otherParticipant.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {selectedConversation.otherParticipant.name}
                      </h3>
                      {selectedConversation.otherParticipant.company && (
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {selectedConversation.otherParticipant.company.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                  {messagesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                        </div>
                      ))}
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((message, index) => (
                      <div
                        key={message.id || index}
                        className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isFromMe
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.isFromMe ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 dark:text-slate-300">No messages yet</p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sendingMessage ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
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
    </div>
  )
}
