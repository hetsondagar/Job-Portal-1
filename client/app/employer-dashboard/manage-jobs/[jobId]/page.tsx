"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  Eye,
  Share2,
  Bookmark,
  Building2,
  Clock,
  CheckCircle,
  Star,
  ExternalLink,
  Download,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  // Mock job data
  const job = {
    id: params.jobId,
    title: "Senior React Developer",
    company: "TechCorp Solutions",
    companyLogo: "/placeholder-logo.png",
    location: "Bangalore, Karnataka",
    type: "Full-time",
    experience: "3-5 years",
    salary: "₹8-15 LPA",
    postedDate: "2 days ago",
    applications: 89,
    views: 1234,
    status: "active",
    department: "Engineering",
    skills: ["React", "JavaScript", "TypeScript", "Node.js", "MongoDB", "AWS", "Git"],
    description: `We are looking for a Senior React Developer to join our dynamic team. You will be responsible for developing and maintaining high-quality web applications using modern React practices.

**Key Responsibilities:**
- Develop and maintain React-based web applications
- Collaborate with cross-functional teams to define, design, and ship new features
- Write clean, maintainable, and efficient code
- Participate in code reviews and technical discussions
- Mentor junior developers and share best practices

**Requirements:**
- 3+ years of experience with React.js and modern JavaScript
- Strong understanding of state management (Redux, Context API)
- Experience with TypeScript and modern build tools
- Knowledge of RESTful APIs and GraphQL
- Familiarity with testing frameworks (Jest, React Testing Library)
- Experience with version control systems (Git)

**Nice to have:**
- Experience with Next.js or similar frameworks
- Knowledge of backend technologies (Node.js, Python)
- Experience with cloud platforms (AWS, Azure, GCP)
- Understanding of CI/CD pipelines`,
    benefits: [
      "Competitive salary and benefits package",
      "Flexible working hours and remote work options",
      "Professional development and training opportunities",
      "Health insurance and wellness programs",
      "Modern office with latest technology",
      "Team building activities and events"
    ],
    companyInfo: {
      description: "TechCorp Solutions is a leading technology company specializing in innovative software solutions for businesses worldwide. We are committed to creating cutting-edge products that drive digital transformation.",
      founded: "2015",
      employees: "500+",
      industry: "Technology",
      website: "techcorp.com",
      linkedin: "linkedin.com/company/techcorp",
      location: "Bangalore, Karnataka, India"
    }
  }

  // Mock recommended jobs
  const recommendedJobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "InnovateTech",
      location: "Mumbai",
      salary: "₹6-12 LPA",
      type: "Full-time",
      posted: "1 day ago",
      applications: 45
    },
    {
      id: 2,
      title: "React Native Developer",
      company: "MobileFirst",
      location: "Delhi",
      salary: "₹7-14 LPA",
      type: "Full-time",
      posted: "3 days ago",
      applications: 67
    },
    {
      id: 3,
      title: "UI/UX Developer",
      company: "DesignHub",
      location: "Pune",
      salary: "₹5-10 LPA",
      type: "Contract",
      posted: "1 week ago",
      applications: 34
    },
    {
      id: 4,
      title: "Full Stack Developer",
      company: "WebSolutions",
      location: "Hyderabad",
      salary: "₹8-16 LPA",
      type: "Full-time",
      posted: "2 days ago",
      applications: 89
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <EmployerNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jobs</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {job.title}
                      </h1>
                      <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                        {job.company}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{job.postedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{job.applications}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Applications</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{job.views}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Views</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{job.status}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{job.department}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Department</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Job Details Tabs */}
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="company">Company</TabsTrigger>
                    <TabsTrigger value="applications">Applications</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Job Description</h3>
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        <div className="whitespace-pre-line text-slate-600 dark:text-slate-400 leading-relaxed">
                          {job.description}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Benefits & Perks</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {job.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-slate-600 dark:text-slate-400">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="company" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">About {job.company}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        {job.companyInfo.description}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Founded</p>
                          <p className="font-medium">{job.companyInfo.founded}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Employees</p>
                          <p className="font-medium">{job.companyInfo.employees}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Industry</p>
                          <p className="font-medium">{job.companyInfo.industry}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                          <p className="font-medium">{job.companyInfo.location}</p>
                        </div>
                      </div>

                      <div className="flex space-x-4 mt-6">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`https://${job.companyInfo.website}`} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4 mr-2" />
                            Website
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`https://${job.companyInfo.linkedin}`} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="w-4 h-4 mr-2" />
                            LinkedIn
                          </a>
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="applications" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Applications</h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        View and manage applications for this job posting. You have received {job.applications} applications so far.
                      </p>
                      
                      <div className="mt-6">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Users className="w-4 h-4 mr-2" />
                          View All Applications
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Job Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Job
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Job
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Job
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Applications
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Job Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Job Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Applications</span>
                    <span className="font-semibold">{job.applications}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Views</span>
                    <span className="font-semibold">{job.views}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Status</span>
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Posted</span>
                    <span className="font-semibold">{job.postedDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Jobs */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Similar Jobs</h3>
                <div className="space-y-4">
                  {recommendedJobs.map((recJob) => (
                    <div key={recJob.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-1">{recJob.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{recJob.company}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{recJob.location}</span>
                        <span>{recJob.salary}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>{recJob.type}</span>
                        <span>{recJob.applications} applications</span>
                      </div>
                    </div>
                  ))}
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