"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  CreditCard,
  Activity,
  Shield,
  Eye,
  Download,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  Building2,
  Globe,
  FileText,
  Bookmark,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Award,
  Target,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface UserDetail {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  address?: string
  city?: string
  state?: string
  country?: string
  region?: string
  user_type: string
  account_status: string
  verification_level: string
  profile_picture?: string
  willing_to_relocate?: boolean
  preferred_locations?: string[]
  createdAt: string
  updatedAt: string
  statistics: {
    totalApplications: number
    totalBookmarks: number
    totalJobsPosted: number
    totalResumes: number
    totalWorkExperiences: number
    totalEducations: number
  }
  subscription?: {
    plan: {
      name: string
      type: string
      price: number
      duration: string
      features: string[]
    }
  }
  payments: Array<{
    id: string
    amount: number
    currency: string
    status: string
    paymentMethod: string
    description: string
    createdAt: string
  }>
  activityLogs: Array<{
    id: string
    action: string
    details: string
    ipAddress: string
    userAgent: string
    createdAt: string
  }>
  sessions: Array<{
    id: string
    ipAddress: string
    userAgent: string
    isActive: boolean
    lastActivity: string
    createdAt: string
  }>
  jobApplications: Array<{
    id: string
    status: string
    coverLetter?: string
    createdAt: string
    job: {
      id: string
      title: string
      location: string
      salary?: number
      jobType: string
      company: {
        id: string
        name: string
        industry: string
      }
    }
  }>
  jobBookmarks: Array<{
    id: string
    createdAt: string
    job: {
      id: string
      title: string
      location: string
      salary?: number
      jobType: string
      company: {
        id: string
        name: string
        industry: string
      }
    }
  }>
  resumes: Array<{
    id: string
    title: string
    summary?: string
    isDefault: boolean
    isPublic: boolean
    views: number
    downloads: number
    lastUpdated: string
    createdAt: string
  }>
  workExperiences: Array<{
    id: string
    companyName: string
    position: string
    startDate: string
    endDate?: string
    description?: string
    isCurrent: boolean
  }>
  educations: Array<{
    id: string
    institution: string
    degree: string
    fieldOfStudy: string
    startDate: string
    endDate: string
    gpa?: number
    description?: string
  }>
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, loading: authLoading } = useAuth()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = params.userId as string

  useEffect(() => {
    if (authLoading || !currentUser) return
    if (currentUser.userType !== 'admin' && currentUser.userType !== 'superadmin') {
      router.push('/')
      return
    }
    loadUserDetails()
  }, [userId, currentUser, authLoading])

  const loadUserDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getUserDetails(userId)
      
      if (response.success) {
        setUser(response.data)
      } else {
        setError(response.message || 'Failed to load user details')
        toast.error(response.message || 'Failed to load user details')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      toast.error(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async () => {
    if (!user) return
    
    try {
      const newStatus = user.account_status === 'active' ? 'suspended' : 'active'
      const response = await apiService.updateUserStatus(user.id, newStatus)
      
      if (response.success) {
        toast.success(`User status updated to ${newStatus}`)
        loadUserDetails() // Reload user details
      } else {
        toast.error(response.message || 'Failed to update user status')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600'
      case 'suspended': return 'bg-red-600'
      case 'deleted': return 'bg-gray-600'
      default: return 'bg-gray-600'
    }
  }

  const getVerificationColor = (level: string) => {
    switch (level) {
      case 'premium': return 'bg-blue-600'
      case 'basic': return 'bg-yellow-600'
      case 'unverified': return 'bg-gray-600'
      default: return 'bg-gray-600'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading user details...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-red-400 mb-4">Error: {error || 'User not found'}</p>
          <Button onClick={() => router.back()} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">User Details</h1>
              <p className="text-slate-300">Comprehensive user information and analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleStatusToggle}
              className={user.account_status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {user.account_status === 'active' ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Suspend User
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Activate User
                </>
              )}
            </Button>
          </div>
        </div>

        {/* User Profile Header */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.profile_picture} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-3xl font-bold text-white">
                    {user.first_name} {user.last_name}
                  </h2>
                  <Badge className={getStatusColor(user.account_status)}>
                    {user.account_status}
                  </Badge>
                  <Badge className={getVerificationColor(user.verification_level)}>
                    {user.verification_level}
                  </Badge>
                </div>
                <p className="text-slate-300 text-lg mb-2">{user.email}</p>
                <div className="flex items-center space-x-6 text-sm text-slate-400">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {user.user_type}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {user.region || 'Not specified'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Applications</p>
                  <p className="text-3xl font-bold text-white">{user.statistics.totalApplications}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Bookmarks</p>
                  <p className="text-3xl font-bold text-white">{user.statistics.totalBookmarks}</p>
                </div>
                <Bookmark className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Resumes</p>
                  <p className="text-3xl font-bold text-white">{user.statistics.totalResumes}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Experience</p>
                  <p className="text-3xl font-bold text-white">{user.statistics.totalWorkExperiences}</p>
                </div>
                <Award className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/10">
              Overview
            </TabsTrigger>
            <TabsTrigger value="applications" className="text-white data-[state=active]:bg-white/10">
              Applications
            </TabsTrigger>
            <TabsTrigger value="experience" className="text-white data-[state=active]:bg-white/10">
              Experience
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-white data-[state=active]:bg-white/10">
              Payments
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-white data-[state=active]:bg-white/10">
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">First Name</label>
                      <p className="text-white">{user.first_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Last Name</label>
                      <p className="text-white">{user.last_name}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Phone</label>
                    <p className="text-white">{user.phone_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Address</label>
                    <p className="text-white">
                      {user.address ? `${user.address}, ${user.city}, ${user.state}, ${user.country}` : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Region</label>
                    <p className="text-white">{user.region || 'Not specified'}</p>
                  </div>
                  {user.willing_to_relocate !== undefined && (
                    <div>
                      <label className="text-sm text-gray-400">Willing to Relocate</label>
                      <Badge variant={user.willing_to_relocate ? 'default' : 'secondary'}>
                        {user.willing_to_relocate ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  )}
                  {user.preferred_locations && user.preferred_locations.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-400">Preferred Locations</label>
                      <p className="text-white">{user.preferred_locations.join(', ')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">User Type</label>
                    <Badge className={user.user_type === 'employer' ? 'bg-green-600' : 'bg-blue-600'}>
                      {user.user_type}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Account Status</label>
                    <Badge className={getStatusColor(user.account_status)}>
                      {user.account_status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Verification Level</label>
                    <Badge className={getVerificationColor(user.verification_level)}>
                      {user.verification_level}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Created At</label>
                    <p className="text-white">{new Date(user.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Last Updated</label>
                    <p className="text-white">{new Date(user.updatedAt).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Information */}
            {user.subscription && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Subscription Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Plan Name</label>
                      <p className="text-white font-semibold">{user.subscription.plan.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Plan Type</label>
                      <p className="text-white">{user.subscription.plan.type}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Price</label>
                      <p className="text-white">${user.subscription.plan.price}</p>
                    </div>
                  </div>
                  {user.subscription.plan.features && user.subscription.plan.features.length > 0 && (
                    <div className="mt-4">
                      <label className="text-sm text-gray-400">Features</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.subscription.plan.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="border-white/20 text-white">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Job Applications ({user.jobApplications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.jobApplications.length > 0 ? (
                  <div className="space-y-4">
                    {user.jobApplications.map((application) => (
                      <div key={application.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">{application.job.title}</h4>
                            <p className="text-gray-400">{application.job.company.name}</p>
                            <p className="text-sm text-gray-400">{application.job.location}</p>
                            {application.coverLetter && (
                              <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                                {application.coverLetter}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={
                                application.status === 'hired' ? 'bg-green-600' :
                                application.status === 'rejected' ? 'bg-red-600' :
                                application.status === 'offered' ? 'bg-blue-600' :
                                'bg-yellow-600'
                              }
                            >
                              {application.status}
                            </Badge>
                            <p className="text-sm text-gray-400 mt-1">
                              {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No applications found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Work Experience */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Work Experience ({user.workExperiences.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.workExperiences.length > 0 ? (
                    <div className="space-y-4">
                      {user.workExperiences.map((exp) => (
                        <div key={exp.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-white font-semibold">{exp.position}</h4>
                              <p className="text-gray-400">{exp.companyName}</p>
                              <p className="text-sm text-gray-400">
                                {new Date(exp.startDate).toLocaleDateString()} - {exp.isCurrent ? 'Present' : new Date(exp.endDate!).toLocaleDateString()}
                              </p>
                              {exp.description && (
                                <p className="text-sm text-gray-300 mt-2">{exp.description}</p>
                              )}
                            </div>
                            {exp.isCurrent && (
                              <Badge className="bg-green-600">Current</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No work experience found</p>
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Education ({user.educations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.educations.length > 0 ? (
                    <div className="space-y-4">
                      {user.educations.map((edu) => (
                        <div key={edu.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <h4 className="text-white font-semibold">{edu.degree} in {edu.fieldOfStudy}</h4>
                          <p className="text-gray-400">{edu.institution}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(edu.startDate).toLocaleDateString()} - {new Date(edu.endDate).toLocaleDateString()}
                          </p>
                          {edu.gpa && (
                            <p className="text-sm text-gray-400">GPA: {edu.gpa}</p>
                          )}
                          {edu.description && (
                            <p className="text-sm text-gray-300 mt-2">{edu.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No education found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment History ({user.payments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.payments.length > 0 ? (
                  <div className="space-y-4">
                    {user.payments.map((payment) => (
                      <div key={payment.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-white font-semibold">{payment.description}</h4>
                            <p className="text-sm text-gray-400">
                              {new Date(payment.createdAt).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-400">{payment.paymentMethod}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">${payment.amount} {payment.currency}</p>
                            <Badge 
                              className={payment.status === 'completed' ? 'bg-green-600' : 'bg-red-600'}
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No payment history found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Logs */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Activity Logs ({user.activityLogs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.activityLogs.length > 0 ? (
                    <div className="space-y-3">
                      {user.activityLogs.slice(0, 10).map((log) => (
                        <div key={log.id} className="p-3 bg-white/5 rounded border border-white/10">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">{log.action}</p>
                              <p className="text-sm text-gray-400">{log.details}</p>
                              <p className="text-xs text-gray-500">{log.ipAddress}</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No activity logs found</p>
                  )}
                </CardContent>
              </Card>

              {/* Sessions */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Active Sessions ({user.sessions.filter(s => s.isActive).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.sessions.length > 0 ? (
                    <div className="space-y-3">
                      {user.sessions.slice(0, 5).map((session) => (
                        <div key={session.id} className="p-3 bg-white/5 rounded border border-white/10">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-white text-sm">{session.ipAddress}</p>
                              <p className="text-xs text-gray-400 truncate max-w-xs">
                                {session.userAgent}
                              </p>
                              <p className="text-xs text-gray-500">
                                Last activity: {new Date(session.lastActivity).toLocaleString()}
                              </p>
                            </div>
                            <Badge className={session.isActive ? 'bg-green-600' : 'bg-gray-600'}>
                              {session.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No sessions found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
