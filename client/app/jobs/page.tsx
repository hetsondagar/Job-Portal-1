"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
  X,
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

// Types for state management
interface FilterState {
  search: string
  location: string
  experienceLevels: string[]
  jobTypes: string[]
  locations: string[]
  salaryRange: string
  category: string
  type: string
}

interface Job {
  id: number
  title: string
  company: string
  location: string
  experience: string
  salary: string
  skills: string[]
  logo: string
  posted: string
  applicants: number
  description: string
  type: string
  remote: boolean
  urgent: boolean
  featured: boolean
  companyRating: number
  category: string
}

export default function JobsPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sortBy, setSortBy] = useState("recent")

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "",
    experienceLevels: [],
    jobTypes: [],
    locations: [],
    salaryRange: "",
    category: "",
    type: "",
  })

  // Check URL parameters for filters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const category = urlParams.get('category')
                  const type = urlParams.get('type')
            const location = urlParams.get('location')

            if (category) {
              setFilters(prev => ({ ...prev, category }))
            }
            if (type) {
              setFilters(prev => ({ ...prev, type }))
            }
            if (location) {
              setFilters(prev => ({ ...prev, location }))
            }
    }
  }, [])

  const experienceLevels = [
    "Fresher",
    "1-3 years",
    "3-5 years",
    "5-8 years",
    "8-12 years",
    "12+ years",
  ]

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Remote",
    "Work from home",
  ]

  const locations = [
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Gurgaon",
    "Noida",
    "Kolkata",
    "Ahmedabad",
    "Remote",
    "Work from home",
  ]

  const jobs: Job[] = [
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
      category: "software",
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
      category: "product",
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
      category: "data",
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
      applicants: 38,
      description: "Create beautiful and responsive user interfaces...",
      type: "Full-time",
      remote: false,
      urgent: false,
      featured: true,
      companyRating: 4.3,
      category: "software",
    },
    {
      id: 5,
      title: "UX Designer",
      company: "DesignStudio",
      location: "Delhi",
      experience: "3-5 years",
      salary: "10-18 LPA",
      skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "2 days ago",
      applicants: 25,
      description: "Design intuitive and engaging user experiences...",
      type: "Full-time",
      remote: true,
      urgent: false,
      featured: false,
      companyRating: 4.0,
      category: "design",
    },
    {
      id: 6,
      title: "DevOps Engineer",
      company: "CloudTech",
      location: "Bangalore",
      experience: "4-6 years",
      salary: "18-28 LPA",
      skills: ["Docker", "Kubernetes", "AWS", "Jenkins"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "1 day ago",
      applicants: 22,
      description: "Build and maintain scalable infrastructure...",
      type: "Full-time",
      remote: false,
      urgent: true,
      featured: false,
      companyRating: 4.4,
      category: "devops",
    },
    {
      id: 7,
      title: "Sales Manager",
      company: "SalesForce Inc",
      location: "Mumbai",
      experience: "5-8 years",
      salary: "15-25 LPA",
      skills: ["Sales Strategy", "CRM", "Leadership", "Client Relations"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "3 days ago",
      applicants: 35,
      description: "Lead sales team and drive revenue growth...",
      type: "Full-time",
      remote: false,
      urgent: false,
      featured: true,
      companyRating: 4.2,
      category: "sales",
    },
    {
      id: 8,
      title: "Marketing Specialist",
      company: "Digital Marketing Pro",
      location: "Gurgaon",
      experience: "2-4 years",
      salary: "6-12 LPA",
      skills: ["Digital Marketing", "SEO", "Social Media", "Analytics"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "2 days ago",
      applicants: 42,
      description: "Execute digital marketing campaigns...",
      type: "Full-time",
      remote: true,
      urgent: false,
      featured: false,
      companyRating: 3.9,
      category: "marketing",
    },
  ]

  // Filter functions
  const handleFilterChange = useCallback((filterType: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }, [])

  const handleExperienceToggle = useCallback((level: string) => {
    setFilters(prev => ({
      ...prev,
      experienceLevels: prev.experienceLevels.includes(level)
        ? prev.experienceLevels.filter(l => l !== level)
        : [...prev.experienceLevels, level]
    }))
  }, [])

  const handleJobTypeToggle = useCallback((type: string) => {
    setFilters(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(type)
        ? prev.jobTypes.filter(t => t !== type)
        : [...prev.jobTypes, type]
    }))
  }, [])

  const handleLocationToggle = useCallback((location: string) => {
    setFilters(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location]
    }))
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({
      search: "",
      location: "",
      experienceLevels: [],
      jobTypes: [],
      locations: [],
      salaryRange: "",
      category: "",
      type: "",
    })
  }, [])

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Experience level filter
    if (filters.experienceLevels.length > 0) {
      filtered = filtered.filter(job =>
        filters.experienceLevels.some(level => {
          if (level === "Fresher") return job.experience.includes("0") || job.experience.includes("Fresher")
          if (level === "1-3 years") return job.experience.includes("1-3") || job.experience.includes("2-4")
          if (level === "3-5 years") return job.experience.includes("3-5") || job.experience.includes("4-6")
          if (level === "5-8 years") return job.experience.includes("5-8") || job.experience.includes("6-8")
          if (level === "8-12 years") return job.experience.includes("8-12") || job.experience.includes("8+")
          if (level === "12+ years") return job.experience.includes("12+") || job.experience.includes("10+")
          return false
        })
      )
    }

    // Job type filter
    if (filters.jobTypes.length > 0) {
      filtered = filtered.filter(job =>
        filters.jobTypes.some(type => {
          if (type === "Remote") return job.remote
          if (type === "Work from home") return job.remote
          return job.type === type
        })
      )
    }

    // Location filter (from checkbox)
    if (filters.locations.length > 0) {
      filtered = filtered.filter(job =>
        filters.locations.some(location => {
          if (location === "Remote") return job.remote
          if (location === "Work from home") return job.remote
          return job.location === location
        })
      )
    }

    // Salary range filter
    if (filters.salaryRange) {
      filtered = filtered.filter(job => {
        const range = filters.salaryRange
        if (range === "0-5") return job.salary.includes("3-") || job.salary.includes("4-") || job.salary.includes("5")
        if (range === "5-10") return job.salary.includes("6-") || job.salary.includes("8-") || job.salary.includes("10")
        if (range === "10-15") return job.salary.includes("12-") || job.salary.includes("15")
        if (range === "15-25") return job.salary.includes("18-") || job.salary.includes("20-") || job.salary.includes("25")
        if (range === "25+") return job.salary.includes("25+") || job.salary.includes("30") || job.salary.includes("35")
        return true
      })
    }

    // Category filter (from URL)
    if (filters.category) {
      filtered = filtered.filter(job => job.category === filters.category)
    }

    // Type filter (from URL)
    if (filters.type) {
      filtered = filtered.filter(job => {
        if (filters.type === "fresher") return job.experience.includes("0") || job.experience.includes("Fresher")
        if (filters.type === "remote") return job.remote
        if (filters.type === "wfh") return job.remote
        if (filters.type === "walkin") return job.type === "Walk-in"
        if (filters.type === "parttime") return job.type === "Part-time"
        return job.type === filters.type
      })
    }

    // Sort jobs
    switch (sortBy) {
      case "recent":
        // Sort by posted date (mock implementation)
        filtered.sort((a, b) => {
          const aDays = parseInt(a.posted.split(' ')[0])
          const bDays = parseInt(b.posted.split(' ')[0])
          return aDays - bDays
        })
        break
      case "relevant":
        // Sort by company rating
        filtered.sort((a, b) => b.companyRating - a.companyRating)
        break
      case "salary-high":
        // Sort by salary (mock implementation)
        filtered.sort((a, b) => {
          const aSalary = parseInt(a.salary.split('-')[1])
          const bSalary = parseInt(b.salary.split('-')[1])
          return bSalary - aSalary
        })
        break
      case "salary-low":
        // Sort by salary (mock implementation)
        filtered.sort((a, b) => {
          const aSalary = parseInt(a.salary.split('-')[0])
          const bSalary = parseInt(b.salary.split('-')[0])
          return aSalary - bSalary
        })
        break
      default:
        filtered.sort((a, b) => {
          const aDays = parseInt(a.posted.split(' ')[0])
          const bDays = parseInt(b.posted.split(' ')[0])
          return aDays - bDays
        })
    }

    return filtered
  }, [jobs, filters, sortBy])

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
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 sm:pl-12 h-10 sm:h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm text-sm sm:text-base"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
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
          {/* Filters Sidebar - Sticky */}
          <div className={`w-full lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="sticky top-32 z-10 h-fit">
              <Card className="border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                    <div className="flex items-center">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Filters
                    </div>
                    <div className="flex items-center gap-2">
                      {(filters.experienceLevels.length > 0 || filters.jobTypes.length > 0 || filters.locations.length > 0 || filters.salaryRange || filters.category || filters.type) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Clear
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                        className="lg:hidden text-slate-500 hover:text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-4 sm:space-y-6">
                      {/* Experience Level */}
                      <div>
                        <h3 className="font-semibold mb-3 text-sm sm:text-base">Experience Level</h3>
                        <div className="space-y-2">
                          {experienceLevels.map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={level} 
                                  checked={filters.experienceLevels.includes(level)}
                                  onCheckedChange={() => handleExperienceToggle(level)}
                                />
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
                                <Checkbox 
                                  id={type} 
                                  checked={filters.jobTypes.includes(type)}
                                  onCheckedChange={() => handleJobTypeToggle(type)}
                                />
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
                        <div className="space-y-2">
                          {locations.map((location) => (
                            <div key={location} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={location} 
                                  checked={filters.locations.includes(location)}
                                  onCheckedChange={() => handleLocationToggle(location)}
                                />
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
                          <Select value={filters.salaryRange} onValueChange={(value) => handleFilterChange("salaryRange", value)}>
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Job Listings */}
          <div className="flex-1 min-w-0">
            {/* Active Filters Summary */}
            {(filters.experienceLevels.length > 0 || filters.jobTypes.length > 0 || filters.locations.length > 0 || filters.salaryRange || filters.category || filters.type) && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Active Filters:</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.category && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                      Category: {filters.category}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("category", "")} />
                    </Badge>
                  )}
                  {filters.type && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                      Type: {filters.type}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("type", "")} />
                    </Badge>
                  )}
                  {filters.experienceLevels.map((level) => (
                    <Badge key={level} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                      Experience: {level}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleExperienceToggle(level)} />
                    </Badge>
                  ))}
                  {filters.jobTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                      Type: {type}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleJobTypeToggle(type)} />
                    </Badge>
                  ))}
                  {filters.locations.map((location) => (
                    <Badge key={location} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                      Location: {location}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleLocationToggle(location)} />
                    </Badge>
                  ))}
                  {filters.salaryRange && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                      Salary: {filters.salaryRange} LPA
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("salaryRange", "")} />
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-auto gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Job Opportunities</h1>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{filteredJobs.length} jobs found</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
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
            </div>

            {/* No Results Message */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No jobs found</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Try adjusting your filters or search terms to find more jobs.
                </p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
            <div className="space-y-4 sm:space-y-6 min-h-screen">
                {filteredJobs.map((job, index) => (
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
                                      +{job.skills.length - 4} more
                                  </Badge>
                                )}
                              </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 gap-2">
                                  <div className="flex items-center space-x-4">
                                    <span className="text-xs sm:text-sm text-slate-500">
                                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                                      {job.posted}
                                    </span>
                                    <span className="text-xs sm:text-sm text-slate-500">
                                      <Users className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                                      {job.applicants} applicants
                                    </span>
                            </div>
                                  <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                  }}
                                      className="text-xs sm:text-sm"
                                >
                                      Save
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                        handleApply(job.id)
                                      }}
                                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs sm:text-sm"
                                    >
                                      Apply Now
                            </Button>
                          </div>
                        </div>
                            </div>
                            </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
            )}
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
      <footer className="bg-slate-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">JobPortal</h3>
              <p className="text-slate-300 text-sm">
                India's leading job portal connecting talent with opportunities.
              </p>
                </div>
            <div>
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Create Profile</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Job Alerts</Link></li>
                <li><Link href="/career-advice" className="hover:text-white transition-colors">Career Advice</Link></li>
              </ul>
                </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link href="/employer-dashboard/post-job" className="hover:text-white transition-colors">Post a Job</Link></li>
                <li><Link href="/employer-dashboard/requirements" className="hover:text-white transition-colors">Browse Candidates</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/resources" className="hover:text-white transition-colors">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 JobPortal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
