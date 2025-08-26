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
  Briefcase, 
  FileText, 
  Building2, 
  Bell, 
  Settings, 
  LogOut,
  Search,
  Plus,
  TrendingUp,
  Bookmark,
  X
} from 'lucide-react'
import { Navbar } from '@/components/navbar'

import { toast } from 'sonner'
import { apiService, DashboardStats, Resume } from '@/lib/api'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to access the dashboard')
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !loading) {
      setCurrentUser(user)
      fetchDashboardStats()
      fetchResumes()
    }
  }, [user, loading])

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const response = await apiService.uploadResumeFile(file)
      if (response.success) {
        toast.success('Resume uploaded successfully')
        fetchResumes()
        setShowResumeModal(false)
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      toast.error('Failed to upload resume')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleEditProfile = () => {
    router.push('/profile')
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
    } catch (error) {
      toast.error('Logout failed')
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Here's what's happening with your job search
            </p>
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
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <p className="text-sm text-slate-600 dark:text-slate-300">Track your progress</p>
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
                      <p className="text-sm text-slate-600 dark:text-slate-300">Manage notifications</p>
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
                      <p className="text-sm text-slate-600 dark:text-slate-300">View bookmarks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/search-history">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Search className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">Search History</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Recent searches</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/resumes">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">My Resumes</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Manage CVs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

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

          {/* Stats and Recent Activity */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Job Search Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                     <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                       {statsLoading ? (
                         <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-8 rounded mx-auto"></div>
                       ) : (
                         stats?.applicationCount || 0
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
                       {statsLoading ? (
                         <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-8 rounded mx-auto"></div>
                       ) : (
                         stats?.recentApplications?.length || 0
                       )}
                  </div>
                     <div className="text-sm text-slate-600 dark:text-slate-300">Recent</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
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
                     <span className="text-sm font-medium">Edit Profile</span>
                  </Button>
                   <Button 
                     variant="outline" 
                     className="w-full justify-start h-auto p-3 flex-col items-start space-y-1 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                     onClick={handleUploadResume}
                   >
                     <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
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
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Supported formats: PDF, DOC, DOCX (max 5MB)
                    </p>
                  </div>

                  {uploading && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-slate-600">Uploading...</span>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowResumeModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
