"use client"

import { useState, useEffect } from "react"
import {
  Search,
  MapPin,
  Briefcase,
  Users,
  Star,
  Clock,
  IndianRupee,
  Sparkles,
  ArrowRight,
  Play,
  Building2,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Crown,
  CheckCircle,
  TrendingUp,
  Award,
  Globe,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { apiService } from "@/lib/api"

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isStickyVisible, setIsStickyVisible] = useState(false)
  const [showAllJobRoles, setShowAllJobRoles] = useState(false)
  
  // Animation states for sections
  const [animatedSections, setAnimatedSections] = useState({
    hero: false,
    stats: false,
    companies: false,
    featuredJobs: false,
    testimonials: false,
    features: false,
    cta: false
  })

  // Search functionality
  const handleSearch = () => {
    if (searchQuery.trim() || location.trim()) {
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.append("q", searchQuery.trim())
      if (location.trim()) params.append("location", location.trim())
      window.location.href = `/jobs?${params.toString()}`
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const heroTexts = [
    "Find Your Dream Job",
    "Build Your Career",
    "Shape Your Future"
  ]

  const heroSubtitles = [
    "Discover opportunities from top companies worldwide",
    "Connect with industry leaders and grow professionally",
    "Join millions of professionals achieving their goals"
  ]

  const heroGradients = [
    "from-blue-600 via-purple-600 to-indigo-800",
    "from-emerald-600 via-teal-600 to-cyan-800",
    "from-orange-600 via-red-600 to-pink-800"
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  // Enhanced scroll event listener for animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      
      // Sticky search bar
      setIsStickyVisible(scrollY > 300)
      
      // Section animations
      const sections = {
        hero: 0,
        stats: windowHeight * 0.3,
        companies: windowHeight * 1.2,
        featuredJobs: windowHeight * 2.0,
        testimonials: windowHeight * 2.8,
        features: windowHeight * 3.6,
        cta: windowHeight * 4.4
      }
      
      setAnimatedSections(prev => ({
        hero: true, // Always animated
        stats: scrollY > sections.stats,
        companies: scrollY > sections.companies,
        featuredJobs: scrollY > sections.featuredJobs,
        testimonials: scrollY > sections.testimonials,
        features: scrollY > sections.features,
        cta: scrollY > sections.cta
      }))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Trigger initial check
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const [stats, setStats] = useState([
    { value: "—", label: "Active Jobs", icon: Briefcase },
    { value: "—", label: "Companies", icon: Building2 },
    { value: "—", label: "Professionals", icon: Users },
    { value: "—", label: "Success Rate", icon: Star },
  ])

  const [topCompanies, setTopCompanies] = useState<any[]>([])

  const [featuredJobs, setFeaturedJobs] = useState<any[]>([])

  const [featuredCompanies, setFeaturedCompanies] = useState<any[]>([])

  const [trendingJobRoles, setTrendingJobRoles] = useState<any[]>([])

  const getSectorColor = (sector: string) => {
    switch (sector) {
      case "technology":
        return "from-blue-500 to-cyan-500"
      case "finance":
        return "from-green-500 to-emerald-500"
      case "healthcare":
        return "from-blue-500 to-indigo-500"
      case "ecommerce":
        return "from-orange-500 to-red-500"
      case "automotive":
        return "from-slate-500 to-gray-500"
      case "oil-gas":
        return "from-purple-500 to-pink-500"
      default:
        return "from-slate-500 to-gray-500"
    }
  }

  const scrollCompanies = (direction: 'left' | 'right') => {
    const container = document.getElementById('companies-container')
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  // Fetch real data for landing
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const companiesResp = await apiService.listCompanies({ limit: 20, offset: 0 })
        if (companiesResp.success && Array.isArray(companiesResp.data)) {
          const mapped = companiesResp.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            industry: c.industry || 'General',
            openings: c.activeJobsCount || 0,
            rating: c.rating || 0,
            icon: '🏢',
            color: getSectorColor(((c.industry||'').toLowerCase().includes('tech')?'technology':(c.industry||'').toLowerCase().includes('fin')?'finance':(c.industry||'').toLowerCase().includes('health')?'healthcare':(c.industry||'').toLowerCase().includes('auto')?'automotive':(c.industry||'').toLowerCase().includes('e-com')?'ecommerce':'technology')),
            location: [c.city, c.state, c.country].filter(Boolean).join(', '),
            employees: c.companySize || '',
            logo: '/placeholder.svg?height=40&width=40',
            sector: ((c.industry||'').toLowerCase().includes('tech')?'technology':(c.industry||'').toLowerCase().includes('fin')?'finance':(c.industry||'').toLowerCase().includes('health')?'healthcare':(c.industry||'').toLowerCase().includes('auto')?'automotive':(c.industry||'').toLowerCase().includes('e-com')?'ecommerce':'technology')
          }))
          setTopCompanies(mapped)
          setFeaturedCompanies(mapped)
        } else {
          setTopCompanies([])
          setFeaturedCompanies([])
        }
      } catch {
        setTopCompanies([])
        setFeaturedCompanies([])
      }

      try {
        const jobsResp = await apiService.getJobs({ limit: 12, status: 'active' })
        const list = Array.isArray((jobsResp as any)?.data?.rows) ? (jobsResp as any).data.rows : (Array.isArray((jobsResp as any)?.data) ? (jobsResp as any).data : [])
        const mappedJobs = list.map((j: any) => ({
          id: j.id,
          title: j.title,
          company: j.companyName || j.company?.name || '',
          location: j.location || j.city || j.state || j.country || '—',
          experience: j.experienceLevel || [j.experienceMin, j.experienceMax].filter(Boolean).join('-'),
          salary: j.salary || (j.salaryMin && j.salaryMax ? `${j.salaryMin}-${j.salaryMax}` : ''),
          skills: Array.isArray(j.skills) ? j.skills : [],
          logo: '/placeholder.svg?height=40&width=40',
          posted: j.createdAt || '',
          applicants: j.applications || 0,
          urgent: j.isUrgent || j.is_urgent || false,
          sector: 'technology',
        }))
        setFeaturedJobs(mappedJobs)
        setTrendingJobRoles([])
        setStats((prev) => [
          { ...prev[0], value: String(mappedJobs.length) },
          { ...prev[1], value: String(Math.max(topCompanies.length, featuredCompanies.length)) },
          prev[2],
          prev[3],
        ])
      } catch {
        setFeaturedJobs([])
      }
    }
    load()
    return () => controller.abort()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Enhanced Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-800/5 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-indigo-800/20"></div>
        
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-500"></div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-orange-400/15 to-red-400/15 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-yellow-400/15 to-orange-400/15 rounded-full blur-2xl animate-bounce delay-700"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Enhanced Animated Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentTextIndex}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 1.05 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className={`text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r ${heroGradients[currentTextIndex]} bg-clip-text text-transparent drop-shadow-lg`}
              >
                {heroTexts[currentTextIndex]}
              </motion.h1>
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTextIndex}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 1.05 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeInOut" }}
                className="text-xl sm:text-2xl lg:text-3xl text-slate-600 dark:text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed font-medium"
              >
                {heroSubtitles[currentTextIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Enhanced Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="mb-12"
          >
                         <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 dark:border-slate-700/20 max-w-4xl mx-auto transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-hover:text-blue-500 transition-colors duration-300" />
                  <Input
                    placeholder="Job title, keywords, or company"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-12 h-14 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-500"
                  />
                </div>
                <div className="relative flex-1 group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-hover:text-blue-500 transition-colors duration-300" />
                  <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-12 h-14 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-500"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 rounded-2xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Jobs
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Popular:</span>
                {["Software Engineer", "Sales Manager", "Marketing Specialist", "Business Analyst", "Content Writer", "Operations Manager"].map((skill, index) => (
                  <motion.button
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                    onClick={() => setSearchQuery(skill)}
                    className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all duration-200 font-medium transform hover:scale-105"
                  >
                    {skill}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sticky Search Bar - Appears on scroll */}
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ 
              opacity: isStickyVisible ? 1 : 0, 
              y: isStickyVisible ? 0 : -100 
            }}
            transition={{ duration: 0.3 }}
            className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-lg transform transition-all duration-300 ${
              isStickyVisible ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Job title, keywords, or company"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700 rounded-xl text-sm font-medium"
                  />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700 rounded-xl text-sm font-medium"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 rounded-xl text-sm shadow-lg"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-lg mb-4 group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 transform hover:rotate-3">
                  <stat.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{stat.value}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* JobAtPace Premium Banner */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 py-6 sm:py-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 animate-pulse"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-bounce delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link href="/jobatpace">
            <div className="flex flex-col sm:flex-row items-center justify-between text-white cursor-pointer group">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-white" />
                      </div>
                <div>
                  <div className="font-bold text-lg sm:text-xl mb-1">JobAtPace Premium</div>
                  <div className="text-sm sm:text-base opacity-90">Get priority applications & exclusive jobs</div>
                </div>
                    </div>
                    <Button
                      size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 shadow-xl transition-all duration-300 group-hover:scale-105 font-semibold px-8 py-3 rounded-full"
                    >
                      Upgrade Now
                <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
            </Link>
        </div>
      </div>

      {/* Top Companies Hiring Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: animatedSections.stats ? 1 : 0, y: animatedSections.stats ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Top Companies Hiring</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Explore opportunities with industry leaders and discover your next career move
            </p>
          </motion.div>

          {/* Companies Carousel */}
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={() => scrollCompanies('left')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>
            
            <button
              onClick={() => scrollCompanies('right')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <ChevronRight className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>

            {/* Companies Container */}
            <div
              id="companies-container"
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 px-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {topCompanies.map((company, index) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: animatedSections.companies ? 1 : 0, x: animatedSections.companies ? 0 : 50 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="flex-shrink-0 w-72 sm:w-80"
                >
                  <Link href={`/companies/${company.id}`}>
                                         <Card className={`h-full bg-gradient-to-br ${company.color} backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl dark:hover:shadow-white/20 transition-all duration-500 group cursor-pointer transform hover:scale-105`}>
                    <CardContent className="p-6 text-white relative overflow-hidden">
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-black/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="text-2xl">{company.icon}</span>
                </div>
                          <Badge className="bg-black/30 text-white border-0 backdrop-blur-sm">
                            {company.industry}
                          </Badge>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors duration-200">
                          {company.name}
                        </h3>
                        
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(company.rating)
                                    ? "text-yellow-300 fill-current"
                                    : "text-white/40"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-white/90">
                            {company.rating}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/80">Open Positions</span>
                            <span className="font-semibold text-white">{company.openings}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Button
                            className="bg-black/30 hover:bg-black/40 text-white border-0 shadow-lg transition-all duration-300 group-hover:scale-105 backdrop-blur-sm"
                          >
                            View Jobs
                          </Button>
                          <div className="w-8 h-8 bg-black/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <ArrowRight className="w-4 h-4 text-white" />
                </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                    </Link>
              </motion.div>
            ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/companies">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-2xl">
                View All Companies
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Featured Companies</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Discover opportunities with the most innovative and respected companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCompanies.map((company, index) => (
              <div
                key={company.id}
                className="group transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
              >
                <Link href={`/companies/${company.id}`}>
                  <Card className="cursor-pointer border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                    <CardContent className="p-6 text-center relative h-full flex flex-col justify-between">
                      <div className={`absolute inset-0 bg-gradient-to-br ${getSectorColor(company.sector)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                      <div>
                        <Avatar className="w-16 h-16 mx-auto mb-4 ring-2 ring-white/50 group-hover:ring-4 transition-all duration-300 shadow-lg">
                          <AvatarImage src={company.logo} alt={company.name} />
                          <AvatarFallback className="text-lg font-bold">{company.name[0]}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg group-hover:text-blue-600 transition-colors duration-300">
                          {company.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{company.industry}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">{company.location}</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-center mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(company.rating)
                                    ? "text-yellow-400 fill-current"
                                    : "text-slate-300 dark:text-slate-600"
                                }`}
                              />
                            ))}
                        </div>
                          <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                            {company.rating} ({company.reviews} reviews)
                          </span>
                          </div>
                        <div className="flex items-center justify-between text-sm mb-4">
                          <span className="text-slate-600 dark:text-slate-400">{company.employees}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{company.openings} openings</span>
                          </div>
                        <div className={`w-0 group-hover:w-full h-1 bg-gradient-to-r ${getSectorColor(company.sector)} transition-all duration-300 mx-auto rounded-full`} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/companies?featured=true">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-2xl">
                View All Companies
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Job Roles */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: animatedSections.features ? 1 : 0, y: animatedSections.features ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Trending Job Roles</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Explore the most in-demand positions across various industries
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingJobRoles.slice(0, showAllJobRoles ? trendingJobRoles.length : 12).map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: animatedSections.features ? 1 : 0, y: animatedSections.features ? 0 : 30 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="transform transition-all duration-200 ease-out hover:-translate-y-6 hover:scale-110 hover:shadow-2xl will-change-transform group"
              >
                <Link href={`/jobs?category=${role.category}`}>
                  <Card className="group cursor-pointer border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-200 ease-out overflow-hidden h-full">
                    <CardContent className="p-6 text-center relative h-full flex flex-col justify-between">
                      <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                      <div>
                        <div className="text-4xl mb-4 group-hover:scale-125 group-hover:rotate-3 transition-all duration-200 ease-out">
                          {role.icon}
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg group-hover:text-blue-600 transition-all duration-200 ease-out group-hover:scale-105">
                          {role.name}
                        </h3>
                      </div>

                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out transform translate-y-2 group-hover:translate-y-0">
                          {role.openings}
                        </p>
                        <div className={`w-0 group-hover:w-full h-1 bg-gradient-to-r ${role.color} transition-all duration-200 ease-out mx-auto rounded-full`} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Show More/Less Button */}
          {trendingJobRoles.length > 12 && (
            <div className="text-center mt-8">
              <Button
                onClick={() => setShowAllJobRoles(!showAllJobRoles)}
                variant="outline"
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 px-6 py-3 rounded-2xl"
              >
                <span className="mr-2">
                  {showAllJobRoles ? "Show Less" : "Show More"}
                </span>
                <motion.div
                  animate={{ rotate: showAllJobRoles ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </Button>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/jobs">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-2xl">
                View All Job Categories
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: animatedSections.featuredJobs ? 1 : 0, y: animatedSections.featuredJobs ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Featured Jobs</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Hand-picked opportunities from top companies worldwide
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: animatedSections.featuredJobs ? 1 : 0, y: animatedSections.featuredJobs ? 0 : 30 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="transform transition-all duration-200 ease-out hover:-translate-y-3 hover:scale-110 hover:shadow-2xl"
              >
                <Link href={`/jobs/${job.id}`}>
                  <Card className="group cursor-pointer border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                    <CardContent className="p-6 relative h-full flex flex-col justify-between">
                      <div className={`absolute inset-0 bg-gradient-to-br ${getSectorColor(job.sector)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <Avatar className="w-12 h-12 ring-2 ring-white/50 group-hover:ring-4 transition-all duration-300">
                            <AvatarImage src={job.logo} alt={job.company} />
                            <AvatarFallback className="text-sm font-bold">{job.company[0]}</AvatarFallback>
                          </Avatar>
                  {job.urgent && (
                            <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                        Urgent
                      </Badge>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                          {job.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{job.company}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <MapPin className="w-4 h-4 mr-2" />
                            {job.location}
                      </div>
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Briefcase className="w-4 h-4 mr-2" />
                            {job.experience}
                      </div>
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <IndianRupee className="w-4 h-4 mr-2" />
                            {job.salary}
                          </div>
                      </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.slice(0, 3).map((skill: string, skillIndex: number) => (
                          <Badge
                            key={skillIndex}
                            variant="secondary"
                              className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{job.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                      <div>
                        <div className="flex items-center justify-between text-sm mb-4">
                          <span className="text-slate-500 dark:text-slate-500">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {job.posted}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            <Users className="w-4 h-4 inline mr-1" />
                            {job.applicants} applicants
                          </span>
                        </div>
                    <Button
                          className={`w-full bg-gradient-to-r ${getSectorColor(job.sector)} hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg transition-all duration-300 group-hover:scale-105`}
                    >
                          View Job
                    </Button>
                      </div>
                  </CardContent>
                </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/jobs">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-2xl">
                View All Jobs
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">JobPortal</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                India's leading job portal connecting talent with opportunities. Find your dream job or hire the perfect
                candidate.
              </p>
                </div>

            <div>
              <h3 className="font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link href="/jobs" className="hover:text-white transition-colors">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/companies" className="hover:text-white transition-colors">
                    Browse Companies
                  </Link>
                </li>
                <li>
                  <Link href="/jobatpace" className="hover:text-white transition-colors font-medium">
                    JobAtPace Premium
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link href="/employer-dashboard/post-job" className="hover:text-white transition-colors">
                    Post a Job
                      </Link>
                    </li>
                <li>
                  <Link href="/employer-dashboard/requirements" className="hover:text-white transition-colors">
                    Search Resume Database
                  </Link>
                </li>
                <li>
                  <Link href="/employer-dashboard/manage-jobs" className="hover:text-white transition-colors">
                    Manage Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/employer-register" className="hover:text-white transition-colors">
                    Employer Registration
                  </Link>
                </li>
                </ul>
              </div>

            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>Email: support@jobportal.com</p>
                <p>Phone: +91 80-4040-0000</p>
                <p>Address: Bangalore, India</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>© 2025 JobPortal. All rights reserved. Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
