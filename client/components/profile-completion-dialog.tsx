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
import { User as UserIcon, Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react'

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
    experienceYears: '',
    expectedSalary: '',
    noticePeriod: '',
    skills: '',
    dateOfBirth: '',
    gender: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Check if profile is incomplete
  const isProfileIncomplete = !user.phone || !user.currentLocation || !user.headline || 
    (user.experienceYears === undefined || user.experienceYears === null)

  // Load existing data
  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        currentLocation: user.currentLocation || '',
        headline: user.headline || '',
        experienceYears: user.experienceYears?.toString() || '',
        expectedSalary: user.expectedSalary?.toString() || '',
        noticePeriod: user.noticePeriod?.toString() || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
        dateOfBirth: (user as any).dateOfBirth || '',
        gender: (user as any).gender || ''
      })
    }
  }, [user])

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.phone || !formData.currentLocation || !formData.headline) {
      toast.error('Please fill in all required fields (Phone, Location, Headline)')
      return
    }

    setSubmitting(true)
    try {
      const updateData: any = {
        phone: formData.phone,
        currentLocation: formData.currentLocation,
        headline: formData.headline,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : 0,
        expectedSalary: formData.expectedSalary ? parseFloat(formData.expectedSalary) : undefined,
        noticePeriod: formData.noticePeriod ? parseInt(formData.noticePeriod) : undefined,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined
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

  const handleSkip = () => {
    onClose()
  }

  // Don't show dialog if profile is complete
  if (!isProfileIncomplete) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
          {/* Required Fields */}
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Required Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="currentLocation">Current Location *</Label>
                <Input
                  id="currentLocation"
                  placeholder="e.g., Mumbai, India"
                  value={formData.currentLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentLocation: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="headline">Professional Headline *</Label>
              <Input
                id="headline"
                placeholder="e.g., Senior Software Engineer | Full Stack Developer"
                value={formData.headline}
                onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
              />
            </div>
          </div>

          {/* Optional but Recommended Fields */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Additional Details (Recommended)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="expectedSalary">Expected Salary (LPA)</Label>
                <Input
                  id="expectedSalary"
                  type="number"
                  placeholder="e.g., 12"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedSalary: e.target.value }))}
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

              <div>
                <Label htmlFor="gender">Gender</Label>
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

              <div className="md:col-span-2">
                <Label htmlFor="skills">Key Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  placeholder="e.g., JavaScript, React, Node.js, Python"
                  value={formData.skills}
                  onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
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
            disabled={submitting || !formData.phone || !formData.currentLocation || !formData.headline}
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
    phone: '',
    designation: '',
    department: '',
    companyName: '',
    companyIndustry: '',
    companySize: '',
    companyWebsite: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [needsCompany, setNeedsCompany] = useState(false)

  // Check if profile is incomplete
  const isProfileIncomplete = !user.phone || !user.designation || !user.companyId

  useEffect(() => {
    setNeedsCompany(!user.companyId)
    if (user) {
      setFormData({
        phone: user.phone || '',
        designation: (user as any).designation || '',
        department: (user as any).department || '',
        companyName: '',
        companyIndustry: '',
        companySize: '',
        companyWebsite: ''
      })
    }
  }, [user])

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.phone || !formData.designation) {
      toast.error('Please fill in all required fields (Phone, Designation)')
      return
    }

    if (needsCompany && (!formData.companyName || !formData.companyIndustry)) {
      toast.error('Please provide company name and industry')
      return
    }

    setSubmitting(true)
    try {
      // If user needs a company, create it first
      let companyId = user.companyId

      if (needsCompany && formData.companyName) {
        const companyResponse = await apiService.createCompany({
          name: formData.companyName,
          industry: formData.companyIndustry,
          companySize: formData.companySize || 'Not specified',
          website: formData.companyWebsite || '',
          description: `Company created for ${user.firstName} ${user.lastName}`,
          region: user.region || 'india'
        })

        if (companyResponse.success && companyResponse.data) {
          companyId = companyResponse.data.id
          toast.success('Company created successfully!')
        } else {
          toast.error('Failed to create company')
          setSubmitting(false)
          return
        }
      }

      // Update user profile
      const updateData: any = {
        phone: formData.phone,
        designation: formData.designation,
        department: formData.department || undefined,
        companyId: companyId
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

  const handleSkip = () => {
    onClose()
  }

  // Don't show dialog if profile is complete
  if (!isProfileIncomplete) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Complete Your Employer Profile
          </DialogTitle>
          <DialogDescription>
            Complete your profile to start posting jobs and managing applications effectively.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Required Fields */}
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Required Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emp-phone">Phone Number *</Label>
                <Input
                  id="emp-phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="designation">Your Designation *</Label>
                <Input
                  id="designation"
                  placeholder="e.g., HR Manager, Recruiter"
                  value={formData.designation}
                  onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g., Human Resources"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Company Information (if needed) */}
          {needsCompany && (
            <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-sm text-green-900 dark:text-green-100">Company Information</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You don't have a company associated. Please provide company details or join an existing company.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., Tech Solutions Pvt Ltd"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="companyIndustry">Industry *</Label>
                  <Input
                    id="companyIndustry"
                    placeholder="e.g., IT Services, Manufacturing"
                    value={formData.companyIndustry}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyIndustry: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select value={formData.companySize} onValueChange={(value) => setFormData(prev => ({ ...prev, companySize: value }))}>
                    <SelectTrigger id="companySize">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, companyWebsite: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}
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
            disabled={submitting || !formData.phone || !formData.designation || (needsCompany && (!formData.companyName || !formData.companyIndustry))}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {submitting ? 'Saving...' : 'Complete Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

