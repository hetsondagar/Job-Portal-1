"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Flame, DollarSign, Star, CheckCircle, Clock, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { apiService } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface PricingTier {
  name: string
  price: number
  currency: string
  features: string[]
  duration: number
}

export default function CreateHotVacancyPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [pricingTiers, setPricingTiers] = useState<Record<string, PricingTier>>({})
  const [selectedTier, setSelectedTier] = useState<string>('premium')
  const [loadingPricing, setLoadingPricing] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    location: '',
    city: '',
    state: '',
    country: 'India',
    jobType: 'full-time',
    experienceLevel: 'mid',
    experienceMin: 0,
    experienceMax: 5,
    salaryMin: '',
    salaryMax: '',
    salary: '',
    salaryCurrency: 'INR',
    salaryPeriod: 'yearly',
    isSalaryVisible: true,
    department: '',
    category: '',
    skills: [] as string[],
    benefits: [] as string[],
    remoteWork: 'on-site',
    travelRequired: false,
    shiftTiming: 'day',
    noticePeriod: '',
    education: [] as string[],
    certifications: [] as string[],
    languages: [] as string[],
    tags: [] as string[],
    urgencyLevel: 'high',
    hiringTimeline: 'immediate',
    maxApplications: 50,
    applicationDeadline: '',
    seoTitle: '',
    seoDescription: '',
    keywords: [] as string[]
  })

  useEffect(() => {
    if (!loading && user) {
      loadPricingTiers()
    }
  }, [user, loading])

  const loadPricingTiers = async () => {
    try {
      setLoadingPricing(true)
      const response = await apiService.getHotVacancyPricing()
      if (response.success) {
        setPricingTiers(response.data || {})
      }
    } catch (error) {
      console.error('Failed to load pricing tiers:', error)
      toast.error('Failed to load pricing information')
    } finally {
      setLoadingPricing(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.location) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!selectedTier || !pricingTiers[selectedTier]) {
      toast.error('Please select a pricing tier')
      return
    }

    try {
      setSubmitting(true)
      
      const hotVacancyData = {
        ...formData,
        pricingTier: selectedTier,
        price: pricingTiers[selectedTier].price,
        currency: pricingTiers[selectedTier].currency,
        // Set premium features based on tier
        priorityListing: true,
        featuredBadge: true,
        unlimitedApplications: selectedTier === 'enterprise',
        advancedAnalytics: true,
        candidateMatching: true,
        directContact: selectedTier === 'enterprise'
      }

      const response = await apiService.createHotVacancy(hotVacancyData)
      
      if (response.success) {
        toast.success('Hot vacancy created successfully!')
        router.push('/employer-dashboard/hot-vacancies')
      } else {
        toast.error(response.message || 'Failed to create hot vacancy')
      }
    } catch (error) {
      console.error('Failed to create hot vacancy:', error)
      toast.error('Failed to create hot vacancy')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || loadingPricing) {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-3 mb-2">
              <Flame className="h-8 w-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900">Create Hot Vacancy</h1>
            </div>
            <p className="text-gray-600">
              Premium urgent hiring solution for immediate recruitment needs
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Pricing Tier Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Choose Your Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(pricingTiers).map(([tier, plan]) => (
                    <div
                      key={tier}
                      className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all ${
                        selectedTier === tier
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTier(tier)}
                    >
                      {tier === 'premium' && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                        </div>
                      )}
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          ₹{plan.price.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{plan.duration} days listing</p>
                        <ul className="space-y-2 text-sm">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Mumbai, Maharashtra"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    placeholder="Brief summary of the role (optional)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Urgency & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Urgency & Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="urgencyLevel">Urgency Level</Label>
                    <Select
                      value={formData.urgencyLevel}
                      onValueChange={(value) => handleInputChange('urgencyLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="immediate">Immediate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="hiringTimeline">Hiring Timeline</Label>
                    <Select
                      value={formData.hiringTimeline}
                      onValueChange={(value) => handleInputChange('hiringTimeline', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="1-week">1 Week</SelectItem>
                        <SelectItem value="2-weeks">2 Weeks</SelectItem>
                        <SelectItem value="1-month">1 Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxApplications">Maximum Applications</Label>
                  <Input
                    id="maxApplications"
                    type="number"
                    value={formData.maxApplications}
                    onChange={(e) => handleInputChange('maxApplications', parseInt(e.target.value))}
                    placeholder="50"
                    min="1"
                    max="1000"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select
                      value={formData.jobType}
                      onValueChange={(value) => handleInputChange('jobType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full Time</SelectItem>
                        <SelectItem value="part-time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select
                      value={formData.experienceLevel}
                      onValueChange={(value) => handleInputChange('experienceLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="remoteWork">Work Type</Label>
                    <Select
                      value={formData.remoteWork}
                      onValueChange={(value) => handleInputChange('remoteWork', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on-site">On Site</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="experienceMin">Minimum Experience (years)</Label>
                    <Input
                      id="experienceMin"
                      type="number"
                      value={formData.experienceMin}
                      onChange={(e) => handleInputChange('experienceMin', parseInt(e.target.value))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experienceMax">Maximum Experience (years)</Label>
                    <Input
                      id="experienceMax"
                      type="number"
                      value={formData.experienceMax}
                      onChange={(e) => handleInputChange('experienceMax', parseInt(e.target.value))}
                      placeholder="5"
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Salary Information */}
            <Card>
              <CardHeader>
                <CardTitle>Salary Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="salaryMin">Minimum Salary</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryMax">Maximum Salary</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                      placeholder="1000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryPeriod">Salary Period</Label>
                    <Select
                      value={formData.salaryPeriod}
                      onValueChange={(value) => handleInputChange('salaryPeriod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4" />
                    Create Hot Vacancy
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
