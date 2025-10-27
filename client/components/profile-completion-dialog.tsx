"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { apiService, User } from '@/lib/api'
import { toast } from 'sonner'
import { User as UserIcon, Briefcase, MapPin, DollarSign, Calendar, Building2, ChevronDown, Upload, Image, Palette } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown"
import DepartmentDropdown from "@/components/ui/department-dropdown"

interface ProfileCompletionDialogProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onProfileUpdated: (userData: any) => void
}

export function JobseekerProfileCompletionDialog({ 
  isOpen, 
  onClose, 
  user,
  onProfileUpdated 
}: ProfileCompletionDialogProps) {
  const [formData, setFormData] = useState({
    phone: '',
    currentLocation: '',
    headline: '',
    summary: '',
    experienceYears: '',
    expectedSalary: '',
    noticePeriod: '',
    skills: '',
    dateOfBirth: '',
    gender: '',
    willingToRelocate: false,
    preferredLocations: '',
    // Professional Details
    currentCompany: '',
    currentRole: '',
    highestEducation: '',
    fieldOfStudy: '',
    // Preferred Professional Details
    preferredJobTitles: '',
    preferredIndustries: '',
    preferredCompanySize: '',
    preferredWorkMode: '',
    preferredEmploymentType: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Check if profile is incomplete - COMPREHENSIVE CHECK
  const isProfileIncomplete = () => {
    // Check if user has marked profile as complete
    if (user.preferences?.profileCompleted === true) {
      return false
    }

    // Required fields for jobseeker
    const hasRequiredFields = user.phone && 
                              user.currentLocation && 
                              user.headline && 
                              (user.experienceYears !== undefined && user.experienceYears !== null) &&
                              user.gender &&
                              (user as any).dateOfBirth

    return !hasRequiredFields
  }

  // Load existing data
  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        currentLocation: user.currentLocation || '',
        headline: user.headline || '',
        summary: user.summary || '',
        experienceYears: user.experienceYears?.toString() || '',
        expectedSalary: user.expectedSalary?.toString() || '',
        noticePeriod: user.noticePeriod?.toString() || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
        dateOfBirth: (user as any).dateOfBirth || '',
        gender: (user as any).gender || '',
        willingToRelocate: user.willingToRelocate || false,
        preferredLocations: Array.isArray((user as any).preferredLocations) ? (user as any).preferredLocations.join(', ') : '',
        // Professional Details
        currentCompany: (user as any).currentCompany || '',
        currentRole: (user as any).currentRole || '',
        highestEducation: (user as any).highestEducation || '',
        fieldOfStudy: (user as any).fieldOfStudy || '',
        // Preferred Professional Details
        preferredJobTitles: Array.isArray((user as any).preferredJobTitles) ? (user as any).preferredJobTitles.join(', ') : '',
        preferredIndustries: Array.isArray((user as any).preferredIndustries) ? (user as any).preferredIndustries.join(', ') : '',
        preferredCompanySize: (user as any).preferredCompanySize || '',
        preferredWorkMode: (user as any).preferredWorkMode || '',
        preferredEmploymentType: (user as any).preferredEmploymentType || ''
      })
    }
  }, [user])

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.phone || !formData.currentLocation || !formData.headline || !formData.gender || !formData.dateOfBirth) {
      toast.error('Please fill in all required fields (Phone, Location, Headline, Gender, Date of Birth)')
      return
    }

    setSubmitting(true)
    try {
      const updateData: any = {
        phone: formData.phone,
        currentLocation: formData.currentLocation,
        headline: formData.headline,
        summary: formData.summary || undefined,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : 0,
        expectedSalary: formData.expectedSalary ? parseFloat(formData.expectedSalary) : undefined,
        noticePeriod: formData.noticePeriod ? parseInt(formData.noticePeriod) : undefined,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        willingToRelocate: formData.willingToRelocate,
        preferredLocations: formData.preferredLocations ? formData.preferredLocations.split(',').map(s => s.trim()).filter(Boolean) : [],
        // Professional Details
        currentCompany: formData.currentCompany || undefined,
        currentRole: formData.currentRole || undefined,
        highestEducation: formData.highestEducation || undefined,
        fieldOfStudy: formData.fieldOfStudy || undefined,
        // Preferred Professional Details
        preferredJobTitles: formData.preferredJobTitles ? formData.preferredJobTitles.split(',').map(s => s.trim()).filter(Boolean) : [],
        preferredIndustries: formData.preferredIndustries ? formData.preferredIndustries.split(',').map(s => s.trim()).filter(Boolean) : [],
        preferredCompanySize: formData.preferredCompanySize || undefined,
        preferredWorkMode: formData.preferredWorkMode || undefined,
        preferredEmploymentType: formData.preferredEmploymentType || undefined,
        preferences: {
          ...(user.preferences || {}),
          profileCompleted: true
        }
      }

      const response = await apiService.updateProfile(updateData)
      
      if (response.success) {
        toast.success('Profile updated successfully!')
        onProfileUpdated(response.data)
        onClose()
      } else {
        toast.error(response.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = async () => {
    try {
      // Set skip timestamp to 12 hours from now
      const skipUntil = new Date()
      skipUntil.setHours(skipUntil.getHours() + 12)
      
      // Store current login timestamp to track session
      const currentLoginSession = user.lastLoginAt || new Date().toISOString()
      
      const updateData = {
        preferences: {
          ...(user.preferences || {}),
          profileCompletionSkippedUntil: skipUntil.toISOString(),
          profileCompletionSkipSession: currentLoginSession // Track which session the skip was for
        }
      }
      
      const response = await apiService.updateProfile(updateData)
      if (response.success) {
        toast.success('Profile completion reminder snoozed for 12 hours (this session)')
        // Refresh user data to update preferences in memory
        onProfileUpdated(response.data)
      }
      onClose()
    } catch (error) {
      console.error('Error updating skip preference:', error)
      onClose()
    }
  }

  // Don't show dialog if profile is complete
  if (!isProfileIncomplete()) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Help employers find you! Complete your profile to increase your chances of getting hired.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Personal Information */}
          <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Personal Information *</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-3">
                <Label htmlFor="currentLocation">Current Location *</Label>
                <Input
                  id="currentLocation"
                  placeholder="e.g., Mumbai, Maharashtra, India"
                  value={formData.currentLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentLocation: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Professional Information *</h3>
            
            <div>
              <Label htmlFor="headline">Professional Headline *</Label>
              <Input
                id="headline"
                placeholder="e.g., Senior Software Engineer | Full Stack Developer"
                value={formData.headline}
                onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                placeholder="Brief overview of your professional background and skills..."
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              />
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-semibold text-sm text-green-900 dark:text-green-100">Professional Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentCompany">Current Company</Label>
                <Input
                  id="currentCompany"
                  placeholder="e.g., Tech Solutions Inc."
                  value={formData.currentCompany}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentCompany: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="currentRole">Current Role/Position</Label>
                <Input
                  id="currentRole"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.currentRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="experienceYears">Years of Experience</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min="0"
                  placeholder="e.g., 5"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="highestEducation">Highest Education</Label>
                <Select value={formData.highestEducation} onValueChange={(value) => setFormData(prev => ({ ...prev, highestEducation: value }))}>
                  <SelectTrigger id="highestEducation">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                    <SelectItem value="masters">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD/Doctorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Input
                  id="fieldOfStudy"
                  placeholder="e.g., Computer Science, Engineering"
                  value={formData.fieldOfStudy}
                  onChange={(e) => setFormData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="noticePeriod">Notice Period (Days)</Label>
                <Input
                  id="noticePeriod"
                  type="number"
                  placeholder="e.g., 30"
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, noticePeriod: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="skills">Key Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  placeholder="e.g., JavaScript, React, Node.js, Python"
                  value={formData.skills}
                  onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Preferred Professional Details */}
          <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h3 className="font-semibold text-sm text-orange-900 dark:text-orange-100">Preferred Professional Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="preferredJobTitles">Preferred Job Titles/Roles (comma-separated)</Label>
                <Input
                  id="preferredJobTitles"
                  placeholder="e.g., Software Engineer, Developer..."
                  value={formData.preferredJobTitles}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredJobTitles: e.target.value }))}
                  className="text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="preferredIndustries">Preferred Industries (comma-separated)</Label>
                <Input
                  id="preferredIndustries"
                  placeholder="e.g., Technology, Finance, Healthcare, E-commerce"
                  value={formData.preferredIndustries}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredIndustries: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="preferredCompanySize">Preferred Company Size</Label>
                <Select value={formData.preferredCompanySize} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredCompanySize: value }))}>
                  <SelectTrigger id="preferredCompanySize">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (1-50)</SelectItem>
                    <SelectItem value="small">Small (51-200)</SelectItem>
                    <SelectItem value="medium">Medium (201-1000)</SelectItem>
                    <SelectItem value="large">Large (1000+)</SelectItem>
                    <SelectItem value="any">Any Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="preferredWorkMode">Preferred Work Mode</Label>
                <Select value={formData.preferredWorkMode} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredWorkMode: value }))}>
                  <SelectTrigger id="preferredWorkMode">
                    <SelectValue placeholder="Select work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="preferredEmploymentType">Preferred Employment Type</Label>
                <Select value={formData.preferredEmploymentType} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredEmploymentType: value }))}>
                  <SelectTrigger id="preferredEmploymentType">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expectedSalary">Expected Salary (LPA)</Label>
                <Input
                  id="expectedSalary"
                  type="number"
                  placeholder="e.g., 12"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="preferredLocations">Preferred Work Locations (comma-separated)</Label>
                <Input
                  id="preferredLocations"
                  placeholder="e.g., Mumbai, Bangalore, Delhi"
                  value={formData.preferredLocations}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredLocations: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="willingToRelocate"
                  checked={formData.willingToRelocate}
                  onChange={(e) => setFormData(prev => ({ ...prev, willingToRelocate: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <Label htmlFor="willingToRelocate" className="cursor-pointer">
                  I am willing to relocate for the right opportunity
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={submitting}
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !formData.phone || !formData.currentLocation || !formData.headline || !formData.gender || !formData.dateOfBirth}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {submitting ? 'Saving...' : 'Complete Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function EmployerProfileCompletionDialog({ 
  isOpen, 
  onClose, 
  user,
  onProfileUpdated 
}: ProfileCompletionDialogProps) {
  const [formData, setFormData] = useState({
    // Personal Info
    phone: '',
    designation: '',
    department: '',
    departments: [] as string[],
    location: '',
    // Company Info (if creating new)
    companyName: '',
    companyIndustry: '',
    companySize: '',
    companyWebsite: '',
    companyDescription: '',
    companyWhyJoinUs: '',
    // Company Details (if existing company)
    natureOfBusiness: [] as string[],
    companyTypes: [] as string[]
  })
  const [submitting, setSubmitting] = useState(false)
  const [needsCompany, setNeedsCompany] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showNatureOfBusinessDropdown, setShowNatureOfBusinessDropdown] = useState(false)
  const [showCompanyTypesDropdown, setShowCompanyTypesDropdown] = useState(false)
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false)
  const [companyData, setCompanyData] = useState<any>(null)
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [companyPlaceholder, setCompanyPlaceholder] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [placeholderPreview, setPlaceholderPreview] = useState<string | null>(null)

  // Multi-select options
  const natureOfBusinessOptions = [
    "SaaS (Software as a Service)", "PaaS (Platform as a Service)", "IaaS (Infrastructure as a Service)",
    "B2B (Business to Business)", "B2C (Business to Consumer)", "B2B2C (Business to Business to Consumer)",
    "D2C (Direct to Consumer)", "C2C (Consumer to Consumer)", "B2G (Business to Government)",
    "Enterprise Software", "Product-based", "Service-based", "Consulting", "Manufacturing",
    "E-commerce", "Fintech", "Healthcare", "EdTech", "AgriTech", "Other"
  ]

  const companyTypeOptions = [
    "Corporate", "Foreign MNC", "Indian MNC", "Startup", "Unicorn (₹1000+ Cr valuation)",
    "Govt/PSU", "MNC", "SME (Small & Medium Enterprise)", "Private Limited", "Public Limited",
    "Partnership Firm", "Sole Proprietorship", "Non-Profit / NGO", "Others"
  ]

  // Check if profile is incomplete - COMPREHENSIVE CHECK
  const isProfileIncomplete = () => {
    // Check if user has marked profile as complete - THIS IS THE KEY CHECK
    if (user.preferences?.profileCompleted === true) {
      console.log('✅ Profile already completed, not showing dialog');
      return false
    }

    // Check if user has skipped and the skip period hasn't expired
    if (user.preferences?.profileCompletionSkippedUntil) {
      const skipUntil = new Date(user.preferences.profileCompletionSkippedUntil)
      const now = new Date()
      
      if (skipUntil > now) {
        // Check if it's the same login session
        const skipSession = user.preferences.profileCompletionSkipSession
        const currentSession = user.lastLoginAt || new Date().toISOString()
        
        if (skipSession === currentSession) {
          console.log('🕒 Profile completion skipped until:', skipUntil.toISOString())
          return false
        }
      }
    }

    // Required fields for employer
    const isAdmin = user.userType === 'admin'
    const hasRequiredFields = user.phone && 
                              (user as any).designation && 
                              (user.companyId || isAdmin)

    console.log('🔍 Profile completion check:', {
      profileCompleted: user.preferences?.profileCompleted,
      hasRequiredFields,
      phone: user.phone,
      designation: (user as any).designation,
      companyId: user.companyId,
      isAdmin: isAdmin
    });

    return !hasRequiredFields
  }

  // Determine if user needs company setup (for users in same company, skip steps 1-3)
  const shouldSkipCompanySteps = () => {
    // If user already has a companyId, they're in an existing company
    // Only show step 4 (personal info) for them
    // For admin users, also skip company steps since they don't need a company
    const isAdmin = user.userType === 'admin'
    return !!(user.companyId && !needsCompany) || isAdmin
  }

  // Load company data if user has a company
  useEffect(() => {
    const loadCompanyData = async () => {
      if (user?.companyId && !needsCompany) {
        try {
          const response = await apiService.getCompany(user.companyId)
          if (response.success && response.data) {
            setCompanyData(response.data)
            setFormData(prev => ({
              ...prev,
              natureOfBusiness: response.data.natureOfBusiness || [],
              companyTypes: response.data.companyTypes || []
            }))
          }
        } catch (error) {
          console.error('Error loading company data:', error)
        }
      }
    }

    loadCompanyData()
  }, [user?.companyId, needsCompany])

  // Set initial step based on user's company status
  useEffect(() => {
    if (user && isOpen) {
      if (shouldSkipCompanySteps()) {
        // User is in existing company, skip to step 4 (personal info)
        console.log('🏢 User in existing company, skipping to step 4');
        setCurrentStep(4)
      } else {
        // New user or needs company setup, start from step 1
        console.log('🆕 New user or needs company setup, starting from step 1');
        setCurrentStep(1)
      }
    }
  }, [user, isOpen])

  useEffect(() => {
    setNeedsCompany(!user.companyId)
    if (user) {
      setFormData(prev => ({
        ...prev,
        phone: user.phone || '',
        designation: (user as any).designation || '',
        department: (user as any).department || '',
        location: user.currentLocation || ''
      }))
    }
  }, [user])

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCompanyLogo(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePlaceholderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCompanyPlaceholder(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPlaceholderPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    // For users in existing companies, only validate step 4
    if (shouldSkipCompanySteps()) {
      if (!formData.phone || !formData.designation) {
        toast.error('Please fill in all required fields (Phone, Designation)')
        return
      }
    } else {
      // Validate required fields based on current step for new companies
      if (currentStep === 1) {
        // Step 1 is company branding - no required fields, just move to next step
        // No validation needed for Step 1
      }
      
      if (currentStep === 2) {
        // Step 2 is company logo - no required fields, just move to next step
        // No validation needed for Step 2
      }
      
      if (currentStep === 3) {
        if (needsCompany && (!formData.companyName || !formData.companyIndustry)) {
          toast.error('Please provide company name and industry')
          return
        }
      }
      
      if (currentStep === 4) {
        if (!formData.phone || !formData.designation) {
          toast.error('Please fill in all required fields (Phone, Designation)')
          return
        }
      }

      if (currentStep < 4) {
        setCurrentStep(currentStep + 1)
        return
      }
    }

    setSubmitting(true)
    try {
      // If user needs a company, create it first
      let companyId = user.companyId

      // For users in existing companies, skip company creation/update
      if (shouldSkipCompanySteps()) {
        // User is in existing company, just update personal info
        companyId = user.companyId
      } else if (needsCompany && formData.companyName) {
        const companyResponse = await apiService.createCompany({
          name: formData.companyName,
          industry: formData.companyIndustry,
          companySize: formData.companySize || 'Not specified',
          website: formData.companyWebsite || '',
          description: formData.companyDescription || `Company created for ${user.firstName} ${user.lastName}`,
          whyJoinUs: formData.companyWhyJoinUs || '',
          natureOfBusiness: formData.natureOfBusiness,
          companyTypes: formData.companyTypes,
          region: user.region || 'india'
        })

        if (companyResponse.success && companyResponse.data) {
          companyId = companyResponse.data.id
          toast.success('Company created successfully!')
          
          // Upload company logo if provided
          if (companyLogo && companyId) {
            try {
              const logoResponse = await apiService.uploadCompanyLogo(companyId, companyLogo)
              if (logoResponse.success) {
                console.log('✅ Company logo uploaded successfully')
              }
            } catch (error) {
              console.error('❌ Error uploading company logo:', error)
            }
          }
          
          // Upload company banner/placeholder if provided
          if (companyPlaceholder && companyId) {
            try {
              const bannerResponse = await apiService.uploadCompanyBanner(companyId, companyPlaceholder)
              if (bannerResponse.success) {
                console.log('✅ Company banner uploaded successfully')
              }
            } catch (error) {
              console.error('❌ Error uploading company banner:', error)
            }
          }
        } else {
          toast.error('Failed to create company')
          setSubmitting(false)
          return
        }
      } else if (!needsCompany && user.companyId) {
        // Update existing company with additional details
        try {
          await apiService.updateCompany(user.companyId, {
            description: formData.companyDescription || companyData?.description,
            whyJoinUs: formData.companyWhyJoinUs || companyData?.whyJoinUs,
            natureOfBusiness: formData.natureOfBusiness,
            companyTypes: formData.companyTypes
          })
          
          // Upload company logo if provided
          if (companyLogo && user.companyId) {
            try {
              const logoResponse = await apiService.uploadCompanyLogo(user.companyId, companyLogo)
              if (logoResponse.success) {
                console.log('✅ Company logo uploaded successfully')
              }
            } catch (error) {
              console.error('❌ Error uploading company logo:', error)
            }
          }
          
          // Upload company banner/placeholder if provided
          if (companyPlaceholder && user.companyId) {
            try {
              const bannerResponse = await apiService.uploadCompanyBanner(user.companyId, companyPlaceholder)
              if (bannerResponse.success) {
                console.log('✅ Company banner uploaded successfully')
              }
            } catch (error) {
              console.error('❌ Error uploading company banner:', error)
            }
          }
        } catch (error) {
          console.error('Error updating company details:', error)
          // Continue with user profile update even if company update fails
        }
      }

      // Update user profile
      const updateData: any = {
        phone: formData.phone,
        designation: formData.designation,
        department: formData.department || undefined,
        currentLocation: formData.location || undefined,
        companyId: companyId,
        preferences: {
          ...(user.preferences || {}),
          profileCompleted: true
        }
      }

      const response = await apiService.updateProfile(updateData)
      
      if (response.success) {
        toast.success('Profile completed successfully! 🎉')
        // Store in localStorage as backup with timestamp
        const completionData = {
          completed: true,
          timestamp: Date.now(),
          userType: user.userType
        }
        localStorage.setItem('profileCompleted', JSON.stringify(completionData));
        onProfileUpdated(response.data)
        onClose()
      } else {
        toast.error(response.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = async () => {
    try {
      // Set skip timestamp to 12 hours from now
      const skipUntil = new Date()
      skipUntil.setHours(skipUntil.getHours() + 12)
      
      // Store current login timestamp to track session
      const currentLoginSession = user.lastLoginAt || new Date().toISOString()
      
      const updateData = {
        preferences: {
          ...(user.preferences || {}),
          profileCompletionSkippedUntil: skipUntil.toISOString(),
          profileCompletionSkipSession: currentLoginSession // Track which session the skip was for
        }
      }
      
      const response = await apiService.updateProfile(updateData)
      if (response.success) {
        toast.success('Profile completion reminder snoozed for 12 hours (this session)')
        // Refresh user data to update preferences in memory
        onProfileUpdated(response.data)
      }
      onClose()
    } catch (error) {
      console.error('Error updating skip preference:', error)
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    console.log('🔄 Profile completion form data change:', { field, value });
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // CRITICAL: Ultimate check - if profile is completed, NEVER render dialog
  if (user.preferences?.profileCompleted === true) {
    console.log('🚫 ULTIMATE DIALOG CHECK: Profile is completed - dialog will NEVER render');
    return null
  }
  
  // Additional localStorage check with timestamp validation
  try {
    const storedCompletion = localStorage.getItem('profileCompleted');
    if (storedCompletion) {
      const completionData = JSON.parse(storedCompletion);
      if (completionData.completed === true && completionData.userType === user.userType) {
        // Check if completion is recent (within last 30 days)
        const completionAge = Date.now() - completionData.timestamp;
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        
        if (completionAge < thirtyDaysInMs) {
          console.log('🚫 LOCALSTORAGE DIALOG CHECK: Profile completed in localStorage - dialog will NEVER render');
          return null
        } else {
          // Clear old completion data
          localStorage.removeItem('profileCompleted');
        }
      }
    }
  } catch (error) {
    // If parsing fails, clear the invalid data
    localStorage.removeItem('profileCompleted');
  }

  // Don't show dialog if profile is complete
  const shouldShowDialog = isProfileIncomplete()
  console.log('🎯 Employer Profile Dialog - Should show:', shouldShowDialog, {
    profileCompleted: user.preferences?.profileCompleted,
    preferences: user.preferences
  });
  
  // CRITICAL: Double-check that profile is not completed before rendering
  if (!shouldShowDialog) {
    console.log('✅ Profile completed - dialog will not render');
    return null
  }

  const getStepTitle = () => {
    if (shouldSkipCompanySteps()) {
      return "Your Personal Information"
    }
    
    switch (currentStep) {
      case 1: return "About Your Company"
      case 2: return "Company Logo & Branding"
      case 3: return "Company Details"
      case 4: return "Your Personal Information"
      default: return "Complete Your Profile"
    }
  }

  const getStepDescription = () => {
    if (shouldSkipCompanySteps()) {
      const isAdmin = user.userType === 'admin'
      if (isAdmin) {
        return "👑 You're an admin user! Let's complete your personal professional information to get started."
      }
      return "🏢 You're joining an existing company! Let's complete your personal professional information to get started."
    }
    
    switch (currentStep) {
      case 1: return "🎯 Get FREE professional branding! Showcase your company to millions of job seekers and attract top talent."
      case 2: return "🎨 Add your company logo and branding elements to make your company stand out."
      case 3: return needsCompany ? "Create your company profile to get started." : "Complete your company details."
      case 4: return "Let's complete your personal professional information."
      default: return "Complete your profile to start posting jobs and managing applications effectively."
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    console.log('🔄 Dialog open change requested:', { open, showNatureOfBusinessDropdown, showCompanyTypesDropdown, showDepartmentDropdown });
    
    // Don't close the dialog if any dropdown is open
    if (!open && (showNatureOfBusinessDropdown || showCompanyTypesDropdown || showDepartmentDropdown)) {
      console.log('🚫 Preventing dialog close - dropdown is open');
      return;
    }
    
    console.log('✅ Dialog close allowed');
    onClose();
  };

  // Prevent dialog from closing when dropdown is open
  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    // If any dropdown is open, prevent the dialog from handling escape key
    if (e.key === 'Escape' && (showNatureOfBusinessDropdown || showCompanyTypesDropdown || showDepartmentDropdown)) {
      e.stopPropagation();
    }
  };

  return (
    <>
    <Dialog 
      open={isOpen} 
      onOpenChange={handleDialogOpenChange}
      modal={true}
    >
      <DialogContent 
        className={`max-w-[95vw] sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto transition-opacity duration-200 ${
          (showNatureOfBusinessDropdown || showCompanyTypesDropdown || showDepartmentDropdown) ? 'opacity-50' : 'opacity-100'
        }`}
        style={{ 
          pointerEvents: (showNatureOfBusinessDropdown || showCompanyTypesDropdown || showDepartmentDropdown) ? 'none' : 'auto' 
        }}
        onKeyDown={handleDialogKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Complete Your Employer Profile
            <Badge variant="outline" className="ml-2">
              {shouldSkipCompanySteps() ? 'Step 1 of 1' : `Step ${currentStep} of 4`}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {getStepDescription()}
          </DialogDescription>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${shouldSkipCompanySteps() ? '100%' : `${(currentStep / 4) * 100}%`}` }}
            />
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Step 1: About Your Company (moved from Step 3) - Only for new companies */}
          {currentStep === 1 && !shouldSkipCompanySteps() && (
            <div className="space-y-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg text-purple-900 dark:text-purple-100 mb-2">
                  🎯 Empower Your Company Brand
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                  <strong>Get FREE professional branding on our portal!</strong> Complete your company profile to showcase your organization to millions of job seekers and attract top talent.
                </p>
                <div className="mt-4 p-3 bg-white/60 dark:bg-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-700">
                  <p className="text-xs text-purple-800 dark:text-purple-200 font-medium">
                    ✨ Your company information will be displayed on our public companies page, helping job seekers discover and learn about your organization
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white/80 dark:bg-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <Label htmlFor="companyDescription" className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                      Company Description & Culture
                    </Label>
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mb-3">
                    This will be displayed on your company profile page. Help job seekers understand your company's mission, values, and work culture.
                  </p>
                  <Textarea
                    id="companyDescription"
                    placeholder="Describe your company's mission, values, culture, and what makes it a great place to work. This helps job seekers understand your organization better..."
                    value={formData.companyDescription}
                    onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                    rows={4}
                    className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                  />
                </div>

                <div className="bg-white/80 dark:bg-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <Label htmlFor="companyWhyJoinUs" className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                      Why Join Our Company?
                    </Label>
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mb-3">
                    Highlight your company's unique benefits, growth opportunities, and what makes it attractive to potential employees.
                  </p>
                  <Textarea
                    id="companyWhyJoinUs"
                    placeholder="Share what makes your company special - career growth opportunities, benefits, work-life balance, innovative projects, team culture, etc..."
                    value={formData.companyWhyJoinUs}
                    onChange={(e) => handleInputChange('companyWhyJoinUs', e.target.value)}
                    rows={4}
                    className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                  />
                </div>

                <div className="bg-white/80 dark:bg-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                      Company Classification
                    </h4>
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mb-4">
                    Help job seekers understand your business model and company type. This information helps candidates find companies that match their career preferences.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nature of Business */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-purple-800 dark:text-purple-200">Nature of Business</Label>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setShowNatureOfBusinessDropdown(true)}
                      >
                        <span className="text-left flex-1 truncate">
                          {formData.natureOfBusiness.length > 0
                            ? `${formData.natureOfBusiness.length} selected`
                            : "Select nature of business"}
                        </span>
                        <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                      </Button>
                      
                      {formData.natureOfBusiness.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {formData.natureOfBusiness.slice(0, 3).map((item: string) => (
                            <Badge key={item} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {item}
                            </Badge>
                          ))}
                          {formData.natureOfBusiness.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{formData.natureOfBusiness.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Company Types */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-purple-800 dark:text-purple-200">Company Type</Label>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setShowCompanyTypesDropdown(true)}
                      >
                        <span className="text-left flex-1 truncate">
                          {formData.companyTypes.length > 0
                            ? `${formData.companyTypes.length} selected`
                            : "Select company type(s)"}
                        </span>
                        <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                      </Button>
                      
                      {formData.companyTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {formData.companyTypes.slice(0, 3).map((type: string) => (
                            <Badge key={type} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                              {type}
                            </Badge>
                          ))}
                          {formData.companyTypes.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{formData.companyTypes.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Call to Action Section */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-lg text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-sm">🚀 Ready to Showcase Your Company?</h4>
                  </div>
                  <p className="text-xs text-purple-100 leading-relaxed">
                    Complete your company profile to get <strong>FREE professional branding</strong> on our platform. Your company will be featured on our public companies page, helping you attract the best talent and build your employer brand.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 text-xs text-purple-100">
                      <div className="w-1.5 h-1.5 bg-green-300 rounded-full"></div>
                      <span>Public company profile</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-purple-100">
                      <div className="w-1.5 h-1.5 bg-green-300 rounded-full"></div>
                      <span>Enhanced job visibility</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-purple-100">
                      <div className="w-1.5 h-1.5 bg-green-300 rounded-full"></div>
                      <span>Professional branding</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Company Logo & Branding - Only for new companies */}
          {currentStep === 2 && !shouldSkipCompanySteps() && (
            <div className="space-y-6 p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Company Logo & Branding</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Add your company logo and branding elements to make your company stand out</p>
              </div>

              <div className="space-y-4">
                {/* Company Logo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="companyLogo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Logo
                  </Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id="companyLogo"
                        accept="image/*,.jfif,.svg"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => document.getElementById('companyLogo')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {companyLogo ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB. Recommended: 200x200px</p>
                    </div>
                  </div>
                </div>

                {/* Company Placeholder/Description */}
                <div className="space-y-2">
                  <Label htmlFor="companyPlaceholder" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Placeholder Image
                  </Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden">
                      {placeholderPreview ? (
                        <img src={placeholderPreview} alt="Placeholder preview" className="w-full h-full object-cover" />
                      ) : (
                        <Image className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id="companyPlaceholder"
                        accept="image/*,.jfif,.svg"
                        onChange={handlePlaceholderUpload}
                        className="hidden"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => document.getElementById('companyPlaceholder')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {companyPlaceholder ? 'Change Image' : 'Upload Placeholder'}
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">Optional: Company office, team, or product image</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Step 3: Company Details - Only for new companies */}
          {currentStep === 3 && !shouldSkipCompanySteps() && (
            <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-sm text-green-900 dark:text-green-100 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company Details
              </h3>
              
              {needsCompany ? (
                <>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    You don't have a company associated. Please provide company details to get started.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        placeholder="e.g., Tech Solutions Pvt Ltd"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyIndustry">Industry *</Label>
                      <Input
                        id="companyIndustry"
                        placeholder="e.g., IT Services, Manufacturing"
                        value={formData.companyIndustry}
                        onChange={(e) => handleInputChange('companyIndustry', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="companySize">Company Size</Label>
                      <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                        <SelectTrigger id="companySize">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-50">1-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="500-1000">500-1000 employees</SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="companyWebsite">Company Website</Label>
                      <Input
                        id="companyWebsite"
                        type="url"
                        placeholder="https://www.example.com"
                        value={formData.companyWebsite}
                        onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 mx-auto text-green-600 mb-4" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    You're already associated with <strong>{companyData?.name}</strong>
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Continue to the next step to complete your company profile.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Your Personal Information - Always show for all users */}
          {(currentStep === 4 || shouldSkipCompanySteps()) && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-2">
                  👤 Your Personal Information
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  Complete your personal professional details to help us provide you with the best hiring experience.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emp-phone">Phone Number *</Label>
                  <Input
                    id="emp-phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <Label htmlFor="designation">Your Designation *</Label>
                  <Input
                    id="designation"
                    placeholder="e.g., HR Manager, Recruiter"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    className="border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between border-blue-200 focus:border-blue-400"
                    onClick={() => setShowDepartmentDropdown(true)}
                  >
                    <span className="text-left flex-1 truncate">
                      {formData.departments.length > 0
                        ? `${formData.departments.length} selected`
                        : "Select department"}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                  </Button>
                  
                  {formData.departments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.departments.slice(0, 3).map((dept: string) => (
                        <Badge key={dept} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          {dept}
                        </Badge>
                      ))}
                      {formData.departments.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{formData.departments.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Mumbai, Maharashtra"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="flex justify-between gap-3 pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={submitting}
            >
              Skip for Now
            </Button>
            {currentStep > 1 && !shouldSkipCompanySteps() && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={submitting}
              >
                Previous
              </Button>
            )}
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={
              submitting || 
              (shouldSkipCompanySteps() && (!formData.phone || !formData.designation)) ||
              (currentStep === 3 && needsCompany && (!formData.companyName || !formData.companyIndustry)) ||
              (currentStep === 4 && (!formData.phone || !formData.designation))
            }
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {submitting ? 'Saving...' : 
             shouldSkipCompanySteps() ? '🚀 Complete Profile' :
             currentStep < 4 ? 'Next' : '🚀 Complete & Get FREE Branding'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Multi-Select Dropdowns - Rendered completely outside dialog to prevent interference */}
    {showNatureOfBusinessDropdown && (
      <MultiSelectDropdown
        title="Select Nature of Business"
        options={natureOfBusinessOptions}
        selectedValues={formData.natureOfBusiness}
        onChange={(values) => {
          handleInputChange("natureOfBusiness", values)
        }}
        onClose={() => setShowNatureOfBusinessDropdown(false)}
      />
    )}

    {showCompanyTypesDropdown && (
      <MultiSelectDropdown
        title="Select Company Type(s)"
        options={companyTypeOptions}
        selectedValues={formData.companyTypes}
        onChange={(values) => {
          handleInputChange("companyTypes", values)
        }}
        onClose={() => setShowCompanyTypesDropdown(false)}
      />
    )}

    {showDepartmentDropdown && (
      <DepartmentDropdown
        selectedDepartments={formData.departments}
        onDepartmentChange={(departments: string[]) => {
          handleInputChange("departments", departments)
          // Also update the single department field for backward compatibility
          handleInputChange("department", departments[0] || '')
        }}
        onClose={() => setShowDepartmentDropdown(false)}
      />
    )}
  </>
  )
}

