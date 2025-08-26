"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Eye, Send, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export default function PostJobPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [publishing, setPublishing] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "",
    experience: "",
    salary: "",
    description: "",
    requirements: "",
    benefits: "",
    skills: [],
  })

  const steps = [
    { id: 1, title: "Job Details", description: "Basic job information" },
    { id: 2, title: "Requirements", description: "Job requirements and skills" },
    { id: 3, title: "Benefits & Perks", description: "What you offer" },
    { id: 4, title: "Review & Post", description: "Final review" },
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Remove the automatic redirect - let users fill out the form

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePublishJob = async () => {
    // Check authentication when trying to publish
    if (!user) {
      setShowAuthDialog(true)
      return
    }
    
    if (user.userType !== 'employer') {
      toast.error('Only employers can post jobs')
      setShowAuthDialog(true)
      return
    }

    // Validate required fields
    if (!formData.title || !formData.description || !formData.requirements || !formData.location) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setPublishing(true)
      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        location: formData.location,
        type: formData.type || 'full-time',
        experience: formData.experience || 'fresher',
        salary: formData.salary,
        benefits: formData.benefits,
        skills: formData.skills,
        department: formData.department
      }

      const response = await apiService.postJob(jobData)
      
      if (response.success) {
        toast.success('Job posted successfully!')
        // Reset form
        setFormData({
          title: "",
          department: "",
          location: "",
          type: "",
          experience: "",
          salary: "",
          description: "",
          requirements: "",
          benefits: "",
          skills: [],
        })
        setCurrentStep(1)
        // Optionally redirect to jobs list
        // router.push('/employer-dashboard/my-jobs')
      } else {
        toast.error(response.message || 'Failed to post job')
      }
    } catch (error: any) {
      console.error('Job posting error:', error)
      toast.error(error.message || 'Failed to post job')
    } finally {
      setPublishing(false)
    }
  }

  const handleAuthDialogAction = (action: 'login' | 'register') => {
    setShowAuthDialog(false)
    if (action === 'login') {
      router.push('/employer-login')
    } else {
      router.push('/employer-register')
    }
  }

  

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Job Title*</label>
                <Input
                  placeholder="e.g. Senior React Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Department*</label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Location*</label>
                <Input
                  placeholder="e.g. Bangalore, Karnataka"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Job Type*</label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Experience Level*</label>
                <Select value={formData.experience} onValueChange={(value) => setFormData({ ...formData, experience: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fresher">Fresher (0-1 years)</SelectItem>
                    <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                    <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Salary Range*</label>
                <Input
                  placeholder="e.g. ₹8-15 LPA"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Job Description*</label>
              <Textarea
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                className="min-h-32"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Requirements*</label>
              <Textarea
                placeholder="List the required qualifications, experience, and skills..."
                className="min-h-32"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Key Skills (Optional)</label>
              <Input placeholder="e.g. React, Node.js, JavaScript (separate with commas)" />
              <p className="text-sm text-gray-500 mt-1">Add relevant skills to help candidates find this job</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Additional Requirements</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remote" />
                  <label htmlFor="remote" className="text-sm">
                    Remote work available
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="travel" />
                  <label htmlFor="travel" className="text-sm">
                    Travel required
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="degree" />
                  <label htmlFor="degree" className="text-sm">
                    Bachelor's degree required
                  </label>
                </div>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Benefits & Perks</label>
              <Textarea
                placeholder="Describe the benefits, perks, and what makes your company a great place to work..."
                className="min-h-32"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Common Benefits</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "Health Insurance",
                  "Dental Insurance",
                  "Vision Insurance",
                  "Life Insurance",
                  "401(k) Plan",
                  "Paid Time Off",
                  "Flexible Hours",
                  "Remote Work",
                  "Professional Development",
                  "Gym Membership",
                  "Free Lunch",
                  "Stock Options",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center space-x-2">
                    <Checkbox id={benefit} />
                    <label htmlFor={benefit} className="text-sm">
                      {benefit}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Job Preview</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{formData.title || "Job Title"}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">Full-time</Badge>
                    <Badge variant="secondary">Engineering</Badge>
                    <Badge variant="secondary">Bangalore</Badge>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Description</h5>
                  <p className="text-gray-700 mt-1">{formData.description || "No description provided"}</p>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Requirements</h5>
                  <p className="text-gray-700 mt-1">{formData.requirements || "No requirements provided"}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Publishing Options</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="featured" />
                  <label htmlFor="featured" className="text-sm">
                    Make this a featured job (+₹2,000)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="urgent" />
                  <label htmlFor="urgent" className="text-sm">
                    Mark as urgent hiring (+₹1,000)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="email" />
                  <label htmlFor="email" className="text-sm">
                    Send email notifications for applications
                  </label>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <EmployerNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <EmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/employer-dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
              <p className="text-gray-600">Create and publish your job posting</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Steps */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50 sticky top-24">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                        currentStep === step.id
                          ? "bg-blue-50 border border-blue-200"
                          : currentStep > step.id
                            ? "bg-green-50 border border-green-200"
                            : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          currentStep === step.id
                            ? "bg-blue-600 text-white"
                            : currentStep > step.id
                              ? "bg-green-600 text-white"
                              : "bg-gray-400 text-white"
                        }`}
                      >
                        {currentStep > step.id ? "✓" : step.id}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{step.title}</div>
                        <div className="text-xs text-gray-600">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
              <CardHeader>
                <CardTitle>
                  Step {currentStep}: {steps[currentStep - 1].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <div>
                    {currentStep > 1 && (
                      <Button variant="outline" onClick={handlePrevious}>
                        Previous
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                    {currentStep < steps.length ? (
                      <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                        Next Step
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          onClick={handlePublishJob} 
                          disabled={publishing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {publishing ? 'Publishing...' : 'Publish Job'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <EmployerFooter />

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Authentication Required
            </DialogTitle>
            <DialogDescription>
              You need to be logged in as an employer to post jobs. Please sign in or create an account to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => handleAuthDialogAction('login')}>
              Sign In
            </Button>
            <Button onClick={() => handleAuthDialogAction('register')}>
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
