"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Building2, CheckCircle, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Employer Navbar Component
function EmployerNavbar() {
  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              JobPortal
            </span>
            <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
              Employers
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="/employer-login"
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              Login
            </Link>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Post a Job
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default function EmployerRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const [formData, setFormData] = useState({
    companyId: "",
    companyName: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    companySize: "",
    industry: "",
    website: "",
    role: "recruiter",
    region: "",
    agreeToTerms: false,
    subscribeUpdates: true,
  })
  const { employerSignup, loading, error, clearError } = useAuth()
  const router = useRouter()
  // Preselect companyId from URL if coming from selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const cid = params.get('companyId') || ''
      if (cid) {
        setFormData((prev) => ({ ...prev, companyId: cid, companyName: '' }))
      }
    }
  }, [])
  const [companySearch, setCompanySearch] = useState('')
  const [companyOptions, setCompanyOptions] = useState<any[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoadingCompanies(true)
      const res = await apiService.listCompanies({ search: companySearch, limit: 10 })
      if (res.success && res.data) setCompanyOptions(res.data)
      setLoadingCompanies(false)
    }
    load()
  }, [companySearch])

  // Real-time validation function
  const validateField = (field: string, value: string) => {
    const errors: {[key: string]: string} = {}
    
    switch (field) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (value && !emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address'
        }
        break
      case 'password':
        if (value && value.length < 8) {
          errors.password = 'Password must be at least 8 characters'
        } else if (value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.password = 'Password must contain uppercase, lowercase, and number'
        }
        break
      case 'phone':
        const phoneRegex = /^[\+]?[0-9\s\-\(\)\.]+$/
        if (value && value.length < 8) {
          errors.phone = 'Phone must be at least 8 characters'
        } else if (value && value.length > 20) {
          errors.phone = 'Phone must be 20 characters or less'
        } else if (value && !phoneRegex.test(value)) {
          errors.phone = 'Use only digits, spaces, dashes, parentheses, and dots'
        }
        break
      case 'fullName':
        if (value && value.length < 2) {
          errors.fullName = 'Name must be at least 2 characters'
        }
        break
      case 'companyName':
        if (value && value.length < 2) {
          errors.companyName = 'Company name must be at least 2 characters'
        }
        break
    }
    
    setValidationErrors(prev => ({ ...prev, ...errors }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic frontend validation
    if (!formData.companyId && !formData.companyName.trim()) {
      toast.error('Select a company to join or enter a new company name')
      return
    }
    
    if (!formData.fullName.trim()) {
      toast.error('Full name is required')
      return
    }
    
    if (!formData.email.trim()) {
      toast.error('Email is required')
      return
    }
    
    if (!formData.phone.trim()) {
      toast.error('Phone number is required')
      return
    }
    
    if (!formData.region) {
      toast.error('Please select a region')
      return
    }
    
    if (!formData.password) {
      toast.error('Password is required')
      return
    }
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    try {
      clearError()
      const result = await employerSignup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        companyId: formData.companyId || undefined,
        companyName: formData.companyId ? undefined : formData.companyName,
        phone: formData.phone,
        companySize: formData.companySize,
        industry: formData.industry,
        website: formData.website,
        role: formData.role,
        region: formData.region,
        agreeToTerms: formData.agreeToTerms,
        subscribeUpdates: formData.subscribeUpdates,
      })
      
      if (result?.user?.userType === 'employer' || result?.user?.userType === 'admin') {
        // Check region for dashboard redirect
        if (result?.company?.region === 'gulf') {
          toast.success('Employer account created successfully! Redirecting to Gulf dashboard...')
          setTimeout(() => {
            router.push('/gulf-dashboard')
          }, 2000)
        } else {
          toast.success('Employer account created successfully! Redirecting to employer dashboard...')
        setTimeout(() => {
          router.push('/employer-dashboard')
        }, 2000)
        }
      } else {
        toast.error('Failed to create employer account. Please try again.')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      
      // Handle specific validation errors with actionable guidance
      if (error.message && error.message.includes('Validation failed')) {
        if (error.errors && Array.isArray(error.errors)) {
          // Process each validation error and provide specific guidance
          const errorGuidance = error.errors.map((err: any) => {
            const field = err.path
            const message = err.msg
            
            // Provide specific guidance for each field
            switch (field) {
              case 'email':
                return '📧 Email: Please enter a valid email address (e.g., john@company.com)'
              case 'password':
                if (message.includes('8 characters')) {
                  return '🔒 Password: Must be at least 8 characters long'
                } else if (message.includes('uppercase')) {
                  return '🔒 Password: Must contain uppercase letter, lowercase letter, and number (e.g., MyPass123)'
                } else {
                  return '🔒 Password: Must be 8+ characters with uppercase, lowercase, and number'
                }
              case 'fullName':
                return '👤 Full Name: Must be 2-100 characters (e.g., John Doe)'
              case 'companyName':
                return '🏢 Company Name: Must be 2-200 characters (e.g., Acme Corporation)'
              case 'phone':
                if (message.includes('8 and 20 characters')) {
                  return '📞 Phone: Must be 8-20 characters (e.g., +1234567890 or 123-456-7890)'
                } else {
                  return '📞 Phone: Use only digits, spaces, dashes, parentheses, and dots'
                }
              case 'companySize':
                return '📊 Company Size: Select from the dropdown (1-50, 51-200, etc.)'
              case 'industry':
                return '🏭 Industry: Select from the dropdown (Technology, Finance, etc.)'
              default:
                return `${field}: ${message}`
            }
          }).join('\n\n')
          
          toast.error(`Please fix the following issues:\n\n${errorGuidance}`, {
            duration: 8000, // Show for 8 seconds
            style: {
              whiteSpace: 'pre-line',
              maxWidth: '400px'
            }
          })
        } else {
          toast.error('Please check your input and try again')
        }
      } else if (error.message && error.message.includes('already exists')) {
        toast.error('❌ An account with this email already exists. Please use a different email or try logging in.')
      } else if (error.message && error.message.includes('phone number')) {
        toast.error('📞 Phone: Use only digits, spaces, dashes, parentheses, and dots (e.g., +1234567890 or 123-456-7890)')
      } else {
        toast.error(error.message || 'Registration failed. Please try again.')
      }
    }
  }

  const handleOAuthSignup = async (provider: 'google' | 'facebook') => {
    try {
      setOauthLoading(provider)
      clearError()
      
      // Get OAuth URLs from backend for employer
      const response = await apiService.getOAuthUrls('employer')
      
      if (response.success && response.data) {
        const url = provider === 'google' ? response.data.google : response.data.facebook
        // Redirect to OAuth provider
        window.location.href = url
      } else {
        toast.error('Failed to get OAuth URL')
      }
    } catch (error: any) {
      console.error(`${provider} OAuth error:`, error)
      toast.error(`Failed to sign up with ${provider}`)
    } finally {
      setOauthLoading(null)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    
    // Validate field in real-time
    if (typeof value === 'string') {
      validateField(field, value)
    }
  }

  const benefits = [
    "Access to 50M+ job seekers",
    "AI-powered candidate matching",
    "Advanced screening tools",
    "Dedicated account manager",
    "Priority job listing",
    "Detailed analytics & insights",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <EmployerNavbar />

      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block space-y-8"
          >
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Hire the Best Talent</h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
                Join 50,000+ companies that trust JobPortal for their hiring needs
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Start Free, Scale Fast</h3>
              <p className="text-blue-100">
                Post your first job for free and upgrade as you grow. No setup fees, no hidden costs.
              </p>
            </div>
          </motion.div>

          {/* Right Side - Registration Form */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                  Create Employer Account
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-300 mt-2">Start hiring top talent in minutes</p>
              </CardHeader>

                             <CardContent className="space-y-6">
                <div className="text-center text-sm text-slate-600 dark:text-slate-300">
                  Already have a company in the system?{' '}
                  <Link href="/employer-join-company" className="text-blue-600 hover:text-blue-700 font-medium">
                    Join existing company
                  </Link>
                </div>
                {/* Company selection or creation */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Join Existing Company</Label>
                  <div className="space-y-2">
                    <Input value={companySearch} onChange={(e) => setCompanySearch(e.target.value)} placeholder="Search companies" className="h-10" />
                    <div className="border rounded max-h-48 overflow-auto bg-white dark:bg-slate-800">
                      {loadingCompanies ? (
                        <div className="p-2 text-sm text-slate-500">Loading...</div>
                      ) : companyOptions.map((c) => (
                        <button key={c.id} type="button" onClick={() => handleInputChange('companyId', c.id)} className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${formData.companyId === c.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-slate-500">{c.industry} • {c.companySize}</div>
                        </button>
                      ))}
                      {(!loadingCompanies && companyOptions.length === 0) && (
                        <div className="p-2 text-sm text-slate-500">No companies found</div>
                      )}
                    </div>
                    {formData.companyId && (
                      <div className="text-xs text-green-700">Selected company ID: {formData.companyId}</div>
                    )}
                    <p className="text-xs text-slate-500">Selecting a company hides company creation fields.</p>
                  </div>
                </div>

                {formData.companyId ? (
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Your Role</Label>
                    <Select value={formData.role} onValueChange={(v) => handleInputChange('role', v)}>
                      <SelectTrigger className="h-12 border-slate-200 dark:border-slate-600">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                        <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">Admins are auto-assigned only when creating a new company.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-slate-700 dark:text-slate-300">New Company Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input id="companyName" type="text" placeholder="Enter new company name" value={formData.companyName} onChange={(e) => handleInputChange("companyName", e.target.value)} className="pl-10 h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700" />
                    </div>
                    <p className="text-slate-500 text-xs">Creating a company will make you the Admin by default.</p>
                  </div>
                )}

                 {/* Validation Status */}
                 {Object.keys(validationErrors).length > 0 ? (
                   <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                     <h3 className="text-red-800 dark:text-red-200 font-medium mb-2 flex items-center">
                       <span className="mr-2">⚠️</span>
                       Please fix the following issues:
                     </h3>
                     <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                       {Object.entries(validationErrors).map(([field, message]) => (
                         <li key={field} className="flex items-start">
                           <span className="mr-2">•</span>
                           <span className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
                           <span className="ml-1">{message}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 ) : (
                   formData.companyName && formData.fullName && formData.email && formData.phone && formData.region && formData.password && (
                     <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                       <h3 className="text-green-800 dark:text-green-200 font-medium mb-2 flex items-center">
                         <span className="mr-2">✅</span>
                         All required fields look good!
                       </h3>
                       <p className="text-green-700 dark:text-green-300 text-sm">
                         You can now submit your registration.
                       </p>
                     </div>
                   )
                 )}
                 
                 <form onSubmit={handleSubmit} className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">
                        Your Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          className="pl-10 h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700"
                          required
                        />
                      </div>
                    </div>

                                         <div className="space-y-2">
                       <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">
                         Phone Number
                       </Label>
                       <div className="relative">
                         <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                         <Input
                           id="phone"
                           type="tel"
                           placeholder="e.g., +1234567890 or 123-456-7890"
                           value={formData.phone}
                           onChange={(e) => handleInputChange("phone", e.target.value)}
                           className={`pl-10 h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700 ${
                             validationErrors.phone ? 'border-red-500 focus:border-red-500' : ''
                           }`}
                           required
                         />
                       </div>
                       {validationErrors.phone && (
                         <p className="text-red-500 text-sm mt-1 flex items-center">
                           <span className="mr-1">⚠️</span>
                           {validationErrors.phone}
                         </p>
                       )}
                       <p className="text-slate-500 text-xs">
                         💡 Acceptable formats: +1234567890, 123-456-7890, (123) 456-7890
                       </p>
                     </div>
                  </div>

                                     <div className="space-y-2">
                     <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                       Work Email Address
                     </Label>
                     <div className="relative">
                       <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                       <Input
                         id="email"
                         type="email"
                         placeholder="Enter your work email"
                         value={formData.email}
                         onChange={(e) => handleInputChange("email", e.target.value)}
                         className={`pl-10 h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700 ${
                           validationErrors.email ? 'border-red-500 focus:border-red-500' : ''
                         }`}
                         required
                       />
                     </div>
                     {validationErrors.email && (
                       <p className="text-red-500 text-sm mt-1 flex items-center">
                         <span className="mr-1">⚠️</span>
                         {validationErrors.email}
                       </p>
                     )}
                     <p className="text-slate-500 text-xs">
                       💡 Example: john.doe@company.com
                     </p>
                   </div>

                  {!formData.companyId && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companySize" className="text-slate-700 dark:text-slate-300">
                        Company Size
                      </Label>
                      <Select
                        value={formData.companySize}
                        onValueChange={(value) => handleInputChange("companySize", value)}
                      >
                        <SelectTrigger className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700">
                          <SelectValue placeholder="Select company size" />
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

                    <div className="space-y-2">
                      <Label htmlFor="industry" className="text-slate-700 dark:text-slate-300">
                        Industry
                      </Label>
                      <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                        <SelectTrigger className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-slate-700 dark:text-slate-300">
                      Region of Operation *
                    </Label>
                    <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                      <SelectTrigger className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700">
                        <SelectValue placeholder="Select your region of operation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="india">India</SelectItem>
                        <SelectItem value="gulf">Gulf Region (UAE, Saudi Arabia, Qatar, etc.)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-slate-500 text-xs">
                      💡 This determines which dashboard you'll access after registration
                    </p>
                  </div>

                  {!formData.companyId && (
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-slate-700 dark:text-slate-300">
                      Company Website (Optional)
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourcompany.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        className="pl-10 h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700"
                      />
                    </div>
                  </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div className="space-y-2">
                       <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                         Password
                       </Label>
                       <div className="relative">
                         <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                         <Input
                           id="password"
                           type={showPassword ? "text" : "password"}
                           placeholder="Create password"
                           value={formData.password}
                           onChange={(e) => handleInputChange("password", e.target.value)}
                           className={`pl-10 pr-10 h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700 ${
                             validationErrors.password ? 'border-red-500 focus:border-red-500' : ''
                           }`}
                           required
                         />
                         <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                         >
                           {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                         </button>
                       </div>
                       {validationErrors.password && (
                         <p className="text-red-500 text-sm mt-1 flex items-center">
                           <span className="mr-1">⚠️</span>
                           {validationErrors.password}
                         </p>
                       )}
                       <p className="text-slate-500 text-xs">
                         💡 Must be 8+ characters with uppercase, lowercase, and number (e.g., MyPass123)
                       </p>
                     </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className="pl-10 pr-10 h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                        required
                      />
                      <Label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400">
                        I agree to the{" "}
                        <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="updates"
                        checked={formData.subscribeUpdates}
                        onCheckedChange={(checked) => handleInputChange("subscribeUpdates", checked as boolean)}
                      />
                      <Label htmlFor="updates" className="text-sm text-slate-600 dark:text-slate-400">
                        Send me product updates and hiring tips
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Employer Account'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                                     {error && (
                     <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                       {error}
                     </div>
                   )}
                 </form>

                 {/* Helpful Tips */}
                 <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                   <h3 className="text-blue-800 dark:text-blue-200 font-medium mb-2 flex items-center">
                     <span className="mr-2">💡</span>
                     Registration Tips
                   </h3>
                   <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                     <li>• Use your work email address for better verification</li>
                     <li>• Phone number can include country code, spaces, and dashes</li>
                     <li>• Password must be strong: 8+ characters with uppercase, lowercase, and number</li>
                     <li>• Company name should be your official business name</li>
                     <li>• All fields marked with * are required</li>
                   </ul>
                 </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                    onClick={() => handleOAuthSignup('google')}
                    disabled={oauthLoading === 'google'}
                  >
                    {oauthLoading === 'google' ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                    onClick={() => handleOAuthSignup('facebook')}
                    disabled={oauthLoading === 'facebook'}
                  >
                    {oauthLoading === 'facebook' ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                    Facebook
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">Already have an account?</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link href="/employer-login">
                    <Button variant="outline" className="w-full h-12 bg-white dark:bg-slate-700">
                      Sign In to Your Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">JobPortal</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                India's leading job portal connecting talent with opportunities. Find your dream job or hire the perfect
                candidate.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link href="/jobs" className="hover:text-white transition-colors">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/companies" className="hover:text-white transition-colors">
                    Browse Companies
                  </Link>
                </li>
                <li>
                  <Link href="/jobatpace" className="hover:text-white transition-colors font-medium">
                    JobAtPace Premium
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link href="/employer-dashboard/post-job" className="hover:text-white transition-colors">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/employer-dashboard/requirements" className="hover:text-white transition-colors">
                    Search Resume Database
                  </Link>
                </li>
                <li>
                  <Link href="/employer-dashboard/manage-jobs" className="hover:text-white transition-colors">
                    Manage Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/employer-register" className="hover:text-white transition-colors">
                    Employer Registration
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>Email: support@jobportal.com</p>
                <p>Phone: +91 80-4040-0000</p>
                <p>Address: Bangalore, India</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>© 2025 JobPortal. All rights reserved. Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
