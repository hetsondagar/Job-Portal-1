"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Flame, Clock, Users, Eye, Edit, Trash2, Filter, Search, DollarSign, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { apiService } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface HotVacancy {
  id: string
  title: string
  location: string
  urgencyLevel: 'high' | 'critical' | 'immediate'
  hiringTimeline: 'immediate' | '1-week' | '2-weeks' | '1-month'
  status: 'draft' | 'active' | 'paused' | 'closed' | 'expired'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  price: number
  currency: string
  pricingTier: 'basic' | 'premium' | 'enterprise'
  views: number
  applications: number
  maxApplications: number
  validTill: string
  applicationDeadline: string
  createdAt: string
  company?: {
    name: string
    industry: string
  }
  photos?: Array<{
    id: string
    fileUrl: string
    isPrimary: boolean
  }>
}

interface PricingTier {
  name: string
  price: number
  currency: string
  features: string[]
  duration: number
}

export default function HotVacanciesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [hotVacancies, setHotVacancies] = useState<HotVacancy[]>([])
  const [pricingTiers, setPricingTiers] = useState<Record<string, PricingTier>>({})
  const [loadingData, setLoadingData] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [showPricingModal, setShowPricingModal] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      loadHotVacancies()
      loadPricingTiers()
    }
  }, [user, loading])

  const loadHotVacancies = async () => {
    try {
      setLoadingData(true)
      const response = await apiService.getHotVacancies()
      if (response.success) {
        setHotVacancies(response.data || [])
      } else {
        toast.error('Failed to load hot vacancies')
      }
    } catch (error) {
      console.error('Failed to load hot vacancies:', error)
      toast.error('Failed to load hot vacancies')
    } finally {
      setLoadingData(false)
    }
  }

  const loadPricingTiers = async () => {
    try {
      const response = await apiService.getHotVacancyPricing()
      if (response.success) {
        setPricingTiers(response.data || {})
      }
    } catch (error) {
      console.error('Failed to load pricing tiers:', error)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'bg-red-600 text-white'
      case 'critical': return 'bg-orange-600 text-white'
      case 'high': return 'bg-yellow-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-white'
      case 'draft': return 'bg-gray-600 text-white'
      case 'paused': return 'bg-yellow-600 text-white'
      case 'closed': return 'bg-red-600 text-white'
      case 'expired': return 'bg-gray-500 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-600 text-white'
      case 'pending': return 'bg-yellow-600 text-white'
      case 'failed': return 'bg-red-600 text-white'
      case 'refunded': return 'bg-gray-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const filteredHotVacancies = hotVacancies.filter(vacancy => {
    const matchesSearch = vacancy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vacancy.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || vacancy.status === statusFilter
    const matchesUrgency = urgencyFilter === 'all' || vacancy.urgencyLevel === urgencyFilter
    return matchesSearch && matchesStatus && matchesUrgency
  })

  const handleCreateHotVacancy = () => {
    router.push('/employer-dashboard/hot-vacancies/create')
  }

  const handleViewHotVacancy = (id: string) => {
    router.push(`/employer-dashboard/hot-vacancies/${id}`)
  }

  const handleEditHotVacancy = (id: string) => {
    router.push(`/employer-dashboard/hot-vacancies/${id}/edit`)
  }

  const handleDeleteHotVacancy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hot vacancy?')) return

    try {
      const response = await apiService.deleteHotVacancy(id)
      if (response.success) {
        toast.success('Hot vacancy deleted successfully')
        loadHotVacancies()
      } else {
        toast.error('Failed to delete hot vacancy')
      }
    } catch (error) {
      console.error('Failed to delete hot vacancy:', error)
      toast.error('Failed to delete hot vacancy')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Flame className="h-8 w-8 text-red-600" />
                  Hot Vacancies
                </h1>
                <p className="mt-2 text-gray-600">
                  Premium urgent hiring solutions for immediate recruitment needs
                </p>
              </div>
              <div className="flex gap-3">
                <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      View Pricing
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Hot Vacancy Pricing Plans
                      </DialogTitle>
                      <DialogDescription>
                        Choose the perfect plan for your urgent hiring needs
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {Object.entries(pricingTiers).map(([tier, plan]) => (
                        <Card key={tier} className={`relative ${tier === 'premium' ? 'ring-2 ring-blue-500' : ''}`}>
                          {tier === 'premium' && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                            </div>
                          )}
                          <CardHeader className="text-center">
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <div className="text-3xl font-bold text-blue-600">
                              ₹{plan.price.toLocaleString()}
                            </div>
                            <p className="text-sm text-gray-600">{plan.duration} days listing</p>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button onClick={handleCreateHotVacancy} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Hot Vacancy
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Flame className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Hot Vacancies</p>
                    <p className="text-2xl font-bold text-gray-900">{hotVacancies.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {hotVacancies.filter(v => v.status === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {hotVacancies.reduce((sum, v) => sum + v.applications, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {hotVacancies.reduce((sum, v) => sum + v.views, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search hot vacancies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Urgency</SelectItem>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Hot Vacancies List */}
          {loadingData ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading hot vacancies...</p>
            </div>
          ) : filteredHotVacancies.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Flame className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hot Vacancies Found</h3>
                <p className="text-gray-600 mb-6">
                  {hotVacancies.length === 0 
                    ? "Create your first hot vacancy to start urgent hiring"
                    : "No hot vacancies match your current filters"
                  }
                </p>
                {hotVacancies.length === 0 && (
                  <Button onClick={handleCreateHotVacancy} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Hot Vacancy
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredHotVacancies.map((vacancy) => (
                <motion.div
                  key={vacancy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2 mb-2">
                            {vacancy.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <span>{vacancy.location}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getUrgencyColor(vacancy.urgencyLevel)}>
                            {vacancy.urgencyLevel}
                          </Badge>
                          <Badge className={getStatusColor(vacancy.status)}>
                            {vacancy.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Hiring Timeline:</span>
                          <span className="font-medium">{vacancy.hiringTimeline}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Applications:</span>
                          <span className="font-medium">
                            {vacancy.applications}/{vacancy.maxApplications}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Views:</span>
                          <span className="font-medium">{vacancy.views}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium text-green-600">
                            ₹{vacancy.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Payment:</span>
                          <Badge className={getPaymentStatusColor(vacancy.paymentStatus)}>
                            {vacancy.paymentStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Valid Till:</span>
                          <span className="font-medium">
                            {new Date(vacancy.validTill).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewHotVacancy(vacancy.id)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditHotVacancy(vacancy.id)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteHotVacancy(vacancy.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
