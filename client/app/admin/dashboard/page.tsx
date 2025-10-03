"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  Shield,
  AlertCircle,
  BarChart3,
  Globe,
  MapPin,
  Settings,
  LogOut,
  UserCheck,
  UserX,
  CheckCircle2,
  Clock
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (authLoading) return

    // Redirect if not logged in or not admin
    if (!user) {
      router.push('/admin-login')
      return
    }

    if (user.userType !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
      return
    }

    loadStats()
  }, [user, authLoading, router])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminStats()
      
      if (response.success) {
        setStats(response.data)
      } else {
        toast.error('Failed to load statistics')
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
      toast.error('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.userType !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">System Administration Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-600 text-white">
                <UserCheck className="w-3 h-3 mr-1" />
                Admin
              </Badge>
              <span className="text-sm text-gray-300">
                {user.first_name} {user.last_name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.clear()
                  router.push('/admin-login')
                }}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-blue-600">
              <Building2 className="w-4 h-4 mr-2" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-600">
              <Briefcase className="w-4 h-4 mr-2" />
              Jobs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      Total Users
                      <Users className="w-5 h-5" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.users?.total || 0}</div>
                    <p className="text-xs mt-1 text-blue-100">
                      +{stats?.users?.newLast30Days || 0} in last 30 days
                    </p>
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Jobseekers:</span>
                        <span className="font-semibold">{stats?.users?.jobseekers || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Employers:</span>
                        <span className="font-semibold">{stats?.users?.employers || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Admins:</span>
                        <span className="font-semibold">{stats?.users?.admins || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Companies */}
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      Companies
                      <Building2 className="w-5 h-5" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.companies?.total || 0}</div>
                    <p className="text-xs mt-1 text-purple-100">
                      +{stats?.companies?.newLast30Days || 0} in last 30 days
                    </p>
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Verified:</span>
                        <span className="font-semibold">{stats?.companies?.verified || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Pending:</span>
                        <span className="font-semibold">{stats?.companies?.unverified || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Jobs */}
                <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      Jobs Posted
                      <Briefcase className="w-5 h-5" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.jobs?.total || 0}</div>
                    <p className="text-xs mt-1 text-green-100">
                      +{stats?.jobs?.newLast30Days || 0} in last 30 days
                    </p>
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Active:</span>
                        <span className="font-semibold">{stats?.jobs?.active || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>India:</span>
                        <span className="font-semibold">{stats?.jobs?.india || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Gulf:</span>
                        <span className="font-semibold">{stats?.jobs?.gulf || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Applications */}
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      Applications
                      <TrendingUp className="w-5 h-5" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.applications?.total || 0}</div>
                    <p className="text-xs mt-1 text-orange-100">
                      Total applications submitted
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>User Management</span>
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Manage all users, jobseekers, and employers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/admin/users/all">
                      <Button className="w-full justify-between bg-blue-600 hover:bg-blue-700">
                        Manage Users
                        <Users className="w-4 h-4" />
                      </Button>
                    </Link>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/5 rounded p-2">
                        <div className="text-gray-400">Active</div>
                        <div className="text-lg font-bold">{stats?.users?.active || 0}</div>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <div className="text-gray-400">Inactive</div>
                        <div className="text-lg font-bold">{(stats?.users?.total || 0) - (stats?.users?.active || 0)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="w-5 h-5" />
                      <span>Company Management</span>
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Verify and manage company accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/admin/companies/all">
                      <Button className="w-full justify-between bg-purple-600 hover:bg-purple-700">
                        Manage Companies
                        <Building2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/5 rounded p-2">
                        <div className="text-gray-400">Verified</div>
                        <div className="text-lg font-bold">{stats?.companies?.verified || 0}</div>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <div className="text-gray-400">Pending</div>
                        <div className="text-lg font-bold">{stats?.companies?.unverified || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="w-5 h-5" />
                      <span>Job Management</span>
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Manage job postings and approvals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/admin/jobs/all">
                      <Button className="w-full justify-between bg-green-600 hover:bg-green-700">
                        Manage Jobs
                        <Briefcase className="w-4 h-4" />
                      </Button>
                    </Link>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/5 rounded p-2">
                        <div className="text-gray-400">Active</div>
                        <div className="text-lg font-bold">{stats?.jobs?.active || 0}</div>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <div className="text-gray-400">Inactive</div>
                        <div className="text-lg font-bold">{stats?.jobs?.inactive || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Security Notice */}
              <Card className="bg-red-500/10 border-red-500/50 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>Security Notice</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">
                    This is a secure admin portal. All actions are logged and monitored. 
                    Never share this URL with unauthorized users. If you notice any suspicious activity, 
                    change your password immediately.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <div className="flex space-x-2">
                  <Link href="/admin/users/india">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <MapPin className="w-4 h-4 mr-2" />
                      India Users
                    </Button>
                  </Link>
                  <Link href="/admin/users/gulf">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Globe className="w-4 h-4 mr-2" />
                      Gulf Users
                    </Button>
                  </Link>
                </div>
              </div>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle>All Users Overview</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage all users across India and Gulf regions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Users</p>
                          <p className="text-2xl font-bold">{stats?.users?.total || 0}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Active Users</p>
                          <p className="text-2xl font-bold text-green-400">{stats?.users?.active || 0}</p>
                        </div>
                        <UserCheck className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">New This Month</p>
                          <p className="text-2xl font-bold text-blue-400">{stats?.users?.newLast30Days || 0}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link href="/admin/users/all">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Users className="w-4 h-4 mr-2" />
                        View All Users
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Company Management</h2>
                <div className="flex space-x-2">
                  <Link href="/admin/companies/india">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <MapPin className="w-4 h-4 mr-2" />
                      India Companies
                    </Button>
                  </Link>
                  <Link href="/admin/companies/gulf">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Globe className="w-4 h-4 mr-2" />
                      Gulf Companies
                    </Button>
                  </Link>
                </div>
              </div>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle>All Companies Overview</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage all companies across India and Gulf regions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Companies</p>
                          <p className="text-2xl font-bold">{stats?.companies?.total || 0}</p>
                        </div>
                        <Building2 className="w-8 h-8 text-purple-400" />
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Verified</p>
                          <p className="text-2xl font-bold text-green-400">{stats?.companies?.verified || 0}</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Pending Verification</p>
                          <p className="text-2xl font-bold text-yellow-400">{stats?.companies?.unverified || 0}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link href="/admin/companies/all">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Building2 className="w-4 h-4 mr-2" />
                        View All Companies
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Job Management</h2>
                <div className="flex space-x-2">
                  <Link href="/admin/jobs/india">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <MapPin className="w-4 h-4 mr-2" />
                      India Jobs
                    </Button>
                  </Link>
                  <Link href="/admin/jobs/gulf">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Globe className="w-4 h-4 mr-2" />
                      Gulf Jobs
                    </Button>
                  </Link>
                </div>
              </div>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle>All Jobs Overview</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage all jobs across India and Gulf regions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Jobs</p>
                          <p className="text-2xl font-bold">{stats?.jobs?.total || 0}</p>
                        </div>
                        <Briefcase className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Active Jobs</p>
                          <p className="text-2xl font-bold text-green-400">{stats?.jobs?.active || 0}</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">India Jobs</p>
                          <p className="text-2xl font-bold text-blue-400">{stats?.jobs?.india || 0}</p>
                        </div>
                        <MapPin className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Gulf Jobs</p>
                          <p className="text-2xl font-bold text-orange-400">{stats?.jobs?.gulf || 0}</p>
                        </div>
                        <Globe className="w-8 h-8 text-orange-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link href="/admin/jobs/all">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Briefcase className="w-4 h-4 mr-2" />
                        View All Jobs
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
