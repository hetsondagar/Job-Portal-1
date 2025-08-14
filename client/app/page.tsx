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

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isStickyVisible, setIsStickyVisible] = useState(false)

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

  // Scroll event listener for sticky search bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsStickyVisible(scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const stats = [
    { value: "2M+", label: "Active Jobs", icon: Briefcase },
    { value: "50K+", label: "Companies", icon: Building2 },
    { value: "15M+", label: "Professionals", icon: Users },
    { value: "95%", label: "Success Rate", icon: Star },
  ]

  const topCompanies = [
    {
      id: 1,
      name: "TechCorp Solutions",
      industry: "Technology",
      openings: 24,
      rating: 4.2,
      icon: "🔍",
      color: "from-blue-500 to-cyan-500",
      hoverColor: "from-blue-600 to-cyan-600",
    },
    {
      id: 2,
      name: "FinanceFirst Bank",
      industry: "Banking & Finance",
      openings: 89,
      rating: 4.1,
      icon: "🏦",
      color: "from-green-500 to-emerald-500",
      hoverColor: "from-green-600 to-emerald-600",
    },
    {
      id: 3,
      name: "AutoDrive Motors",
      industry: "Automotive",
      openings: 45,
      rating: 4.0,
      icon: "🚗",
      color: "from-orange-500 to-red-500",
      hoverColor: "from-orange-600 to-red-600",
    },
    {
      id: 4,
      name: "HealthCare Plus",
      industry: "Healthcare",
      openings: 67,
      rating: 4.3,
      icon: "🏥",
      color: "from-teal-500 to-cyan-500",
      hoverColor: "from-teal-600 to-cyan-600",
    },
    {
      id: 5,
      name: "EduTech Innovations",
      industry: "Education Technology",
      openings: 34,
      rating: 4.4,
      icon: "📚",
      color: "from-emerald-500 to-teal-500",
      hoverColor: "from-emerald-600 to-teal-600",
    },
    {
      id: 6,
      name: "SalesForce",
      industry: "Sales & CRM",
      openings: 167,
      rating: 4.4,
      icon: "☁️",
      color: "from-blue-500 to-indigo-500",
      hoverColor: "from-blue-600 to-indigo-600",
    },
    {
      id: 7,
      name: "TCS",
      industry: "Technology",
      openings: 567,
      rating: 4.2,
      icon: "💻",
      color: "from-purple-500 to-pink-500",
      hoverColor: "from-purple-600 to-pink-600",
    },
    {
      id: 8,
      name: "ICICI Bank",
      industry: "Finance",
      openings: 234,
      rating: 4.2,
      icon: "💰",
      color: "from-emerald-500 to-teal-500",
      hoverColor: "from-emerald-600 to-teal-600",
    },
    {
      id: 9,
      name: "Wipro",
      industry: "Technology",
      openings: 345,
      rating: 4.0,
      icon: "⚡",
      color: "from-cyan-500 to-blue-500",
      hoverColor: "from-cyan-600 to-blue-600",
    },
    {
      id: 10,
      name: "Infosys",
      industry: "Technology",
      openings: 432,
      rating: 4.1,
      icon: "🔧",
      color: "from-slate-500 to-gray-500",
      hoverColor: "from-slate-600 to-gray-600",
    },
  ]

  const featuredJobs = [
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
      urgent: true,
      sector: "technology",
    },
    {
      id: 2,
      title: "Product Manager - Growth",
      company: "InnovateTech",
      location: "Mumbai",
      experience: "5-8 years",
      salary: "20-35 LPA",
      skills: ["Product Strategy", "Analytics", "Leadership"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "1 day ago",
      applicants: 32,
      urgent: false,
      sector: "technology",
    },
    {
      id: 3,
      title: "Investment Banking Analyst",
      company: "Goldman Sachs",
      location: "Mumbai",
      experience: "2-4 years",
      salary: "18-30 LPA",
      skills: ["Financial Modeling", "Valuation", "Excel"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "3 days ago",
      applicants: 67,
      urgent: true,
      sector: "finance",
    },
    {
      id: 4,
      title: "Data Scientist - ML",
      company: "DataDriven Inc",
      location: "Hyderabad",
      experience: "3-6 years",
      salary: "12-22 LPA",
      skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "3 days ago",
      applicants: 28,
      urgent: false,
      sector: "technology",
    },
    {
      id: 5,
      title: "UX/UI Designer",
      company: "DesignStudio",
      location: "Pune",
      experience: "2-5 years",
      salary: "10-18 LPA",
      skills: ["Figma", "Adobe Creative Suite", "Prototyping"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "1 day ago",
      applicants: 23,
      urgent: false,
      sector: "design",
    },
    {
      id: 6,
      title: "DevOps Engineer",
      company: "CloudTech Solutions",
      location: "Chennai",
      experience: "3-7 years",
      salary: "14-26 LPA",
      skills: ["Docker", "Kubernetes", "AWS", "Jenkins"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "4 days ago",
      applicants: 34,
      urgent: true,
      sector: "technology",
    },
    {
      id: 7,
      title: "Sales Manager - Enterprise",
      company: "SalesForce India",
      location: "Delhi",
      experience: "5-8 years",
      salary: "16-28 LPA",
      skills: ["B2B Sales", "CRM", "Team Leadership", "Negotiation"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "2 days ago",
      applicants: 41,
      urgent: true,
      sector: "sales",
    },
    {
      id: 8,
      title: "Marketing Specialist - Digital",
      company: "Digital Marketing Pro",
      location: "Mumbai",
      experience: "3-6 years",
      salary: "8-16 LPA",
      skills: ["Google Ads", "Facebook Ads", "SEO", "Content Marketing"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "1 day ago",
      applicants: 29,
      urgent: false,
      sector: "marketing",
    },
    {
      id: 9,
      title: "Operations Manager",
      company: "Logistics Express",
      location: "Gurgaon",
      experience: "4-7 years",
      salary: "12-20 LPA",
      skills: ["Supply Chain", "Process Optimization", "Team Management"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "3 days ago",
      applicants: 35,
      urgent: false,
      sector: "operations",
    },
    {
      id: 10,
      title: "Content Writer - Creative",
      company: "Content Studio",
      location: "Bangalore",
      experience: "2-4 years",
      salary: "6-12 LPA",
      skills: ["Creative Writing", "SEO", "Social Media", "Copywriting"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "2 days ago",
      applicants: 18,
      urgent: false,
      sector: "content",
    },
    {
      id: 11,
      title: "Business Analyst",
      company: "Consulting Partners",
      location: "Delhi",
      experience: "3-6 years",
      salary: "10-18 LPA",
      skills: ["Requirements Gathering", "SQL", "Process Analysis", "Documentation"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "4 days ago",
      applicants: 26,
      urgent: false,
      sector: "business",
    },
    {
      id: 12,
      title: "Customer Success Manager",
      company: "SaaS Solutions",
      location: "Pune",
      experience: "2-5 years",
      salary: "8-15 LPA",
      skills: ["Customer Relationship", "Product Knowledge", "Problem Solving"],
      logo: "/placeholder.svg?height=40&width=40",
      posted: "1 day ago",
      applicants: 22,
      urgent: true,
      sector: "customer",
    },
  ]

  const featuredCompanies = [
    {
      id: 1,
      name: "Google",
      industry: "Technology",
      location: "Bangalore",
      employees: "10,000+ employees",
      rating: 4.8,
      reviews: 1247,
      openings: 156,
      logo: "/placeholder.svg?height=40&width=40",
      sector: "technology",
    },
    {
      id: 2,
      name: "Microsoft",
      industry: "Technology",
      location: "Hyderabad",
      employees: "8,500+ employees",
      rating: 4.6,
      reviews: 892,
      openings: 89,
      logo: "/placeholder.svg?height=40&width=40",
      sector: "technology",
    },
    {
      id: 3,
      name: "Amazon",
      industry: "E-commerce",
      location: "Bangalore",
      employees: "15,000+ employees",
      rating: 4.4,
      reviews: 2156,
      openings: 234,
      logo: "/placeholder.svg?height=40&width=40",
      sector: "ecommerce",
    },
    {
      id: 4,
      name: "TCS",
      industry: "Technology",
      location: "Mumbai",
      employees: "25,000+ employees",
      rating: 4.2,
      reviews: 3456,
      openings: 567,
      logo: "/placeholder.svg?height=40&width=40",
      sector: "technology",
    },
    {
      id: 5,
      name: "Infosys",
      industry: "Technology",
      location: "Bangalore",
      employees: "20,000+ employees",
      rating: 4.1,
      reviews: 2890,
      openings: 432,
      logo: "/placeholder.svg?height=40&width=40",
      sector: "technology",
    },
    {
      id: 6,
      name: "HDFC Bank",
      industry: "Finance",
      location: "Mumbai",
      employees: "12,000+ employees",
      rating: 4.3,
      reviews: 1567,
      openings: 189,
      logo: "/placeholder.svg?height=40&width=40",
      sector: "finance",
    },
    {
      id: 7,
      name: "Apollo Hospitals",
      industry: "Healthcare",
      location: "Chennai",
      employees: "8,000+ employees",
      rating: 4.5,
      reviews: 2345,
      openings: 145,
      logo: "/placeholder.svg?height=40&width=40",
      sector: "healthcare",
    },
    {
      id: 8,
      name: "SalesForce India",
      industry: "Sales & CRM",
      location: "Mumbai",
      employees: "5,000+ employees",
      rating: 4.4,
      reviews: 1234,
      openings: 167,
      logo: "/placeholder.svg?height=40&width=40",
      sector: "sales",
    },
    {
      id: 9,
      name: "Wipro",
      industry: "Technology",
      location: "Bangalore",
      employees: "18,000+ employees",
      rating: 4.0,
      reviews: 2678,
      openings: 345,
      logo: "/placeholder.svg?height=40&width=40",
      sector: "technology",
    },
    {
      id: 10,
      name: "ICICI Bank",
      industry: "Finance",
      location: "Mumbai",
      employees: "15,000+ employees",
      rating: 4.2,
      reviews: 1890,
      openings: 234,
      logo: "/placeholder.svg?height=40&width=40",
      sector: "finance",
    },
  ]

  const trendingJobRoles = [
    {
      name: "Software Engineer",
      openings: "15,000+ jobs",
      icon: "💻",
      category: "software",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Data Scientist",
      openings: "8,500+ jobs",
      icon: "📊",
      category: "data",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Product Manager",
      openings: "6,200+ jobs",
      icon: "🎯",
      category: "product",
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "UX Designer",
      openings: "4,800+ jobs",
      icon: "🎨",
      category: "design",
      color: "from-orange-500 to-red-500",
    },
    {
      name: "DevOps Engineer",
      openings: "5,600+ jobs",
      icon: "⚙️",
      category: "devops",
      color: "from-indigo-500 to-purple-500",
    },
    {
      name: "AI/ML Engineer",
      openings: "3,900+ jobs",
      icon: "🤖",
      category: "ai",
      color: "from-teal-500 to-cyan-500",
    },
    {
      name: "Sales Manager",
      openings: "7,300+ jobs",
      icon: "📈",
      category: "sales",
      color: "from-yellow-500 to-orange-500",
    },
    {
      name: "Marketing Specialist",
      openings: "5,100+ jobs",
      icon: "📢",
      category: "marketing",
      color: "from-pink-500 to-rose-500",
    },
    {
      name: "Business Analyst",
      openings: "4,200+ jobs",
      icon: "📋",
      category: "business",
      color: "from-slate-500 to-gray-500",
    },
    {
      name: "Cloud Architect",
      openings: "2,800+ jobs",
      icon: "☁️",
      category: "cloud",
      color: "from-blue-500 to-indigo-500",
    },
    {
      name: "Cybersecurity Expert",
      openings: "3,400+ jobs",
      icon: "🔒",
      category: "security",
      color: "from-red-500 to-pink-500",
    },
    {
      name: "Digital Marketing",
      openings: "6,700+ jobs",
      icon: "📱",
      category: "digital",
      color: "from-green-500 to-teal-500",
    },
    {
      name: "Investment Banking",
      openings: "2,500+ jobs",
      icon: "💰",
      category: "finance",
      color: "from-emerald-500 to-green-500",
    },
    {
      name: "Healthcare Professional",
      openings: "4,800+ jobs",
      icon: "🏥",
      category: "healthcare",
      color: "from-red-500 to-pink-500",
    },
    {
      name: "Content Writer",
      openings: "3,200+ jobs",
      icon: "✍️",
      category: "content",
      color: "from-purple-500 to-indigo-500",
    },
    {
      name: "Operations Manager",
      openings: "4,500+ jobs",
      icon: "📦",
      category: "operations",
      color: "from-orange-500 to-yellow-500",
    },
    {
      name: "Customer Success",
      openings: "3,800+ jobs",
      icon: "🎯",
      category: "customer",
      color: "from-blue-500 to-purple-500",
    },
    {
      name: "Human Resources",
      openings: "3,600+ jobs",
      icon: "👥",
      category: "hr",
      color: "from-pink-500 to-rose-500",
    },
    {
      name: "Supply Chain",
      openings: "2,900+ jobs",
      icon: "🚚",
      category: "logistics",
      color: "from-gray-500 to-slate-500",
    },
    {
      name: "Quality Assurance",
      openings: "3,100+ jobs",
      icon: "✅",
      category: "qa",
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Project Manager",
      openings: "5,400+ jobs",
      icon: "📋",
      category: "project",
      color: "from-indigo-500 to-blue-500",
    },
    {
      name: "Financial Analyst",
      openings: "4,300+ jobs",
      icon: "📊",
      category: "finance",
      color: "from-emerald-500 to-teal-500",
    },
    {
      name: "Legal Counsel",
      openings: "2,200+ jobs",
      icon: "⚖️",
      category: "legal",
      color: "from-slate-500 to-gray-500",
    },
    {
      name: "Research Analyst",
      openings: "3,700+ jobs",
      icon: "🔬",
      category: "research",
      color: "from-purple-500 to-pink-500",
    },
  ]

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
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 dark:border-slate-700/20 max-w-4xl mx-auto transform hover:scale-[1.02] transition-all duration-500">
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
            whileInView={{ opacity: 1, y: 0 }}
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
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="flex-shrink-0 w-72 sm:w-80"
                >
                  <Link href={`/companies/${company.id}`}>
                    <Card className={`h-full bg-gradient-to-br ${company.color} hover:${company.hoverColor} backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer transform hover:scale-105`}>
                    <CardContent className="p-6 text-white relative overflow-hidden">
                      {/* Background pattern */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="text-2xl">{company.icon}</span>
                </div>
                          <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
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
                            className="bg-white/20 hover:bg-white/30 text-white border-0 shadow-lg transition-all duration-300 group-hover:scale-105 backdrop-blur-sm"
                          >
                            View Jobs
                          </Button>
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Featured Companies</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Discover opportunities with the most innovative and respected companies
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCompanies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Link href={`/companies/${company.id}`}>
                  <Card className="group cursor-pointer border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 overflow-hidden h-full">
                    <CardContent className="p-6 text-center relative h-full flex flex-col justify-between">
                      <div className={`absolute inset-0 bg-gradient-to-br ${getSectorColor(company.sector)} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                      <div>
                        <Avatar className="w-16 h-16 mx-auto mb-4 ring-2 ring-white/50 group-hover:ring-4 transition-all duration-300 shadow-lg">
                          <AvatarImage src={company.logo} alt={company.name} />
                          <AvatarFallback className="text-lg font-bold">{company.name[0]}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg group-hover:text-blue-600 transition-colors">
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
                        <div className={`w-0 group-hover:w-full h-1 bg-gradient-to-r ${getSectorColor(company.sector)} transition-all duration-500 mx-auto rounded-full`} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
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
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Trending Job Roles</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Explore the most in-demand positions across various industries
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingJobRoles.map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Link href={`/jobs?category=${role.category}`}>
                  <Card className="group cursor-pointer border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 overflow-hidden h-full">
                    <CardContent className="p-6 text-center relative h-full flex flex-col justify-between">
                      <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                      <div>
                        <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500">
                          {role.icon}
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg group-hover:text-blue-600 transition-colors">
                          {role.name}
                        </h3>
                      </div>

                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                          {role.openings}
                        </p>
                        <div className={`w-0 group-hover:w-full h-1 bg-gradient-to-r ${role.color} transition-all duration-500 mx-auto rounded-full`} />
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
            whileInView={{ opacity: 1, y: 0 }}
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
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Link href={`/jobs/${job.id}`}>
                  <Card className="group cursor-pointer border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 overflow-hidden h-full">
                    <CardContent className="p-6 relative h-full flex flex-col justify-between">
                      <div className={`absolute inset-0 bg-gradient-to-br ${getSectorColor(job.sector)} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

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
                        {job.skills.slice(0, 3).map((skill, skillIndex) => (
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
