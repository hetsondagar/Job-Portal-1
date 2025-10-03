"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  Star,
  Eye,
  Download,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Globe,
  CreditCard,
  Activity,
  Shield,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Award,
  Target,
  FileText,
  Image,
  MessageSquare,
  DollarSign,
  Clock,
  UserCheck,
  UserX
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface CompanyDetail {
  id: string
  name: string
  email: string
  phone_number?: string
  website?: string
  industry?: string
  sector?: string
  company_size?: string
  founded_year?: number
  address?: string
  city?: string
  state?: string
  country?: string
  region?: string
  description?: string
  logo?: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  statistics: {
    totalJobs: number
    activeJobs: number
    totalApplications: number
    totalReviews: number
    averageRating: number
    totalEmployees: number
    totalPhotos: number
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
  analytics: Array<{
    id: string
    eventType: string
    eventData: any
    createdAt: string
  }>
  jobs: Array<{
    id: string
    title: string
    location: string
    salary?: number
    jobType: string
    status: string
    createdAt: string
    applicationDeadline?: string
    jobApplications: Array<{
      id: string
      status: string
      createdAt: string
      user: {
        id: string
        first_name: string
        last_name: string
        email: string
      }
    }>
  }>
  employees: Array<{
    id: string
    first_name: string
    last_name: string
    email: string
    user_type: string
    is_active: boolean
    createdAt: string
  }>
  photos: Array<{
    id: string
    filePath: string
    isPrimary: boolean
    createdAt: string
  }>
  reviews: Array<{
    id: string
    rating: number
    comment: string
    createdAt: string
    user: {
      id: string
      first_name: string
      last_name: string
    }
  }>
}

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, loading: authLoading } = useAuth()
  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const companyId = params.companyId as string

  useEffect(() => {
    if (authLoading || !currentUser) return
    if (currentUser.userType !== 'admin' && currentUser.userType !== 'superadmin') {
      router.push('/')
      return
    }
    loadCompanyDetails()
  }, [companyId, currentUser, authLoading])

  const loadCompanyDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getCompanyDetails(companyId)
      
      if (response.success) {
        setCompany(response.data)
      } else {
        setError(response.message || 'Failed to load company details')
        toast.error(response.message || 'Failed to load company details')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      toast.error(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async () => {
    if (!company) return
    
    try {
      const newStatus = company.isActive ? 'inactive' : 'active'
      const response = await apiService.updateCompanyStatus(company.id, newStatus)
      
      if (response.success) {
        toast.success(`Company status updated to ${newStatus}`)
        loadCompanyDetails() // Reload company details
      } else {
        toast.error(response.message || 'Failed to update company status')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating status')
    }
  }

  const handleVerificationToggle = async () => {
    if (!company) return
    
    try {
      const newVerification = company.isVerified ? 'unverified' : 'verified'
      const response = await apiService.updateCompanyVerification(company.id, newVerification)
      
      if (response.success) {
        toast.success(`Company verification updated to ${newVerification}`)
        loadCompanyDetails() // Reload company details
      } else {
        toast.error(response.message || 'Failed to update company verification')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating verification')
    }
  }

  const getImageUrl = (path: string | undefined | null) => {
    if (!path) return "/images/default-company-logo.png"
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path
    }
    return `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}${path}`
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading company details...</p>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-red-400 mb-4">Error: {error || 'Company not found'}</p>
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
              <h1 className="text-3xl font-bold text-white">Company Details</h1>
              <p className="text-slate-300">Comprehensive company information and analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleVerificationToggle}
              className={company.isVerified ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {company.isVerified ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Unverify
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verify
                </>
              )}
            </Button>
            <Button
              onClick={handleStatusToggle}
              className={company.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {company.isActive ? (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Company Profile Header */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={getImageUrl(company.logo)} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                  {company.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-3xl font-bold text-white">{company.name}</h2>
                  <Badge className={company.isVerified ? 'bg-green-600' : 'bg-yellow-600'}>
                    {company.isVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                  <Badge className={company.isActive ? 'bg-green-600' : 'bg-red-600'}>
                    {company.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-slate-300 text-lg mb-2">{company.email}</p>
                <div className="flex items-center space-x-6 text-sm text-slate-400">
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    {company.industry || 'Not specified'}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {company.region || 'Not specified'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined {new Date(company.createdAt).toLocaleDateString()}
                  </div>
                  {company.founded_year && (
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      Founded {company.founded_year}
                    </div>
                  )}
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
                  <p className="text-sm text-gray-400">Total Jobs</p>
                  <p className="text-3xl font-bold text-white">{company.statistics.totalJobs}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Jobs</p>
                  <p className="text-3xl font-bold text-white">{company.statistics.activeJobs}</p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Applications</p>
                  <p className="text-3xl font-bold text-white">{company.statistics.totalApplications}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Rating</p>
                  <p className="text-3xl font-bold text-white">{company.statistics.averageRating}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
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
            <TabsTrigger value="jobs" className="text-white data-[state=active]:bg-white/10">
              Jobs
            </TabsTrigger>
            <TabsTrigger value="employees" className="text-white data-[state=active]:bg-white/10">
              Employees
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-white data-[state=active]:bg-white/10">
              Reviews
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
                    <Building2 className="w-5 h-5 mr-2" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Company Name</label>
                    <p className="text-white font-semibold">{company.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white">{company.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Phone</label>
                    <p className="text-white">{company.phone_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Website</label>
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {company.website}
                      </a>
                    ) : (
                      <p className="text-white">Not provided</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Industry</label>
                    <p className="text-white">{company.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Sector</label>
                    <p className="text-white">{company.sector || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Company Size</label>
                    <p className="text-white">{company.company_size || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Founded Year</label>
                    <p className="text-white">{company.founded_year || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Address</label>
                    <p className="text-white">
                      {company.address ? `${company.address}, ${company.city}, ${company.state}, ${company.country}` : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Region</label>
                    <p className="text-white">{company.region || 'Not specified'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Verification Status</label>
                    <Badge className={company.isVerified ? 'bg-green-600' : 'bg-yellow-600'}>
                      {company.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Account Status</label>
                    <Badge className={company.isActive ? 'bg-green-600' : 'bg-red-600'}>
                      {company.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Created At</label>
                    <p className="text-white">{new Date(company.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Last Updated</label>
                    <p className="text-white">{new Date(company.updatedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Total Employees</label>
                    <p className="text-white">{company.statistics.totalEmployees}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Total Photos</label>
                    <p className="text-white">{company.statistics.totalPhotos}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Company Description */}
            {company.description && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Company Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">{company.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Subscription Information */}
            {company.subscription && (
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
                      <p className="text-white font-semibold">{company.subscription.plan.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Plan Type</label>
                      <p className="text-white">{company.subscription.plan.type}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Price</label>
                      <p className="text-white">${company.subscription.plan.price}</p>
                    </div>
                  </div>
                  {company.subscription.plan.features && company.subscription.plan.features.length > 0 && (
                    <div className="mt-4">
                      <label className="text-sm text-gray-400">Features</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {company.subscription.plan.features.map((feature, index) => (
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

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Company Jobs ({company.jobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {company.jobs.length > 0 ? (
                  <div className="space-y-4">
                    {company.jobs.map((job) => (
                      <div key={job.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">{job.title}</h4>
                            <p className="text-gray-400">{job.location}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                              <span>{job.jobType}</span>
                              {job.salary && <span>${job.salary}</span>}
                              <span>{job.jobApplications.length} applications</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={
                                job.status === 'active' ? 'bg-green-600' :
                                job.status === 'closed' ? 'bg-red-600' :
                                'bg-yellow-600'
                              }
                            >
                              {job.status}
                            </Badge>
                            <p className="text-sm text-gray-400 mt-1">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No jobs found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Company Employees ({company.employees.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {company.employees.length > 0 ? (
                  <div className="space-y-4">
                    {company.employees.map((employee) => (
                      <div key={employee.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-white font-semibold">
                              {employee.first_name} {employee.last_name}
                            </h4>
                            <p className="text-gray-400">{employee.email}</p>
                            <p className="text-sm text-gray-400">
                              Joined {new Date(employee.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={employee.user_type === 'employer' ? 'bg-green-600' : 'bg-blue-600'}>
                              {employee.user_type}
                            </Badge>
                            <Badge className={employee.is_active ? 'bg-green-600' : 'bg-red-600'} variant="outline">
                              {employee.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No employees found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Company Reviews ({company.reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {company.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {company.reviews.map((review) => (
                      <div key={review.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-white font-semibold">
                                {review.user.first_name} {review.user.last_name}
                              </h4>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-300">{review.comment}</p>
                          </div>
                          <p className="text-sm text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No reviews found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment History ({company.payments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {company.payments.length > 0 ? (
                  <div className="space-y-4">
                    {company.payments.map((payment) => (
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
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Activity Logs ({company.activityLogs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {company.activityLogs.length > 0 ? (
                  <div className="space-y-3">
                    {company.activityLogs.slice(0, 20).map((log) => (
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
