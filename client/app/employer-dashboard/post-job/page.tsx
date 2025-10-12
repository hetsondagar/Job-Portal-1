"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Eye, Send, AlertCircle, Camera, Upload, X, Image as ImageIcon, CheckCircle, ChevronDown, TrendingUp, Zap, Star, Plus, Mail, ExternalLink, Building2, Video } from "lucide-react"
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
    companyName: "", // NEW: Company name field
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
    education: [] as string[],
    employmentType: "",
    // NEW: Consultancy fields
    postingType: "company" as "company" | "consultancy",
    consultancyName: "",
    hiringCompanyName: "",
    hiringCompanyIndustry: "",
    hiringCompanyDescription: "",
    showHiringCompanyDetails: false,
    // Hot Vacancy Premium Features
    isHotVacancy: false,
    urgentHiring: false,
    multipleEmailIds: [] as string[],
    boostedSearch: false,
    searchBoostLevel: "standard",
    citySpecificBoost: [] as string[],
    videoBanner: "",
    whyWorkWithUs: "",
    companyReviews: [] as string[],
    autoRefresh: false,
    refreshDiscount: 0,
    attachmentFiles: [] as string[],
    officeImages: [] as string[],
    companyProfile: "",
    proactiveAlerts: false,
    alertRadius: 50,
    alertFrequency: "immediate",
    featuredKeywords: [] as string[],
    customBranding: {},
    superFeatured: false,
    tierLevel: "basic",
    externalApplyUrl: "",
    hotVacancyPrice: 0,
    hotVacancyCurrency: "INR",
    hotVacancyPaymentStatus: "pending",
    // CRITICAL PREMIUM HOT VACANCY FEATURES (from hot_vacancies table)
    urgencyLevel: "high",
    hiringTimeline: "immediate",
    maxApplications: 50,
    applicationDeadline: "",
    pricingTier: "premium",
    price: 0,
    currency: "INR",
    paymentId: "",
    paymentDate: "",
    priorityListing: false,
    featuredBadge: false,
    unlimitedApplications: false,
    advancedAnalytics: false,
    candidateMatching: false,
    directContact: false,
    seoTitle: "",
    seoDescription: "",
    keywords: [] as string[],
    impressions: 0,
    clicks: 0
  })
  const [jobPhotos, setJobPhotos] = useState<any[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [uploadedJobId, setUploadedJobId] = useState<string | null>(null)
  const [brandingMedia, setBrandingMedia] = useState<{type: 'video' | 'photo', file: File, preview: string}[]>([])
  const [uploadingBranding, setUploadingBranding] = useState(false)
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
  const [selectedEducation, setSelectedEducation] = useState<string[]>([])
  const [currentEmail, setCurrentEmail] = useState("")
  
  // ========== AGENCY CLIENT SELECTION STATE ==========
  const [isAgency, setIsAgency] = useState(false)
  const [activeClients, setActiveClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('') // 'own' or client ID
  const [loadingClients, setLoadingClients] = useState(false)
  const [clientSelectionMade, setClientSelectionMade] = useState(false)

  // Dynamic steps based on whether it's a hot vacancy or not
  const allSteps = [
    { id: 1, title: "Basic Info", description: "Basic job information" },
    { id: 2, title: "Job Details", description: "Role, industry, and requirements" },
    { id: 3, title: "Benefits & Perks", description: "What you offer" },
    { id: 4, title: "Hot Vacancy Features", description: "Premium features and options", hotVacancyOnly: true },
    { id: 5, title: "Photos", description: "Showcase your workplace" },
    { id: 6, title: "Review & Post", description: "Final review" },
  ]
  
  // Filter steps based on hot vacancy mode
  const steps = formData.isHotVacancy 
    ? allSteps 
    : allSteps.filter(step => !step.hotVacancyOnly).map((step, index) => ({
        ...step,
        id: index + 1 // Renumber steps when Step 4 is excluded
      }))

  // ========== LOAD AGENCY CLIENTS ==========
  useEffect(() => {
    const checkAgencyAndLoadClients = async () => {
      if (user && user.companyId) {
        try {
          // Check if user's company is an agency
          const companyResponse = await apiService.getCompany(user.companyId)
          if (companyResponse.success && companyResponse.data) {
            const companyAccountType = companyResponse.data.companyAccountType || 'direct'
            const isAgencyAccount = companyAccountType === 'recruiting_agency' || companyAccountType === 'consulting_firm'
            setIsAgency(isAgencyAccount)
            
            if (isAgencyAccount) {
              // Load active clients
              setLoadingClients(true)
              const clientsResponse = await apiService.getActiveClients()
              if (clientsResponse.success) {
                setActiveClients(clientsResponse.data || [])
              }
              setLoadingClients(false)
            } else {
              // Direct employer - auto-select "own company"
              setSelectedClient('own')
              setClientSelectionMade(true)
            }
          }
        } catch (error) {
          console.error('Error checking agency status:', error)
        }
      }
    }

    checkAgencyAndLoadClients()
  }, [user])

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
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('draft') || urlParams.get('job');
    const hotVacancyParam = urlParams.get('hotVacancy');
    
    const loadJobData = async () => {
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
            
            // Sync selectedEducation state
            const educationArray = Array.isArray(jobData.education) ? jobData.education : (jobData.education ? [jobData.education] : [])
            setSelectedEducation(educationArray)
            
            // Sync selectedIndustries state
            const industryArray = jobData.industryType ? jobData.industryType.split(', ').filter((i: string) => i.trim()) : []
            setSelectedIndustries(industryArray)
            
            // Extract metadata for consultancy fields
            const metadata = jobData.metadata || {};
            
            setFormData((prev) => ({
              ...prev,
              title: jobData.title || '',
              // Consultancy fields from metadata
              companyName: metadata.companyName || '',
              postingType: metadata.postingType || 'company',
              consultancyName: metadata.consultancyName || '',
              hiringCompanyName: metadata.hiringCompany?.name || '',
              hiringCompanyIndustry: metadata.hiringCompany?.industry || '',
              hiringCompanyDescription: metadata.hiringCompany?.description || '',
              showHiringCompanyDetails: metadata.showHiringCompanyDetails || false,
              department: jobData.department || '',
              location: jobData.location || '',
              type: jobData.jobType || jobData.type || '',
              experience: jobData.experienceLevel || jobData.experience || '',
              salary: jobData.salary || '',
              description: jobData.description || '',
              requirements: jobData.requirements || '',
              benefits: jobData.benefits || '',
              skills: jobData.skills || [],
              role: jobData.role || '',
              industryType: jobData.industryType || '',
              roleCategory: jobData.roleCategory || '',
              education: Array.isArray(jobData.education) ? jobData.education : (jobData.education ? [jobData.education] : []),
              employmentType: jobData.employmentType || '',
              // Hot Vacancy Premium Features
              isHotVacancy: jobData.isHotVacancy || false,
              urgentHiring: jobData.urgentHiring || false,
              multipleEmailIds: jobData.multipleEmailIds || [],
              boostedSearch: jobData.boostedSearch || false,
              searchBoostLevel: jobData.searchBoostLevel || "standard",
              citySpecificBoost: jobData.citySpecificBoost || [],
              videoBanner: jobData.videoBanner || "",
              whyWorkWithUs: jobData.whyWorkWithUs || "",
              companyReviews: jobData.companyReviews || [],
              autoRefresh: jobData.autoRefresh || false,
              refreshDiscount: jobData.refreshDiscount || 0,
              attachmentFiles: jobData.attachmentFiles || [],
              officeImages: jobData.officeImages || [],
              companyProfile: jobData.companyProfile || "",
              proactiveAlerts: jobData.proactiveAlerts || false,
              alertRadius: jobData.alertRadius || 50,
              alertFrequency: jobData.alertFrequency || "immediate",
              featuredKeywords: jobData.featuredKeywords || [],
              customBranding: jobData.customBranding || {},
              superFeatured: jobData.superFeatured || false,
              tierLevel: jobData.tierLevel || "basic",
              externalApplyUrl: jobData.externalApplyUrl || "",
              hotVacancyPrice: jobData.hotVacancyPrice || jobData.price || 0,
              hotVacancyCurrency: jobData.hotVacancyCurrency || jobData.currency || "INR",
              hotVacancyPaymentStatus: jobData.hotVacancyPaymentStatus || "pending",
              // CRITICAL PREMIUM HOT VACANCY FEATURES
              urgencyLevel: jobData.urgencyLevel || "high",
              hiringTimeline: jobData.hiringTimeline || "immediate",
              maxApplications: jobData.maxApplications || 50,
              applicationDeadline: jobData.applicationDeadline || "",
              pricingTier: jobData.pricingTier || "premium",
              price: jobData.price || jobData.hotVacancyPrice || 0,
              currency: jobData.currency || jobData.hotVacancyCurrency || "INR",
              paymentId: jobData.paymentId || "",
              paymentDate: jobData.paymentDate || "",
              priorityListing: jobData.priorityListing || false,
              featuredBadge: jobData.featuredBadge || false,
              unlimitedApplications: jobData.unlimitedApplications || false,
              advancedAnalytics: jobData.advancedAnalytics || false,
              candidateMatching: jobData.candidateMatching || false,
              directContact: jobData.directContact || false,
              seoTitle: jobData.seoTitle || "",
              seoDescription: jobData.seoDescription || "",
              keywords: jobData.keywords || [],
              impressions: jobData.impressions || 0,
              clicks: jobData.clicks || 0
            }));
            
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
          setFormData((prev) => ({
            ...prev,
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
            education: Array.isArray(templateData.education) ? templateData.education : (templateData.education ? [templateData.education] : []),
            employmentType: templateData.employmentType || '',
            // Hot Vacancy Premium Features
            isHotVacancy: templateData.isHotVacancy || false,
            urgentHiring: templateData.urgentHiring || false,
            multipleEmailIds: templateData.multipleEmailIds || [],
            boostedSearch: templateData.boostedSearch || false,
            searchBoostLevel: templateData.searchBoostLevel || "standard",
            citySpecificBoost: templateData.citySpecificBoost || [],
            videoBanner: templateData.videoBanner || "",
            whyWorkWithUs: templateData.whyWorkWithUs || "",
            companyReviews: templateData.companyReviews || [],
            autoRefresh: templateData.autoRefresh || false,
            refreshDiscount: templateData.refreshDiscount || 0,
            attachmentFiles: templateData.attachmentFiles || [],
            officeImages: templateData.officeImages || [],
            companyProfile: templateData.companyProfile || "",
            proactiveAlerts: templateData.proactiveAlerts || false,
            alertRadius: templateData.alertRadius || 50,
            alertFrequency: templateData.alertFrequency || "immediate",
            featuredKeywords: templateData.featuredKeywords || [],
            customBranding: templateData.customBranding || {},
            superFeatured: templateData.superFeatured || false,
            tierLevel: templateData.tierLevel || "basic",
            externalApplyUrl: templateData.externalApplyUrl || "",
            hotVacancyPrice: templateData.hotVacancyPrice || 0,
            hotVacancyCurrency: templateData.hotVacancyCurrency || "INR",
            hotVacancyPaymentStatus: templateData.hotVacancyPaymentStatus || "pending",
            // CRITICAL PREMIUM HOT VACANCY FEATURES
            urgencyLevel: templateData.urgencyLevel || "high",
            hiringTimeline: templateData.hiringTimeline || "immediate",
            maxApplications: templateData.maxApplications || 50,
            applicationDeadline: templateData.applicationDeadline || "",
            pricingTier: templateData.pricingTier || "premium",
            price: templateData.price || templateData.hotVacancyPrice || 0,
            currency: templateData.currency || templateData.hotVacancyCurrency || "INR",
            paymentId: templateData.paymentId || "",
            paymentDate: templateData.paymentDate || "",
            priorityListing: templateData.priorityListing || false,
            featuredBadge: templateData.featuredBadge || false,
            unlimitedApplications: templateData.unlimitedApplications || false,
            advancedAnalytics: templateData.advancedAnalytics || false,
            candidateMatching: templateData.candidateMatching || false,
            directContact: templateData.directContact || false,
            seoTitle: templateData.seoTitle || "",
            seoDescription: templateData.seoDescription || "",
            keywords: templateData.keywords || [],
            impressions: templateData.impressions || 0,
            clicks: templateData.clicks || 0
          }));
          
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
      
      // Check if hot vacancy mode should be enabled
      if (hotVacancyParam === 'true' && !jobId) {
        console.log('🔥 Hot Vacancy mode enabled from URL parameter');
        setFormData(prev => ({
          ...prev,
          isHotVacancy: true,
          urgentHiring: true,
          boostedSearch: true
        }));
        // Keep user at Step 1 to fill basic info first
        // Step 4 will be automatically accessible in the stepper
        setCurrentStep(1);
        toast.info('🔥 Hot Vacancy mode enabled! Fill basic info and configure premium features in Step 4.');
      }
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
        
        // Check if we're in hot vacancy mode from URL
        const urlParams = new URLSearchParams(window.location.search);
        const hotVacancyParam = urlParams.get('hotVacancy');
        const isHotVacancyMode = hotVacancyParam === 'true' || formData.isHotVacancy;
        
        console.log('🔥 Hot vacancy mode:', isHotVacancyMode);
        
        // Sync selectedEducation state
        const educationArray = Array.isArray(template.templateData.education) ? template.templateData.education : (template.templateData.education ? [template.templateData.education] : [])
        setSelectedEducation(educationArray)
        
        const newFormData = {
          title: template.templateData.title || '',
          companyName: template.templateData.companyName || '',
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
          education: Array.isArray(template.templateData.education) ? template.templateData.education : (template.templateData.education ? [template.templateData.education] : []),
          employmentType: template.templateData.employmentType || '',
          // Consultancy fields
          postingType: template.templateData.postingType || 'company',
          consultancyName: template.templateData.consultancyName || '',
          hiringCompanyName: template.templateData.hiringCompanyName || '',
          hiringCompanyIndustry: template.templateData.hiringCompanyIndustry || '',
          hiringCompanyDescription: template.templateData.hiringCompanyDescription || '',
          showHiringCompanyDetails: template.templateData.showHiringCompanyDetails || false,
          // Hot Vacancy Premium Features - PRESERVE hot vacancy mode from URL or current state
          isHotVacancy: isHotVacancyMode,
          urgentHiring: template.templateData.urgentHiring || (isHotVacancyMode ? true : false),
          multipleEmailIds: template.templateData.multipleEmailIds || [],
          boostedSearch: template.templateData.boostedSearch || (isHotVacancyMode ? true : false),
          searchBoostLevel: template.templateData.searchBoostLevel || "standard",
          citySpecificBoost: template.templateData.citySpecificBoost || [],
          videoBanner: template.templateData.videoBanner || "",
          whyWorkWithUs: template.templateData.whyWorkWithUs || "",
          companyReviews: template.templateData.companyReviews || [],
          autoRefresh: template.templateData.autoRefresh || false,
          refreshDiscount: template.templateData.refreshDiscount || 0,
          attachmentFiles: template.templateData.attachmentFiles || [],
          officeImages: template.templateData.officeImages || [],
          companyProfile: template.templateData.companyProfile || "",
          proactiveAlerts: template.templateData.proactiveAlerts || false,
          alertRadius: template.templateData.alertRadius || 50,
          alertFrequency: template.templateData.alertFrequency || "immediate",
          featuredKeywords: template.templateData.featuredKeywords || [],
          customBranding: template.templateData.customBranding || {},
          superFeatured: template.templateData.superFeatured || false,
          tierLevel: template.templateData.tierLevel || "basic",
          externalApplyUrl: template.templateData.externalApplyUrl || "",
          hotVacancyPrice: template.templateData.hotVacancyPrice || 0,
          hotVacancyCurrency: template.templateData.hotVacancyCurrency || "INR",
          hotVacancyPaymentStatus: template.templateData.hotVacancyPaymentStatus || "pending",
          // CRITICAL PREMIUM HOT VACANCY FEATURES
          urgencyLevel: template.templateData.urgencyLevel || "high",
          hiringTimeline: template.templateData.hiringTimeline || "immediate",
          maxApplications: template.templateData.maxApplications || 50,
          applicationDeadline: template.templateData.applicationDeadline || "",
          pricingTier: template.templateData.pricingTier || "premium",
          price: template.templateData.price || template.templateData.hotVacancyPrice || 0,
          currency: template.templateData.currency || template.templateData.hotVacancyCurrency || "INR",
          paymentId: template.templateData.paymentId || "",
          paymentDate: template.templateData.paymentDate || "",
          priorityListing: template.templateData.priorityListing || false,
          featuredBadge: template.templateData.featuredBadge || false,
          unlimitedApplications: template.templateData.unlimitedApplications || false,
          advancedAnalytics: template.templateData.advancedAnalytics || false,
          candidateMatching: template.templateData.candidateMatching || false,
          directContact: template.templateData.directContact || false,
          seoTitle: template.templateData.seoTitle || "",
          seoDescription: template.templateData.seoDescription || "",
          keywords: template.templateData.keywords || [],
          impressions: template.templateData.impressions || 0,
          clicks: template.templateData.clicks || 0
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
        role: formData.role || '',
        industryType: formData.industryType || '',
        roleCategory: formData.roleCategory || '',
        education: Array.isArray(formData.education) ? formData.education.join(', ') : formData.education || '',
        employmentType: formData.employmentType || '',
        status: editingJobId ? undefined : 'draft', // Only set to draft for new jobs, preserve existing status for edits
        // ========== CONSULTANCY POSTING FIELDS ==========
        companyName: formData.companyName || '',
        postingType: formData.postingType || 'company',
        ...(formData.postingType === 'consultancy' && {
          consultancyName: formData.consultancyName,
          hiringCompanyName: formData.hiringCompanyName,
          hiringCompanyIndustry: formData.hiringCompanyIndustry,
          hiringCompanyDescription: formData.hiringCompanyDescription,
          showHiringCompanyDetails: formData.showHiringCompanyDetails
        }),
        // Include hot vacancy fields if it's a hot vacancy
        ...(formData.isHotVacancy && {
          isHotVacancy: formData.isHotVacancy,
          urgencyLevel: formData.urgencyLevel,
          hiringTimeline: formData.hiringTimeline,
          maxApplications: formData.maxApplications,
          applicationDeadline: formData.applicationDeadline,
          pricingTier: formData.pricingTier,
          price: formData.price || formData.hotVacancyPrice,
          currency: formData.currency || formData.hotVacancyCurrency,
          priorityListing: formData.priorityListing,
          featuredBadge: formData.featuredBadge,
          unlimitedApplications: formData.unlimitedApplications,
          advancedAnalytics: formData.advancedAnalytics,
          candidateMatching: formData.candidateMatching,
          directContact: formData.directContact,
          seoTitle: formData.seoTitle,
          seoDescription: formData.seoDescription,
          keywords: formData.keywords,
          urgentHiring: formData.urgentHiring,
          multipleEmailIds: formData.multipleEmailIds,
          boostedSearch: formData.boostedSearch,
          searchBoostLevel: formData.searchBoostLevel,
          citySpecificBoost: formData.citySpecificBoost,
          videoBanner: formData.videoBanner,
          whyWorkWithUs: formData.whyWorkWithUs,
          companyProfile: formData.companyProfile,
          proactiveAlerts: formData.proactiveAlerts,
          superFeatured: formData.superFeatured,
          tierLevel: formData.tierLevel
        })
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
    
    // Validate posting type specific fields
    if (formData.postingType === 'consultancy') {
      if (!formData.consultancyName || formData.consultancyName.trim() === '') {
        validationErrors.push('Consultancy name is required')
      }
      if (!formData.hiringCompanyName || formData.hiringCompanyName.trim() === '') {
        validationErrors.push('Hiring company name is required')
      }
      if (!formData.hiringCompanyIndustry || formData.hiringCompanyIndustry.trim() === '') {
        validationErrors.push('Hiring company industry is required')
      }
      if (!formData.hiringCompanyDescription || formData.hiringCompanyDescription.trim() === '') {
        validationErrors.push('Hiring company description is required')
      }
    } else {
      if (!formData.companyName || formData.companyName.trim() === '') {
        validationErrors.push('Company name is required')
      }
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
        role: formData.role,
        industryType: formData.industryType,
        roleCategory: formData.roleCategory,
        education: Array.isArray(formData.education) ? formData.education.join(', ') : formData.education,
        employmentType: formData.employmentType,
        status: 'active', // Explicitly set status to active for publishing
        // ========== CONSULTANCY POSTING FIELDS ==========
        companyName: formData.companyName,
        postingType: formData.postingType,
        ...(formData.postingType === 'consultancy' && {
          consultancyName: formData.consultancyName,
          hiringCompanyName: formData.hiringCompanyName,
          hiringCompanyIndustry: formData.hiringCompanyIndustry,
          hiringCompanyDescription: formData.hiringCompanyDescription,
          showHiringCompanyDetails: formData.showHiringCompanyDetails
        }),
        // ========== AGENCY POSTING FIELDS ==========
        ...(isAgency && selectedClient !== 'own' && {
          isAgencyPosted: true,
          hiringCompanyId: selectedClient,
          postedByAgencyId: user.companyId
        }),
        // Include hot vacancy fields if enabled
        ...(formData.isHotVacancy && {
          isHotVacancy: true,
          urgencyLevel: formData.urgencyLevel,
          hiringTimeline: formData.hiringTimeline,
          maxApplications: formData.maxApplications,
          applicationDeadline: formData.applicationDeadline,
          pricingTier: formData.pricingTier,
          hotVacancyPrice: formData.price || formData.hotVacancyPrice,
          hotVacancyCurrency: formData.currency || formData.hotVacancyCurrency,
          priorityListing: formData.priorityListing,
          featuredBadge: formData.featuredBadge,
          unlimitedApplications: formData.unlimitedApplications,
          advancedAnalytics: formData.advancedAnalytics,
          candidateMatching: formData.candidateMatching,
          directContact: formData.directContact,
          urgentHiring: formData.urgentHiring,
          multipleEmailIds: formData.multipleEmailIds,
          boostedSearch: formData.boostedSearch,
          searchBoostLevel: formData.searchBoostLevel,
          citySpecificBoost: formData.citySpecificBoost,
          videoBanner: formData.videoBanner,
          whyWorkWithUs: formData.whyWorkWithUs,
          companyProfile: formData.companyProfile,
          proactiveAlerts: formData.proactiveAlerts,
          superFeatured: formData.superFeatured,
          tierLevel: formData.tierLevel,
          externalApplyUrl: formData.externalApplyUrl
        })
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
            companyName: "",
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
             education: [],
             employmentType: "",
            // Consultancy fields
            postingType: "company",
            consultancyName: "",
            hiringCompanyName: "",
            hiringCompanyIndustry: "",
            hiringCompanyDescription: "",
            showHiringCompanyDetails: false,
             // Hot Vacancy Premium Features
             isHotVacancy: false,
             urgentHiring: false,
             multipleEmailIds: [],
             boostedSearch: false,
             searchBoostLevel: "standard",
             citySpecificBoost: [],
             videoBanner: "",
             whyWorkWithUs: "",
             companyReviews: [],
             autoRefresh: false,
             refreshDiscount: 0,
             attachmentFiles: [],
             officeImages: [],
             companyProfile: "",
             proactiveAlerts: false,
             alertRadius: 50,
             alertFrequency: "immediate",
             featuredKeywords: [],
             customBranding: {},
             superFeatured: false,
             tierLevel: "basic",
             externalApplyUrl: "",
             hotVacancyPrice: 0,
             hotVacancyCurrency: "INR",
            hotVacancyPaymentStatus: "pending",
            // CRITICAL PREMIUM HOT VACANCY FEATURES
            urgencyLevel: "high",
            hiringTimeline: "immediate",
            maxApplications: 50,
            applicationDeadline: "",
            pricingTier: "premium",
            price: 0,
            currency: "INR",
            paymentId: "",
            paymentDate: "",
            priorityListing: false,
            featuredBadge: false,
            unlimitedApplications: false,
            advancedAnalytics: false,
            candidateMatching: false,
            directContact: false,
            seoTitle: "",
            seoDescription: "",
            keywords: [],
            impressions: 0,
            clicks: 0
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

  // Branding Media Handlers
  const handleBrandingMediaAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const currentCount = brandingMedia.length
    const MAX_ITEMS = 5
    const remainingSlots = MAX_ITEMS - currentCount

    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_ITEMS} items allowed (photos + video combined)`)
      return
    }

    const newFiles = Array.from(files).slice(0, remainingSlots)
    const newMedia: {type: 'video' | 'photo', file: File, preview: string}[] = []

    newFiles.forEach(file => {
      // Check file type
      const isVideo = file.type.startsWith('video/')
      const isPhoto = file.type.startsWith('image/')

      if (!isVideo && !isPhoto) {
        toast.error(`${file.name}: Only images and videos are allowed`)
        return
      }

      // Check file size (videos: 50MB, photos: 5MB)
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large. Max ${isVideo ? '50MB for videos' : '5MB for photos'}`)
        return
      }

      // Create preview
      const preview = URL.createObjectURL(file)
      newMedia.push({
        type: isVideo ? 'video' : 'photo',
        file,
        preview
      })
    })

    setBrandingMedia(prev => [...prev, ...newMedia])
    
    if (newMedia.length > 0) {
      toast.success(`Added ${newMedia.length} item(s). ${MAX_ITEMS - currentCount - newMedia.length} slots remaining`)
    }

    // Reset input
    event.target.value = ''
  }

  const handleBrandingMediaRemove = (index: number) => {
    setBrandingMedia(prev => {
      const updated = prev.filter((_, i) => i !== index)
      // Clean up object URL
      URL.revokeObjectURL(prev[index].preview)
      return updated
    })
    toast.info('Item removed')
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
    // Map current step to actual content based on hot vacancy mode
    const getActualStep = () => {
      if (!formData.isHotVacancy && currentStep >= 4) {
        // When not hot vacancy, skip step 4, so step 4 becomes photos (5), step 5 becomes review (6)
        return currentStep + 1
      }
      return currentStep
    }
    
    const actualStep = getActualStep()
    
    switch (actualStep) {
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
                          companyName: "",
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
                          education: [],
                          employmentType: "",
                          // Consultancy fields
                          postingType: "company",
                          consultancyName: "",
                          hiringCompanyName: "",
                          hiringCompanyIndustry: "",
                          hiringCompanyDescription: "",
                          showHiringCompanyDetails: false,
                          // Hot Vacancy Premium Features
                          isHotVacancy: false,
                          urgentHiring: false,
                          multipleEmailIds: [],
                          boostedSearch: false,
                          searchBoostLevel: "standard",
                          citySpecificBoost: [],
                          videoBanner: "",
                          whyWorkWithUs: "",
                          companyReviews: [],
                          autoRefresh: false,
                          refreshDiscount: 0,
                          attachmentFiles: [],
                          officeImages: [],
                          companyProfile: "",
                          proactiveAlerts: false,
                          alertRadius: 50,
                          alertFrequency: "immediate",
                          featuredKeywords: [],
                          customBranding: {},
                          superFeatured: false,
                          tierLevel: "basic",
                          externalApplyUrl: "",
                          hotVacancyPrice: 0,
                          hotVacancyCurrency: "INR",
                        hotVacancyPaymentStatus: "pending",
                        // CRITICAL PREMIUM HOT VACANCY FEATURES
                        urgencyLevel: "high",
                        hiringTimeline: "immediate",
                        maxApplications: 50,
                        applicationDeadline: "",
                        pricingTier: "premium",
                        price: 0,
                        currency: "INR",
                        paymentId: "",
                        paymentDate: "",
                        priorityListing: false,
                        featuredBadge: false,
                        unlimitedApplications: false,
                        advancedAnalytics: false,
                        candidateMatching: false,
                        directContact: false,
                        seoTitle: "",
                        seoDescription: "",
                        keywords: [],
                        impressions: 0,
                        clicks: 0
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
            
            {/* Posting Type Selection */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                You are posting for*
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, postingType: "company" })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.postingType === "company"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Building2 className={`w-6 h-6 mx-auto mb-2 ${formData.postingType === "company" ? "text-blue-600" : "text-gray-400"}`} />
                  <div className="font-medium text-sm">Your Company/Business</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, postingType: "consultancy" })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.postingType === "consultancy"
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <ExternalLink className={`w-6 h-6 mx-auto mb-2 ${formData.postingType === "consultancy" ? "text-purple-600" : "text-gray-400"}`} />
                  <div className="font-medium text-sm">Consultancy</div>
                </button>
              </div>
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
              
              {/* Company Name or Consultancy Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {formData.postingType === "consultancy" ? "Consultancy Name*" : "Company Name*"}
                </label>
                <Input
                  placeholder={formData.postingType === "consultancy" ? "e.g. ABC Consultants" : "e.g. Tech Solutions Pvt Ltd"}
                  value={formData.postingType === "consultancy" ? formData.consultancyName : formData.companyName}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    [formData.postingType === "consultancy" ? "consultancyName" : "companyName"]: e.target.value 
                  })}
                />
              </div>

              {/* Consultancy Hiring Company Fields */}
              {formData.postingType === "consultancy" && (
                <>
                  <div className="md:col-span-2 mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-purple-900 mb-4">Company You're Hiring For</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Company Name*</label>
                        <Input
                          placeholder="e.g. Client Company Pvt Ltd"
                          value={formData.hiringCompanyName}
                          onChange={(e) => setFormData({ ...formData, hiringCompanyName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Industry*</label>
                <Button
                          type="button"
                  variant="outline"
                  className="w-full justify-between"
                          onClick={() => setShowIndustryDropdown(true)}
                >
                          {formData.hiringCompanyIndustry || "Select industry"}
                  <ChevronDown className="w-4 h-4" />
                </Button>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">Company Description*</label>
                        <Textarea
                          placeholder="Brief description about the company you're hiring for..."
                          className="min-h-20"
                          value={formData.hiringCompanyDescription}
                          onChange={(e) => setFormData({ ...formData, hiringCompanyDescription: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showHiringCompanyDetails"
                            checked={formData.showHiringCompanyDetails}
                            onCheckedChange={(checked) => setFormData({ ...formData, showHiringCompanyDetails: checked as boolean })}
                          />
                          <label htmlFor="showHiringCompanyDetails" className="text-sm text-gray-700">
                            Show company details to candidates (if unchecked, only consultancy name will be shown)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Industry Type - Moved from Step 2 */}
              {formData.postingType !== "consultancy" && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Industry Type*</label>
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
              )}
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

            {/* Department - Moved from Step 1 */}
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

            {/* Industry Type field removed - now in Step 1 */}

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
                Education* (Select Multiple)
              </label>
              <div className="space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    'Any Graduate',
                    'B.Tech/B.E.',
                    'B.Sc',
                    'B.Com',
                    'BBA',
                    'BCA',
                    'M.Tech/M.E.',
                    'M.Sc',
                    'MBA',
                    'MCA',
                    'M.Com',
                    'Ph.D',
                    'Diploma',
                    '12th Pass',
                    '10th Pass'
                  ].map((edu) => (
                    <div
                      key={edu}
                      onClick={() => {
                        const isSelected = selectedEducation.includes(edu)
                        const updated = isSelected
                          ? selectedEducation.filter(e => e !== edu)
                          : [...selectedEducation, edu]
                        setSelectedEducation(updated)
                        setFormData({ ...formData, education: updated })
                      }}
                      className={`px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedEducation.includes(edu)
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedEducation.includes(edu)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedEducation.includes(edu) && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm">{edu}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedEducation.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium text-blue-900">Selected ({selectedEducation.length}):</span>
                    {selectedEducation.map((edu) => (
                      <Badge key={edu} variant="secondary" className="bg-blue-100 text-blue-800">
                        {edu}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            const updated = selectedEducation.filter(e => e !== edu)
                            setSelectedEducation(updated)
                            setFormData({ ...formData, education: updated })
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
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
            
            {/* Hot Vacancy Toggle */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6 mt-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="enableHotVacancy"
                  checked={formData.isHotVacancy}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, isHotVacancy: checked as boolean })
                    if (checked) {
                      toast.success('Hot Vacancy mode enabled! Premium features will be available in the next step.')
                    } else {
                      toast.info('Hot Vacancy mode disabled. Premium features step will be skipped.')
                    }
                  }}
                />
                <div className="flex-1">
                  <label htmlFor="enableHotVacancy" className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                    🔥 Make this a Hot Vacancy (Premium Job Posting)
                    <Badge variant="destructive" className="text-xs">Premium</Badge>
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Get premium visibility, boosted search rankings, and advanced features to attract top talent faster. 
                    Unlock features like urgent hiring badges, city-specific boosts, multiple contact emails, and more.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  🔥 Hot Vacancy Premium Features
                </h3>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Premium
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Make your job posting stand out with premium features for maximum visibility and faster hiring.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isHotVacancy"
                    checked={formData.isHotVacancy}
                    onCheckedChange={(checked) => setFormData({ ...formData, isHotVacancy: checked as boolean })}
                  />
                  <label htmlFor="isHotVacancy" className="text-sm font-medium">
                    Make this a Hot Vacancy (Premium Job Posting)
                  </label>
                </div>
                
                {formData.isHotVacancy && (
                  <div className="ml-6 space-y-6 border-l-2 border-red-200 pl-4">
                    {/* Urgency & Timeline Settings */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4">⏰ Urgency & Timeline</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Urgency Level
                          </label>
                          <Select 
                            value={formData.urgencyLevel} 
                            onValueChange={(value) => setFormData({ ...formData, urgencyLevel: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select urgency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">🟡 High - Fill within 2 weeks</SelectItem>
                              <SelectItem value="critical">🟠 Critical - Fill within 1 week</SelectItem>
                              <SelectItem value="immediate">🔴 Immediate - Fill within 2-3 days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Hiring Timeline
                          </label>
                          <Select 
                            value={formData.hiringTimeline} 
                            onValueChange={(value) => setFormData({ ...formData, hiringTimeline: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Immediate (1-3 days)</SelectItem>
                              <SelectItem value="1-week">Within 1 Week</SelectItem>
                              <SelectItem value="2-weeks">Within 2 Weeks</SelectItem>
                              <SelectItem value="1-month">Within 1 Month</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Premium Paid Features */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-4">💎 Premium Paid Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="priorityListing"
                            checked={formData.priorityListing}
                            onCheckedChange={(checked) => setFormData({ ...formData, priorityListing: checked as boolean })}
                          />
                          <label htmlFor="priorityListing" className="text-sm font-medium flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            Priority Listing (Top Placement)
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="featuredBadge"
                            checked={formData.featuredBadge}
                            onCheckedChange={(checked) => setFormData({ ...formData, featuredBadge: checked as boolean })}
                          />
                          <label htmlFor="featuredBadge" className="text-sm font-medium flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            Featured Badge
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="advancedAnalytics"
                            checked={formData.advancedAnalytics}
                            onCheckedChange={(checked) => setFormData({ ...formData, advancedAnalytics: checked as boolean })}
                          />
                          <label htmlFor="advancedAnalytics" className="text-sm font-medium flex items-center gap-1">
                            📊 Advanced Analytics
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="candidateMatching"
                            checked={formData.candidateMatching}
                            onCheckedChange={(checked) => setFormData({ ...formData, candidateMatching: checked as boolean })}
                          />
                          <label htmlFor="candidateMatching" className="text-sm font-medium flex items-center gap-1">
                            🤖 AI Candidate Matching
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="directContact"
                            checked={formData.directContact}
                            onCheckedChange={(checked) => setFormData({ ...formData, directContact: checked as boolean })}
                          />
                          <label htmlFor="directContact" className="text-sm font-medium flex items-center gap-1">
                            📞 Direct Contact Access
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="unlimitedApplications"
                            checked={formData.unlimitedApplications}
                            onCheckedChange={(checked) => setFormData({ ...formData, unlimitedApplications: checked as boolean })}
                          />
                          <label htmlFor="unlimitedApplications" className="text-sm font-medium flex items-center gap-1">
                            ∞ Unlimited Applications
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Basic Premium Features */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4">🚀 Visibility Boosters</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="urgentHiring"
                          checked={formData.urgentHiring}
                          onCheckedChange={(checked) => setFormData({ ...formData, urgentHiring: checked as boolean })}
                        />
                        <label htmlFor="urgentHiring" className="text-sm flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                            Urgent Hiring Badge
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="boostedSearch"
                          checked={formData.boostedSearch}
                          onCheckedChange={(checked) => setFormData({ ...formData, boostedSearch: checked as boolean })}
                        />
                        <label htmlFor="boostedSearch" className="text-sm flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          Boosted Search
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="proactiveAlerts"
                          checked={formData.proactiveAlerts}
                          onCheckedChange={(checked) => setFormData({ ...formData, proactiveAlerts: checked as boolean })}
                        />
                        <label htmlFor="proactiveAlerts" className="text-sm flex items-center gap-1">
                          <Zap className="h-4 w-4 text-green-500" />
                          Proactive Alerts
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="superFeatured"
                          checked={formData.superFeatured}
                          onCheckedChange={(checked) => setFormData({ ...formData, superFeatured: checked as boolean })}
                        />
                        <label htmlFor="superFeatured" className="text-sm flex items-center gap-1">
                          <Star className="h-4 w-4 text-purple-500" />
                          Super Featured
                        </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Application Settings */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4">📝 Application Settings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                            Max Applications
                      </label>
                      <Input
                            type="number"
                            placeholder="50"
                            value={formData.maxApplications}
                            onChange={(e) => setFormData({ ...formData, maxApplications: parseInt(e.target.value) || 50 })}
                            disabled={formData.unlimitedApplications}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.unlimitedApplications ? 'Unlimited enabled' : 'Max number of applications accepted'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Application Deadline
                          </label>
                          <Input
                            type="date"
                            value={formData.applicationDeadline}
                            onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            When applications close (optional)
                          </p>
                        </div>
                      </div>
                    </div>
                    
                      {/* External Application URL */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-300">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <ExternalLink className="h-5 w-5 text-blue-600" />
                        External Application URL
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <Input
                            placeholder="https://yourcompany.com/careers/apply"
                        value={formData.externalApplyUrl}
                        onChange={(e) => setFormData({ ...formData, externalApplyUrl: e.target.value })}
                            className="border-blue-300"
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            Redirect candidates to your company's career portal or external application system
                          </p>
                        </div>
                        
                        {formData.externalApplyUrl && (
                          <div className="bg-yellow-50 border border-yellow-300 rounded-md p-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-yellow-800">
                                <strong className="font-semibold">Note:</strong> Since you're using an external application link, 
                                we cannot track applications submitted through your platform. You'll need to manage and 
                                count applications on your own system. The "Apply" button will redirect candidates directly 
                                to your provided URL.
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Additional Email IDs for Applications
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="hr@company.com"
                          value={currentEmail}
                          onChange={(e) => setCurrentEmail(e.target.value)}
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
                    
                    {/* Why Work With Us */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-600" />
                        Why Work With Us
                      </h4>
                      <Textarea
                        placeholder="Showcase your company culture, values, and benefits. Tell candidates what makes your company special..."
                        className="min-h-32"
                        value={formData.whyWorkWithUs}
                        onChange={(e) => setFormData({ ...formData, whyWorkWithUs: e.target.value })}
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        This will be displayed prominently on the job details page to attract top talent
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Company Profile
                      </label>
                      <Textarea
                        placeholder="Detailed company profile and culture..."
                        className="min-h-20"
                        value={formData.companyProfile}
                        onChange={(e) => setFormData({ ...formData, companyProfile: e.target.value })}
                      />
                    </div>
                    
                    {/* Video Banner URL */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Video className="h-5 w-5 text-red-600" />
                        Video Banner URL (Optional)
                      </h4>
                      <Input
                        placeholder="https://youtube.com/watch?v=... or https://youtu.be/... or direct video URL"
                        value={formData.videoBanner}
                        onChange={(e) => setFormData({ ...formData, videoBanner: e.target.value })}
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        <strong>Supports:</strong> YouTube links, direct video files (.mp4, .webm), or any embeddable video URL
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Use this for YouTube or hosted videos. For local files, use the "Company Branding Media" section below.
                      </p>
                    </div>
                    
                    {/* Branding Photos & Videos */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-300">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-indigo-600" />
                        Company Branding Media
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-700 mb-2">
                            Upload photos or a video to showcase your company brand, culture, and workplace
                          </p>
                          <div className="bg-white rounded-lg p-3 border border-indigo-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                {brandingMedia.length} / 5 items
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                brandingMedia.length >= 5 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {5 - brandingMedia.length} slots remaining
                              </span>
                  </div>
                            
                            <input
                              type="file"
                              accept="image/*,video/*"
                              multiple
                              onChange={handleBrandingMediaAdd}
                              disabled={brandingMedia.length >= 5}
                              className="hidden"
                              id="branding-media-upload"
                            />
                            <label
                              htmlFor="branding-media-upload"
                              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                                brandingMedia.length >= 5
                                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                  : 'border-indigo-300 bg-white hover:bg-indigo-50 hover:border-indigo-400'
                              }`}
                            >
                              <Upload className="h-5 w-5 text-indigo-600" />
                              <span className="text-sm font-medium text-gray-700">
                                {brandingMedia.length >= 5 ? 'Maximum 5 items reached' : 'Click to upload photos or video'}
                              </span>
                            </label>
                          </div>
                          
                          <div className="mt-2 space-y-1 text-xs text-gray-600">
                            <p>📸 <strong>Photos:</strong> Max 5MB each, JPG/PNG format</p>
                            <p>🎥 <strong>Video:</strong> Max 50MB, MP4/WebM format (recommended: 1080p, 30fps, compressed)</p>
                            <p>⚠️ <strong>Limit:</strong> Maximum 5 items total (photos + video combined)</p>
                            <p>💡 <strong>Tip:</strong> Compress videos for faster loading (use tools like HandBrake)</p>
                          </div>
                        </div>
                        
                        {/* Preview Grid */}
                        {brandingMedia.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {brandingMedia.map((item, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-indigo-200">
                                  {item.type === 'video' ? (
                                    <video
                                      src={item.preview}
                                      className="w-full h-full object-cover"
                                      muted
                                    />
                                  ) : (
                                    <img
                                      src={item.preview}
                                      alt={`Branding ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                  
                                  {/* Overlay */}
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleBrandingMediaRemove(index)}
                                      className="flex items-center gap-1"
                                    >
                                      <X className="h-4 w-4" />
                                      Remove
                                    </Button>
              </div>
                                  
                                  {/* Type Badge */}
                                  <div className="absolute top-2 left-2">
                                    <Badge variant="secondary" className="bg-white/90 backdrop-blur">
                                      {item.type === 'video' ? '🎥 Video' : '📸 Photo'}
                                    </Badge>
                                  </div>
                                  
                                  {/* File Size */}
                                  <div className="absolute bottom-2 right-2">
                                    <Badge variant="secondary" className="bg-white/90 backdrop-blur text-xs">
                                      {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                                    </Badge>
                                  </div>
                                </div>
                                
                                <p className="text-xs text-gray-600 mt-1 truncate">
                                  {item.file.name}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      case 5:
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
                
                {/* Salary */}
                {formData.salary && (
                  <div>
                    <h5 className="font-semibold text-gray-900">Salary</h5>
                    <p className="text-gray-700 mt-1">{formData.salary}</p>
                  </div>
                )}
                
                {/* Experience */}
                {formData.experience && (
                  <div>
                    <h5 className="font-semibold text-gray-900">Experience</h5>
                    <p className="text-gray-700 mt-1">{formData.experience}</p>
                  </div>
                )}
                
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
                    <div className="text-gray-700 mt-1">
                      {Array.isArray(formData.education) && formData.education.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {formData.education.map((edu, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {edu}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span>Not provided</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900">Description</h5>
                  <p className="text-gray-700 mt-1 whitespace-pre-line">{formData.description || "No description provided"}</p>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Requirements</h5>
                  <p className="text-gray-700 mt-1 whitespace-pre-line">{formData.requirements || "No requirements provided"}</p>
                </div>
                {formData.benefits && (
                  <div>
                    <h5 className="font-semibold text-gray-900">Benefits</h5>
                    <p className="text-gray-700 mt-1 whitespace-pre-line">{formData.benefits}</p>
                  </div>
                )}
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
            
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your job is ready to be published! Review the details above and click "Publish Job" when you're ready.
              </AlertDescription>
            </Alert>
          </div>
        )
      case 6:
        // Same as case 5 (Review & Publish) - for hot vacancies with 6 steps
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
                    {formData.isHotVacancy && (
                      <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                        🔥 HOT VACANCY
                      </Badge>
                    )}
                </div>
                </div>
                
                {/* Salary */}
                {formData.salary && (
                  <div>
                    <h5 className="font-semibold text-gray-900">Salary</h5>
                    <p className="text-gray-700 mt-1">{formData.salary}</p>
                </div>
                )}
                
                {/* Experience */}
                {formData.experience && (
                  <div>
                    <h5 className="font-semibold text-gray-900">Experience</h5>
                    <p className="text-gray-700 mt-1">{formData.experience}</p>
              </div>
                )}
                
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
                    <div className="text-gray-700 mt-1">
                      {Array.isArray(formData.education) && formData.education.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {formData.education.map((edu, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {edu}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span>Not provided</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900">Description</h5>
                  <p className="text-gray-700 mt-1 whitespace-pre-line">{formData.description || "No description provided"}</p>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Requirements</h5>
                  <p className="text-gray-700 mt-1 whitespace-pre-line">{formData.requirements || "No requirements provided"}</p>
                </div>
                {formData.benefits && (
                  <div>
                    <h5 className="font-semibold text-gray-900">Benefits</h5>
                    <p className="text-gray-700 mt-1 whitespace-pre-line">{formData.benefits}</p>
                  </div>
                )}
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
                
                {/* Hot Vacancy Premium Features Preview */}
                {formData.isHotVacancy && (
                  <div className="mt-6 pt-6 border-t border-blue-200">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Premium Features Enabled
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {formData.urgencyLevel && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Urgency: {formData.urgencyLevel}</span>
                        </div>
                      )}
                      {formData.hiringTimeline && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Timeline: {formData.hiringTimeline}</span>
                        </div>
                      )}
                      {formData.priorityListing && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Priority Listing</span>
                        </div>
                      )}
                      {formData.featuredBadge && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Featured Badge</span>
                        </div>
                      )}
                      {formData.boostedSearch && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Boosted Search</span>
                        </div>
                      )}
                      {formData.urgentHiring && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Urgent Hiring</span>
                        </div>
                      )}
                      {formData.advancedAnalytics && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Advanced Analytics</span>
                        </div>
                      )}
                      {formData.candidateMatching && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>AI Candidate Matching</span>
                        </div>
                      )}
                      {formData.directContact && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Direct Contact</span>
                        </div>
                      )}
                    </div>
                    
                    {formData.externalApplyUrl && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">External Application URL</p>
                            <p className="text-xs text-blue-700 mt-1 break-all">{formData.externalApplyUrl}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {formData.whyWorkWithUs && (
                      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm font-medium text-purple-900 mb-1">Why Work With Us</p>
                        <p className="text-xs text-purple-700 whitespace-pre-line">{formData.whyWorkWithUs}</p>
                      </div>
                    )}
                    
                    {formData.videoBanner && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Video className="h-4 w-4 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-900">Video Banner</p>
                            <p className="text-xs text-red-700 mt-1 break-all">{formData.videoBanner}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {brandingMedia.length > 0 && (
                      <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <p className="text-sm font-medium text-indigo-900 mb-2">Company Branding Media: {brandingMedia.length} items</p>
                        <div className="flex flex-wrap gap-2">
                          {brandingMedia.map((item, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {item.type === 'video' ? '🎥' : '📸'} {item.file.name.substring(0, 20)}...
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
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
            
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your job is ready to be published! Review the details above and click "Publish Job" when you're ready.
              </AlertDescription>
            </Alert>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 overflow-x-hidden">
      <EmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
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

        {/* ========== AGENCY CLIENT SELECTION (BEFORE STEPS) ========== */}
        {isAgency && !clientSelectionMade && (
          <Card className="mb-8 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                Who are you posting this job for?
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Select whether you're posting for your own company or for a client
              </p>
            </CardHeader>
            <CardContent>
              {loadingClients ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading clients...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Option: Our Company */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClient('own')
                      setClientSelectionMade(true)
                      toast.success('Posting for your own company')
                    }}
                    className="w-full text-left p-6 border-2 rounded-lg transition-all hover:border-blue-400 hover:bg-white"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">Our Company</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Post for your own hiring needs. No additional verification required.
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-blue-50 text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* Option: Client Company */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Post for Authorized Client</h3>
                    
                    {activeClients.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-4">No active clients yet</p>
                        <Button
                          onClick={() => router.push('/employer-dashboard/add-client')}
                          variant="outline"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Client
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeClients.map((client: any) => {
                          const daysLeft = client.contractEndDate 
                            ? Math.ceil((new Date(client.contractEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                            : null
                            
                          return (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => {
                                setSelectedClient(client.id)
                                setClientSelectionMade(true)
                                toast.success(`Posting for: ${client.ClientCompany?.name || 'Client'}`)
                              }}
                              disabled={!client.canPostJobs}
                              className="text-left p-4 border-2 rounded-lg transition-all hover:border-blue-400 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="flex items-start gap-3">
                                {client.ClientCompany?.logo ? (
                                  <img 
                                    src={client.ClientCompany.logo} 
                                    alt={client.ClientCompany.name}
                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="w-5 h-5 text-white" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 truncate">
                                    {client.ClientCompany?.name || 'Unknown Company'}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {client.ClientCompany?.industry} • {client.ClientCompany?.city}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {client.jobsPosted || 0}
                                      {client.maxActiveJobs ? `/${client.maxActiveJobs}` : ''} jobs
                                    </Badge>
                                    {daysLeft !== null && daysLeft > 0 && daysLeft < 30 && (
                                      <Badge variant="outline" className="text-xs text-amber-600">
                                        {daysLeft}d left
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Show form only after client selection (or if direct employer) */}
        {(!isAgency || clientSelectionMade) && (
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
        )}
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
              // Redirect to dashboard
              router.push(user?.region === 'gulf' ? '/gulf-dashboard' : '/employer-dashboard')
            }}>
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Industry Dropdown */}
      {showIndustryDropdown && (
        <IndustryDropdown
          selectedIndustries={formData.postingType === "consultancy" && formData.hiringCompanyIndustry 
            ? [formData.hiringCompanyIndustry] 
            : selectedIndustries
          }
          onIndustryChange={(industries) => {
            if (formData.postingType === "consultancy") {
              // For consultancy, set hiring company industry (single selection)
              setFormData({ ...formData, hiringCompanyIndustry: industries[0] || "" })
            } else {
              // For regular company, set multiple industries
            setSelectedIndustries(industries)
            setFormData({ ...formData, industryType: industries.join(', ') })
            }
          }}
          onClose={() => setShowIndustryDropdown(false)}
          hideSelectAllButtons={formData.postingType === "consultancy"}
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
