"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Plus, MapPin, DollarSign, Clock, Users, Briefcase, Globe, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { EmployerAuthGuard } from "@/components/employer-auth-guard"
import { GulfEmployerAuthGuard } from "@/components/gulf-employer-auth-guard"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"

export default function GulfCreateRequirementPage() {
  const { user } = useAuth()

  return (
    <EmployerAuthGuard>
      <GulfEmployerAuthGuard>
        <GulfCreateRequirementContent user={user} />
      </GulfEmployerAuthGuard>
    </EmployerAuthGuard>
  )
}

function GulfCreateRequirementContent({ user }: { user: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    experience: "mid",
    workExperienceMin: "",
    workExperienceMax: "",
    salary: "",
    currentSalaryMin: "",
    currentSalaryMax: "",
    currency: "AED",
    jobType: "full-time",
    skills: [] as string[],
    keySkills: [] as string[],
    education: "",
    industry: "",
    department: "",
    validTill: "",
    noticePeriod: "",
    remoteWork: "on-site",
    travelRequired: "No",
    shiftTiming: "day",
    candidateLocations: [] as string[],
    candidateDesignations: [] as string[],
    includeWillingToRelocate: false,
    includeNotMentioned: false,
    benefits: [] as string[],
    region: "gulf",
    institute: "",
    resumeFreshness: "",
    currentCompany: "",
  })

  const [currentSkill, setCurrentSkill] = useState("")
  const [currentKeySkill, setCurrentKeySkill] = useState("")
  const [currentBenefit, setCurrentBenefit] = useState("")
  const [currentCandidateLocation, setCurrentCandidateLocation] = useState("")
  const [currentCandidateDesignation, setCurrentCandidateDesignation] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        workExperienceMin: formData.workExperienceMin ? Number(formData.workExperienceMin) : undefined,
        workExperienceMax: formData.workExperienceMax ? Number(formData.workExperienceMax) : undefined,
        currentSalaryMin: formData.currentSalaryMin ? Number(formData.currentSalaryMin) : undefined,
        currentSalaryMax: formData.currentSalaryMax ? Number(formData.currentSalaryMax) : undefined,
        validTill: formData.validTill || undefined,
        travelRequired: formData.travelRequired === 'Yes' ? true : (formData.travelRequired === 'No' ? false : undefined),
        region: "gulf" // Ensure Gulf region
      }

      console.log('🔍 Submitting Gulf requirement payload:', payload)
      const response = await apiService.createRequirement(payload)
      console.log('✅ Gulf requirement API response:', response)
      
      if (response.success) {
        toast.success('Requirement created successfully for Gulf region!')
        router.push('/gulf-dashboard/requirements')
      } else {
        toast.error(response.message || 'Failed to create requirement')
      }
    } catch (error: any) {
      console.error('Error creating requirement:', error)
      toast.error(error.message || 'Failed to create requirement')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, currentSkill.trim()] }))
      setCurrentSkill("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
  }

  const handleAddKeySkill = () => {
    if (currentKeySkill.trim() && !formData.keySkills.includes(currentKeySkill.trim())) {
      setFormData(prev => ({ ...prev, keySkills: [...prev.keySkills, currentKeySkill.trim()] }))
      setCurrentKeySkill("")
    }
  }

  const handleRemoveKeySkill = (skill: string) => {
    setFormData(prev => ({ ...prev, keySkills: prev.keySkills.filter(s => s !== skill) }))
  }

  const handleAddBenefit = () => {
    if (currentBenefit.trim() && !formData.benefits.includes(currentBenefit.trim())) {
      setFormData(prev => ({ ...prev, benefits: [...prev.benefits, currentBenefit.trim()] }))
      setCurrentBenefit("")
    }
  }

  const handleRemoveBenefit = (benefit: string) => {
    setFormData(prev => ({ ...prev, benefits: prev.benefits.filter(b => b !== benefit) }))
  }

  const handleAddCandidateLocation = () => {
    if (currentCandidateLocation.trim() && !formData.candidateLocations.includes(currentCandidateLocation.trim())) {
      setFormData(prev => ({ ...prev, candidateLocations: [...prev.candidateLocations, currentCandidateLocation.trim()] }))
      setCurrentCandidateLocation("")
    }
  }

  const handleRemoveCandidateLocation = (location: string) => {
    setFormData(prev => ({ ...prev, candidateLocations: prev.candidateLocations.filter(l => l !== location) }))
  }

  const handleAddCandidateDesignation = () => {
    if (currentCandidateDesignation.trim() && !formData.candidateDesignations.includes(currentCandidateDesignation.trim())) {
      setFormData(prev => ({ ...prev, candidateDesignations: [...prev.candidateDesignations, currentCandidateDesignation.trim()] }))
      setCurrentCandidateDesignation("")
    }
  }

  const handleRemoveCandidateDesignation = (designation: string) => {
    setFormData(prev => ({ ...prev, candidateDesignations: prev.candidateDesignations.filter(d => d !== designation) }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      <EmployerNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Create Requirement - Gulf Region</h1>
              <p className="text-slate-600">Create a new requirement for Gulf region candidates</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Requirement Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Requirement Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="e.g., Senior Software Engineer"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          placeholder="e.g., Dubai, UAE"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                      rows={6}
                      required
                    />
                  </div>
                </div>

                {/* Experience & Salary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Experience & Salary</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience Level</Label>
                      <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fresher">Fresher (0-1 years)</SelectItem>
                          <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                          <SelectItem value="mid">Mid (3-6 years)</SelectItem>
                          <SelectItem value="senior">Senior (6-10 years)</SelectItem>
                          <SelectItem value="lead">Lead (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workExperienceMin">Min Experience (years)</Label>
                      <Input
                        id="workExperienceMin"
                        type="number"
                        value={formData.workExperienceMin}
                        onChange={(e) => handleInputChange("workExperienceMin", e.target.value)}
                        placeholder="e.g., 3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workExperienceMax">Max Experience (years)</Label>
                      <Input
                        id="workExperienceMax"
                        type="number"
                        value={formData.workExperienceMax}
                        onChange={(e) => handleInputChange("workExperienceMax", e.target.value)}
                        placeholder="e.g., 8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AED">AED (UAE Dirham)</SelectItem>
                          <SelectItem value="SAR">SAR (Saudi Riyal)</SelectItem>
                          <SelectItem value="QAR">QAR (Qatari Riyal)</SelectItem>
                          <SelectItem value="KWD">KWD (Kuwaiti Dinar)</SelectItem>
                          <SelectItem value="BHD">BHD (Bahraini Dinar)</SelectItem>
                          <SelectItem value="OMR">OMR (Omani Rial)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentSalaryMin">Min Current Salary</Label>
                      <Input
                        id="currentSalaryMin"
                        type="number"
                        value={formData.currentSalaryMin}
                        onChange={(e) => handleInputChange("currentSalaryMin", e.target.value)}
                        placeholder="e.g., 5000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentSalaryMax">Max Current Salary</Label>
                      <Input
                        id="currentSalaryMax"
                        type="number"
                        value={formData.currentSalaryMax}
                        onChange={(e) => handleInputChange("currentSalaryMax", e.target.value)}
                        placeholder="e.g., 10000"
                      />
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Skills & Requirements</h3>
                  
                  <div className="space-y-2">
                    <Label>Required Skills</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        placeholder="e.g., React, Node.js"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      />
                      <Button type="button" onClick={handleAddSkill} variant="outline">
                        Add
                      </Button>
                    </div>
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm flex items-center space-x-2"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-emerald-600 hover:text-emerald-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Key Skills</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={currentKeySkill}
                        onChange={(e) => setCurrentKeySkill(e.target.value)}
                        placeholder="e.g., Leadership, Communication"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeySkill())}
                      />
                      <Button type="button" onClick={handleAddKeySkill} variant="outline">
                        Add
                      </Button>
                    </div>
                    {formData.keySkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.keySkills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm flex items-center space-x-2"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveKeySkill(skill)}
                              className="text-teal-600 hover:text-teal-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Candidate Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Candidate Preferences</h3>
                  
                  <div className="space-y-2">
                    <Label>Preferred Candidate Locations</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={currentCandidateLocation}
                        onChange={(e) => setCurrentCandidateLocation(e.target.value)}
                        placeholder="e.g., Dubai, Abu Dhabi"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCandidateLocation())}
                      />
                      <Button type="button" onClick={handleAddCandidateLocation} variant="outline">
                        Add
                      </Button>
                    </div>
                    {formData.candidateLocations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.candidateLocations.map((location, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-2"
                          >
                            <span>{location}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCandidateLocation(location)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Candidate Designations</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={currentCandidateDesignation}
                        onChange={(e) => setCurrentCandidateDesignation(e.target.value)}
                        placeholder="e.g., Software Engineer, Manager"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCandidateDesignation())}
                      />
                      <Button type="button" onClick={handleAddCandidateDesignation} variant="outline">
                        Add
                      </Button>
                    </div>
                    {formData.candidateDesignations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.candidateDesignations.map((designation, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center space-x-2"
                          >
                            <span>{designation}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCandidateDesignation(designation)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeWillingToRelocate"
                        checked={formData.includeWillingToRelocate}
                        onCheckedChange={(checked) => handleInputChange("includeWillingToRelocate", checked)}
                      />
                      <Label htmlFor="includeWillingToRelocate">Include willing to relocate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeNotMentioned"
                        checked={formData.includeNotMentioned}
                        onCheckedChange={(checked) => handleInputChange("includeNotMentioned", checked)}
                      />
                      <Label htmlFor="includeNotMentioned">Include not mentioned</Label>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Benefits & Perks</h3>
                  
                  <div className="space-y-2">
                    <Label>Benefits</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={currentBenefit}
                        onChange={(e) => setCurrentBenefit(e.target.value)}
                        placeholder="e.g., Health Insurance, Annual Leave"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                      />
                      <Button type="button" onClick={handleAddBenefit} variant="outline">
                        Add
                      </Button>
                    </div>
                    {formData.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.benefits.map((benefit, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center space-x-2"
                          >
                            <span>{benefit}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBenefit(benefit)}
                              className="text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Additional Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="institute">Institute / University</Label>
                      <Input
                        id="institute"
                        value={formData.institute}
                        onChange={(e) => handleInputChange('institute', e.target.value)}
                        placeholder="e.g., IIT Bombay, KAUST"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resumeFreshness">Resume Freshness / Last Updated Date</Label>
                      <Input
                        id="resumeFreshness"
                        type="date"
                        value={formData.resumeFreshness}
                        onChange={(e) => handleInputChange('resumeFreshness', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentCompany">Current Company</Label>
                      <Input
                        id="currentCompany"
                        value={formData.currentCompany}
                        onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                        placeholder="e.g., Emirates, Aramco"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    {loading ? 'Creating Requirement...' : 'Create Requirement for Gulf Region'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <EmployerFooter />
    </div>
  )
}
