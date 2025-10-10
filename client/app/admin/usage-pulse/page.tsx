"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import {
  TrendingUp,
  Users,
  Eye,
  FileText,
  Search,
  Calendar,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  ArrowLeft
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function UsagePulsePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [usageData, setUsageData] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState('30d')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    if (authLoading) return

    // Redirect if not logged in or not admin
    if (!user) {
      router.push('/admin-login')
      return
    }

    if (user.userType !== 'admin' && user.userType !== 'superadmin') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
      return
    }

    loadUsageData()
  }, [user, authLoading, router, dateRange])

  const loadUsageData = async () => {
    try {
      setLoading(true)
      
      // Ensure API service has the latest token
      apiService.refreshToken()
      
      const [summaryResponse, activitiesResponse] = await Promise.all([
        apiService.getUsageSummary(),
        apiService.getUsageActivities({ 
          from: getDateFromRange(dateRange),
          limit: 50 
        })
      ])
      
      if (summaryResponse.success) {
        setUsageData(summaryResponse.data)
      } else {
        toast.error('Failed to load usage summary')
      }

      if (activitiesResponse.success) {
        setActivities(activitiesResponse.data.activities || [])
      } else {
        toast.error('Failed to load usage activities')
      }
    } catch (error) {
      console.error('Failed to load usage data:', error)
      toast.error('Failed to load usage data')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadUsageData()
    setRefreshing(false)
    toast.success('Usage data refreshed')
  }

  const getDateFromRange = (range: string) => {
    const now = new Date()
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUsageBadgeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-100 text-red-800'
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading usage data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={user?.region === 'gulf' ? '/gulf-dashboard' : '/employer-dashboard'}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
                <TrendingUp className="w-8 h-8 mr-3 text-blue-600" />
                Usage Pulse
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Monitor quota usage and activity for your company
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={refreshData} disabled={refreshing} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Usage Summary Cards */}
        {usageData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {usageData.recruiters?.map((recruiter: any) => (
              <Card key={recruiter.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                    {recruiter.first_name} {recruiter.last_name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {recruiter.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recruiter.quotas?.map((quota: any) => {
                    const percentage = getUsagePercentage(quota.used, quota.limit)
                    return (
                      <div key={quota.type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                            {quota.type.replace('_', ' ')}
                          </span>
                          <Badge className={getUsageBadgeColor(percentage)}>
                            {quota.used}/{quota.limit}
                          </Badge>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              percentage >= 90 ? 'bg-red-500' : 
                              percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {percentage.toFixed(1)}% used
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Activity Log */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Track usage activities and quota consumption
                </CardDescription>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="job_postings">Job Postings</SelectItem>
                  <SelectItem value="resume_views">Resume Views</SelectItem>
                  <SelectItem value="requirements_posted">Requirements</SelectItem>
                  <SelectItem value="profile_visits">Profile Visits</SelectItem>
                  <SelectItem value="resume_search">Resume Search</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities
                  .filter(activity => filterType === 'all' || activity.activityType === filterType)
                  .map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          {activity.activityType === 'job_postings' && <FileText className="w-5 h-5 text-blue-600" />}
                          {activity.activityType === 'resume_views' && <Eye className="w-5 h-5 text-blue-600" />}
                          {activity.activityType === 'requirements_posted' && <Search className="w-5 h-5 text-blue-600" />}
                          {activity.activityType === 'profile_visits' && <Users className="w-5 h-5 text-blue-600" />}
                          {activity.activityType === 'resume_search' && <BarChart3 className="w-5 h-5 text-blue-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white capitalize">
                            {activity.activityType.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {activity.details}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(activity.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No activities found for the selected period</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
