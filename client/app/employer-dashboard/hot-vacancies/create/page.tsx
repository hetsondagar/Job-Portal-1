"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Upload, 
  Plus, 
  X, 
  AlertCircle, 
  Star, 
  Zap, 
  Target, 
  Mail, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  TrendingUp,
  Shield,
  Crown,
  Rocket,
  CheckCircle,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import IndustryDropdown from "@/components/ui/industry-dropdown"
import RoleCategoryDropdown from "@/components/ui/role-category-dropdown"

interface PricingTier {
  name: string;
  price: number;
  currency: string;
  features: string[];
  duration: number;
  tierLevel: string;
}

export default function CreateHotVacancyPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [publishing, setPublishing] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string>("premium")
  const [pricingTiers, setPricingTiers] = useState<Record<string, PricingTier>>({})
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    department: "",
    location: "",
    type: "",
    experience: "",
    salary: "",
    description: "",
    requirements: "",
    benefits: "",
    skills: [] as string[],
    role: "",
    industryType: "",
    roleCategory: "",
    education: "",
    employmentType: "",
    
    // Premium Features
    urgentHiring: false,
    multipleEmailIds: [] as string[],
    boostedSearch: true,
    searchBoostLevel: "premium",
    citySpecificBoost: [] as string[],
    videoBanner: "",
    whyWorkWithUs: "",
    companyReviews: [] as string[],
    autoRefresh: false,
    refreshDiscount: 0,
    attachmentFiles: [] as string[],
    officeImages: [] as string[],
    companyProfile: "",
    proactiveAlerts: true,
    alertRadius: 50,
    alertFrequency: "immediate",
    featuredKeywords: [] as string[],
    customBranding: {},
    superFeatured: false,
    tierLevel: "premium"
  })
  
  const [jobPhotos, setJobPhotos] = useState<any[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [currentSkill, setCurrentSkill] = useState("")
  const [currentEmail, setCurrentEmail] = useState("")
  const [currentKeyword, setCurrentKeyword] = useState("")
  const [currentCity, setCurrentCity] = useState("")
  const [currentReview, setCurrentReview] = useState("")
  
  const steps = [
    { id: 1, title: "Basic Info", description: "Basic job information" },
    { id: 2, title: "Premium Features", description: "Advanced hot vacancy features" },
    { id: 3, title: "Pricing & Boost", description: "Choose your tier and boost options" },
    { id: 4, title: "Media & Attachments", description: "Photos, videos, and documents" },
    { id: 5, title: "Review & Publish", description: "Final review and payment" }
  ]

  // Load pricing tiers
  useEffect(() => {
  const loadPricingTiers = async () => {
    try {
        const response = await apiService.getHotVacancyPricingTiers()
      if (response.success) {
          setPricingTiers(response.data)
      }
    } catch (error) {
        console.error('Error loading pricing tiers:', error)
      }
    }
    
    loadPricingTiers()
  }, [])

  // Auth check
  useEffect(() => {
    if (!loading && !user) {
      setShowAuthDialog(true)
    }
  }, [user, loading])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSkillAdd = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }))
      setCurrentSkill("")
    }
  }

  const handleSkillRemove = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const handleEmailAdd = () => {
    if (currentEmail.trim() && !formData.multipleEmailIds.includes(currentEmail.trim())) {
      setFormData(prev => ({
        ...prev,
        multipleEmailIds: [...prev.multipleEmailIds, currentEmail.trim()]
      }))
      setCurrentEmail("")
    }
  }

  const handleEmailRemove = (email: string) => {
    setFormData(prev => ({
      ...prev,
      multipleEmailIds: prev.multipleEmailIds.filter(e => e !== email)
    }))
  }

  const handleKeywordAdd = () => {
    if (currentKeyword.trim() && !formData.featuredKeywords.includes(currentKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        featuredKeywords: [...prev.featuredKeywords, currentKeyword.trim()]
      }))
      setCurrentKeyword("")
    }
  }

  const handleKeywordRemove = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      featuredKeywords: prev.featuredKeywords.filter(k => k !== keyword)
    }))
  }

  const handleCityAdd = () => {
    if (currentCity.trim() && !formData.citySpecificBoost.includes(currentCity.trim())) {
      setFormData(prev => ({
        ...prev,
        citySpecificBoost: [...prev.citySpecificBoost, currentCity.trim()]
      }))
      setCurrentCity("")
    }
  }

  const handleCityRemove = (city: string) => {
    setFormData(prev => ({
      ...prev,
      citySpecificBoost: prev.citySpecificBoost.filter(c => c !== city)
    }))
  }

  const handleReviewAdd = () => {
    if (currentReview.trim() && !formData.companyReviews.includes(currentReview.trim())) {
      setFormData(prev => ({
        ...prev,
        companyReviews: [...prev.companyReviews, currentReview.trim()]
      }))
      setCurrentReview("")
    }
  }

  const handleReviewRemove = (review: string) => {
    setFormData(prev => ({
      ...prev,
      companyReviews: prev.companyReviews.filter(r => r !== review)
    }))
  }

  const handlePublish = async () => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }

    setPublishing(true)
    try {
      const selectedTierData = pricingTiers[selectedTier]
      const hotVacancyData = {
        ...formData,
        pricingTier: selectedTier,
        price: selectedTierData?.price || 5999,
        currency: selectedTierData?.currency || 'INR',
        tierLevel: selectedTierData?.tierLevel || 'premium',
        urgencyLevel: formData.urgentHiring ? 'critical' : 'high',
        hiringTimeline: formData.urgentHiring ? 'immediate' : '1-week'
      }

      const response = await apiService.createHotVacancy(hotVacancyData)
      
      if (response.success) {
        toast.success("🔥 Hot Vacancy created successfully!")
        router.push(`/employer-dashboard/hot-vacancies/${response.data.id}`)
      } else {
        toast.error(response.message || "Failed to create hot vacancy")
      }
    } catch (error) {
      console.error('Error creating hot vacancy:', error)
      toast.error("Failed to create hot vacancy. Please try again.")
    } finally {
      setPublishing(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
    return (
          <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="e.g., Engineering"
                  className="mt-1"
                    />
                  </div>
              
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Bangalore, India"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Job Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
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
                <Label htmlFor="experience">Experience Level *</Label>
                <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="junior">Junior (2-4 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (4-7 years)</SelectItem>
                    <SelectItem value="senior">Senior (7-12 years)</SelectItem>
                    <SelectItem value="lead">Lead (12+ years)</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="salary">Salary Range</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  placeholder="e.g., ₹8,00,000 - ₹12,00,000"
                  className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the role, responsibilities, and what makes this opportunity special..."
                className="mt-1 min-h-[120px]"
              />
            </div>
            
            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="List the key requirements and qualifications..."
                className="mt-1 min-h-[100px]"
                  />
                </div>

                <div>
              <Label htmlFor="benefits">Benefits & Perks</Label>
                  <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) => handleInputChange('benefits', e.target.value)}
                placeholder="List the benefits, perks, and what makes your company great to work for..."
                className="mt-1 min-h-[100px]"
                  />
                </div>
            
            <div>
              <Label>Key Skills</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && handleSkillAdd()}
                />
                <Button type="button" onClick={handleSkillAdd} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleSkillRemove(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  placeholder="e.g., Software Engineer"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="industryType">Industry Type</Label>
                <IndustryDropdown
                  value={formData.industryType}
                  onValueChange={(value) => handleInputChange('industryType', value)}
                />
              </div>
              
              <div>
                <Label htmlFor="roleCategory">Role Category</Label>
                <RoleCategoryDropdown
                  value={formData.roleCategory}
                  onValueChange={(value) => handleInputChange('roleCategory', value)}
                />
              </div>
              
              <div>
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="e.g., B.Tech/B.E."
                  className="mt-1"
                />
                  </div>
              
                  <div>
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select value={formData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
                      <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

            {/* Premium Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Premium Hot Vacancy Features
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="urgentHiring"
                      checked={formData.urgentHiring}
                      onCheckedChange={(checked) => handleInputChange('urgentHiring', checked)}
                    />
                    <Label htmlFor="urgentHiring" className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Urgent Hiring
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Mark this as urgent hiring for maximum visibility</p>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="boostedSearch"
                      checked={formData.boostedSearch}
                      onCheckedChange={(checked) => handleInputChange('boostedSearch', checked)}
                    />
                    <Label htmlFor="boostedSearch" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      Boosted Search
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Get priority placement in search results</p>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="proactiveAlerts"
                      checked={formData.proactiveAlerts}
                      onCheckedChange={(checked) => handleInputChange('proactiveAlerts', checked)}
                    />
                    <Label htmlFor="proactiveAlerts" className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      Proactive Alerts
                    </Label>
                </div>
                  <p className="text-sm text-gray-600 mt-1">Send alerts to matching candidates</p>
            </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="superFeatured"
                      checked={formData.superFeatured}
                      onCheckedChange={(checked) => handleInputChange('superFeatured', checked)}
                    />
                    <Label htmlFor="superFeatured" className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-500" />
                      Super Featured
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Get super featured status with premium badge</p>
                </Card>
              </div>
            </div>
            
            {/* Multiple Email Support */}
                  <div>
              <Label>Additional Email IDs for Applications</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  placeholder="Add email address"
                  type="email"
                  onKeyPress={(e) => e.key === 'Enter' && handleEmailAdd()}
                />
                <Button type="button" onClick={handleEmailAdd} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.multipleEmailIds.map((email, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {email}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleEmailRemove(email)}
                    />
                  </Badge>
                ))}
              </div>
                  </div>
            
            {/* Alert Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                <Label htmlFor="alertRadius">Alert Radius (km)</Label>
                <div className="mt-2">
                  <Slider
                    value={[formData.alertRadius]}
                    onValueChange={(value) => handleInputChange('alertRadius', value[0])}
                    max={200}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>10 km</span>
                    <span>{formData.alertRadius} km</span>
                    <span>200 km</span>
                  </div>
                </div>
                  </div>
              
                  <div>
                <Label htmlFor="alertFrequency">Alert Frequency</Label>
                <Select value={formData.alertFrequency} onValueChange={(value) => handleInputChange('alertFrequency', value)}>
                      <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose Your Hot Vacancy Tier</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(pricingTiers).map(([key, tier]) => (
                  <Card 
                    key={key} 
                    className={`cursor-pointer transition-all ${
                      selectedTier === key 
                        ? 'ring-2 ring-blue-500 border-blue-500' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTier(key)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{tier.name}</CardTitle>
                        {selectedTier === key && <CheckCircle className="h-5 w-5 text-blue-500" />}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">₹{tier.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-600">/{tier.duration} days</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Boost Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Boost Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoRefresh"
                      checked={formData.autoRefresh}
                      onCheckedChange={(checked) => handleInputChange('autoRefresh', checked)}
                    />
                    <Label htmlFor="autoRefresh" className="flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-orange-500" />
                      Auto Refresh
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Automatically refresh your listing for continued visibility</p>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="refreshDiscount"
                      checked={formData.refreshDiscount > 0}
                      onCheckedChange={(checked) => handleInputChange('refreshDiscount', checked ? 20 : 0)}
                    />
                    <Label htmlFor="refreshDiscount" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      Refresh Discount (20%)
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Get 20% discount on refresh</p>
                </Card>
              </div>
            </div>
            
            {/* City-Specific Boost */}
            <div>
              <Label>City-Specific Boost</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  placeholder="Add city for specific boost"
                  onKeyPress={(e) => e.key === 'Enter' && handleCityAdd()}
                />
                <Button type="button" onClick={handleCityAdd} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.citySpecificBoost.map((city, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {city}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleCityRemove(city)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Featured Keywords */}
            <div>
              <Label>Featured Keywords</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={currentKeyword}
                  onChange={(e) => setCurrentKeyword(e.target.value)}
                  placeholder="Add featured keyword"
                  onKeyPress={(e) => e.key === 'Enter' && handleKeywordAdd()}
                />
                <Button type="button" onClick={handleKeywordAdd} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.featuredKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {keyword}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleKeywordRemove(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
                  <div>
              <h3 className="text-lg font-semibold mb-4">Media & Attachments</h3>
              
              {/* Video Banner */}
              <div className="mb-6">
                <Label htmlFor="videoBanner">Video Banner URL</Label>
                    <Input
                  id="videoBanner"
                  value={formData.videoBanner}
                  onChange={(e) => handleInputChange('videoBanner', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="mt-1"
                />
                <p className="text-sm text-gray-600 mt-1">Add a video to showcase your company culture</p>
              </div>
              
              {/* Why Work With Us */}
              <div className="mb-6">
                <Label htmlFor="whyWorkWithUs">Why Work With Us</Label>
                <Textarea
                  id="whyWorkWithUs"
                  value={formData.whyWorkWithUs}
                  onChange={(e) => handleInputChange('whyWorkWithUs', e.target.value)}
                  placeholder="Tell candidates why they should choose your company..."
                  className="mt-1 min-h-[100px]"
                />
              </div>
              
              {/* Company Profile */}
              <div className="mb-6">
                <Label htmlFor="companyProfile">Company Profile</Label>
                <Textarea
                  id="companyProfile"
                  value={formData.companyProfile}
                  onChange={(e) => handleInputChange('companyProfile', e.target.value)}
                  placeholder="Detailed company profile and culture..."
                  className="mt-1 min-h-[100px]"
                    />
                  </div>
              
              {/* Company Reviews */}
              <div className="mb-6">
                <Label>Company Reviews</Label>
                <div className="flex gap-2 mt-1">
                    <Input
                    value={currentReview}
                    onChange={(e) => setCurrentReview(e.target.value)}
                    placeholder="Add a company review"
                    onKeyPress={(e) => e.key === 'Enter' && handleReviewAdd()}
                  />
                  <Button type="button" onClick={handleReviewAdd} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {formData.companyReviews.map((review, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="flex-1">{review}</span>
                      <X 
                        className="h-4 w-4 cursor-pointer text-gray-500" 
                        onClick={() => handleReviewRemove(review)}
                      />
                    </div>
                  ))}
                </div>
              </div>
                  </div>
                </div>
        )

      case 5:
        const selectedTierData = pricingTiers[selectedTier]
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Review Your Hot Vacancy</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Title:</strong> {formData.title}</div>
                      <div><strong>Department:</strong> {formData.department}</div>
                      <div><strong>Location:</strong> {formData.location}</div>
                      <div><strong>Type:</strong> {formData.type}</div>
                      <div><strong>Experience:</strong> {formData.experience}</div>
                      <div><strong>Salary:</strong> {formData.salary}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                      <CardTitle>Premium Features</CardTitle>
              </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${formData.urgentHiring ? 'text-green-500' : 'text-gray-300'}`} />
                        <span>Urgent Hiring</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${formData.boostedSearch ? 'text-green-500' : 'text-gray-300'}`} />
                        <span>Boosted Search</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${formData.proactiveAlerts ? 'text-green-500' : 'text-gray-300'}`} />
                        <span>Proactive Alerts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${formData.superFeatured ? 'text-green-500' : 'text-gray-300'}`} />
                        <span>Super Featured</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                  <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>{selectedTierData?.name}</span>
                          <span>₹{selectedTierData?.price.toLocaleString()}</span>
                        </div>
                        {formData.autoRefresh && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Auto Refresh</span>
                            <span>+₹{Math.round(selectedTierData?.price * 0.1)}</span>
                  </div>
                        )}
                        {formData.refreshDiscount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Refresh Discount</span>
                            <span>-{formData.refreshDiscount}%</span>
                  </div>
                        )}
                        <hr />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>₹{selectedTierData?.price.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold text-blue-900">Hot Vacancy Benefits</span>
                    </div>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Priority placement in search results</li>
                      <li>• Proactive alerts to matching candidates</li>
                      <li>• Featured badge and highlighting</li>
                      <li>• Advanced analytics and insights</li>
                      <li>• Multiple email support for applications</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Create Hot Vacancy</h1>
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Premium
            </Badge>
          </div>
          <p className="text-gray-600">
            Create a premium hot vacancy with advanced features for maximum visibility and candidate engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        currentStep === step.id
                          ? 'bg-blue-100 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentStep(step.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          currentStep === step.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {step.id}
                        </div>
                        <div>
                          <div className="font-medium">{step.title}</div>
                          <div className="text-sm text-gray-600">{step.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {renderStepContent()}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
              <Button
                variant="outline"
                  onClick={() => {/* Save as draft */}}
                  disabled={savingDraft}
              >
                  {savingDraft ? 'Saving...' : 'Save Draft'}
              </Button>
                
                {currentStep < steps.length ? (
              <Button
                    onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {publishing ? 'Publishing...' : '🔥 Publish Hot Vacancy'}
                  </Button>
                )}
              </div>
            </div>
        </div>
      </div>
      </div>
      
      <EmployerFooter />
    </div>
  )
}
