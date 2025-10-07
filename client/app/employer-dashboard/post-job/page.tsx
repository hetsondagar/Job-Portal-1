"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Eye, Send, AlertCircle, Camera, Upload, X, Image as ImageIcon, CheckCircle, ChevronDown } from "lucide-react"
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
import DepartmentDropdown from "@/components/ui/department-dropdown"
import IndustryDropdown from "@/components/ui/industry-dropdown"
import RoleCategoryDropdown from "@/components/ui/role-category-dropdown"

export default function PostJobPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [publishing, setPublishing] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [loadingDraft, setLoadingDraft] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [editingJobId, setEditingJobId] = useState<string | null>(null)
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
    skills: [] as string[],
    role: "",
    industryType: "",
    roleCategory: "",
    education: "",
    employmentType: "",
  })
  const [jobPhotos, setJobPhotos] = useState<any[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [uploadedJobId, setUploadedJobId] = useState<string | null>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [postedJobId, setPostedJobId] = useState<string | null>(null)
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false)
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false)
  const [showRoleCategoryDropdown, setShowRoleCategoryDropdown] = useState(false)
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedRoleCategories, setSelectedRoleCategories] = useState<string[]>([])

  const steps = [
    { id: 1, title: "Basic Info", description: "Basic job information" },
    { id: 2, title: "Job Details", description: "Role, industry, department, and requirements" },
    { id: 3, title: "Benefits & Perks", description: "What you offer" },
    { id: 4, title: "Photos", description: "Showcase your workplace" },
    { id: 5, title: "Review & Post", description: "Final review" },
  ]

  // Load job photos when uploadedJobId changes
  useEffect(() => {
    const loadJobPhotos = async () => {
      if (uploadedJobId && user) {
        try {
          console.log('🔍 Loading job photos for job ID:', uploadedJobId)
          const photosResponse = await apiService.getJobPhotos(uploadedJobId)
          if (photosResponse.success) {
            console.log('✅ Job photos loaded:', photosResponse.data)
            console.log('📸 Photo URLs:', photosResponse.data?.map(p => p.fileUrl))
            setJobPhotos(photosResponse.data || [])
          } else {
            console.error('❌ Failed to load photos:', photosResponse)
          }
        } catch (error) {
          console.error('Failed to load job photos:', error)
        }
      }
    }

    loadJobPhotos()
  }, [uploadedJobId, user])

  // Load job data when editing or template data from URL
  useEffect(() => {
    const loadJobData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('draft') || urlParams.get('job');
      const templateId = urlParams.get('template');
      const templateDataParam = urlParams.get('templateData');
      const templateName = urlParams.get('templateName');
      
      if (jobId && user) {
        try {
          setLoadingDraft(true);
          console.log('🔍 Loading job data for job ID:', jobId);
          
          const response = await apiService.getJobForEdit(jobId);
          
          if (response.success) {
            const jobData = response.data;
            console.log('✅ Job data loaded:', jobData);
            
            setEditingJobId(jobId);
            setUploadedJobId(jobId);
            setFormData({
              title: jobData.title || '',
              department: jobData.department || '',
              location: jobData.location || '',
              type: jobData.jobType || jobData.type || '',
              experience: jobData.experience || jobData.experienceLevel || '',
              salary: jobData.salary || '',
              description: jobData.description || '',
              requirements: jobData.requirements || '',
              benefits: jobData.benefits || '',
              skills: jobData.skills || [],
              role: jobData.role || '',
              industryType: jobData.industryType || '',
              roleCategory: jobData.roleCategory || '',
              education: jobData.education || '',
              employmentType: jobData.employmentType || ''
            });
            
            // Load existing job photos
            try {
              const photosResponse = await apiService.getJobPhotos(jobId);
              if (photosResponse.success) {
                setJobPhotos(photosResponse.data || []);
              }
            } catch (photoError) {
              console.error('Failed to load job photos:', photoError);
            }
            
            const isDraft = jobData.status === 'draft';
            toast.success(`${isDraft ? 'Draft' : 'Job'} loaded successfully! Continue editing where you left off.`);
          } else {
            console.error('❌ Failed to load job:', response);
            toast.error('Failed to load job. Please try again.');
          }
        } catch (error: any) {
          console.error('❌ Error loading job:', error);
          toast.error('Failed to load job. Please try again.');
        } finally {
          setLoadingDraft(false);
        }
      } else if (templateId && templateDataParam && user) {
        // Load template data from URL parameters
        try {
          setLoadingDraft(true);
          console.log('🔍 Loading template data from URL:', templateId);
          
          const templateData = JSON.parse(decodeURIComponent(templateDataParam));
          console.log('✅ Template data loaded:', templateData);
          
          setSelectedTemplate(templateId);
          setFormData({
            title: templateData.title || '',
            department: templateData.department || '',
            location: templateData.location || '',
            type: templateData.jobType || templateData.type || '',
            experience: templateData.experienceLevel || templateData.experience || '',
            salary: templateData.salary || (templateData.salaryMin && templateData.salaryMax ? `${templateData.salaryMin}-${templateData.salaryMax}` : ''),
            description: templateData.description || '',
            requirements: templateData.requirements || '',
            benefits: templateData.benefits || '',
            skills: Array.isArray(templateData.skills) ? templateData.skills : (typeof templateData.skills === 'string' ? templateData.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
            role: templateData.role || '',
            industryType: templateData.industryType || '',
            roleCategory: templateData.roleCategory || '',
            education: templateData.education || '',
            employmentType: templateData.employmentType || ''
          });
          
          toast.success(`Template "${decodeURIComponent(templateName || '')}" applied successfully! Customize the fields as needed.`);
          
          // Clean up URL parameters
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('template');
          newUrl.searchParams.delete('templateData');
          newUrl.searchParams.delete('templateName');
          window.history.replaceState({}, '', newUrl.toString());
        } catch (error: any) {
          console.error('❌ Error loading template data:', error);
          toast.error('Failed to load template data. Please try again.');
        } finally {
          setLoadingDraft(false);
        }
      }
    };

    if (user && !loading) {
      loadJobData();
      loadTemplates();
    }
  }, [user, loading]);

  // Load available templates
  const loadTemplates = async () => {
    try {
      const response = await apiService.getJobTemplates();
      if (response.success) {
        setTemplates(response.data || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  // Handle template selection
  const handleTemplateSelect = async (templateId: string) => {
    if (!templateId) return;
    
    try {
      const response = await apiService.getJobTemplateById(templateId);
      if (response.success && response.data) {
        const template = response.data;
        console.log('🔍 Applying template:', template.name);
        console.log('📋 Template data:', template.templateData);
        
        const newFormData = {
          title: template.templateData.title || '',
          department: template.templateData.department || '',
          location: template.templateData.location || '',
          type: template.templateData.type || '',
          experience: template.templateData.experience || '',
          salary: template.templateData.salary || '',
          description: template.templateData.description || '',
          requirements: template.templateData.requirements || '',
          benefits: template.templateData.benefits || '',
          skills: Array.isArray(template.templateData.skills) ? template.templateData.skills : [],
          role: template.templateData.role || '',
          industryType: template.templateData.industryType || '',
          roleCategory: template.templateData.roleCategory || '',
          education: template.templateData.education || '',
          employmentType: template.templateData.employmentType || ''
        };
        
        console.log('📝 Setting form data:', newFormData);
        setFormData(newFormData);
        
        // Record template usage
        await apiService.useJobTemplate(templateId);
        
        toast.success(`Template "${template.name}" applied successfully! All fields have been pre-filled.`);
        setSelectedTemplate(templateId);
        setShowTemplateDialog(false);
      }
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template');
    }
  };

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

  const handleSaveDraft = async () => {
    // Check authentication when trying to save draft
    if (!user) {
      setShowAuthDialog(true)
      return
    }
    
    if (user.userType !== 'employer' && user.userType !== 'admin') {
      toast.error('Only employers can save job drafts')
      setShowAuthDialog(true)
      return
    }

    try {
      setSavingDraft(true)
      console.log('💾 Saving job:', formData)
      
      const jobData = {
        title: formData.title || 'Untitled Job',
        description: formData.description || '',
        requirements: formData.requirements || '',
        location: formData.location || '',
        type: formData.type || 'full-time',
        experience: formData.experience || 'fresher',
        salary: formData.salary || '',
        benefits: formData.benefits || '',
        skills: formData.skills || [],
        department: formData.department || '',
        status: editingJobId ? undefined : 'draft' // Only set to draft for new jobs, preserve existing status for edits
      }

      let response;
      if (editingJobId) {
        // Update existing job
        console.log('🔄 Updating existing job:', editingJobId);
        response = await apiService.updateJob(editingJobId, jobData);
        setUploadedJobId(editingJobId);
      } else {
        // Create new draft
        console.log('🆕 Creating new draft');
        response = await apiService.postJob(jobData);
        if (response.success && response.data?.id) {
          setUploadedJobId(response.data.id);
        }
      }
      
      if (response.success) {
        const action = editingJobId ? 'updated' : 'saved';
        const jobType = editingJobId ? 'job' : 'draft';
        toast.success(`${jobType.charAt(0).toUpperCase() + jobType.slice(1)} ${action} successfully!`)
        console.log(`✅ ${jobType.charAt(0).toUpperCase() + jobType.slice(1)} ${action}:`, response.data)
        
        // For drafts, just show success message and stay on the form
        // For published jobs, show success dialog
        if (editingJobId || jobData.status === 'active') {
          setPostedJobId(response.data.id)
          setShowSuccessDialog(true)
        } else {
          // For new drafts, just update the uploadedJobId to enable photo uploads
          setUploadedJobId(response.data.id)
        }
      } else {
        console.error('❌ Job saving failed:', response)
        toast.error(response.message || 'Failed to save job')
      }
    } catch (error: any) {
      console.error('❌ Job saving error:', error)
      
      // Handle specific error types
      if (error.message?.includes('DATABASE_CONNECTION_ERROR')) {
        toast.error('Database connection error. Please try again later.')
      } else if (error.message?.includes('MISSING_COMPANY_ASSOCIATION')) {
        toast.error('Company association required. Please contact support.')
      } else if (error.message?.includes('DUPLICATE_JOB_TITLE')) {
        toast.error('A job with this title already exists. Please use a different title.')
      } else if (error.message?.includes('INVALID_FOREIGN_KEY')) {
        toast.error('Invalid company or user reference. Please try logging in again.')
      } else if (error.message?.includes('Validation failed')) {
        toast.error('Please check your input and try again.')
      } else {
        toast.error(error.message || 'Failed to save job. Please try again later.')
      }
    } finally {
      setSavingDraft(false)
    }
  }

  const handlePublishJob = async () => {
    // Check authentication when trying to publish
    if (!user) {
      setShowAuthDialog(true)
      return
    }
    
    if (user.userType !== 'employer' && user.userType !== 'admin') {
      toast.error('Only employers can post jobs')
      setShowAuthDialog(true)
      return
    }

    // Validate required fields with specific messages
    const validationErrors = []
    
    if (!formData.title || formData.title.trim() === '') {
      validationErrors.push('Job title is required')
    }
    if (!formData.description || formData.description.trim() === '') {
      validationErrors.push('Job description is required')
    }
    if (!formData.requirements || formData.requirements.trim() === '') {
      validationErrors.push('Job requirements are required')
    }
    if (!formData.location || formData.location.trim() === '') {
      validationErrors.push('Job location is required')
    }
    if (!formData.department || formData.department.trim() === '') {
      validationErrors.push('Department is required')
    }
    if (!formData.type || formData.type.trim() === '') {
      validationErrors.push('Job type is required')
    }
    if (!formData.experience || formData.experience.trim() === '') {
      validationErrors.push('Experience level is required')
    }
    if (!formData.salary || formData.salary.trim() === '') {
      validationErrors.push('Salary range is required')
    }
    
    if (validationErrors.length > 0) {
      toast.error(`Please fill in the following required fields: ${validationErrors.join(', ')}`)
      return
    }

    try {
      setPublishing(true)
      console.log('📝 Submitting job data:', formData)
      
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
        department: formData.department,
        status: 'active' // Explicitly set status to active for publishing
      }

             let response;
       if (editingJobId) {
         // Update existing job to active status
         console.log('🔄 Publishing existing job:', editingJobId);
         response = await apiService.updateJob(editingJobId, jobData);
         setUploadedJobId(editingJobId);
       } else {
         // Create new job
         console.log('🆕 Creating new job');
         response = await apiService.postJob(jobData);
         if (response.success && response.data?.id) {
           setUploadedJobId(response.data.id);
         }
       }
      
             if (response.success) {
         const action = editingJobId ? 'updated' : 'posted';
         toast.success(`Job ${action} successfully!`)
         console.log(`✅ Job ${action}:`, response.data)
         
         // Store the posted job ID and show success dialog
         setPostedJobId(response.data.id)
         setShowSuccessDialog(true)
         
         if (!editingJobId) {
           // Only reset form for new jobs, not when editing
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
             role: "",
             industryType: "",
             roleCategory: "",
             education: "",
             employmentType: ""
           })
           setCurrentStep(1)
         }
       } else {
        console.error('❌ Job posting failed:', response)
        toast.error(response.message || 'Failed to post job')
      }
    } catch (error: any) {
      console.error('❌ Job posting error:', error)
      
      // Handle specific error types
      if (error.message?.includes('DATABASE_CONNECTION_ERROR')) {
        toast.error('Database connection error. Please try again later.')
      } else if (error.message?.includes('MISSING_COMPANY_ASSOCIATION')) {
        toast.error('Company association required. Please contact support.')
      } else if (error.message?.includes('DUPLICATE_JOB_TITLE')) {
        toast.error('A job with this title already exists. Please use a different title.')
      } else if (error.message?.includes('INVALID_FOREIGN_KEY')) {
        toast.error('Invalid company or user reference. Please try logging in again.')
      } else if (error.message?.includes('Validation failed')) {
        toast.error('Please check your input and try again.')
      } else {
        toast.error(error.message || 'Failed to post job. Please try again later.')
      }
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

  // Photo upload functions
  const handlePhotoUpload = async (files: FileList) => {
    if (!uploadedJobId) {
      toast.error('Please save the job first before uploading photos')
      return
    }

    console.log('📸 Starting photo upload for job:', uploadedJobId)
    console.log('📸 Files to upload:', files.length)

    setUploadingPhotos(true)
    const uploadPromises = Array.from(files).map(async (file, index) => {
      console.log(`📸 Uploading file ${index + 1}:`, file.name, file.size, file.type)
      
      const uploadFormData = new FormData()
      uploadFormData.append('photo', file)
      uploadFormData.append('jobId', uploadedJobId)
      uploadFormData.append('altText', `Job photo for ${formData.title || 'Untitled Job'}`)
      uploadFormData.append('displayOrder', (jobPhotos.length + index).toString())
      uploadFormData.append('isPrimary', (jobPhotos.length === 0 && index === 0).toString())

      try {
        console.log('📸 Sending upload request for:', file.name)
        const response = await apiService.uploadJobPhoto(uploadFormData)
        console.log('📸 Upload response:', response)
        
        if (response.success) {
          console.log('✅ Photo uploaded successfully:', response.data)
          return response.data
        } else {
          console.error('❌ Upload failed:', response.message)
          throw new Error(response.message || 'Upload failed')
        }
      } catch (error) {
        console.error('❌ Photo upload error for', file.name, ':', error)
        throw error
      }
    })

    try {
      const uploadedPhotos = await Promise.all(uploadPromises)
      console.log('✅ All photos uploaded:', uploadedPhotos)
      setJobPhotos(prev => [...prev, ...uploadedPhotos])
      
      // Refresh photos from server to ensure consistency
      try {
        const photosResponse = await apiService.getJobPhotos(uploadedJobId)
        if (photosResponse.success) {
          console.log('🔄 Refreshed photos after upload:', photosResponse.data)
          setJobPhotos(photosResponse.data || [])
        } else {
          console.error('❌ Failed to refresh photos:', photosResponse)
        }
      } catch (refreshError) {
        console.error('Failed to refresh photos:', refreshError)
      }
      
      toast.success(`${uploadedPhotos.length} photo(s) uploaded successfully!`)
    } catch (error: any) {
      console.error('❌ Photo upload failed:', error)
      toast.error(`Failed to upload photos: ${error.message || 'Please try again.'}`)
    } finally {
      setUploadingPhotos(false)
    }
  }

  const handlePhotoDelete = async (photoId: string) => {
    try {
      const response = await apiService.deleteJobPhoto(photoId)
      if (response.success) {
        setJobPhotos(prev => prev.filter(photo => (photo.id || photo.photoId) !== photoId))
        toast.success('Photo deleted successfully!')
      } else {
        toast.error('Failed to delete photo')
      }
    } catch (error) {
      console.error('Photo deletion error:', error)
      toast.error('Failed to delete photo')
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handlePhotoUpload(files)
    }
  }

  // Navigation handlers
  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Template Selection - Enhanced */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">🚀 Quick Start with Templates</h3>
                  <p className="text-sm text-blue-700">
                    Choose from {templates.length} professional templates to create your job posting in seconds
                  </p>
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setShowTemplateDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Browse Templates
                </Button>
              </div>
              
              {selectedTemplate ? (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        ✓ Template Applied & Form Pre-filled
                      </Badge>
                      <div>
                        <span className="font-medium text-gray-900">
                          {templates.find(t => t.id === selectedTemplate)?.name}
                        </span>
                        <p className="text-sm text-gray-600">
                          {templates.find(t => t.id === selectedTemplate)?.description}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          ✨ All form fields have been automatically filled with template data
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate("");
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
                          role: "",
                          industryType: "",
                          roleCategory: "",
                          education: "",
                          employmentType: ""
                        });
                        toast.info("Template cleared. Form has been reset.");
                      }}
                    >
                      Clear Template
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {templates.slice(0, 3).map((template) => (
                    <div
                      key={template.id}
                      className="bg-white rounded-lg p-3 border border-blue-200 hover:border-blue-300 cursor-pointer transition-colors"
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{template.name}</h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {template.usageCount} uses
                        </span>
                      </div>
                    </div>
                  ))}
                  {templates.length > 3 && (
                    <div
                      className="bg-white rounded-lg p-3 border border-dashed border-blue-300 hover:border-blue-400 cursor-pointer transition-colors flex items-center justify-center"
                      onClick={() => setShowTemplateDialog(true)}
                    >
                      <div className="text-center">
                        <div className="text-blue-600 font-medium text-sm">+{templates.length - 3} More</div>
                        <div className="text-xs text-gray-500">View All</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Job Title*
                  {selectedTemplate && formData.title && (
                    <span className="ml-2 text-xs text-green-600">✨ Pre-filled from template</span>
                  )}
                </label>
                <Input
                  placeholder="e.g. Senior React Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Department*</label>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowDepartmentDropdown(true)}
                >
                  <span>{formData.department || "Select department"}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                
                {showDepartmentDropdown && (
                  <DepartmentDropdown
                    selectedDepartments={formData.department ? [formData.department] : []}
                    onDepartmentChange={(departments: string[]) => {
                      // For job posting, we only allow single selection
                      if (departments.length > 0) {
                        setFormData({ ...formData, department: departments[0] })
                      } else {
                        setFormData({ ...formData, department: "" })
                      }
                    }}
                    onClose={() => setShowDepartmentDropdown(false)}
                    hideSelectAllButtons={true}
                  />
                )}
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
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Job Description*
                {selectedTemplate && formData.description && (
                  <span className="ml-2 text-xs text-green-600">✨ Pre-filled from template</span>
                )}
              </label>
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
            {/* Role Field */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Role*
              </label>
              <Input
                placeholder="e.g. Security Administrator, Software Engineer, Data Analyst"
                value={formData.role}
                onChange={(e) => {
                  const value = e.target.value;
                  // Capitalize first letter of each word
                  const capitalized = value.replace(/\b\w/g, l => l.toUpperCase());
                  setFormData({ ...formData, role: capitalized });
                }}
              />
              <p className="text-sm text-gray-500 mt-1">Enter the specific role title</p>
            </div>

            {/* Industry Type */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Industry Type*
              </label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowIndustryDropdown(true)}
              >
                {selectedIndustries.length > 0 
                  ? `${selectedIndustries.length} industry${selectedIndustries.length > 1 ? 'ies' : ''} selected`
                  : "Select industry type"
                }
                <ChevronDown className="w-4 h-4" />
              </Button>
              {selectedIndustries.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedIndustries.slice(0, 3).map((industry, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {industry.replace(/\s*\(\d+\)\s*$/, '')}
                    </Badge>
                  ))}
                  {selectedIndustries.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedIndustries.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Department*
              </label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT & Information Security">IT & Information Security</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Sales & Marketing">Sales & Marketing</SelectItem>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="Finance & Accounting">Finance & Accounting</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                  <SelectItem value="Research & Development">Research & Development</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                  <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                  <SelectItem value="Product Management">Product Management</SelectItem>
                  <SelectItem value="Business Development">Business Development</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Employment Type*
              </label>
              <Select value={formData.employmentType} onValueChange={(value) => setFormData({ ...formData, employmentType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time, Permanent">Full Time, Permanent</SelectItem>
                  <SelectItem value="Part Time, Permanent">Part Time, Permanent</SelectItem>
                  <SelectItem value="Full Time, Contract">Full Time, Contract</SelectItem>
                  <SelectItem value="Part Time, Contract">Part Time, Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Category */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Role Category*
              </label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowRoleCategoryDropdown(true)}
              >
                {selectedRoleCategories.length > 0 
                  ? `${selectedRoleCategories.length} role${selectedRoleCategories.length > 1 ? 's' : ''} selected`
                  : "Select role category"
                }
                <ChevronDown className="w-4 h-4" />
              </Button>
              {selectedRoleCategories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedRoleCategories.slice(0, 3).map((role, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                  {selectedRoleCategories.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedRoleCategories.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Education*
              </label>
              <Select value={formData.education} onValueChange={(value) => setFormData({ ...formData, education: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education requirement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any Graduate">Any Graduate</SelectItem>
                  <SelectItem value="B.Tech/B.E.">B.Tech/B.E.</SelectItem>
                  <SelectItem value="B.Sc">B.Sc</SelectItem>
                  <SelectItem value="B.Com">B.Com</SelectItem>
                  <SelectItem value="BBA">BBA</SelectItem>
                  <SelectItem value="BCA">BCA</SelectItem>
                  <SelectItem value="M.Tech/M.E.">M.Tech/M.E.</SelectItem>
                  <SelectItem value="M.Sc">M.Sc</SelectItem>
                  <SelectItem value="MBA">MBA</SelectItem>
                  <SelectItem value="MCA">MCA</SelectItem>
                  <SelectItem value="M.Com">M.Com</SelectItem>
                  <SelectItem value="Ph.D">Ph.D</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="12th Pass">12th Pass</SelectItem>
                  <SelectItem value="10th Pass">10th Pass</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Requirements*
                {selectedTemplate && formData.requirements && (
                  <span className="ml-2 text-xs text-green-600">✨ Pre-filled from template</span>
                )}
              </label>
              <Textarea
                placeholder="List the required qualifications, experience, and skills..."
                className="min-h-32"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>

            {/* Key Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Key Skills*
                {selectedTemplate && formData.skills && formData.skills.length > 0 && (
                  <span className="ml-2 text-xs text-green-600">✨ Pre-filled from template</span>
                )}
              </label>
              <Input 
                placeholder="e.g. SAP Security, SAP GRC, JavaScript, React (separate with commas)"
                value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills || ''}
                onChange={(e) => {
                  const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
                  setFormData({ ...formData, skills: skillsArray });
                }}
              />
              <p className="text-sm text-gray-500 mt-1">Skills highlighted with '' are preferred key skills</p>
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
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Benefits & Perks
                {selectedTemplate && formData.benefits && (
                  <span className="ml-2 text-xs text-green-600">✨ Pre-filled from template</span>
                )}
              </label>
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
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Job Photos</h3>
              <p className="text-blue-700 mb-4">
                Showcase your workplace, team, or company culture with photos. This helps job seekers get a better sense of your work environment.
              </p>
              
              {!uploadedJobId && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please save your job as a draft first before uploading photos.
                  </AlertDescription>
                </Alert>
              )}

              {uploadedJobId && (
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="photo-upload"
                      disabled={uploadingPhotos}
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center space-y-2">
                        {uploadingPhotos ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        ) : (
                          <Upload className="w-8 h-8 text-gray-400" />
                        )}
                        <div className="text-sm text-gray-600">
                          {uploadingPhotos ? 'Uploading photos...' : 'Click to upload photos or drag and drop'}
                        </div>
                        <div className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB each
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Uploaded Photos */}
                  {jobPhotos.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Uploaded Photos ({jobPhotos.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {jobPhotos.map((photo, index) => {
                          console.log('📸 Rendering photo:', photo);
                          return (
                          <div key={photo.id || photo.photoId} className="relative group">
                            {photo.fileUrl ? (
                              <img
                                src={photo.fileUrl}
                                alt={photo.altText || `Job photo ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                onLoad={() => console.log('✅ Image loaded successfully:', photo.fileUrl)}
                                onError={(e) => {
                                  console.error('❌ Image failed to load:', photo.fileUrl, e);
                                  console.log('🔄 Retrying image load in 1 second...');
                                  setTimeout(() => {
                                    e.currentTarget.src = photo.fileUrl + '?t=' + Date.now();
                                  }, 1000);
                                }}
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                                <div className="text-center">
                                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-xs text-gray-500">No image URL</p>
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handlePhotoDelete(photo.id || photo.photoId)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            {photo.isPrimary && (
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-blue-600 text-white text-xs">Primary</Badge>
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Photo Tips:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Show your office space, team, or work environment</li>
                      <li>• Include photos of company events or team activities</li>
                      <li>• Make sure photos are well-lit and professional</li>
                      <li>• The first photo will be used as the primary showcase image</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Job Preview</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{formData.title || "Job Title"}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">{formData.type || "Full-time"}</Badge>
                    <Badge variant="secondary">{formData.department || "Department"}</Badge>
                    <Badge variant="secondary">{formData.location || "Location"}</Badge>
                  </div>
                </div>
                
                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-gray-900">Role</h5>
                    <p className="text-gray-700 mt-1">{formData.role || "Not provided"}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Industry Type</h5>
                    <div className="text-gray-700 mt-1">
                      {selectedIndustries.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedIndustries.map((industry, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {industry.replace(/\s*\(\d+\)\s*$/, '')}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span>Not provided</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Department</h5>
                    <p className="text-gray-700 mt-1">{formData.department || "Not provided"}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Employment Type</h5>
                    <p className="text-gray-700 mt-1">{formData.employmentType || "Not provided"}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Role Category</h5>
                    <div className="text-gray-700 mt-1">
                      {selectedRoleCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedRoleCategories.map((role, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span>Not provided</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Education</h5>
                    <p className="text-gray-700 mt-1">{formData.education || "Not provided"}</p>
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
                {formData.skills && formData.skills.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-900">Key Skills</h5>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {jobPhotos.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Job Showcase</h5>
                    <div className="flex space-x-2 overflow-x-auto">
                      {jobPhotos.slice(0, 4).map((photo, index) => (
                        <div key={photo.photoId} className="flex-shrink-0">
                          <img
                            src={photo.fileUrl}
                            alt={photo.altText || `Job photo ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      ))}
                      {jobPhotos.length > 4 && (
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500 font-medium">
                            +{jobPhotos.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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

  // Show loading state while checking authentication or loading draft
  if (loading || loadingDraft) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <EmployerNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">
              {loadingDraft ? 'Loading your draft...' : 'Loading...'}
            </p>
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
            <Link href={user?.region === 'gulf' ? '/gulf-dashboard' : '/employer-dashboard'}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
                         <div>
               <h1 className="text-3xl font-bold text-gray-900">
                 {editingJobId ? 'Edit Job' : 'Post a New Job'}
               </h1>
               <p className="text-gray-600">
                 {editingJobId 
                   ? 'Update your job details and save changes' 
                   : 'Create and publish your job posting'
                 }
               </p>
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
                       <Button variant="outline" onClick={goToPreviousStep}>
                         Previous
                       </Button>
                     )}
                   </div>
                   <div className="flex items-center space-x-3">
                     <Button 
                       variant="outline" 
                       onClick={handleSaveDraft}
                       disabled={savingDraft}
                     >
                       <Save className="w-4 h-4 mr-2" />
                       {savingDraft ? 'Saving...' : editingJobId ? 'Save Changes' : 'Save Draft'}
                     </Button>
                     {currentStep < steps.length ? (
                       <Button onClick={goToNextStep} className="bg-blue-600 hover:bg-blue-700">
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
                           {publishing ? 'Publishing...' : editingJobId ? 'Update Job' : 'Publish Job'}
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

      {/* Template Selection Dialog - Enhanced */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Choose Your Job Template</DialogTitle>
            <DialogDescription>
              Select a professional template to quickly create your job posting. All fields will be pre-filled for you to customize.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25 hover:shadow-md'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg mb-2">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{template.description}</p>
                      </div>
                      <div className="ml-4">
                        <Button
                          size="sm"
                          variant={selectedTemplate === template.id ? "default" : "outline"}
                          className={selectedTemplate === template.id ? "bg-blue-600" : ""}
                        >
                          {selectedTemplate === template.id ? "✓ Applied" : "Use Template"}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="outline" className="text-xs bg-gray-100">
                        {template.category}
                      </Badge>
                      {template.createdBy === user?.id ? (
                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                          👤 My Template
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                          👥 Shared
                        </Badge>
                      )}
                      {template.isPublic && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
                          🌐 Public
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                        📊 {template.usageCount} uses
                      </Badge>
                    </div>
                    
                    {/* Template Preview */}
                    <div className="mt-auto bg-white rounded-lg p-3 border border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">Template Preview:</div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {template.templateData?.title || 'Job Title'}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {template.templateData?.location || 'Location'} • {template.templateData?.type || 'Job Type'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {template.templateData?.experience || 'Experience Level'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {templates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Available</h3>
                <p className="text-gray-600 mb-4">Create your first template to get started with quick job posting.</p>
                <Button onClick={() => {
                  setShowTemplateDialog(false);
                  // Navigate to template creation
                  window.open('/employer-dashboard/job-templates', '_blank');
                }}>
                  Create Template
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              💡 Tip: You can customize all fields after applying a template. Only template creators can edit or change privacy settings.
            </div>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Job Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {editingJobId ? 'Job Updated Successfully!' : 'Job Posted Successfully!'}
            </DialogTitle>
            <DialogDescription>
              {editingJobId 
                ? 'Your job has been updated successfully. You can view it, manage it, or make further changes.'
                : 'Your job has been posted and is now live. You can view it, manage it, or post another job.'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(user?.region === 'gulf' ? '/gulf-dashboard/manage-jobs' : '/employer-dashboard/manage-jobs')}>
              Manage Jobs
            </Button>
            {postedJobId && (
              <Button onClick={() => router.push(`/jobs/${postedJobId}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Job
              </Button>
            )}
            <Button onClick={() => {
              setShowSuccessDialog(false)
              setPostedJobId(null)
            }}>
              {editingJobId ? 'Continue Editing' : 'Post Another Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Industry Dropdown */}
      {showIndustryDropdown && (
        <IndustryDropdown
          selectedIndustries={selectedIndustries}
          onIndustryChange={(industries) => {
            setSelectedIndustries(industries)
            setFormData({ ...formData, industryType: industries.join(', ') })
          }}
          onClose={() => setShowIndustryDropdown(false)}
          hideSelectAllButtons={true}
        />
      )}

      {/* Role Category Dropdown */}
      {showRoleCategoryDropdown && (
        <RoleCategoryDropdown
          selectedRoles={selectedRoleCategories}
          onRoleChange={(roles) => {
            setSelectedRoleCategories(roles)
            setFormData({ ...formData, roleCategory: roles.join(', ') })
          }}
          onClose={() => setShowRoleCategoryDropdown(false)}
          hideSelectAllButtons={true}
        />
      )}
    </div>
  )
}
