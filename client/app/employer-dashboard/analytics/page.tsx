"use client"

import { useEffect, useState } from "react"
import { BarChart3, TrendingUp, Users, Eye, MousePointer, Download, Calendar, Filter, Search, Target, PieChart, Activity, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { apiService } from "@/lib/api"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("overview")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any | null>(null)
  const [exporting, setExporting] = useState(false)

  const fetchAnalytics = async (range: string) => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiService.getEmployerAnalytics(range as any)
      if (res.success && res.data) {
        setAnalyticsData(res.data)
      } else {
        setError(res.message || 'Failed to load analytics')
        setAnalyticsData(null)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load analytics')
      setAnalyticsData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async () => {
    try {
      setExporting(true)
      const blob = await apiService.exportAnalyticsReport(timeRange as any, 'csv')
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${timeRange}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      console.error('Export failed:', error)
      setError(error?.message || 'Failed to export report')
    } finally {
      setExporting(false)
    }
  }

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'Search': return <Search className="w-4 h-4 text-blue-600" />
      case 'Eye': return <Eye className="w-4 h-4 text-purple-600" />
      case 'Users': return <Users className="w-4 h-4 text-green-600" />
      case 'Download': return <Download className="w-4 h-4 text-orange-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityBgColor = (iconType: string) => {
    switch (iconType) {
      case 'Search': return 'bg-blue-100'
      case 'Eye': return 'bg-purple-100'
      case 'Users': return 'bg-green-100'
      case 'Download': return 'bg-orange-100'
      default: return 'bg-gray-100'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  useEffect(() => {
    fetchAnalytics(timeRange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <EmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Candidate Analytics</h1>
            <p className="text-slate-600">Track your search performance and candidate insights</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportReport} disabled={exporting || loading}>
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {exporting ? 'Exporting...' : 'Export Report'}
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Searches</p>
                  <p className="text-2xl font-bold text-slate-900">{analyticsData?.overview?.totalSearches ?? 0}</p>
                  <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                </div>
                <Search className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Candidates Found</p>
                  <p className="text-2xl font-bold text-slate-900">{(analyticsData?.overview?.totalCandidates ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+8% from last month</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Profile Views</p>
                  <p className="text-2xl font-bold text-slate-900">{analyticsData?.overview?.viewedProfiles ?? 0}</p>
                  <p className="text-xs text-green-600 mt-1">+15% from last month</p>
                </div>
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{analyticsData?.overview?.conversionRate ?? 0}%</p>
                  <p className="text-xs text-green-600 mt-1">+3% from last month</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Search Performance</TabsTrigger>
            <TabsTrigger value="insights">Candidate Insights</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest candidate interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                    ) : analyticsData?.recentActivity?.length > 0 ? (
                      analyticsData.recentActivity.map((activity: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${getActivityBgColor(activity.icon)} rounded-full flex items-center justify-center`}>
                              {getActivityIcon(activity.icon)}
                            </div>
                            <div>
                              <p className="font-medium">{activity.title}</p>
                              <p className="text-sm text-slate-600">{activity.description}</p>
                            </div>
                          </div>
                          <span className="text-sm text-slate-500">{formatTimeAgo(activity.timestamp)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No recent activity found</p>
                        <p className="text-sm">Your recent actions will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common analytics tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate Performance Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleExportReport} disabled={exporting || loading}>
                      {exporting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      {exporting ? 'Exporting...' : 'Export Candidate Data'}
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Target className="w-4 h-4 mr-2" />
                      Set Analytics Goals
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      View Real-time Metrics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Performance</CardTitle>
                <CardDescription>How your searches are performing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analyticsData?.searchPerformance || []).map((search: any, index: number) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-900">{search.search}</h3>
                        <Badge className="bg-green-100 text-green-800">
                          {search.conversion}% conversion
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Results:</span>
                          <span className="font-medium ml-1">{search.results}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Views:</span>
                          <span className="font-medium ml-1">{search.views}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Contacts:</span>
                          <span className="font-medium ml-1">{search.contacts}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">View Rate:</span>
                          <span className="font-medium ml-1">{((search.views / Math.max(search.results, 1)) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Skills</CardTitle>
                  <CardDescription>Most common skills among candidates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(analyticsData?.candidateInsights?.topSkills || []).map((skill: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{skill.skill}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${skill.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-600 w-12">{skill.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Experience Levels</CardTitle>
                  <CardDescription>Distribution by experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(analyticsData?.candidateInsights?.experienceLevels || []).map((level: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{level.level}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${level.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-600 w-12">{level.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Locations</CardTitle>
                  <CardDescription>Candidate distribution by location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(analyticsData?.candidateInsights?.locations || []).map((location: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{location.location}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${location.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-600 w-12">{location.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Trends</CardTitle>
                <CardDescription>Daily activity over the last week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analyticsData?.trends || []).map((trend: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium w-24">
                          {new Date(trend.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <Search className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">{trend.searches} searches</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4 text-purple-600" />
                            <span className="text-sm">{trend.views} views</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{trend.contacts} contacts</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">
                          {((trend.contacts / Math.max(trend.views, 1)) * 100).toFixed(1)}% conversion
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <EmployerFooter />
    </div>
  )
}


