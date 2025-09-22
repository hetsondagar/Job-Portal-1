"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"

export default function CreateRequirementPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentSkill, setCurrentSkill] = useState("")
  const [currentBenefit, setCurrentBenefit] = useState("")

  // Initialize form data - same structure as edit page
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    experience: "",
    salary: "",
    jobType: "Full-time",
    skills: [] as string[],
    education: "B.Tech/B.E.",
    industry: "Technology",
    department: "Engineering",
    validTill: "",
    noticePeriod: "Immediately",
    remoteWork: "Hybrid",
    travelRequired: "No",
    shiftTiming: "Day",
    benefits: [] as string[],
    // Additional fields for create form
    keySkills: [] as string[],
    candidateDesignations: [] as string[],
    candidateLocations: [] as string[],
    includeWillingToRelocate: false,
    workExperienceMin: "",
    workExperienceMax: "",
    currentSalaryMin: "",
    currentSalaryMax: "",
    currency: "INR",
    includeNotMentioned: false,
  })

  const handleInputChange = (field: string, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSkillChange = (skill: string, action: 'add' | 'remove') => {
    if (action === 'add' && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
    } else if (action === 'remove') {
      setFormData(prev => ({
        ...prev,
        skills: prev.skills.filter(s => s !== skill)
      }))
    }
  }

  const handleBenefitChange = (benefit: string, action: 'add' | 'remove') => {
    if (action === 'add' && !formData.benefits.includes(benefit)) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefit]
      }))
    } else if (action === 'remove') {
      setFormData(prev => ({
        ...prev,
        benefits: prev.benefits.filter(b => b !== benefit)
      }))
    }
  }

  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.keySkills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        keySkills: [...prev.keySkills, currentSkill.trim()]
      }))
      setCurrentSkill("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      keySkills: prev.keySkills.filter(s => s !== skill)
    }))
  }

  const handleAddBenefit = () => {
    if (currentBenefit.trim() && !formData.benefits.includes(currentBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, currentBenefit.trim()]
      }))
      setCurrentBenefit("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        experience: formData.experience,
        workExperienceMin: formData.workExperienceMin ? Number(formData.workExperienceMin) : undefined,
        workExperienceMax: formData.workExperienceMax ? Number(formData.workExperienceMax) : undefined,
        salary: formData.salary,
        currentSalaryMin: formData.currentSalaryMin ? Number(formData.currentSalaryMin) : undefined,
        currentSalaryMax: formData.currentSalaryMax ? Number(formData.currentSalaryMax) : undefined,
        currency: formData.currency,
        jobType: formData.jobType,
        skills: formData.skills,
        keySkills: formData.keySkills,
        education: formData.education,
        industry: formData.industry,
        department: formData.department,
        validTill: formData.validTill || undefined,
        noticePeriod: formData.noticePeriod,
        remoteWork: formData.remoteWork,
        travelRequired: formData.travelRequired === 'Yes' ? true : (formData.travelRequired === 'No' ? false : undefined),
        shiftTiming: formData.shiftTiming,
        candidateLocations: formData.candidateLocations,
        candidateDesignations: formData.candidateDesignations,
        includeWillingToRelocate: !!formData.includeWillingToRelocate,
        includeNotMentioned: !!formData.includeNotMentioned,
        benefits: formData.benefits,
      }

      console.log('🔍 Submitting requirement payload:', payload)
      const response = await apiService.createRequirement(payload)
      console.log('✅ Requirement API response:', response)
      if (!response.success) {
        console.error('❌ Requirement creation failed:', response)
        console.error('❌ Response details:', {
          success: response.success,
          message: response.message,
          errors: (response as any).errors,
          data: response.data
        })
        throw new Error(response.message || 'Failed to create requirement')
      }
      
      const createdId = response.data?.id || response.data?.data?.id || ''
      // End loading before navigating so the toast renders instantly
      setIsLoading(false)
      toast({
        title: "Requirement Created",
        description: createdId ? `Your requirement has been created successfully. ID: ${createdId}` : 'Your requirement has been created successfully.',
      })
      router.push(createdId 
        ? `/employer-dashboard/requirements/${createdId}/candidates`
        : '/employer-dashboard/requirements')
    } catch (error: any) {
      console.error('❌ Error creating requirement:', error?.message || error)
      toast({
        title: "Error",
        description: error?.message || "Failed to create requirement. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Keep as a safeguard; if we navigated above, this is harmless
      setIsLoading(false)
    }
  }

  const commonSkills = ["React", "Node.js", "JavaScript", "TypeScript", "Python", "Java", "C++", "MongoDB", "PostgreSQL", "AWS", "Docker", "Kubernetes"]
  const commonBenefits = ["Competitive salary", "Health insurance", "Flexible working hours", "Professional development", "Remote work", "Stock options", "Gym membership", "Free lunch"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      <EmployerNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/employer-dashboard')}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Create New Requirement</h1>
              <p className="text-slate-600">Define your hiring requirement</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the role, responsibilities, and requirements..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Bangalore, Karnataka"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="experience">Experience Required</Label>
                      <Input
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="e.g., 3-5 years"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salary">Salary Range</Label>
                      <Input
                        id="salary"
                        value={formData.salary}
                        onChange={(e) => handleInputChange('salary', e.target.value)}
                        placeholder="e.g., ₹8-15 LPA"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="jobType">Job Type</Label>
                      <Select value={formData.jobType} onValueChange={(value) => handleInputChange('jobType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Selected Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center space-x-1">
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleSkillChange(skill, 'remove')}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Add Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonSkills.filter(skill => !formData.skills.includes(skill)).map((skill) => (
                        <Button
                          key={skill}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSkillChange(skill, 'add')}
                        >
                          + {skill}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Skills Input */}
                  <div>
                    <Label>Add Custom Skills</Label>
                    <div className="flex space-x-2 mt-2">
                      <Input
                        placeholder="Add custom skill"
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                      />
                      <Button type="button" onClick={handleAddSkill} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.keySkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.keySkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle>Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Selected Benefits</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.benefits.map((benefit) => (
                        <Badge key={benefit} variant="secondary" className="flex items-center space-x-1">
                          <span>{benefit}</span>
                          <button
                            type="button"
                            onClick={() => handleBenefitChange(benefit, 'remove')}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Add Benefits</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonBenefits.filter(benefit => !formData.benefits.includes(benefit)).map((benefit) => (
                        <Button
                          key={benefit}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleBenefitChange(benefit, 'add')}
                        >
                          + {benefit}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Benefits Input */}
                  <div>
                    <Label>Add Custom Benefits</Label>
                    <div className="flex space-x-2 mt-2">
                      <Input
                        placeholder="Add custom benefit"
                        value={currentBenefit}
                        onChange={(e) => setCurrentBenefit(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddBenefit())}
                      />
                      <Button type="button" onClick={handleAddBenefit} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Select value={formData.education} onValueChange={(value) => handleInputChange('education', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select education" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B.Tech/B.E.">B.Tech/B.E.</SelectItem>
                        <SelectItem value="M.Tech/M.E.">M.Tech/M.E.</SelectItem>
                        <SelectItem value="MBA">MBA</SelectItem>
                        <SelectItem value="B.Sc">B.Sc</SelectItem>
                        <SelectItem value="M.Sc">M.Sc</SelectItem>
                        <SelectItem value="Any Graduate">Any Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="validTill">Valid Till</Label>
                    <Input
                      id="validTill"
                      type="date"
                      value={formData.validTill}
                      onChange={(e) => handleInputChange('validTill', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="noticePeriod">Notice Period</Label>
                    <Select value={formData.noticePeriod} onValueChange={(value) => handleInputChange('noticePeriod', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select notice period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Immediately">Immediately</SelectItem>
                        <SelectItem value="15 days">15 days</SelectItem>
                        <SelectItem value="30 days">30 days</SelectItem>
                        <SelectItem value="60 days">60 days</SelectItem>
                        <SelectItem value="90 days">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Work Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Work Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="remoteWork">Remote Work</Label>
                    <Select value={formData.remoteWork} onValueChange={(value) => handleInputChange('remoteWork', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select remote work option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="On-site">On-site</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="travelRequired">Travel Required</Label>
                    <Select value={formData.travelRequired} onValueChange={(value) => handleInputChange('travelRequired', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select travel requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Occasionally">Occasionally</SelectItem>
                        <SelectItem value="Frequently">Frequently</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="shiftTiming">Shift Timing</Label>
                    <Select value={formData.shiftTiming} onValueChange={(value) => handleInputChange('shiftTiming', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift timing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Day">Day</SelectItem>
                        <SelectItem value="Night">Night</SelectItem>
                        <SelectItem value="Rotational">Rotational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/employer-dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Create Requirement</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>

      <EmployerFooter />
    </div>
  )
} 