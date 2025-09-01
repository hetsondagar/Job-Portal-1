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
  Calendar,
  Mail,
  Phone,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { CompanyInfoDisplay } from "@/components/company-info-display"
import { toast } from "sonner"

import { apiService } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { EmployerAuthGuard } from "@/components/employer-auth-guard"

export default function EmployerDashboard() {
  const { user } = useAuth()

  return (
    <EmployerAuthGuard>
      <EmployerDashboardContent user={user} />
    </EmployerAuthGuard>
  )
}

function EmployerDashboardContent({ user }: { user: any }) {
  const router = useRouter()
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [companyData, setCompanyData] = useState<any>(null)
  const [recentApplications, setRecentApplications] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading employer dashboard data for user:', user.id)

      // Load dashboard stats
      const statsResponse = await apiService.getDashboardStats()
      if (statsResponse.success && statsResponse.data) {
        const dashboardStats = [
          {
            title: "Active Jobs",
            value: (statsResponse.data.activeJobs || 0).toString(),
            change: (statsResponse.data.activeJobs || 0) > 0 ? `+${statsResponse.data.activeJobs} active` : "No active jobs",
            icon: Briefcase,
            color: "from-blue-500 to-blue-600",
          },
          {
            title: "Total Applications",
            value: (statsResponse.data.totalApplications || 0).toString(),
            change: (statsResponse.data.totalApplications || 0) > 0 ? `${statsResponse.data.totalApplications} received` : "No applications yet",
            icon: Users,
            color: "from-green-500 to-green-600",
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
          },
        ]
        setStats(dashboardStats)
        console.log('✅ Dashboard stats loaded:', dashboardStats)
      }

      // Load company data if user has a company
      if (user.company_id) {
        try {
          const companyResponse = await apiService.getCompany(user.company_id)
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
        const applicationsResponse = await apiService.getApplications()
        const jobsResponse = await apiService.getEmployerJobs({ limit: 5 })
        
        let applications = []
        let jobs = []
        
        if (applicationsResponse.success && applicationsResponse.data) {
          applications = applicationsResponse.data.slice(0, 5)
          setRecentApplications(applications)
          console.log('✅ Recent applications loaded:', applications.length)
        }
        
        if (jobsResponse.success && jobsResponse.data) {
          jobs = jobsResponse.data.slice(0, 5)
          console.log('✅ Recent jobs loaded:', jobs.length)
        }
        
        // Generate recent activity from real data
        const activityData = generateRecentActivity(applications, jobs)
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

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
      
      // Set default stats if loading fails
      setStats([
        {
          title: "Active Jobs",
          value: "0",
          change: "No data",
          icon: Briefcase,
          color: "from-blue-500 to-blue-600",
        },
        {
          title: "Total Applications",
          value: "0",
          change: "No data",
          icon: Users,
          color: "from-green-500 to-green-600",
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
    }
  }

  const quickActions = [
    {
      title: "Post a Job",
      description: "Create a new job posting",
      icon: Plus,
      href: "/employer-dashboard/post-job",
      color: "from-blue-500 to-blue-600",
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
  ]

  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const generateRecentActivity = (applications: any[], jobs: any[]) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      <EmployerNavbar />

              {/* Welcome Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Stats Cards */}
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
            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
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
                <CardTitle className="text-slate-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
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
            {user?.company_id && (
              <CompanyInfoDisplay companyId={user.company_id} />
            )}



            {/* Profile Completion */}
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Company Profile</span>
                      <span className="text-sm font-medium text-slate-900">{user?.profileCompletion || 0}%</span>
                    </div>
                    <Progress value={user?.profileCompletion || 0} className="h-2" />
                  </div>
                  <div className="text-sm text-slate-600">
                    {user?.profileCompletion >= 80 ? 'Great! Your profile is well completed.' : 'Complete your profile to attract better candidates'}
                  </div>
                                     <Button 
                     variant="outline" 
                     size="sm" 
                     className="w-full bg-transparent"
                     onClick={() => router.push('/employer-dashboard/settings')}
                   >
                     {user?.profileCompletion >= 80 ? 'View Profile' : 'Complete Profile'}
                   </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentApplications.length > 0 ? (
                    recentApplications.slice(0, 2).map((app, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">New application received</p>
                          <p className="text-xs text-slate-600">
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">No upcoming events</p>
                        <p className="text-xs text-slate-600">Your events will appear here</p>
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
    </div>
  )
}
