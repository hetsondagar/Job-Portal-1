"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
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
    }
  })
  
  const [newSkill, setNewSkill] = useState('')
  const [newLanguage, setNewLanguage] = useState('')

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
        expectedSalary: user.expectedSalary || '',
        noticePeriod: user.noticePeriod || '',
        willingToRelocate: user.willingToRelocate || false,
        skills: user.skills || [],
        languages: user.languages || [],
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || '',
          github: user.socialLinks?.github || '',
          portfolio: user.socialLinks?.portfolio || ''
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

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Logout failed')
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
      const response = await apiService.updateProfile(professionalData)
      
      if (response.success) {
        await refreshUser()
        setEditingProfessional(false)
        toast.success('Professional details updated successfully')
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />
      
      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link href="/dashboard">
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
                      src={user.avatar ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.avatar}` : undefined} 
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Account Security</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-300">Password</span>
                        <Badge variant="default">Strong</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-300">Two-Factor Auth</span>
                        <Badge variant="secondary">Disabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-300">Login History</span>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Security Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <LogOut className="w-5 h-5" />
                      <span>Account Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="w-4 h-4 mr-2" />
                        Change Email
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Phone className="w-4 h-4 mr-2" />
                        Change Phone
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
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
