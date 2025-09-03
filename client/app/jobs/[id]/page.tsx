"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  Star,
  Share2,
  Bookmark,
  Building2,
  CheckCircle,
  AlertCircle,
  Award,
  LinkIcon,
  Mail,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { apiService } from '@/lib/api'
import { sampleJobManager } from '@/lib/sampleJobManager'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false) // This would come from your auth context
  const [forceUpdate, setForceUpdate] = useState(false) // State to force re-render for button

  // Mock job data - in real app, fetch based on params.id
  const job = {
    id: 1,
    title: "Senior Full Stack Developer",
    company: "TechCorp Solutions",
    companyId: "1",
    companyLogo: "/placeholder.svg?height=80&width=80",
    location: "Bangalore",
    experience: "4-7 years",
    salary: "15-25 LPA",
    skills: ["React", "Node.js", "Python", "AWS", "MongoDB", "TypeScript"],
    posted: "2 days ago",
    applicants: 45,
    description: `We are looking for a skilled Full Stack Developer to join our dynamic team. The ideal candidate will have experience in both front-end and back-end development, with a strong understanding of modern web technologies.

Key Responsibilities:
• Develop and maintain web applications using React and Node.js
• Design and implement RESTful APIs
• Work with databases (MongoDB, PostgreSQL)
• Collaborate with cross-functional teams
• Ensure code quality and best practices
• Participate in code reviews and technical discussions`,
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      "4+ years of experience in full-stack development",
      "Strong proficiency in React, Node.js, and JavaScript",
      "Experience with cloud platforms (AWS preferred)",
      "Knowledge of database design and optimization",
      "Excellent problem-solving and communication skills",
    ],
    benefits: [
      "Health Insurance",
      "Flexible Working Hours",
      "Remote Work Options",
      "Learning & Development Budget",
      "Performance Bonuses",
      "Stock Options",
      "Free Meals",
      "Gym Membership",
    ],
    type: "Full-time",
    remote: true,
    department: "Engineering",
    companySize: "500-1000",
    companyRating: 4.2,
    companyReviews: 234,
    industry: "Technology",
    founded: "2015",
    website: "techcorp.com",
    aboutCompany:
      "TechCorp Solutions is a leading technology company specializing in innovative software solutions for enterprises. We pride ourselves on creating cutting-edge products that solve real-world problems.",
  }

  const similarJobs = [
    {
      id: 2,
      title: "Full Stack Developer",
      company: "InnovateTech",
      location: "Mumbai",
      experience: "3-5 years",
      salary: "12-20 LPA",
      logo: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      title: "Senior React Developer",
      company: "WebSolutions",
      location: "Hyderabad",
      experience: "4-6 years",
      salary: "14-22 LPA",
      logo: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      title: "Backend Developer",
      company: "DataTech",
      location: "Pune",
      experience: "3-7 years",
      salary: "13-24 LPA",
      logo: "/placeholder.svg?height=40&width=40",
    },
  ]

  const handleApply = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }

    try {
      console.log("Applying for job...")
      
      // Check if this is a sample job
      if (job.id.toString().startsWith('550e8400')) {
        // For sample jobs, use the sample job manager
        sampleJobManager.addApplication({
          jobId: job.id.toString(),
          jobTitle: job.title,
          companyName: job.company,
          location: job.location,
          salary: job.salary,
          type: job.type
        })
        toast.success(`Application submitted successfully for ${job.title} at ${job.company}!`, {
          description: 'Your application has been saved and will appear in your dashboard.',
          duration: 5000,
        })
        console.log('Sample job application submitted:', job.id)
        // Force re-render to update button state
        setForceUpdate(prev => !prev)
        return
      }
      
      // For real jobs, call the backend
      const response = await apiService.applyJob(job.id.toString())
      
      if (response.success) {
        toast.success(`Application submitted successfully for ${job.title} at ${job.company}!`, {
          description: 'Your application has been submitted and is under review.',
          duration: 5000,
        })
        console.log('Application submitted:', response.data)
        // Force re-render to update button state
        setForceUpdate(prev => !prev)
      } else {
        toast.error(response.message || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying for job:', error)
      toast.error('Failed to submit application. Please try again.')
    }
  }

  const handleShare = (platform: string) => {
    const jobUrl = `${window.location.origin}/jobs/${job.id}`
    const shareText = `Check out this ${job.title} position at ${job.company}!`

    switch (platform) {
      case "link":
        navigator.clipboard.writeText(jobUrl)
        // Show toast notification
        break
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${jobUrl}`)}`)
        break
      case "email":
        window.open(`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(jobUrl)}`)
        break
    }
  }

  const handleBackNavigation = () => {
    // Check if we came from a department page
    const referrer = document.referrer
    if (referrer.includes(`/companies/${job.companyId}/departments/`)) {
      router.back()
    } else {
      router.push("/jobs")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />

      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <Button
              variant="ghost"
              className="text-slate-600 dark:text-slate-400 hover:text-blue-600"
              onClick={handleBackNavigation}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Header */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-16 h-16 ring-2 ring-white/50">
                          <AvatarImage src={job.companyLogo || "/placeholder.svg"} alt={job.company} />
                          <AvatarFallback className="text-xl font-bold text-blue-600">{job.company[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{job.title}</h1>
                          <Link
                            href={`/companies/${job.companyId}`}
                            className="text-xl text-blue-600 hover:text-blue-700 font-medium mb-3 inline-block"
                          >
                            {job.company}
                          </Link>
                          <div className="flex items-center space-x-1 mb-4">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-semibold">{job.companyRating}</span>
                            <span className="text-slate-500 text-sm">({job.companyReviews} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsBookmarked(!isBookmarked)}
                          className={`${isBookmarked ? "bg-blue-50 border-blue-200 text-blue-600" : ""}`}
                        >
                          <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                          {isBookmarked ? "Saved" : "Save"}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleShare("link")}>
                              <LinkIcon className="w-4 h-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare("email")}>
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center text-slate-600 dark:text-slate-300">
                        <MapPin className="w-5 h-5 mr-2 text-slate-400" />
                        <div>
                          <div className="font-medium">{job.location}</div>
                          {job.remote && <div className="text-sm text-green-600">Remote Available</div>}
                        </div>
                      </div>
                      <div className="flex items-center text-slate-600 dark:text-slate-300">
                        <Briefcase className="w-5 h-5 mr-2 text-slate-400" />
                        <div>
                          <div className="font-medium">{job.experience}</div>
                          <div className="text-sm text-slate-500">{job.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-slate-600 dark:text-slate-300">
                        <IndianRupee className="w-5 h-5 mr-2 text-slate-400" />
                        <div>
                          <div className="font-medium">{job.salary}</div>
                          <div className="text-sm text-slate-500">Per Annum</div>
                        </div>
                      </div>
                      <div className="flex items-center text-slate-600 dark:text-slate-300">
                        <Clock className="w-5 h-5 mr-2 text-slate-400" />
                        <div>
                          <div className="font-medium">{job.posted}</div>
                          <div className="text-sm text-slate-500">{job.applicants} applicants</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                  <Button
                    onClick={handleApply}
                    className={`w-full ${
                      sampleJobManager.hasApplied(job.id.toString())
                        ? 'bg-green-600 hover:bg-green-700 cursor-default'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    }`}
                    disabled={sampleJobManager.hasApplied(job.id.toString())}
                  >
                    {sampleJobManager.hasApplied(job.id.toString()) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Applied
                      </>
                    ) : (
                      'Apply Now'
                    )}
                  </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Job Description */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">Job Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <div className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed">
                        {job.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Requirements */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">Benefits & Perks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {job.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <Award className="w-5 h-5 text-blue-600 mr-3" />
                          <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Company Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle>About {job.company}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{job.aboutCompany}</p>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Industry</span>
                        <span className="font-medium">{job.industry}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Company Size</span>
                        <span className="font-medium">{job.companySize}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Founded</span>
                        <span className="font-medium">{job.founded}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Website</span>
                        <span className="font-medium text-blue-600">{job.website}</span>
                      </div>
                    </div>
                    <Link href={`/companies/${job.companyId}`}>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Building2 className="w-4 h-4 mr-2" />
                        View Company Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Application Tips */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-blue-700 dark:text-blue-300">Application Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          Tailor your resume to highlight relevant experience
                        </div>
                      </div>
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          Include a compelling cover letter
                        </div>
                      </div>
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          Research the company culture and values
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Similar Jobs */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle>Similar Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {similarJobs.map((similarJob) => (
                        <Link key={similarJob.id} href={`/jobs/${similarJob.id}`}>
                          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-start space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={similarJob.logo || "/placeholder.svg"} alt={similarJob.company} />
                                <AvatarFallback>{similarJob.company[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-900 dark:text-white truncate">
                                  {similarJob.title}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{similarJob.company}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-slate-500">{similarJob.location}</span>
                                  <span className="text-xs text-slate-500">•</span>
                                  <span className="text-xs text-slate-500">{similarJob.salary}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to apply for jobs. Please register or login to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 mt-6">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Register Now
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">JobPortal</span>
              </div>
              <p className="text-slate-400 mb-6">India's leading job portal connecting talent with opportunities.</p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>

            {[
              {
                title: "For Job Seekers",
                links: ["Browse Jobs", "Career Advice", "Resume Builder", "Salary Guide"],
              },
              {
                title: "For Employers",
                links: ["Post Jobs", "Search Resumes", "Recruitment Solutions", "Pricing"],
              },
              {
                title: "Company",
                links: ["About Us", "Contact", "Privacy Policy", "Terms of Service"],
              },
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-6 text-lg">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href="#" className="text-slate-400 hover:text-white transition-colors hover:underline">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2025 JobPortal. All rights reserved. Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
