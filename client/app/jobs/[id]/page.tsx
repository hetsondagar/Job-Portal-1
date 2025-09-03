"use client"

import { useState, useEffect, useMemo } from "react"
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
  X,
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
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(false)
  const [jobLoading, setJobLoading] = useState(true)
  const [job, setJob] = useState<any | null>(null)

  const jobIdFromParams = (params?.id as string) || ''

  // Load job data by id (API first, fallback to sample bookmark/application data)
  useEffect(() => {
    let isMounted = true
    const loadJob = async () => {
      setJobLoading(true)
      try {
        if (jobIdFromParams) {
          const res = await apiService.getJobById(jobIdFromParams)
          if (isMounted && res.success && res.data) {
            setJob(res.data)
            setJobLoading(false)
            return
          }
        }
      } catch (e) {
        // ignore and fallback
      }

      // Fallback: try to hydrate from sample bookmarks/applications
      let fallback: any | null = null
      const bookmarks = sampleJobManager.getBookmarks()
      const apps = sampleJobManager.getApplications()
      const b = bookmarks.find(bm => bm.jobId === jobIdFromParams)
      if (b) {
        fallback = {
          id: b.jobId,
          title: b.jobTitle,
          company: b.companyName,
          companyId: "",
          companyLogo: "/placeholder.svg?height=80&width=80",
          location: b.location,
          experience: "",
          salary: b.salary,
          skills: [],
          posted: "",
          applicants: 0,
          description: "",
          requirements: [],
          benefits: [],
          type: b.type,
          remote: false,
          department: "",
          companySize: "",
          companyRating: 0,
          companyReviews: 0,
          industry: "",
          founded: "",
          website: "",
          aboutCompany: "",
        }
      } else {
        const a = apps.find(ap => ap.jobId === jobIdFromParams)
        if (a) {
          fallback = {
            id: a.jobId,
            title: a.jobTitle,
            company: a.companyName,
            companyId: "",
            companyLogo: "/placeholder.svg?height=80&width=80",
            location: a.location,
            experience: "",
            salary: a.salary,
            skills: [],
            posted: "",
            applicants: 0,
            description: "",
            requirements: [],
            benefits: [],
            type: a.type,
            remote: false,
            department: "",
            companySize: "",
            companyRating: 0,
            companyReviews: 0,
            industry: "",
            founded: "",
            website: "",
            aboutCompany: "",
          }
        }
      }

      if (isMounted) {
        setJob(fallback)
        setJobLoading(false)
      }
    }

    loadJob()
    return () => { isMounted = false }
  }, [jobIdFromParams])

  const hasApplied = useMemo(() => sampleJobManager.hasApplied(jobIdFromParams), [jobIdFromParams, forceUpdate])

  const handleApply = async () => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }

    try {
      if (jobIdFromParams.startsWith('550e8400')) {
        sampleJobManager.addApplication({
          jobId: jobIdFromParams,
          jobTitle: job?.title || 'Job',
          companyName: typeof job?.company === 'string' ? job?.company : (job?.company?.name || 'Company'),
          location: job?.location || '',
          salary: job?.salary || '',
          type: job?.type || ''
        })
        toast.success(`Application submitted successfully${job?.title ? ` for ${job.title}` : ''}!`)
        setForceUpdate(prev => !prev)
        return
      }

      const response = await apiService.applyJob(jobIdFromParams)
      if (response.success) {
        toast.success(`Application submitted successfully${job?.title ? ` for ${job.title}` : ''}!`)
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
    const jobUrl = `${window.location.origin}/jobs/${jobIdFromParams}`
    const shareText = `Check out this ${job?.title || 'job'} position${job?.company ? ` at ${typeof job.company === 'string' ? job.company : job.company?.name}` : ''}!`

    switch (platform) {
      case "link":
        navigator.clipboard.writeText(jobUrl)
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
    const referrer = document.referrer
    if (referrer.includes(`/companies/${job?.companyId}/departments/`)) {
      router.back()
    } else {
      router.push("/jobs")
    }
  }

  if (jobLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />
        <div className="pt-16 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-40 animate-pulse bg-white/60 dark:bg-slate-800/60 rounded-xl" />
          </div>
        </div>
      </div>
    )
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
                          <AvatarImage src={job?.companyLogo || "/placeholder.svg"} alt={typeof job?.company === 'string' ? job?.company : (job?.company?.name || 'Company')} />
                          <AvatarFallback className="text-xl font-bold text-blue-600">{(typeof job?.company === 'string' ? job?.company : job?.company?.name || 'C')[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{job?.title || 'Job'}</h1>
                          {job?.company && (
                            <Link
                              href={`/companies/${job?.companyId || ''}`}
                              className="text-xl text-blue-600 hover:text-blue-700 font-medium mb-3 inline-block"
                            >
                              {typeof job.company === 'string' ? job.company : job.company?.name}
                            </Link>
                          )}
                          <div className="flex items-center space-x-1 mb-4">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-semibold">{job?.companyRating || 0}</span>
                            <span className="text-slate-500 text-sm">({job?.companyReviews || 0} reviews)</span>
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
                          <div className="font-medium">{job?.location || '—'}</div>
                          {job?.remote && <div className="text-sm text-green-600">Remote Available</div>}
                        </div>
                      </div>
                      <div className="flex items-center text-slate-600 dark:text-slate-300">
                        <Briefcase className="w-5 h-5 mr-2 text-slate-400" />
                        <div>
                          <div className="font-medium">{job?.experience || '—'}</div>
                          <div className="text-sm text-slate-500">{job?.type || '—'}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-slate-600 dark:text-slate-300">
                        <IndianRupee className="w-5 h-5 mr-2 text-slate-400" />
                        <div>
                          <div className="font-medium">{job?.salary || '—'}</div>
                          <div className="text-sm text-slate-500">Per Annum</div>
                        </div>
                      </div>
                      <div className="flex items-center text-slate-600 dark:text-slate-300">
                        <Clock className="w-5 h-5 mr-2 text-slate-400" />
                        <div>
                          <div className="font-medium">{job?.posted || '—'}</div>
                          <div className="text-sm text-slate-500">{job?.applicants || 0} applicants</div>
                        </div>
                      </div>
                    </div>

                    {Array.isArray(job?.skills) && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {job.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button
                      onClick={handleApply}
                      className={`w-full ${
                        hasApplied
                          ? 'bg-green-600 hover:bg-green-700 cursor-default'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      }`}
                      disabled={hasApplied}
                    >
                      {hasApplied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Applied
                        </>
                      ) : (
                        'Apply Now'
                      )}
                    </Button>

                    {hasApplied && (
                      <Button
                        onClick={() => {
                          if (sampleJobManager.removeApplication(jobIdFromParams)) {
                            toast.success('Application withdrawn successfully')
                            setForceUpdate(prev => !prev)
                          } else {
                            toast.error('Failed to withdraw application')
                          }
                        }}
                        variant="outline"
                        className="w-full mt-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Withdraw Application
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Job Description */}
              {job?.description && (
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
              )}

              {/* Requirements */}
              {Array.isArray(job?.requirements) && job.requirements.length > 0 && (
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
                        {job.requirements.map((req: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Benefits */}
              {Array.isArray(job?.benefits) && job.benefits.length > 0 && (
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
                        {job.benefits.map((benefit: string, index: number) => (
                          <div key={index} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <Award className="w-5 h-5 text-blue-600 mr-3" />
                            <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Company Info */}
              {job?.aboutCompany && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl">
                    <CardHeader>
                      <CardTitle>About {typeof job.company === 'string' ? job.company : job.company?.name}</CardTitle>
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
                      <Link href={`/companies/${job.companyId || ''}`}>
                        <Button variant="outline" className="w-full bg-transparent">
                          <Building2 className="w-4 h-4 mr-2" />
                          View Company Profile
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

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

              {/* Similar Jobs (static placeholder) */}
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
                      {[1,2,3].map((n) => (
                        <div key={n} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-600 rounded mb-2" />
                          <div className="h-3 w-64 bg-slate-200 dark:bg-slate-600 rounded" />
                        </div>
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
            <Link href="/register" className="w-full">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Register Now
              </Button>
            </Link>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full bg-transparent">
                Login
              </Button>
            </Link>
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
