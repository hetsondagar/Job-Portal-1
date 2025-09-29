"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Plus, MapPin, DollarSign, Clock, Users, Briefcase, Globe } from "lucide-react"
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
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"

export default function GulfPostJobPage() {
  const { user } = useAuth()

  return (
    <EmployerAuthGuard>
      <GulfPostJobContent user={user} />
    </EmployerAuthGuard>
  )
}

function GulfPostJobContent({ user }: { user: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "full-time",
    experienceLevel: "mid",
    salaryMin: "",
    salaryMax: "",
    currency: "AED",
    skills: "",
    requirements: "",
    benefits: "",
    remoteWork: "on-site",
    shiftTiming: "day",
    travelRequired: "no",
    noticePeriod: "30",
    companyName: "",
    companyId: user?.companyId || "",
    region: "gulf"
  })

  // Apply template prefill via URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const templateDataParam = params.get('templateData')
      const templateName = params.get('templateName')
      if (templateDataParam) {
        const prefill = JSON.parse(decodeURIComponent(templateDataParam))
        setFormData(prev => ({
          ...prev,
          title: prefill.title || prev.title,
          description: prefill.description || prev.description,
          location: prefill.location || prev.location,
          jobType: prefill.jobType || prev.jobType,
          experienceLevel: prefill.experienceLevel || prev.experienceLevel,
          salaryMin: prefill.salaryMin ?? prev.salaryMin,
          salaryMax: prefill.salaryMax ?? prev.salaryMax,
          currency: prefill.salaryCurrency || prev.currency,
          skills: Array.isArray(prefill.skills) ? prefill.skills.join(', ') : (prefill.skills || prev.skills),
          requirements: prefill.requirements || prev.requirements,
          benefits: prefill.benefits || prev.benefits,
          remoteWork: prefill.remoteWork || prev.remoteWork,
          shiftTiming: prefill.shiftTiming || prev.shiftTiming,
          travelRequired: (prefill.travelRequired ? 'yes' : 'no') || prev.travelRequired,
          noticePeriod: prefill.noticePeriod ?? prev.noticePeriod
        }))
        if (templateName) {
          // @ts-ignore toast available in this file
          toast.success(`Template "${decodeURIComponent(templateName)}" applied`) 
        }
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('template')
        newUrl.searchParams.delete('templateData')
        newUrl.searchParams.delete('templateName')
        window.history.replaceState({}, '', newUrl.toString())
      }
    } catch (e) {
      console.error('Failed to apply template prefill:', e)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare data and validate required fields per backend rules for active jobs
      const skillsArr = formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      const requirementsArr = formData.requirements.split('\n').map(r => r.trim()).filter(Boolean)
      const benefitsArr = formData.benefits.split('\n').map(b => b.trim()).filter(Boolean)

      // Basic client-side validation to mirror backend
      if (!formData.title.trim()) throw new Error('Job title is required')
      if (!formData.description.trim()) throw new Error('Job description is required')
      if (!formData.location.trim()) throw new Error('Job location is required')
      if (requirementsArr.length === 0) throw new Error('Please add at least one requirement')
      if (!formData.jobType) throw new Error('Job type is required')
      if (!formData.experienceLevel) throw new Error('Experience level is required')
      if (!formData.salary && !formData.salaryMin && !formData.salaryMax) {
        if (!formData.salaryMin && !formData.salaryMax) throw new Error('Please provide salary range')
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        salaryCurrency: formData.currency || 'AED',
        skills: skillsArr,
        requirements: requirementsArr,
        benefits: benefitsArr,
        remoteWork: formData.remoteWork,
        shiftTiming: formData.shiftTiming,
        travelRequired: formData.travelRequired === 'no' ? false : true,
        noticePeriod: formData.noticePeriod ? String(formData.noticePeriod) : undefined,
        companyId: formData.companyId || user?.companyId || undefined,
        region: 'gulf',
        status: 'active',
        department: 'General'
      }

      const response = await apiService.createJob(payload)

      if (response.success) {
        toast.success('Job posted successfully for Gulf region!')
        router.push('/gulf-dashboard/manage-jobs')
      } else {
        toast.error(response.message || 'Failed to post job')
      }
    } catch (error: any) {
      console.error('Error posting job:', error)
      const msg = Array.isArray(error?.errors) ? error.errors.join(', ') : (error.message || 'Failed to post job')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Post a Job - Gulf Region</h1>
              <p className="text-slate-600">Create a new job posting for the Gulf region</p>
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
                <span>Job Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title *</Label>
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
                    <Label htmlFor="description">Job Description *</Label>
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

                {/* Job Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Job Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type</Label>
                      <Select value={formData.jobType} onValueChange={(value) => handleInputChange("jobType", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full Time</SelectItem>
                          <SelectItem value="part-time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experienceLevel">Experience Level</Label>
                      <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange("experienceLevel", value)}>
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
                      <Label htmlFor="remoteWork">Work Type</Label>
                      <Select value={formData.remoteWork} onValueChange={(value) => handleInputChange("remoteWork", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on-site">On-site</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Salary Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Salary Information</h3>
                  
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
                      <Label htmlFor="salaryMin">Minimum Salary</Label>
                      <Input
                        id="salaryMin"
                        type="number"
                        value={formData.salaryMin}
                        onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                        placeholder="e.g., 5000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salaryMax">Maximum Salary</Label>
                      <Input
                        id="salaryMax"
                        type="number"
                        value={formData.salaryMax}
                        onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                        placeholder="e.g., 10000"
                      />
                    </div>
                  </div>
                </div>

                {/* Skills and Requirements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Skills & Requirements</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      value={formData.skills}
                      onChange={(e) => handleInputChange("skills", e.target.value)}
                      placeholder="e.g., React, Node.js, MongoDB, AWS"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => handleInputChange("requirements", e.target.value)}
                      placeholder="List each requirement on a new line..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits & Perks</Label>
                    <Textarea
                      id="benefits"
                      value={formData.benefits}
                      onChange={(e) => handleInputChange("benefits", e.target.value)}
                      placeholder="List each benefit on a new line..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Additional Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shiftTiming">Shift Timing</Label>
                      <Select value={formData.shiftTiming} onValueChange={(value) => handleInputChange("shiftTiming", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Day Shift</SelectItem>
                          <SelectItem value="night">Night Shift</SelectItem>
                          <SelectItem value="rotational">Rotational</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="travelRequired">Travel Required</Label>
                      <Select value={formData.travelRequired} onValueChange={(value) => handleInputChange("travelRequired", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No Travel</SelectItem>
                          <SelectItem value="occasionally">Occasionally</SelectItem>
                          <SelectItem value="frequently">Frequently</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noticePeriod">Notice Period (days)</Label>
                    <Input
                      id="noticePeriod"
                      type="number"
                      value={formData.noticePeriod}
                      onChange={(e) => handleInputChange("noticePeriod", e.target.value)}
                      placeholder="e.g., 30"
                    />
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
                    {loading ? 'Posting Job...' : 'Post Job for Gulf Region'}
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
