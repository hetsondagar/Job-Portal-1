"use client"

import { useState } from "react"
import {
  Search,
  MapPin,
  Briefcase,
  Filter,
  SlidersHorizontal,
  Clock,
  Users,
  IndianRupee,
  Zap,
  Sparkles,
  Star,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

export default function JobsPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const jobs = [
    {
      id: 1,
      title: "Senior Full Stack Developer",
      company: "TechCorp Solutions",
      location: "Bangalore",
      experience: "4-7 years",
      salary: "15-25 LPA",
      skills: ["React", "Node.js", "Python", "AWS"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "2 days ago",
      applicants: 45,
      description: "We are looking for a skilled Full Stack Developer to join our dynamic team...",
      type: "Full-time",
      remote: true,
      urgent: false,
      featured: true,
      companyRating: 4.2,
    },
    {
      id: 2,
      title: "Product Manager - Growth",
      company: "InnovateTech",
      location: "Mumbai",
      experience: "5-8 years",
      salary: "20-35 LPA",
      skills: ["Product Strategy", "Analytics", "Leadership", "Growth Hacking"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "1 day ago",
      applicants: 32,
      description: "Drive product growth and user acquisition strategies...",
      type: "Full-time",
      remote: false,
      urgent: true,
      featured: false,
      companyRating: 4.5,
    },
    {
      id: 3,
      title: "Data Scientist - ML",
      company: "DataDriven Inc",
      location: "Hyderabad",
      experience: "3-6 years",
      salary: "12-22 LPA",
      skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "3 days ago",
      applicants: 28,
      description: "Build and deploy machine learning models at scale...",
      type: "Full-time",
      remote: true,
      urgent: false,
      featured: false,
      companyRating: 4.1,
    },
    {
      id: 4,
      title: "Frontend Developer",
      company: "WebSolutions Ltd",
      location: "Pune",
      experience: "2-4 years",
      salary: "8-15 LPA",
      skills: ["React", "TypeScript", "CSS", "Next.js"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "1 day ago",
      applicants: 67,
      description: "Create beautiful and responsive user interfaces...",
      type: "Full-time",
      remote: true,
      urgent: true,
      featured: true,
      companyRating: 4.3,
    },
    {
      id: 5,
      title: "DevOps Engineer",
      company: "CloudTech Systems",
      location: "Chennai",
      experience: "3-5 years",
      salary: "10-18 LPA",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "4 days ago",
      applicants: 23,
      description: "Manage cloud infrastructure and deployment pipelines...",
      type: "Full-time",
      remote: false,
      urgent: false,
      featured: false,
      companyRating: 4.0,
    },
    {
      id: 6,
      title: "UX Designer",
      company: "DesignStudio Pro",
      location: "Delhi",
      experience: "2-5 years",
      salary: "6-12 LPA",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "2 days ago",
      applicants: 41,
      description: "Design intuitive user experiences for digital products...",
      type: "Full-time",
      remote: true,
      urgent: true,
      featured: false,
      companyRating: 4.4,
    },
  ]

  const experienceLevels = ["0-1 years", "1-3 years", "3-5 years", "5-7 years", "7-10 years", "10+ years"]
  const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote"]
  const locations = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad"]

  const handleApply = (jobId: number) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
    } else {
      console.log(`Applying for job ${jobId}...`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* Header */}
      <div className="pt-20 pb-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">Find Your Dream Job</h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300">
              Discover opportunities that match your skills and aspirations
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col lg:flex-row gap-4"
          >
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  placeholder="Job title, keywords, or company"
                  className="pl-10 sm:pl-12 h-10 sm:h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm text-sm sm:text-base"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  placeholder="Location"
                  className="pl-10 sm:pl-12 h-10 sm:h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm text-sm sm:text-base"
                />
              </div>
              <Button className="h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-sm sm:text-base">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Search Jobs
              </Button>
            </div>
            <Button
              variant="outline"
              className="lg:hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Filters
            </Button>
          </motion.div>
        </div>
      </div>

      {/* JobAtPace Premium Banner */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/jobatpace">
            <div className="flex flex-col sm:flex-row items-center justify-between text-white cursor-pointer group">
              <div className="flex items-center mb-2 sm:mb-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="font-semibold text-sm sm:text-base">JobAtPace Premium</span>
                <span className="ml-2 text-xs sm:text-sm opacity-90">Get priority applications & exclusive jobs</span>
              </div>
              <Button
                size="sm"
                className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg transition-all duration-300 group-hover:scale-105 text-xs sm:text-sm"
              >
                Upgrade Now
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              </Button>
            </div>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex gap-6 sm:gap-8">
          {/* Filters Sidebar */}
          <div className={`w-full lg:w-80 space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="sticky top-24">
              <Card className="border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Experience Level */}
                  <div>
                    <h3 className="font-semibold mb-3 text-sm sm:text-base">Experience Level</h3>
                    <div className="space-y-2">
                      {experienceLevels.map((level) => (
                        <div key={level} className="flex items-center space-x-2">
                          <Checkbox id={level} />
                          <label
                            htmlFor={level}
                            className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            {level}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Job Type */}
                  <div>
                    <h3 className="font-semibold mb-3 text-sm sm:text-base">Job Type</h3>
                    <div className="space-y-2">
                      {jobTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox id={type} />
                          <label
                            htmlFor={type}
                            className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Location */}
                  <div>
                    <h3 className="font-semibold mb-3 text-sm sm:text-base">Location</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {locations.map((location) => (
                        <div key={location} className="flex items-center space-x-2">
                          <Checkbox id={location} />
                          <label
                            htmlFor={location}
                            className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            {location}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Salary Range */}
                  <div>
                    <h3 className="font-semibold mb-3 text-sm sm:text-base">Salary Range</h3>
                    <Select>
                      <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm">
                        <SelectValue placeholder="Select salary range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-5">0-5 LPA</SelectItem>
                        <SelectItem value="5-10">5-10 LPA</SelectItem>
                        <SelectItem value="10-15">10-15 LPA</SelectItem>
                        <SelectItem value="15-25">15-25 LPA</SelectItem>
                        <SelectItem value="25+">25+ LPA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Job Listings */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Job Opportunities</h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{jobs.length} jobs found</p>
              </div>
              <Select defaultValue="recent">
                <SelectTrigger className="w-full sm:w-48 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="relevant">Most Relevant</SelectItem>
                  <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                  <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                >
                  <Link href={`/jobs/${job.id}`}>
                    <Card
                      className={`group cursor-pointer border-0 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative ${
                        job.urgent
                          ? "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 ring-2 ring-red-200 dark:ring-red-800 shadow-red-500/10"
                          : "bg-white/70 dark:bg-slate-800/70 hover:shadow-blue-500/10"
                      }`}
                    >
                      {/* Badges positioned to avoid overlap */}
                      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                        {job.urgent && (
                          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Urgent Hiring
                          </Badge>
                        )}
                        {job.featured && !job.urgent && (
                          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col lg:flex-row gap-4">
                          <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <Avatar className="w-12 h-12 sm:w-16 sm:h-16 ring-2 ring-white/50 group-hover:ring-4 transition-all duration-300 flex-shrink-0">
                              <AvatarImage src={job.logo || "/placeholder.svg"} alt={job.company} />
                              <AvatarFallback>{job.company[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`text-lg sm:text-xl lg:text-2xl font-bold mb-2 transition-colors duration-300 ${
                                  job.urgent
                                    ? "text-red-700 dark:text-red-400"
                                    : "text-slate-900 dark:text-white group-hover:text-blue-600"
                                } line-clamp-2`}
                              >
                                {job.title}
                              </h3>
                              <div className="flex items-center space-x-2 mb-3">
                                <p className="text-slate-600 dark:text-slate-300 font-medium text-sm sm:text-base lg:text-lg truncate">
                                  {job.company}
                                </p>
                                <div className="flex items-center flex-shrink-0">
                                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current mr-1" />
                                  <span className="text-xs sm:text-sm font-medium">{job.companyRating}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-600 dark:text-slate-300 mb-4 text-xs sm:text-sm">
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                                  <span className="truncate">{job.location}</span>
                                  {job.remote && (
                                    <Badge
                                      variant="secondary"
                                      className="ml-2 text-xs bg-green-50 text-green-700 border-green-200"
                                    >
                                      Remote
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                                  <span className="truncate">{job.experience}</span>
                                </div>
                                <div className="flex items-center">
                                  <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                                  <span className="truncate">{job.salary}</span>
                                </div>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 mb-4 line-clamp-2 leading-relaxed text-sm sm:text-base">
                                {job.description}
                              </p>
                              <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                                {job.skills.slice(0, 4).map((skill, skillIndex) => (
                                  <Badge
                                    key={skillIndex}
                                    variant="secondary"
                                    className="text-xs bg-slate-100 dark:bg-slate-700"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills.length > 4 && (
                                  <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700">
                                    +{job.skills.length - 4}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action buttons positioned at bottom right */}
                          <div className="flex flex-col justify-end items-end space-y-2 lg:space-y-3 flex-shrink-0">
                            <Button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleApply(job.id)
                              }}
                              className={`w-full sm:w-auto h-9 sm:h-10 px-4 sm:px-6 transition-all duration-300 transform hover:scale-105 text-sm ${
                                job.urgent
                                  ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25"
                                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/25"
                              }`}
                            >
                              Apply Now
                            </Button>
                            {!isAuthenticated && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setShowAuthDialog(true)
                                  }}
                                  className="text-xs"
                                >
                                  Register
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setShowAuthDialog(true)
                                  }}
                                  className="text-xs"
                                >
                                  Login
                                </Button>
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-xs"
                            >
                              Save Job
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 gap-2">
                          <div className="flex items-center space-x-4 text-xs sm:text-sm text-slate-500">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span>{job.posted}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span>{job.applicants} applicants</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {job.type}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8 sm:mt-12">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  disabled
                  className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-sm"
                >
                  Previous
                </Button>
                <Button className="bg-blue-600 text-white text-sm">1</Button>
                <Button variant="outline" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-sm">
                  2
                </Button>
                <Button variant="outline" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-sm">
                  3
                </Button>
                <Button variant="outline" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to apply for jobs. Please register or login to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 mt-6">
            <Link href="/register">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Register Now
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full bg-transparent">
                Login
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold">JobPortal</span>
              </div>
              <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">
                India's leading job portal connecting talent with opportunities.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-xs sm:text-sm">f</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-xs sm:text-sm">t</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-xs sm:text-sm">in</span>
                </div>
              </div>
            </div>

            {[
              {
                title: "For Job Seekers",
                links: ["Browse Jobs", "Career Advice", "Resume Builder", "Salary Guide", "JobAtPace Premium"],
              },
              {
                title: "For Employers",
                links: ["Post Jobs", "Search Resumes", "Recruitment Solutions", "Pricing", "TalentPulse"],
              },
              {
                title: "Company",
                links: ["About Us", "Contact", "Privacy Policy", "Terms of Service"],
              },
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4 sm:mb-6 text-base sm:text-lg">{section.title}</h3>
                <ul className="space-y-2 sm:space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href="#"
                        className="text-slate-400 hover:text-white transition-colors hover:underline text-sm sm:text-base"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-slate-400">
            <p className="text-sm sm:text-base">&copy; 2025 JobPortal. All rights reserved. Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
