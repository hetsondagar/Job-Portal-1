"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Users, Eye, MousePointer, Download, Calendar, Filter, Search, Target, PieChart, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("overview")

  const analyticsData = {
    overview: {
      totalSearches: 156,
      totalCandidates: 2847,
      viewedProfiles: 892,
      contactedCandidates: 234,
      downloadedResumes: 156,
      conversionRate: 26.2
    },
    searchPerformance: [
      { search: "React Developer", results: 45, views: 23, contacts: 8, conversion: 34.8 },
      { search: "Product Manager", results: 32, views: 18, contacts: 5, conversion: 27.8 },
      { search: "UX Designer", results: 28, views: 15, contacts: 4, conversion: 26.7 },
      { search: "DevOps Engineer", results: 22, views: 12, contacts: 3, conversion: 25.0 },
      { search: "Data Scientist", results: 19, views: 10, contacts: 2, conversion: 20.0 }
    ],
    candidateInsights: {
      topSkills: [
        { skill: "React", count: 156, percentage: 23.4 },
        { skill: "JavaScript", count: 134, percentage: 20.1 },
        { skill: "Node.js", count: 98, percentage: 14.7 },
        { skill: "Python", count: 87, percentage: 13.1 },
        { skill: "AWS", count: 76, percentage: 11.4 }
      ],
      experienceLevels: [
        { level: "Entry Level", count: 234, percentage: 35.1 },
        { level: "Mid Level", count: 298, percentage: 44.7 },
        { level: "Senior", count: 135, percentage: 20.2 }
      ],
      locations: [
        { location: "Bangalore", count: 189, percentage: 28.4 },
        { location: "Mumbai", count: 156, percentage: 23.4 },
        { location: "Delhi", count: 134, percentage: 20.1 },
        { location: "Hyderabad", count: 98, percentage: 14.7 },
        { location: "Pune", count: 89, percentage: 13.4 }
      ]
    },
    trends: [
      { date: "2024-01-15", searches: 12, views: 45, contacts: 8 },
      { date: "2024-01-16", searches: 15, views: 52, contacts: 12 },
      { date: "2024-01-17", searches: 18, views: 67, contacts: 15 },
      { date: "2024-01-18", searches: 14, views: 58, contacts: 11 },
      { date: "2024-01-19", searches: 20, views: 78, contacts: 18 },
      { date: "2024-01-20", searches: 16, views: 62, contacts: 14 },
      { date: "2024-01-21", searches: 22, views: 85, contacts: 20 }
    ]
  }

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
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
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
                  <p className="text-2xl font-bold text-slate-900">{analyticsData.overview.totalSearches}</p>
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
                  <p className="text-2xl font-bold text-slate-900">{analyticsData.overview.totalCandidates.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-slate-900">{analyticsData.overview.viewedProfiles}</p>
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
                  <p className="text-2xl font-bold text-slate-900">{analyticsData.overview.conversionRate}%</p>
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
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Viewed 15 profiles</p>
                          <p className="text-sm text-slate-600">React Developer search</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-500">2 hours ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Contacted 8 candidates</p>
                          <p className="text-sm text-slate-600">Product Manager search</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-500">1 day ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Download className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Downloaded 12 resumes</p>
                          <p className="text-sm text-slate-600">UX Designer search</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-500">2 days ago</span>
                    </div>
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
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Candidate Data
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
                  {analyticsData.searchPerformance.map((search, index) => (
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
                          <span className="font-medium ml-1">{((search.views / search.results) * 100).toFixed(1)}%</span>
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
                    {analyticsData.candidateInsights.topSkills.map((skill, index) => (
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
                    {analyticsData.candidateInsights.experienceLevels.map((level, index) => (
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
                    {analyticsData.candidateInsights.locations.map((location, index) => (
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
                  {analyticsData.trends.map((trend, index) => (
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
                          {((trend.contacts / trend.views) * 100).toFixed(1)}% conversion
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


