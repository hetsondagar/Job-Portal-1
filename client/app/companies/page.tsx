"use client"

import { useState, useRef, useMemo, useCallback, useEffect } from "react"
import {
  Search,
  MapPin,
  Users,
  Star,
  Building2,
  TrendingUp,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Heart,
  Briefcase,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Zap,
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

// Types for state management
interface FilterState {
  search: string
  location: string
  industries: string[]
  companyTypes: string[]
  companySizes: string[]
  locations: string[]
  minRating: string
  salaryRange: string
}

interface Company {
  id: string
  name: string
  logo: string
  industry: string
  sector: string
  location: string
  employees: string
  rating: number
  reviews: number
  openings: number
  activeJobsCount?: number
  profileViews?: number
  description: string
  founded: string
  website: string
  benefits: string[]
  featured: boolean
  salaryRange: string
  workCulture: string
  companyType: string
  urgent: boolean
}

export default function CompaniesPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  // State management
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [companiesPerPage, setCompaniesPerPage] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("rating")
  
  // Follow status management - SIMPLIFIED AND FIXED
  const [followedCompanies, setFollowedCompanies] = useState<Set<string>>(new Set())
  const [loadingFollow, setLoadingFollow] = useState<Set<string>>(new Set())

  // Fetch followed companies - SIMPLIFIED
  const fetchFollowedCompanies = useCallback(async () => {
    if (!user) return

    try {
      const response = await apiService.getFollowedCompanies()
      if (response.success && response.data) {
        const companyIds = response.data.map((follow: any) => follow.companyId).filter(Boolean)
        setFollowedCompanies(new Set(companyIds))
        console.log('✅ Loaded followed companies:', Array.from(companyIds))
      }
    } catch (error) {
      console.error('❌ Error fetching followed companies:', error)
    }
  }, [user])

  // Handle follow/unfollow toggle - COMPLETELY REWRITTEN
  const handleFollowToggle = useCallback(async (companyId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    if (loadingFollow.has(companyId)) return

    setLoadingFollow(prev => new Set([...prev, companyId]))

    try {
      const isCurrentlyFollowing = followedCompanies.has(companyId)
      
      if (isCurrentlyFollowing) {
        // UNFOLLOW
        const response = await apiService.unfollowCompany(companyId)
        if (response.success) {
          setFollowedCompanies(prev => {
            const newSet = new Set(prev)
            newSet.delete(companyId)
            return newSet
          })
          toast.success('Unfollowed company')
          console.log('✅ Unfollowed company:', companyId)
        } else {
          toast.error('Failed to unfollow company')
        }
      } else {
        // FOLLOW
        const response = await apiService.followCompany(companyId)
        if (response.success) {
          setFollowedCompanies(prev => new Set([...prev, companyId]))
          toast.success('Following company')
          console.log('✅ Followed company:', companyId)
        } else {
          toast.error('Failed to follow company')
        }
      }
    } catch (error) {
      console.error('❌ Error toggling follow:', error)
      toast.error('Failed to update follow status')
    } finally {
      setLoadingFollow(prev => {
        const newSet = new Set(prev)
        newSet.delete(companyId)
        return newSet
      })
    }
  }, [user, followedCompanies, loadingFollow, router])
  const [isFeaturedFilter, setIsFeaturedFilter] = useState(false)
  const [badgeDisplay, setBadgeDisplay] = useState<'featured' | 'urgent'>('featured')
  const [isStickyVisible, setIsStickyVisible] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Data from backend
  const [apiCompanies, setApiCompanies] = useState<any[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string>("")

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "",
    industries: [],
    companyTypes: [],
    companySizes: [],
    locations: [],
    minRating: "",
    salaryRange: "",
  })

  // Check URL parameters for featured filter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const featured = urlParams.get('featured')
      if (featured === 'true') {
        setIsFeaturedFilter(true)
      }
    }
  }, [])

  // Alternate badge display for companies with both featured and urgent
  useEffect(() => {
    const interval = setInterval(() => {
      setBadgeDisplay(prev => prev === 'featured' ? 'urgent' : 'featured')
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [])

  // Scroll event listener for sticky search bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsStickyVisible(scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch companies from backend
  useEffect(() => {
    const controller = new AbortController()
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true)
        setLoadError("")
        const resp = await apiService.listCompanies({
          search: filters.search || undefined,
          limit: 100,
          offset: 0,
          timestamp: Date.now() // Cache busting parameter
        })
        if (resp.success && Array.isArray(resp.data)) {
          console.log('🔍 Companies API response:', resp.data.slice(0, 2)) // Log first 2 companies
          setApiCompanies(resp.data.filter((c: any) => c?.region !== 'gulf'))
          // Fetch followed companies after loading companies
          fetchFollowedCompanies()
        } else {
          setApiCompanies([])
          setLoadError(resp.message || 'Failed to load companies')
        }
      } catch (e: any) {
        setLoadError('Failed to load companies')
        setApiCompanies([])
      } finally {
        setLoadingCompanies(false)
      }
    }
    fetchCompanies()
    return () => controller.abort()
  // Re-fetch on search change only; other filters are client-side
  }, [filters.search])

  // Fetch followed companies when user changes
  useEffect(() => {
    if (user) {
      fetchFollowedCompanies()
    }
  }, [user, fetchFollowedCompanies])

  const getSectorColor = (sector: string) => {
    const colors = {
      technology: {
        bg: "from-blue-500 to-cyan-500",
        text: "text-blue-600",
        border: "border-blue-200",
        light: "bg-blue-50 dark:bg-blue-900/20",
        ring: "ring-blue-500",
        hover: "hover:from-blue-600 hover:to-cyan-600",
        glow: "shadow-blue-500/25",
      },
      finance: {
        bg: "from-green-500 to-emerald-500",
        text: "text-green-600",
        border: "border-green-200",
        light: "bg-green-50 dark:bg-green-900/20",
        ring: "ring-green-500",
        hover: "hover:from-green-600 hover:to-emerald-600",
        glow: "shadow-green-500/25",
      },
      automotive: {
        bg: "from-orange-500 to-red-500",
        text: "text-orange-600",
        border: "border-orange-200",
        light: "bg-orange-50 dark:bg-orange-900/20",
        ring: "ring-orange-500",
        hover: "hover:from-orange-600 hover:to-red-600",
        glow: "shadow-orange-500/25",
      },
      healthcare: {
        bg: "from-teal-500 to-cyan-500",
        text: "text-teal-600",
        border: "border-teal-200",
        light: "bg-teal-50 dark:bg-teal-900/20",
        ring: "ring-teal-500",
        hover: "hover:from-teal-600 hover:to-cyan-600",
        glow: "shadow-teal-500/25",
      },
      energy: {
        bg: "from-purple-500 to-pink-500",
        text: "text-purple-600",
        border: "border-purple-200",
        light: "bg-purple-50 dark:bg-purple-900/20",
        ring: "ring-purple-500",
        hover: "hover:from-purple-600 hover:to-pink-600",
        glow: "shadow-purple-500/25",
      },
      consulting: {
        bg: "from-indigo-500 to-purple-500",
        text: "text-indigo-600",
        border: "border-indigo-200",
        light: "bg-indigo-50 dark:bg-indigo-900/20",
        ring: "ring-indigo-500",
        hover: "hover:from-indigo-600 hover:to-purple-600",
        glow: "shadow-indigo-500/25",
      },
      ecommerce: {
        bg: "from-yellow-500 to-orange-500",
        text: "text-yellow-600",
        border: "border-yellow-200",
        light: "bg-yellow-50 dark:bg-yellow-900/20",
        ring: "ring-yellow-500",
        hover: "hover:from-yellow-600 hover:to-orange-600",
        glow: "shadow-yellow-500/25",
      },
      manufacturing: {
        bg: "from-gray-500 to-slate-500",
        text: "text-gray-600",
        border: "border-gray-200",
        light: "bg-gray-50 dark:bg-gray-900/20",
        ring: "ring-gray-500",
        hover: "hover:from-gray-600 hover:to-slate-600",
        glow: "shadow-gray-500/25",
      },
      edtech: {
        bg: "from-emerald-500 to-teal-500",
        text: "text-emerald-600",
        border: "border-emerald-200",
        light: "bg-emerald-50 dark:bg-emerald-900/20",
        ring: "ring-emerald-500",
        hover: "hover:from-emerald-600 hover:to-teal-600",
        glow: "shadow-emerald-500/25",
      },
      fintech: {
        bg: "from-blue-500 to-green-500",
        text: "text-blue-600",
        border: "border-blue-200",
        light: "bg-blue-50 dark:bg-blue-900/20",
        ring: "ring-blue-500",
        hover: "hover:from-blue-600 hover:to-green-600",
        glow: "shadow-blue-500/25",
      },
      startup: {
        bg: "from-pink-500 to-rose-500",
        text: "text-pink-600",
        border: "border-pink-200",
        light: "bg-pink-50 dark:bg-pink-900/20",
        ring: "ring-pink-500",
        hover: "hover:from-pink-600 hover:to-rose-600",
        glow: "shadow-pink-500/25",
      },
      government: {
        bg: "from-slate-500 to-gray-500",
        text: "text-slate-600",
        border: "border-slate-200",
        light: "bg-slate-50 dark:bg-slate-900/20",
        ring: "ring-slate-500",
        hover: "hover:from-slate-600 hover:to-gray-600",
        glow: "shadow-slate-500/25",
      },
      unicorn: {
        bg: "from-violet-500 to-purple-500",
        text: "text-violet-600",
        border: "border-violet-200",
        light: "bg-violet-50 dark:bg-violet-900/20",
        ring: "ring-violet-500",
        hover: "hover:from-violet-600 hover:to-purple-600",
        glow: "shadow-violet-500/25",
      },
    }
    return colors[sector as keyof typeof colors] || colors.technology
  }

  const industryTypes = [
    { name: "MNCs", count: "2.5K+ Companies", sector: "technology" },
    { name: "Internet", count: "354 Companies", sector: "technology" },
    { name: "Manufacturing", count: "1K+ Companies", sector: "manufacturing" },
    { name: "Fortune 500", count: "190 Companies", sector: "finance" },
    { name: "Product", count: "1.2K+ Companies", sector: "technology" },
    { name: "Fintech", count: "450 Companies", sector: "fintech" },
    { name: "Healthcare", count: "680 Companies", sector: "healthcare" },
    { name: "EdTech", count: "320 Companies", sector: "edtech" },
    { name: "Startup", count: "2.8K+ Companies", sector: "startup" },
    { name: "Automobile", count: "280 Companies", sector: "automotive" },
    { name: "Government", count: "150 Companies", sector: "government" },
    { name: "Unicorn", count: "45 Companies", sector: "unicorn" },
    { name: "Consulting", count: "890 Companies", sector: "consulting" },
    { name: "E-commerce", count: "670 Companies", sector: "ecommerce" },
    { name: "Energy", count: "340 Companies", sector: "energy" },
  ]

  // Filter functions
  const handleFilterChange = useCallback((filterType: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    setCurrentPage(1) // Reset to first page when filters change
  }, [])

  const handleIndustryToggle = useCallback((industry: string) => {
    setFilters(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry]
    }))
    
    // Clear top industry selection when manually changing filters
    if (selectedIndustry) {
      setSelectedIndustry(null)
    }
    setCurrentPage(1)
  }, [selectedIndustry])

  const handleCompanyTypeToggle = useCallback((type: string) => {
    setFilters(prev => ({
      ...prev,
      companyTypes: prev.companyTypes.includes(type)
        ? prev.companyTypes.filter(t => t !== type)
        : [...prev.companyTypes, type]
    }))
    
    // Clear top industry selection when manually changing filters
    if (selectedIndustry) {
      setSelectedIndustry(null)
    }
    setCurrentPage(1)
  }, [selectedIndustry])

  const handleCompanySizeToggle = useCallback((size: string) => {
    setFilters(prev => ({
      ...prev,
      companySizes: prev.companySizes.includes(size)
        ? prev.companySizes.filter(s => s !== size)
        : [...prev.companySizes, size]
    }))
    setCurrentPage(1)
  }, [])

  const handleLocationToggle = useCallback((location: string) => {
    setFilters(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location]
    }))
    setCurrentPage(1)
  }, [])



  // Function to handle top industry card selection and sync with filters
  const handleIndustryCardSelection = useCallback((industryName: string | null) => {
    setSelectedIndustry(industryName)
    
    if (!industryName) {
      // If deselecting, clear related filters
      setFilters(prev => ({
        ...prev,
        industries: [],
        companyTypes: []
      }))
      return
    }

    // Map industry card selections to filter states
    const filterMapping: { [key: string]: { industries: string[], companyTypes: string[] } } = {
      "Internet": { industries: ["Technology"], companyTypes: ["Product"] },
      "Startup": { industries: [], companyTypes: ["Startup"] },
      "MNCs": { industries: [], companyTypes: ["MNC"] },
      "Fortune 500": { industries: [], companyTypes: ["Fortune 500"] },
      "Fintech": { industries: ["Financial Technology"], companyTypes: [] },
      "EdTech": { industries: ["Education Technology"], companyTypes: [] },
      "Healthcare": { industries: ["Healthcare"], companyTypes: [] },
      "Manufacturing": { industries: ["Manufacturing"], companyTypes: [] },
      "Automobile": { industries: ["Automotive"], companyTypes: [] },
      "Government": { industries: [], companyTypes: ["Government"] },
      "Unicorn": { industries: [], companyTypes: ["Unicorn"] },
      "Consulting": { industries: ["Consulting"], companyTypes: [] },
      "E-commerce": { industries: ["E-commerce"], companyTypes: [] },
      "Energy": { industries: ["Energy"], companyTypes: [] },
      "Product": { industries: ["Technology"], companyTypes: ["Product"] }
    }

    const mapping = filterMapping[industryName]
    if (mapping) {
      setFilters(prev => ({
        ...prev,
        industries: mapping.industries,
        companyTypes: mapping.companyTypes
      }))
    }
    
    setCurrentPage(1)
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({
      search: "",
      location: "",
      industries: [],
      companyTypes: [],
      companySizes: [],
      locations: [],
      minRating: "",
      salaryRange: "",
    })
    handleIndustryCardSelection(null)
    setIsFeaturedFilter(false)
    setCurrentPage(1)
  }, [handleIndustryCardSelection])

  // Transform backend company to UI model with graceful fallbacks
  const transformCompany = (c: any): Company => {
    const employeesBySize: Record<string, string> = {
      small: "1-50",
      medium: "51-200",
      large: "201-1000",
      enterprise: "1000+",
    }
    const industry = c.industry || 'General'
    const sector = (industry || '').toLowerCase().includes('tech') ? 'technology'
      : (industry || '').toLowerCase().includes('fin') ? 'fintech'
      : (industry || '').toLowerCase().includes('health') ? 'healthcare'
      : (industry || '').toLowerCase().includes('auto') ? 'automotive'
      : (industry || '').toLowerCase().includes('manufact') ? 'manufacturing'
      : (industry || '').toLowerCase().includes('consult') ? 'consulting'
      : (industry || '').toLowerCase().includes('energy') ? 'energy'
      : 'technology'
    const locationParts = [c.city, c.state, c.country].filter(Boolean)
    return {
      id: String(c.id),
      name: c.name || 'Company',
      logo: "/placeholder.svg?height=80&width=80",
      industry,
      sector,
      location: locationParts.join(', ') || '—',
      employees: employeesBySize[String(c.companySize)] || String(c.companySize || '—'),
      rating: 0,
      reviews: 0,
      openings: 0,
      description: c.description || 'Explore roles and teams at this organization.',
      founded: '—',
      website: c.website || '',
      benefits: [],
      featured: false,
      salaryRange: '',
      workCulture: '',
      companyType: '',
      urgent: false,
    }
  }

  const allCompanies: Company[] = useMemo(() => {
    return (apiCompanies || [])
      .filter((c: any) => c?.region !== 'gulf')
      .map(transformCompany)
  }, [apiCompanies])

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    let filtered = allCompanies

    // Featured filter (from URL parameter)
    if (isFeaturedFilter) {
      filtered = filtered.filter(company => company.featured)
    }

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        company.industry.toLowerCase().includes(filters.search.toLowerCase()) ||
        company.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(company =>
        company.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Industry filter
    if (filters.industries.length > 0) {
      filtered = filtered.filter(company =>
        filters.industries.includes(company.industry)
      )
    }

    // Company type filter
    if (filters.companyTypes.length > 0) {
      filtered = filtered.filter(company =>
        filters.companyTypes.includes(company.companyType)
      )
    }

    // Company size filter
    if (filters.companySizes.length > 0) {
      filtered = filtered.filter(company =>
        filters.companySizes.some(size => {
          if (size === "1-50 employees") return company.employees === "1-50"
          if (size === "51-200 employees") return company.employees === "51-200"
          if (size === "201-1000 employees") return company.employees === "201-1000" || company.employees === "500-1000"
          if (size === "1001-5000 employees") return company.employees === "1001-5000" || company.employees === "2000-5000"
          if (size === "5000+ employees") return company.employees === "5000+" || company.employees === "10000+"
          return false
        })
      )
    }

    // Location filter (from checkbox)
    if (filters.locations.length > 0) {
      filtered = filtered.filter(company =>
        filters.locations.includes(company.location)
      )
    }

    // Rating filter
    if (filters.minRating) {
      const minRating = parseFloat(filters.minRating)
      filtered = filtered.filter(company => company.rating >= minRating)
    }

    // Salary range filter
    if (filters.salaryRange) {
      filtered = filtered.filter(company => {
        const range = filters.salaryRange
        if (range === "0-10") return company.salaryRange.includes("5-") || company.salaryRange.includes("6-") || company.salaryRange.includes("7-") || company.salaryRange.includes("8-") || company.salaryRange.includes("9-") || company.salaryRange.includes("10")
        if (range === "10-20") return company.salaryRange.includes("10-") || company.salaryRange.includes("12-") || company.salaryRange.includes("15-") || company.salaryRange.includes("18-") || company.salaryRange.includes("20")
        if (range === "20-30") return company.salaryRange.includes("20-") || company.salaryRange.includes("22-") || company.salaryRange.includes("25-") || company.salaryRange.includes("28-") || company.salaryRange.includes("30")
        if (range === "30+") return company.salaryRange.includes("30+") || company.salaryRange.includes("35") || company.salaryRange.includes("40")
        return true
      })
    }

    // Selected industry filter (from top cards)
    if (selectedIndustry) {
      filtered = filtered.filter(company => {
        if (selectedIndustry === "Internet") return company.industry === "Technology" && company.companyType === "Product"
        if (selectedIndustry === "Startup") return company.companyType === "Startup"
        if (selectedIndustry === "MNCs") return company.companyType === "MNC"
        if (selectedIndustry === "Fortune 500") return company.companyType === "Fortune 500"
        if (selectedIndustry === "Fintech") return company.industry === "Financial Technology"
        if (selectedIndustry === "EdTech") return company.industry === "Education Technology"
        if (selectedIndustry === "Healthcare") return company.industry === "Healthcare"
        if (selectedIndustry === "Manufacturing") return company.industry === "Manufacturing"
        if (selectedIndustry === "Automobile") return company.industry === "Automotive"
        if (selectedIndustry === "Government") return company.companyType === "Government"
        if (selectedIndustry === "Unicorn") return company.companyType === "Unicorn"
        if (selectedIndustry === "Consulting") return company.industry === "Consulting"
        if (selectedIndustry === "E-commerce") return company.industry === "E-commerce"
        if (selectedIndustry === "Energy") return company.industry === "Energy"
        return company.industry === selectedIndustry
      })
    }

    // Sort companies
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "openings":
        filtered.sort((a, b) => b.openings - a.openings)
        break
      case "reviews":
        filtered.sort((a, b) => b.reviews - a.reviews)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        filtered.sort((a, b) => b.rating - a.rating)
    }

    return filtered
  }, [allCompanies, filters, selectedIndustry, sortBy])

  const totalCompanies = filteredCompanies.length
  const totalPages = Math.ceil(totalCompanies / companiesPerPage)
  const startIndex = (currentPage - 1) * companiesPerPage
  const endIndex = startIndex + companiesPerPage
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  // Reset to page 1 when filters change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of company list
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const getHeaderText = () => {
    if (selectedIndustry) {
      return `Top ${selectedIndustry.toLowerCase()} companies hiring now`
    }
    return "Top companies hiring now"
  }

  const industries = [
    "Technology",
    "Fintech",
    "Healthcare",
    "EdTech",
    "E-commerce",
    "Manufacturing",
    "Automotive",
    "Banking & Finance",
    "Consulting",
    "Energy & Petrochemicals",
    "Pharmaceuticals",
    "Telecommunications",
    "Media & Entertainment",
    "Real Estate",
    "Food & Beverage",
    "Retail",
    "Logistics",
    "Government",
    "Non-Profit",
  ]

  const companySizes = [
    "1-50 employees",
    "51-200 employees",
    "201-1000 employees",
    "1001-5000 employees",
    "5000+ employees",
  ]

  const locations = [
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Hyderabad",
    "Pune",
    "Chennai",
    "Gurgaon",
    "Noida",
    "Kolkata",
    "Ahmedabad",
    "Kochi",
    "Indore",
    "Hybrid",
    "Remote",
  ]

  const companyTypes = [
    "MNC",
    "Indian MNC",
    "Startup",
    "Unicorn",
    "Product Based",
    "Fortune 500",
    "Government",
    "Non-Profit",
    "Consulting",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-800/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-indigo-800/20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Discover Top Companies
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl text-slate-600 dark:text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Explore opportunities with industry leaders and find your perfect workplace
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-12"
          >
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 dark:border-slate-700/20 max-w-4xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                    placeholder="Search companies..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-12 h-14 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700 rounded-2xl text-lg font-medium"
                />
              </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Location"
                    value={filters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                    className="pl-12 h-14 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700 rounded-2xl text-lg font-medium"
                />
              </div>
                <Button className="h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 rounded-2xl text-lg">
                  <Search className="w-5 h-5 mr-2" />
                  Search Companies
                </Button>
            </div>
            </div>
          </motion.div>
        </div>
      </section>

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
                placeholder="Search companies..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700 rounded-xl text-sm font-medium"
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="pl-10 h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700 rounded-xl text-sm font-medium"
              />
            </div>
            <Button className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 rounded-xl text-sm shadow-lg">
              <Search className="w-4 h-4 mr-2" />
              Search Companies
            </Button>
          </div>
        </div>
      </motion.div>

      {/* TalentPulse Premium Banner */}
      <div className="bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/naukri-talent-cloud">
            <div className="flex flex-col sm:flex-row items-center justify-between text-white cursor-pointer group">
              <div className="flex items-center mb-2 sm:mb-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="font-semibold text-sm sm:text-base">TalentPulse for Employers</span>
                <span className="ml-2 text-xs sm:text-sm opacity-90">Advanced talent analytics & insights</span>
              </div>
              <Button
                size="sm"
                className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg transition-all duration-300 group-hover:scale-105 text-xs sm:text-sm"
              >
                Learn More
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              </Button>
            </div>
          </Link>
        </div>
      </div>

      {/* Industry Type Filters with Enhanced Hover Effects */}
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{getHeaderText()}</h2>
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Showing {startIndex + 1}-{Math.min(endIndex, totalCompanies)} of {totalCompanies} companies
            </span>
          </div>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0 hover:scale-110 transition-all duration-300 hidden sm:flex"
              onClick={scrollLeft}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div
              ref={scrollRef}
              className="flex space-x-4 sm:space-x-6 overflow-x-auto scrollbar-hide pb-4 px-0 sm:px-12"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {industryTypes.map((type, index) => {
                const sectorColors = getSectorColor(type.sector)
                const isSelected = selectedIndustry === type.name
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                      <Card
                        className={`min-w-[200px] sm:min-w-[240px] cursor-pointer transition-all duration-500 border-0 group ${
                          isSelected
                            ? `${sectorColors.light} ring-2 ${sectorColors.ring} shadow-2xl ${sectorColors.glow}`
                            : "bg-white/80 dark:bg-slate-800/80 hover:shadow-2xl hover:shadow-blue-500/10"
                        } backdrop-blur-xl overflow-hidden relative`}
                        onClick={() => handleIndustryCardSelection(isSelected ? null : type.name)}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${sectorColors.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                        />
                        <CardContent className="p-4 sm:p-6 text-center relative z-10">
                          <div className="mb-3 sm:mb-4">
                            <div
                              className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-2xl bg-gradient-to-br ${sectorColors.bg} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                            >
                              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                          </div>
                          <h3
                            className={`font-bold text-base sm:text-lg mb-2 ${isSelected ? sectorColors.text : "text-slate-900 dark:text-white group-hover:" + sectorColors.text} transition-colors duration-300`}
                          >
                            {type.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
                            {type.count}
                          </p>
                          <div
                            className={`w-full h-1.5 sm:h-2 rounded-full bg-gradient-to-r ${sectorColors.bg} ${isSelected ? "opacity-100" : "opacity-30 group-hover:opacity-70"} transition-all duration-300`}
                          />
                        </CardContent>
                      </Card>
                  </motion.div>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0 hover:scale-110 transition-all duration-300 hidden sm:flex"
              onClick={scrollRight}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex gap-6 sm:gap-8">
          {/* Sticky Filters Sidebar */}
          <div className={`w-full lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="sticky top-32 z-10 h-fit">
              <Card className="border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                    <div className="flex items-center">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    All Filters
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="lg:hidden text-slate-500 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                      {/* Clear All Filters */}
                      {(filters.industries.length > 0 || filters.companyTypes.length > 0 || filters.companySizes.length > 0 || filters.locations.length > 0 || filters.minRating || filters.salaryRange) && (
                        <div className="mb-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllFilters}
                            className="w-full text-xs bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Clear All Filters
                          </Button>
                        </div>
                      )}

                      {/* Industry */}
                      <div>
                        <h3 className="font-semibold mb-3 text-sm sm:text-base text-slate-900 dark:text-white">
                          Industry
                        </h3>
                        <div className="space-y-2">
                            {industries.map((industry) => {
                              const isAutoSelected = selectedIndustry && filters.industries.includes(industry)
                              return (
                              <div key={industry} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={industry} 
                                    checked={filters.industries.includes(industry)}
                                    onCheckedChange={() => handleIndustryToggle(industry)}
                                  />
                                <label
                                  htmlFor={industry}
                                    className={`text-xs sm:text-sm cursor-pointer ${
                                      isAutoSelected 
                                        ? "text-blue-600 dark:text-blue-400 font-medium" 
                                        : "text-slate-700 dark:text-slate-300"
                                    }`}
                                >
                                  {industry}
                                    {isAutoSelected && (
                                      <span className="ml-1 text-xs text-blue-500">(auto)</span>
                                    )}
                                </label>
                              </div>
                              )
                            })}
                          </div>
                        </div>

                      <Separator className="bg-slate-200 dark:bg-slate-700" />

                      {/* Company Type */}
                      <div>
                        <h3 className="font-semibold mb-3 text-sm sm:text-base text-slate-900 dark:text-white">
                          Company Type
                        </h3>
                        <div className="space-y-2">
                          {companyTypes.map((type) => {
                            const isAutoSelected = selectedIndustry && filters.companyTypes.includes(type)
                            return (
                            <div key={type} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={type} 
                                  checked={filters.companyTypes.includes(type)}
                                  onCheckedChange={() => handleCompanyTypeToggle(type)}
                                />
                              <label
                                htmlFor={type}
                                  className={`text-xs sm:text-sm cursor-pointer ${
                                    isAutoSelected 
                                      ? "text-blue-600 dark:text-blue-400 font-medium" 
                                      : "text-slate-700 dark:text-slate-300"
                                  }`}
                              >
                                {type}
                                  {isAutoSelected && (
                                    <span className="ml-1 text-xs text-blue-500">(auto)</span>
                                  )}
                              </label>
                            </div>
                            )
                          })}
                        </div>
                      </div>

                      <Separator className="bg-slate-200 dark:bg-slate-700" />

                      {/* Company Size */}
                      <div>
                        <h3 className="font-semibold mb-3 text-sm sm:text-base text-slate-900 dark:text-white">
                          Company Size
                        </h3>
                        <div className="space-y-2">
                          {companySizes.map((size) => (
                            <div key={size} className="flex items-center space-x-2">
                              <Checkbox 
                                id={size} 
                                checked={filters.companySizes.includes(size)}
                                onCheckedChange={() => handleCompanySizeToggle(size)}
                              />
                              <label
                                htmlFor={size}
                                className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                              >
                                {size}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator className="bg-slate-200 dark:bg-slate-700" />

                      {/* Location */}
                      <div>
                        <h3 className="font-semibold mb-3 text-sm sm:text-base text-slate-900 dark:text-white">
                          Location
                        </h3>
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

                      <Separator className="bg-slate-200 dark:bg-slate-700" />

                      {/* Rating */}
                      <div>
                        <h3 className="font-semibold mb-3 text-sm sm:text-base text-slate-900 dark:text-white">
                          Rating
                        </h3>
                        <Select value={filters.minRating} onValueChange={(value) => handleFilterChange("minRating", value)}>
                          <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm">
                            <SelectValue placeholder="Minimum rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4.5">4.5+ stars</SelectItem>
                            <SelectItem value="4.0">4.0+ stars</SelectItem>
                            <SelectItem value="3.5">3.5+ stars</SelectItem>
                            <SelectItem value="3.0">3.0+ stars</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator className="bg-slate-200 dark:bg-slate-700" />

                      {/* Salary Range */}
                      <div>
                        <h3 className="font-semibold mb-3 text-sm sm:text-base text-slate-900 dark:text-white">
                          Salary Range
                        </h3>
                        <Select value={filters.salaryRange} onValueChange={(value) => handleFilterChange("salaryRange", value)}>
                          <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-10">0-10 LPA</SelectItem>
                            <SelectItem value="10-20">10-20 LPA</SelectItem>
                            <SelectItem value="20-30">20-30 LPA</SelectItem>
                            <SelectItem value="30+">30+ LPA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Company Listings */}
          <div className="flex-1 min-w-0 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-auto gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {isFeaturedFilter 
                      ? "Featured Companies" 
                      : selectedIndustry 
                        ? `${selectedIndustry} Companies` 
                        : "All Companies"
                    }
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                  {startIndex + 1}-{Math.min(endIndex, totalCompanies)} of {totalCompanies} companies
                </p>
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
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="openings">Most Openings</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                    <SelectItem value="name">Company Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(filters.industries.length > 0 || filters.companyTypes.length > 0 || filters.companySizes.length > 0 || filters.locations.length > 0 || filters.minRating || filters.salaryRange || isFeaturedFilter) && (
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
                    {isFeaturedFilter && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                        Featured Companies Only
                        <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setIsFeaturedFilter(false)} />
                      </Badge>
                    )}
                    {filters.industries.map((industry) => {
                      const isAutoSelected = selectedIndustry && filters.industries.includes(industry)
                      return (
                        <Badge key={industry} variant="secondary" className={`${
                          isAutoSelected 
                            ? "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100" 
                            : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                        }`}>
                          Industry: {industry}
                          {isAutoSelected && <span className="ml-1 text-xs">(auto)</span>}
                          <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleIndustryToggle(industry)} />
                        </Badge>
                      )
                    })}
                  {filters.companyTypes.map((type) => {
                    const isAutoSelected = selectedIndustry && filters.companyTypes.includes(type)
                    return (
                      <Badge key={type} variant="secondary" className={`${
                        isAutoSelected 
                          ? "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100" 
                          : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                      }`}>
                        Type: {type}
                        {isAutoSelected && <span className="ml-1 text-xs">(auto)</span>}
                        <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleCompanyTypeToggle(type)} />
                      </Badge>
                    )
                  })}
                  {filters.companySizes.map((size) => (
                    <Badge key={size} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                      Size: {size}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleCompanySizeToggle(size)} />
                    </Badge>
                  ))}
                  {filters.locations.map((location) => (
                    <Badge key={location} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                      Location: {location}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleLocationToggle(location)} />
                    </Badge>
                  ))}
                  {filters.minRating && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                      Rating: {filters.minRating}+
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("minRating", "")} />
                    </Badge>
                  )}
                  {filters.salaryRange && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                      Salary: {filters.salaryRange} LPA
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("salaryRange", "")} />
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Company Grid */}
            <div className="space-y-4 sm:space-y-6">
              {loadError && (
                <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                  {loadError}
                </div>
              )}
              {loadingCompanies && (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
                        <CardContent className="p-6">
                          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {[...Array(4)].map((_, j) => (
                              <div key={j} className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
              {!loadingCompanies && currentCompanies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No companies found</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Try adjusting your filters or search terms to find more companies.
                  </p>
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </div>
              ) : !loadingCompanies ? (
                currentCompanies.map((company, index) => {
                const sectorColors = getSectorColor(company.sector)

                return (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.6 }}
                    whileHover={{ y: -5 }}
                    onHoverStart={() => setSelectedCompany(company.id)}
                    onHoverEnd={() => setSelectedCompany(null)}
                  >
                    <Card
                      className={`group cursor-pointer border-0 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative ${
                        company.urgent
                          ? "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 ring-2 ring-red-200 dark:ring-red-800"
                          : "bg-white/70 dark:bg-slate-800/70"
                      } ${sectorColors.border}`}
                    >
                        {/* Badges positioned above follow button */}
                        {(company.featured || company.urgent) && (
                          <div className="absolute top-4 right-4 z-10">
                            {company.featured && company.urgent ? (
                              // Show alternating badges when both are present
                              badgeDisplay === 'featured' ? (
                                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs animate-pulse">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              ) : (
                                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs animate-pulse">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Urgent Hiring
                                </Badge>
                              )
                            ) : company.featured ? (
                            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                            ) : (
                              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs animate-bounce">
                              <Zap className="w-3 h-3 mr-1" />
                              Urgent Hiring
                            </Badge>
                          )}
                        </div>
                        )}

                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${sectorColors.bg} opacity-0 ${!company.urgent ? 'group-hover:opacity-10' : ''} transition-opacity duration-500`}
                        />

                        <CardContent className="p-4 sm:p-6 lg:p-8">
                          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                            <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-2 ring-white/50 group-hover:ring-4 transition-all duration-300 shadow-lg flex-shrink-0 mx-auto lg:mx-0">
                                <AvatarImage src={company.logo || "/placeholder.svg"} alt={company.name} />
                                <AvatarFallback className={`text-xl sm:text-2xl font-bold ${sectorColors.text}`}>
                                  {company.name[0]}
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3
                                    className={`text-xl sm:text-2xl font-bold mb-2 transition-colors duration-300 ${
                                      company.urgent
                                        ? "text-red-700 dark:text-red-400"
                                        : "text-slate-900 dark:text-white group-hover:text-blue-600"
                                    } line-clamp-2`}
                                  >
                                    {company.name}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3">
                                    <Badge
                                      className={`${sectorColors.text} ${sectorColors.border} bg-gradient-to-r ${sectorColors.bg} bg-opacity-10 text-xs sm:text-sm`}
                                    >
                                      {company.industry}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {company.companyType}
                                    </Badge>
                                    {company.urgent && (
                                      <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                                        Hiring Now
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center mb-3">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                    <span className="font-semibold text-sm sm:text-base">{company.rating}</span>
                                    <span className="text-slate-500 text-xs sm:text-sm ml-1">
                                      ({company.reviews.toLocaleString()} reviews)
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-0 lg:space-y-3 flex-shrink-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={`w-full sm:w-auto backdrop-blur-sm transition-all duration-300 text-xs sm:text-sm ${
                                      followedCompanies.has(company.id) 
                                        ? "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" 
                                        : "bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-600"
                                    }`}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      handleFollowToggle(company.id)
                                    }}
                                    disabled={loadingFollow.has(company.id)}
                                  >
                                    <Heart className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${followedCompanies.has(company.id) ? "fill-current" : ""}`} />
                                    {loadingFollow.has(company.id) 
                                      ? "..." 
                                      : followedCompanies.has(company.id) 
                                        ? "Following" 
                                        : "Follow"
                                    }
                                  </Button>
                                  <Link href={`/companies/${company.id}`}>
                                    <Button
                                      className={`w-full sm:w-auto bg-gradient-to-r ${sectorColors.bg} ${sectorColors.hover} hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm`}
                                    >
                                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                      View ({company.activeJobsCount || company.openings || 0})
                                    </Button>
                                  </Link>
                                </div>
                              </div>

                              <p className="text-slate-700 dark:text-slate-300 mb-4 sm:mb-6 line-clamp-2 leading-relaxed text-sm sm:text-base">
                                {company.description}
                              </p>

                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="flex items-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                  <span className="truncate">{company.location}</span>
                                </div>
                                <div className="flex items-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                  <span className="truncate">{company.employees} employees</span>
                                </div>
                                <div className="flex items-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                  <span className="truncate">Founded {company.founded}</span>
                                </div>
                                <div className="flex items-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                  <span className="truncate">{company.salaryRange}</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                                {company.benefits.slice(0, 4).map((benefit, benefitIndex) => (
                                  <Badge
                                    key={benefitIndex}
                                    variant="secondary"
                                    className="text-xs bg-slate-100 dark:bg-slate-700"
                                  >
                                    {benefit}
                                  </Badge>
                                ))}
                                {company.benefits.length > 4 && (
                                  <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700">
                                    +{company.benefits.length - 4} more
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 gap-2">
                                <div className="flex items-center space-x-4">
                                  <span className="text-xs sm:text-sm text-slate-500">
                                    Work Culture: {company.workCulture}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {company.activeJobsCount || company.openings || 0} open positions
                                  </span>
                                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                  </motion.div>
                )
              }) 
            ): null}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 sm:mt-12 gap-4">
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Showing {startIndex + 1} to {Math.min(endIndex, totalCompanies)} of {totalCompanies} companies
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-xs sm:text-sm"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                    if (pageNum > totalPages) return null

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        className={
                          currentPage === pageNum
                            ? "bg-blue-600 text-white text-xs sm:text-sm"
                            : "bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-xs sm:text-sm"
                        }
                      >
                        {pageNum}
                      </Button>
                    )
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-slate-400">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-xs sm:text-sm"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-xs sm:text-sm"
                >
                  Next
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                links: [
                  { name: "Browse Jobs", href: "/jobs" },
                  { name: "Career Advice", href: "/career-advice" },
                  { name: "Resume Builder", href: "/resume-builder" },
                  { name: "Salary Guide", href: "/salary-guide" },
                  { name: "JobAtPace Premium", href: "/jobatpace" },
                ],
              },
              {
                title: "For Employers",
                links: [
                  { name: "Post Jobs", href: "/employer-dashboard/post-job" },
                  { name: "Search Resumes", href: "/employer-dashboard/requirements" },
                  { name: "Recruitment Solutions", href: "/naukri-talent-cloud" },
                  { name: "Pricing", href: "/pricing" },
                  { name: "TalentPulse", href: "/naukri-talent-cloud" },
                ],
              },
              {
                title: "Company",
                links: [
                  { name: "About Us", href: "/about" },
                  { name: "Contact", href: "/contact" },
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Terms of Service", href: "/terms" },
                ],
              },
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4 sm:mb-6 text-base sm:text-lg">{section.title}</h3>
                <ul className="space-y-2 sm:space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-white transition-colors hover:underline text-sm sm:text-base"
                      >
                        {link.name}
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
