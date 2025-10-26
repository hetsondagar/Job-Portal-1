"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { constructAvatarUrl } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ArrowLeft,
  User, 
  FileText, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard,
  LogOut,
  Edit,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Star,
  Eye,
  Download,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { ResumeManagement } from '@/components/resume-management'
import { toast } from 'sonner'
import { apiService } from '@/lib/api'

export default function AccountPage() {
  const { user, loading, logout, refreshUser } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [resumeStats, setResumeStats] = useState<any>(null)
  
  // Edit states
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form data states
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  })
  
  const [professionalData, setProfessionalData] = useState({
    headline: '',
    currentLocation: '',
    summary: '',
    expectedSalary: '',
    noticePeriod: '',
    willingToRelocate: false,
    skills: [] as string[],
    languages: [] as string[],
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: ''
    },
    jobPreferences: {
      preferredJobTitles: [] as string[],
      preferredLocations: [] as string[],
      preferredJobTypes: [] as string[],
      preferredExperienceLevels: [] as string[],
      preferredSalaryMin: '',
      preferredSalaryMax: '',
      preferredSkills: [] as string[],
      preferredWorkMode: [] as string[],
      willingToTravel: false
    }
  })
  
  const [newSkill, setNewSkill] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newPreferredSkill, setNewPreferredSkill] = useState('')

  // Security-related state
  const [showChangeEmail, setShowChangeEmail] = useState(false)
  const [showChangePhone, setShowChangePhone] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [securityLoading, setSecurityLoading] = useState(false)
  
  // Security form data
  const [emailData, setEmailData] = useState({
    newEmail: '',
    currentPassword: ''
  })
  const [phoneData, setPhoneData] = useState({
    newPhone: '',
    currentPassword: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to access your account')
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !loading) {
      fetchResumeStats()
      initializeFormData()
      fetchJobPreferences()
    }
  }, [user, loading])

  const initializeFormData = () => {
    if (user) {
      setPersonalData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || ''
      })
      
      setProfessionalData({
        headline: user.headline || '',
        currentLocation: user.currentLocation || '',
        summary: user.summary || '',
        expectedSalary: user.expectedSalary?.toString() || '',
        noticePeriod: user.noticePeriod?.toString() || '',
        willingToRelocate: user.willingToRelocate || false,
        skills: user.skills || [],
        languages: user.languages || [],
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || '',
          github: user.socialLinks?.github || '',
          portfolio: user.socialLinks?.portfolio || ''
        },
        jobPreferences: {
          preferredJobTitles: user.jobPreferences?.preferredJobTitles || [],
          preferredLocations: user.jobPreferences?.preferredLocations || [],
          preferredJobTypes: user.jobPreferences?.preferredJobTypes || [],
          preferredExperienceLevels: user.jobPreferences?.preferredExperienceLevels || [],
          preferredSalaryMin: user.jobPreferences?.preferredSalaryMin?.toString() || '',
          preferredSalaryMax: user.jobPreferences?.preferredSalaryMax?.toString() || '',
          preferredSkills: user.jobPreferences?.preferredSkills || [],
          preferredWorkMode: user.jobPreferences?.preferredWorkMode || [],
          willingToTravel: user.jobPreferences?.willingToTravel || false
        }
      })
    }
  }

  const fetchResumeStats = async () => {
    try {
      const response = await apiService.getResumeStats()
      if (response.success && response.data) {
        setResumeStats(response.data)
      }
    } catch (error) {
      console.error('Error fetching resume stats:', error)
    }
  }

  const fetchJobPreferences = async () => {
    try {
      const response = await apiService.getJobPreferences()
      if (response.success && response.data) {
        setProfessionalData(prev => ({
          ...prev,
          jobPreferences: {
            preferredJobTitles: response.data.preferredJobTitles || [],
            preferredLocations: response.data.preferredLocations || [],
            preferredJobTypes: response.data.preferredJobTypes || [],
            preferredExperienceLevels: response.data.preferredExperienceLevels || [],
            preferredSalaryMin: response.data.preferredSalaryMin?.toString() || '',
            preferredSalaryMax: response.data.preferredSalaryMax?.toString() || '',
            preferredSkills: response.data.preferredSkills || [],
            preferredWorkMode: response.data.preferredWorkMode || [],
            willingToTravel: response.data.willingToTravel || false
          }
        }))
      }
    } catch (error) {
      console.error('Error fetching job preferences:', error)
      // If API fails, keep the default empty preferences
      // This ensures the form still works even if the backend is not ready
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  // Security functions
  const handleChangeEmail = async () => {
    if (!emailData.newEmail || !emailData.currentPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (emailData.newEmail === user?.email) {
      toast.error('New email must be different from current email')
      return
    }

    try {
      setSecurityLoading(true)
      const response = await apiService.updateUserEmail({
        newEmail: emailData.newEmail,
        currentPassword: emailData.currentPassword
      })

      if (response.success) {
        toast.success('Email updated successfully. Please check your new email for verification.')
        setEmailData({ newEmail: '', currentPassword: '' })
        setShowChangeEmail(false)
        await refreshUser()
      } else {
        toast.error(response.message || 'Failed to update email')
      }
    } catch (error: any) {
      console.error('Email update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update email')
    } finally {
      setSecurityLoading(false)
    }
  }

  const handleChangePhone = async () => {
    if (!phoneData.newPhone || !phoneData.currentPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (phoneData.newPhone === user?.phone) {
      toast.error('New phone must be different from current phone')
      return
    }

    try {
      setSecurityLoading(true)
      const response = await apiService.updateUserPhone({
        newPhone: phoneData.newPhone,
        currentPassword: phoneData.currentPassword
      })

      if (response.success) {
        toast.success('Phone number updated successfully')
        setPhoneData({ newPhone: '', currentPassword: '' })
        setShowChangePhone(false)
        await refreshUser()
      } else {
        toast.error(response.message || 'Failed to update phone')
      }
    } catch (error: any) {
      console.error('Phone update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update phone')
    } finally {
      setSecurityLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long')
      return
    }

    try {
      setSecurityLoading(true)
      const response = await apiService.updateUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (response.success) {
        toast.success('Password updated successfully')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowChangePassword(false)
      } else {
        toast.error(response.message || 'Failed to update password')
      }
    } catch (error: any) {
      console.error('Password update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update password')
    } finally {
      setSecurityLoading(false)
    }
  }

  const savePersonalData = async () => {
    try {
      setSaving(true)
      const response = await apiService.updateProfile(personalData)
      
      if (response.success) {
        await refreshUser()
        setEditingPersonal(false)
        toast.success('Personal information updated successfully')
      } else {
        toast.error(response.message || 'Failed to update personal information')
      }
    } catch (error) {
      console.error('Error updating personal data:', error)
      toast.error('Failed to update personal information')
    } finally {
      setSaving(false)
    }
  }

  const saveProfessionalData = async () => {
    try {
      setSaving(true)
      
      // Save professional data
      const response = await apiService.updateProfile({
        ...professionalData,
        expectedSalary: professionalData.expectedSalary ? Number(professionalData.expectedSalary) : undefined,
        noticePeriod: professionalData.noticePeriod ? Number(professionalData.noticePeriod) : undefined
      })
      
      if (response.success) {
        // Save job preferences
        const preferencesResponse = await apiService.updateJobPreferences(professionalData.jobPreferences)
        
        if (preferencesResponse.success) {
          await refreshUser()
          setEditingProfessional(false)
          toast.success('Professional details and job preferences updated successfully')
        } else {
          await refreshUser()
          setEditingProfessional(false)
          toast.success('Professional details updated successfully, but job preferences failed to save')
        }
      } else {
        toast.error(response.message || 'Failed to update professional details')
      }
    } catch (error) {
      console.error('Error updating professional data:', error)
      toast.error('Failed to update professional details')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !professionalData.skills.includes(newSkill.trim())) {
      setProfessionalData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfessionalData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !professionalData.languages.includes(newLanguage.trim())) {
      setProfessionalData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }))
      setNewLanguage('')
    }
  }

  const removeLanguage = (languageToRemove: string) => {
    setProfessionalData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== languageToRemove)
    }))
  }

  // Job preferences helper functions
  const addJobTitle = () => {
    if (newJobTitle.trim() && !(professionalData.jobPreferences?.preferredJobTitles || []).includes(newJobTitle.trim())) {
      setProfessionalData(prev => ({
        ...prev,
        jobPreferences: {
          ...prev.jobPreferences,
          preferredJobTitles: [...(prev.jobPreferences?.preferredJobTitles || []), newJobTitle.trim()]
        }
      }))
      setNewJobTitle('')
    }
  }

  const removeJobTitle = (titleToRemove: string) => {
    setProfessionalData(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        preferredJobTitles: (prev.jobPreferences?.preferredJobTitles || []).filter(title => title !== titleToRemove)
      }
    }))
  }


  const addLocation = () => {
    if (newLocation.trim() && !professionalData.jobPreferences.preferredLocations.includes(newLocation.trim())) {
      setProfessionalData(prev => ({
        ...prev,
        jobPreferences: {
          ...prev.jobPreferences,
          preferredLocations: [...prev.jobPreferences.preferredLocations, newLocation.trim()]
        }
      }))
      setNewLocation('')
    }
  }

  const removeLocation = (locationToRemove: string) => {
    setProfessionalData(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        preferredLocations: prev.jobPreferences.preferredLocations.filter(location => location !== locationToRemove)
      }
    }))
  }


  const addJobType = (jobType: string) => {
    if (!professionalData.jobPreferences.preferredJobTypes.includes(jobType)) {
      setProfessionalData(prev => ({
        ...prev,
        jobPreferences: {
          ...prev.jobPreferences,
          preferredJobTypes: [...prev.jobPreferences.preferredJobTypes, jobType]
        }
      }))
    }
  }

  const removeJobType = (jobTypeToRemove: string) => {
    setProfessionalData(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        preferredJobTypes: prev.jobPreferences.preferredJobTypes.filter(type => type !== jobTypeToRemove)
      }
    }))
  }

  const addExperienceLevel = (level: string) => {
    if (!professionalData.jobPreferences.preferredExperienceLevels.includes(level)) {
      setProfessionalData(prev => ({
        ...prev,
        jobPreferences: {
          ...prev.jobPreferences,
          preferredExperienceLevels: [...prev.jobPreferences.preferredExperienceLevels, level]
        }
      }))
    }
  }

  const removeExperienceLevel = (levelToRemove: string) => {
    setProfessionalData(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        preferredExperienceLevels: prev.jobPreferences.preferredExperienceLevels.filter(level => level !== levelToRemove)
      }
    }))
  }

  const toggleWorkMode = (mode: string, checked: boolean) => {
    setProfessionalData(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        preferredWorkMode: checked 
          ? [...prev.jobPreferences.preferredWorkMode, mode]
          : prev.jobPreferences.preferredWorkMode.filter(m => m !== mode)
      }
    }))
  }

  const addPreferredSkill = () => {
    if (newPreferredSkill.trim() && !(professionalData.jobPreferences?.preferredSkills || []).includes(newPreferredSkill.trim())) {
      setProfessionalData(prev => ({
        ...prev,
        jobPreferences: {
          ...prev.jobPreferences,
          preferredSkills: [...(prev.jobPreferences?.preferredSkills || []), newPreferredSkill.trim()]
        }
      }))
      setNewPreferredSkill('')
    }
  }

  const removePreferredSkill = (skillToRemove: string) => {
    setProfessionalData(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        preferredSkills: (prev.jobPreferences?.preferredSkills || []).filter(skill => skill !== skillToRemove)
      }
    }))
  }

  const cancelEdit = (type: 'personal' | 'professional') => {
    if (type === 'personal') {
      setEditingPersonal(false)
      initializeFormData()
    } else {
      setEditingProfessional(false)
      initializeFormData()
    }
  }

  const getProfileCompletion = () => {
    if (!user) return 0
    
    let completion = 0
    const fields = [
      user.firstName, user.lastName, user.email, user.phone,
      user.currentLocation, user.headline, user.summary
    ]
    
    fields.forEach(field => {
      if (field && field.trim() !== '') completion += 14.28
    })
    
    return Math.min(100, Math.round(completion))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50/40 to-indigo-50/40 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 relative overflow-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50/40 to-indigo-50/40 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 relative overflow-auto">
      <Navbar />
      
      {/* Welcome Back Div Style Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-200/45 via-blue-200/35 to-indigo-200/45"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-purple-300/10 to-blue-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-36 h-36 bg-gradient-to-br from-blue-300/10 to-indigo-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-indigo-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-0 right-0 h-24 bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-indigo-400/20"></div>
      </div>
      
      <div className="pt-20 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link href={user?.region === 'gulf' ? '/gulf-dashboard' : '/dashboard'}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Account Settings
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Manage your profile, resumes, and account preferences
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-sm">
                  <User className="w-3 h-3 mr-1" />
                  {user.userType}
                </Badge>
                <Badge variant={user.accountStatus === 'active' ? 'default' : 'destructive'}>
                  {user.accountStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Profile Overview Card */}
          <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex-shrink-0">
                  <Avatar className="w-20 h-20 border-4 border-white dark:border-slate-700 shadow-lg">
                    <AvatarImage 
                      src={constructAvatarUrl(user.avatar)} 
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {`${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Profile Completion</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                            style={{ width: `${getProfileCompletion()}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{getProfileCompletion()}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Member Since</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="resumes" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Resumes</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Personal Information</span>
                      </div>
                      {!editingPersonal && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingPersonal(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingPersonal ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={personalData.firstName}
                              onChange={(e) => setPersonalData(prev => ({ ...prev, firstName: e.target.value }))}
                              placeholder="Enter your first name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={personalData.lastName}
                              onChange={(e) => setPersonalData(prev => ({ ...prev, lastName: e.target.value }))}
                              placeholder="Enter your last name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={personalData.email}
                              onChange={(e) => setPersonalData(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Enter your email"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={personalData.phone}
                              onChange={(e) => setPersonalData(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={savePersonalData}
                            disabled={saving}
                            className="flex-1"
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => cancelEdit('personal')}
                            disabled={saving}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">First Name</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {user.firstName || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Last Name</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {user.lastName || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {user.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {user.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Professional Details</span>
                      </div>
                      {!editingProfessional && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingProfessional(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingProfessional ? (
                      <div className="space-y-6">
                        {/* Basic Professional Info */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="headline">Professional Headline</Label>
                            <Input
                              id="headline"
                              value={professionalData.headline}
                              onChange={(e) => setProfessionalData(prev => ({ ...prev, headline: e.target.value }))}
                              placeholder="e.g., Software Engineer, UI/UX Designer"
                            />
                          </div>
                          <div>
                            <Label htmlFor="currentLocation">Current Location</Label>
                            <Input
                              id="currentLocation"
                              value={professionalData.currentLocation}
                              onChange={(e) => setProfessionalData(prev => ({ ...prev, currentLocation: e.target.value }))}
                              placeholder="e.g., Mumbai, Maharashtra"
                            />
                          </div>
                          <div>
                            <Label htmlFor="summary">Professional Summary</Label>
                            <Textarea
                              id="summary"
                              value={professionalData.summary}
                              onChange={(e) => setProfessionalData(prev => ({ ...prev, summary: e.target.value }))}
                              placeholder="Tell us about your professional background, skills, and career goals..."
                              rows={4}
                            />
                          </div>
                        </div>

                        {/* Salary and Preferences */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expectedSalary">Expected Salary (LPA)</Label>
                            <Input
                              id="expectedSalary"
                              type="number"
                              value={professionalData.expectedSalary}
                              onChange={(e) => setProfessionalData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                              placeholder="e.g., 8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="noticePeriod">Notice Period (days)</Label>
                            <Input
                              id="noticePeriod"
                              type="number"
                              value={professionalData.noticePeriod}
                              onChange={(e) => setProfessionalData(prev => ({ ...prev, noticePeriod: e.target.value }))}
                              placeholder="e.g., 30"
                            />
                          </div>
                        </div>

                        {/* Willing to Relocate */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="willingToRelocate"
                            checked={professionalData.willingToRelocate}
                            onCheckedChange={(checked) => setProfessionalData(prev => ({ ...prev, willingToRelocate: !!checked }))}
                          />
                          <Label htmlFor="willingToRelocate">Willing to relocate</Label>
                        </div>

                        {/* Skills Management */}
                        <div>
                          <Label>Skills</Label>
                          <div className="flex flex-wrap gap-2 mt-2 mb-3">
                            {professionalData.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {skill}
                                <button
                                  onClick={() => removeSkill(skill)}
                                  className="ml-1 hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <Input
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              placeholder="Add a skill"
                              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                            />
                            <Button type="button" onClick={addSkill} size="sm">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Languages Management */}
                        <div>
                          <Label>Languages</Label>
                          <div className="flex flex-wrap gap-2 mt-2 mb-3">
                            {professionalData.languages.map((language, index) => (
                              <Badge key={index} variant="outline" className="flex items-center gap-1">
                                {language}
                                <button
                                  onClick={() => removeLanguage(language)}
                                  className="ml-1 hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <Input
                              value={newLanguage}
                              onChange={(e) => setNewLanguage(e.target.value)}
                              placeholder="Add a language"
                              onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                            />
                            <Button type="button" onClick={addLanguage} size="sm">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Job Preferences Section */}
                        <div className="space-y-6 border-t pt-6">
                          <div className="flex items-center space-x-2">
                            <Star className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">Job Preferences</h3>
                          </div>
                          
                          {/* Preferred Job Titles */}
                          <div>
                            <Label>Preferred Job Titles</Label>
                            <div className="flex flex-wrap gap-2 mt-2 mb-3">
                              {(professionalData.jobPreferences?.preferredJobTitles || []).map((title, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  {title}
                                  <button
                                    onClick={() => removeJobTitle(title)}
                                    className="ml-1 hover:text-red-500"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <Input
                                value={newJobTitle}
                                onChange={(e) => setNewJobTitle(e.target.value)}
                                placeholder="e.g., Software Engineer, Product Manager"
                                onKeyPress={(e) => e.key === 'Enter' && addJobTitle()}
                              />
                              <Button type="button" onClick={addJobTitle} size="sm">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>


                          {/* Preferred Locations */}
                          <div>
                            <Label>Preferred Locations</Label>
                            <div className="flex flex-wrap gap-2 mt-2 mb-3">
                              {professionalData.jobPreferences.preferredLocations.map((location, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  {location}
                                  <button
                                    onClick={() => removeLocation(location)}
                                    className="ml-1 hover:text-red-500"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <Input
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
                                placeholder="e.g., Mumbai, Bangalore, Remote"
                                onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                              />
                              <Button type="button" onClick={addLocation} size="sm">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>


                          {/* Job Type and Experience Preferences */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label>Preferred Job Types</Label>
                              <Select
                                value=""
                                onValueChange={(value) => addJobType(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="full-time">Full-time</SelectItem>
                                  <SelectItem value="part-time">Part-time</SelectItem>
                                  <SelectItem value="contract">Contract</SelectItem>
                                  <SelectItem value="internship">Internship</SelectItem>
                                  <SelectItem value="freelance">Freelance</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {professionalData.jobPreferences.preferredJobTypes.map((type, index) => (
                                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {type}
                                    <button
                                      onClick={() => removeJobType(type)}
                                      className="ml-1 hover:text-red-500"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label>Preferred Experience Levels</Label>
                              <Select
                                value=""
                                onValueChange={(value) => addExperienceLevel(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select experience level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="entry">Entry Level</SelectItem>
                                  <SelectItem value="junior">Junior</SelectItem>
                                  <SelectItem value="mid">Mid Level</SelectItem>
                                  <SelectItem value="senior">Senior</SelectItem>
                                  <SelectItem value="lead">Lead</SelectItem>
                                  <SelectItem value="executive">Executive</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {professionalData.jobPreferences.preferredExperienceLevels.map((level, index) => (
                                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                                    {level}
                                    <button
                                      onClick={() => removeExperienceLevel(level)}
                                      className="ml-1 hover:text-red-500"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Work Mode Preferences */}
                          <div>
                            <Label>Preferred Work Mode</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {['on-site', 'remote', 'hybrid'].map((mode) => (
                                <div key={mode} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`workMode-${mode}`}
                                    checked={professionalData.jobPreferences.preferredWorkMode.includes(mode)}
                                    onCheckedChange={(checked) => toggleWorkMode(mode, !!checked)}
                                  />
                                  <Label htmlFor={`workMode-${mode}`} className="capitalize">
                                    {mode}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Preferred Skills */}
                          <div>
                            <Label>Preferred Skills</Label>
                            <div className="flex flex-wrap gap-2 mt-2 mb-3">
                              {(professionalData.jobPreferences?.preferredSkills || []).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  {skill}
                                  <button
                                    onClick={() => removePreferredSkill(skill)}
                                    className="ml-1 hover:text-red-500"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <Input
                                value={newPreferredSkill}
                                onChange={(e) => setNewPreferredSkill(e.target.value)}
                                placeholder="e.g., React, Python, Machine Learning"
                                onKeyPress={(e) => e.key === 'Enter' && addPreferredSkill()}
                              />
                              <Button type="button" onClick={addPreferredSkill} size="sm">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Salary Preferences */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label>Preferred Minimum Salary (LPA)</Label>
                              <Input
                                type="number"
                                value={professionalData.jobPreferences.preferredSalaryMin}
                                onChange={(e) => setProfessionalData(prev => ({
                                  ...prev,
                                  jobPreferences: {
                                    ...prev.jobPreferences,
                                    preferredSalaryMin: e.target.value
                                  }
                                }))}
                                placeholder="e.g., 5"
                              />
                            </div>
                            <div>
                              <Label>Preferred Maximum Salary (LPA)</Label>
                              <Input
                                type="number"
                                value={professionalData.jobPreferences.preferredSalaryMax}
                                onChange={(e) => setProfessionalData(prev => ({
                                  ...prev,
                                  jobPreferences: {
                                    ...prev.jobPreferences,
                                    preferredSalaryMax: e.target.value
                                  }
                                }))}
                                placeholder="e.g., 15"
                              />
                            </div>
                          </div>

                          {/* Additional Preferences */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="willingToTravel"
                                checked={professionalData.jobPreferences.willingToTravel}
                                onCheckedChange={(checked) => setProfessionalData(prev => ({
                                  ...prev,
                                  jobPreferences: {
                                    ...prev.jobPreferences,
                                    willingToTravel: !!checked
                                  }
                                }))}
                              />
                              <Label htmlFor="willingToTravel">Willing to travel for work</Label>
                            </div>
                          </div>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-4">
                          <Label>Social Links</Label>
                          <div>
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input
                              id="linkedin"
                              value={professionalData.socialLinks.linkedin}
                              onChange={(e) => setProfessionalData(prev => ({ 
                                ...prev, 
                                socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                              }))}
                              placeholder="https://linkedin.com/in/yourprofile"
                            />
                          </div>
                          <div>
                            <Label htmlFor="github">GitHub</Label>
                            <Input
                              id="github"
                              value={professionalData.socialLinks.github}
                              onChange={(e) => setProfessionalData(prev => ({ 
                                ...prev, 
                                socialLinks: { ...prev.socialLinks, github: e.target.value }
                              }))}
                              placeholder="https://github.com/yourusername"
                            />
                          </div>
                          <div>
                            <Label htmlFor="portfolio">Portfolio</Label>
                            <Input
                              id="portfolio"
                              value={professionalData.socialLinks.portfolio}
                              onChange={(e) => setProfessionalData(prev => ({ 
                                ...prev, 
                                socialLinks: { ...prev.socialLinks, portfolio: e.target.value }
                              }))}
                              placeholder="https://yourportfolio.com"
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Button 
                            onClick={saveProfessionalData}
                            disabled={saving}
                            className="flex-1"
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => cancelEdit('professional')}
                            disabled={saving}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Headline</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {user.headline || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {user.currentLocation || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Summary</p>
                        <p className="font-medium text-slate-900 dark:text-white line-clamp-3">
                          {user.summary || 'No summary provided'}
                        </p>
                      </div>
                        {user.skills && user.skills.length > 0 && (
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {user.skills.slice(0, 5).map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                              ))}
                              {user.skills.length > 5 && (
                                <Badge variant="outline">+{user.skills.length - 5} more</Badge>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Resumes Tab */}
            <TabsContent value="resumes" className="space-y-6">
              <ResumeManagement />
              
              {resumeStats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                          {resumeStats.totalResumes}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">Total Resumes</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                          {resumeStats.totalViews}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">Total Views</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                          {resumeStats.totalDownloads}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">Total Downloads</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-300">Job Alerts</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-300">Application Updates</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-300">Profile Views</span>
                        <Badge variant="secondary">Disabled</Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Notifications
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Billing & Subscription</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-300">Current Plan</span>
                        <Badge variant="outline">Free</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-300">Next Billing</span>
                        <span className="text-sm text-slate-900 dark:text-white">-</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <LogOut className="w-5 h-5" />
                      <span>Account Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Change Email Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <div>
                            <h3 className="font-medium">Change Email</h3>
                            <p className="text-sm text-slate-500">Update your email address</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowChangeEmail(!showChangeEmail)}
                        >
                          {showChangeEmail ? 'Cancel' : 'Change'}
                        </Button>
                      </div>
                      
                      {showChangeEmail && (
                        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          <div>
                            <Label htmlFor="new-email">New Email Address</Label>
                            <Input
                              id="new-email"
                              type="email"
                              value={emailData.newEmail}
                              onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})}
                              placeholder="Enter new email address"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email-password">Current Password</Label>
                            <Input
                              id="email-password"
                              type="password"
                              value={emailData.currentPassword}
                              onChange={(e) => setEmailData({...emailData, currentPassword: e.target.value})}
                              placeholder="Enter current password"
                            />
                          </div>
                          <Button 
                            onClick={handleChangeEmail}
                            disabled={securityLoading}
                            className="w-full"
                          >
                            {securityLoading ? 'Updating...' : 'Update Email'}
                          </Button>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Change Phone Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-5 h-5 text-green-600" />
                          <div>
                            <h3 className="font-medium">Change Phone</h3>
                            <p className="text-sm text-slate-500">Update your phone number</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowChangePhone(!showChangePhone)}
                        >
                          {showChangePhone ? 'Cancel' : 'Change'}
                        </Button>
                      </div>
                      
                      {showChangePhone && (
                        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          <div>
                            <Label htmlFor="new-phone">New Phone Number</Label>
                            <Input
                              id="new-phone"
                              type="tel"
                              value={phoneData.newPhone}
                              onChange={(e) => setPhoneData({...phoneData, newPhone: e.target.value})}
                              placeholder="Enter new phone number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone-password">Current Password</Label>
                            <Input
                              id="phone-password"
                              type="password"
                              value={phoneData.currentPassword}
                              onChange={(e) => setPhoneData({...phoneData, currentPassword: e.target.value})}
                              placeholder="Enter current password"
                            />
                          </div>
                          <Button 
                            onClick={handleChangePhone}
                            disabled={securityLoading}
                            className="w-full"
                          >
                            {securityLoading ? 'Updating...' : 'Update Phone'}
                          </Button>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Change Password Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-red-600" />
                          <div>
                            <h3 className="font-medium">Change Password</h3>
                            <p className="text-sm text-slate-500">Update your account password</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowChangePassword(!showChangePassword)}
                        >
                          {showChangePassword ? 'Cancel' : 'Change'}
                        </Button>
                      </div>
                      
                      {showChangePassword && (
                        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          <div>
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                              id="current-password"
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              placeholder="Enter current password"
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                              id="new-password"
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              placeholder="Enter new password"
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              placeholder="Confirm new password"
                            />
                          </div>
                          <Button 
                            onClick={handleChangePassword}
                            disabled={securityLoading}
                            className="w-full"
                          >
                            {securityLoading ? 'Updating...' : 'Update Password'}
                          </Button>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
