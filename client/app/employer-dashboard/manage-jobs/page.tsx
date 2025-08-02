"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Pause,
  Play,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"

export default function ManageJobsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all-jobs")

  // Mock job data
  const jobs = [
    {
      id: 1,
      title: "Senior React Developer",
      department: "Engineering",
      location: "Bangalore",
      type: "Full-time",
      applications: 89,
      views: 1234,
      status: "active",
      postedDate: "2 days ago",
      expiryDate: "15 days left",
      salary: "₹8-15 LPA",
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "Mumbai",
      type: "Full-time",
      applications: 156,
      views: 2341,
      status: "active",
      postedDate: "5 days ago",
      expiryDate: "20 days left",
      salary: "₹12-20 LPA",
    },
    {
      id: 3,
      title: "UX Designer",
      department: "Design",
      location: "Delhi",
      type: "Contract",
      applications: 67,
      views: 987,
      status: "paused",
      postedDate: "1 week ago",
      expiryDate: "10 days left",
      salary: "₹6-12 LPA",
    },
    {
      id: 4,
      title: "Backend Developer",
      department: "Engineering",
      location: "Pune",
      type: "Full-time",
      applications: 234,
      views: 3456,
      status: "closed",
      postedDate: "3 weeks ago",
      expiryDate: "Expired",
      salary: "₹6-12 LPA",
    },
  ]

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Paused</Badge>
      case "closed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Closed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case "paused":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      case "closed":
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <EmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage Jobs</h1>
            <p className="text-slate-600">View and manage all your job postings</p>
          </div>
          <Link href="/employer-dashboard/post-job">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search jobs by title, department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-xl border border-slate-200/50">
            <TabsTrigger value="all-jobs">All Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({jobs.filter((j) => j.status === "active").length})</TabsTrigger>
            <TabsTrigger value="paused">Paused ({jobs.filter((j) => j.status === "paused").length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({jobs.filter((j) => j.status === "closed").length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              {getStatusIcon(job.status)}
                              <Link
                                href={`/employer-dashboard/manage-jobs/${job.id}`}
                                className="text-xl font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                {job.title}
                              </Link>
                              {getStatusBadge(job.status)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <Briefcase className="w-4 h-4" />
                                <span>{job.department}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <MapPin className="w-4 h-4" />
                                <span>
                                  {job.location} • {job.type}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <Calendar className="w-4 h-4" />
                                <span>{job.postedDate}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-slate-600">
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{job.applications} applications</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{job.views} views</span>
                              </div>
                              <span>•</span>
                              <span>{job.salary}</span>
                              <span>•</span>
                              <span className={job.status === "closed" ? "text-red-600" : "text-green-600"}>
                                {job.expiryDate}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Link href={`/employer-dashboard/manage-jobs/${job.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Job
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Users className="w-4 h-4 mr-2" />
                                  View Applications
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview Job
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {job.status === "active" ? (
                                  <DropdownMenuItem>
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause Job
                                  </DropdownMenuItem>
                                ) : job.status === "paused" ? (
                                  <DropdownMenuItem>
                                    <Play className="w-4 h-4 mr-2" />
                                    Resume Job
                                  </DropdownMenuItem>
                                ) : null}
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Job
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
                      <p className="text-slate-600 mb-4">
                        {searchQuery || statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Get started by posting your first job"}
                      </p>
                      <Link href="/employer-dashboard/post-job">
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Post Your First Job
                        </Button>
                      </Link>
                    </div>
                  )}
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
