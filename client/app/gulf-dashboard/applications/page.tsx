"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  Download,
  Mail,
  Phone,
  Calendar,
  User,
  Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { EmployerAuthGuard } from "@/components/employer-auth-guard"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"

export default function GulfApplicationsPage() {
  const { user } = useAuth()

  return (
    <EmployerAuthGuard>
      <GulfApplicationsContent user={user} />
    </EmployerAuthGuard>
  )
}

function GulfApplicationsContent({ user }: { user: any }) {
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setLoading(true)
      const response = await apiService.getEmployerApplications()
      if (response.success && response.data) {
        setApplications(response.data)
      }
    } catch (error) {
      console.error('Error loading applications:', error)
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const response = await apiService.updateApplicationStatus(applicationId, newStatus)
      if (response.success) {
        toast.success('Application status updated successfully')
        loadApplications()
      } else {
        toast.error('Failed to update application status')
      }
    } catch (error) {
      console.error('Error updating application status:', error)
      toast.error('Failed to update application status')
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicant?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      applied: { color: "bg-blue-100 text-blue-800", label: "Applied" },
      reviewing: { color: "bg-yellow-100 text-yellow-800", label: "Under Review" },
      shortlisted: { color: "bg-purple-100 text-purple-800", label: "Shortlisted" },
      interview_scheduled: { color: "bg-orange-100 text-orange-800", label: "Interview Scheduled" },
      hired: { color: "bg-green-100 text-green-800", label: "Hired" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.applied
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      <EmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Applications - Gulf Region</h1>
              <p className="text-slate-600">Manage job applications for your Gulf region postings</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search by candidate name or job title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="reviewing">Under Review</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {loading ? (
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading applications...</p>
              </CardContent>
            </Card>
          ) : filteredApplications.length > 0 ? (
            <div className="grid gap-6">
              {filteredApplications.map((application, index) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={application.applicant?.avatar} />
                          <AvatarFallback>
                            {getInitials(application.applicant?.first_name, application.applicant?.last_name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900">
                                {application.applicant?.first_name} {application.applicant?.last_name}
                              </h3>
                              <p className="text-slate-600">{application.job?.title}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(application.status)}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{application.applicant?.email}</span>
                            </div>
                            {application.applicant?.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4" />
                                <span>{application.applicant.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {application.applicant?.headline && (
                            <p className="text-slate-600 text-sm mb-4">
                              {application.applicant.headline}
                            </p>
                          )}

                          {application.applicant?.skills && application.applicant.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {application.applicant.skills.slice(0, 5).map((skill: string, skillIndex: number) => (
                                <Badge key={skillIndex} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {application.applicant.skills.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{application.applicant.skills.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/gulf-dashboard/applications/${application.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            
                            <Select
                              value={application.status}
                              onValueChange={(value) => handleStatusChange(application.id, value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="applied">Applied</SelectItem>
                                <SelectItem value="reviewing">Under Review</SelectItem>
                                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                                <SelectItem value="hired">Hired</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>

                            {application.resume && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(application.resume, '_blank')}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Resume
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications found</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm || statusFilter !== "all" 
                    ? "No applications match your current filters. Try adjusting your search criteria."
                    : "You haven't received any applications yet. Make sure your jobs are active and visible."
                  }
                </p>
                <Button
                  onClick={() => router.push('/gulf-dashboard/post-job')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  Post a New Job
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      <EmployerFooter />
    </div>
  )
}
