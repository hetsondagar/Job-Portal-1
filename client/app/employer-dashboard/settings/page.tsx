"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Building2, Mail, Phone, MapPin, Shield, Bell, CreditCard, Settings, LogOut, Edit, Save, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export default function EmployerSettingsPage() {
  const router = useRouter()
  const { toast: toastNotification } = useToast()
  const { user, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  // Dynamic user data from API
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    designation: "",
    location: "",
    avatar: "",
    companyLogo: "",
    companySize: "",
    industry: "",
    website: "",
    address: "",
    about: "",
    notifications: {
      email: true,
      sms: false,
      push: true,
      jobApplications: true,
      candidateMatches: true,
      systemUpdates: false,
      marketing: false
    },
    subscription: {
      plan: "Basic",
      status: "Active",
      nextBilling: "",
      features: ["Job Postings", "Basic Analytics", "Email Support"]
    }
  })

  const [formData, setFormData] = useState(userData)

  // Load user and company data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return
      
      try {
        setLoadingData(true)
        console.log('🔄 Loading employer profile data for user:', user.id)

        // Load user profile data
        const userProfileResponse = await apiService.getUserProfile()
        if (userProfileResponse.success && userProfileResponse.data?.user) {
          const userProfile = userProfileResponse.data.user
          console.log('✅ User profile loaded:', userProfile)
          
          // Load company data if user has a company
          let companyData = null
          if (userProfile.companyId) {
            try {
              const companyResponse = await apiService.getCompany(userProfile.companyId)
              if (companyResponse.success && companyResponse.data) {
                companyData = companyResponse.data
                console.log('✅ Company data loaded:', companyData)
              }
            } catch (error) {
              console.error('❌ Error loading company data:', error)
            }
          }

          // Combine user and company data
          const combinedData = {
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            email: userProfile.email || '',
            phone: userProfile.phone || '',
            company: companyData?.name || '',
            designation: userProfile.headline || '',
            location: userProfile.currentLocation || '',
            avatar: userProfile.avatar || '',
            companyLogo: companyData?.logo || '',
            companySize: companyData?.companySize || '',
            industry: companyData?.industry || '',
            website: companyData?.website || '',
            address: companyData?.address || '',
            about: companyData?.description || '',
            notifications: {
              email: true,
              sms: false,
              push: true,
              jobApplications: true,
              candidateMatches: true,
              systemUpdates: false,
              marketing: false
            },
            subscription: {
              plan: "Basic",
              status: "Active",
              nextBilling: "",
              features: ["Job Postings", "Basic Analytics", "Email Support"]
            }
          }

          setUserData(combinedData)
          setFormData(combinedData)
          console.log('✅ Profile data combined and set:', combinedData)
        }
      } catch (error) {
        console.error('❌ Error loading profile data:', error)
        toast.error('Failed to load profile data')
      } finally {
        setLoadingData(false)
      }
    }

    if (user && !loading) {
      loadProfileData()
    }
  }, [user, loading])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      console.log('💾 Saving employer profile data:', formData)

      // Update user profile
      const userUpdateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        currentLocation: formData.location,
        headline: formData.designation
      }

      const userResponse = await apiService.updateProfile(userUpdateData)
      
      if (userResponse.success) {
        console.log('✅ User profile updated successfully')
        
        // Update company data if user has a company
        if (user?.companyId) {
          try {
            const companyUpdateData = {
              name: formData.company,
              industry: formData.industry,
              companySize: formData.companySize,
              website: formData.website,
              description: formData.about,
              address: formData.address
            }

            const companyResponse = await apiService.updateCompany(user.companyId, companyUpdateData)
            if (companyResponse.success) {
              console.log('✅ Company data updated successfully')
            }
          } catch (error) {
            console.error('❌ Error updating company data:', error)
            // Don't fail the entire save if company update fails
          }
        }

        setUserData(formData)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
        console.log('✅ Profile update completed')
      } else {
        throw new Error(userResponse.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(userData)
    setIsEditing(false)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Show loading state while checking authentication or loading data
  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <EmployerNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading profile data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      <EmployerNavbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
              <p className="text-slate-600">Manage your profile and preferences</p>
            </div>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Company</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Subscription</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={userData.avatar} alt={`${userData.firstName} ${userData.lastName}`} />
                    <AvatarFallback className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      {getInitials(userData.firstName, userData.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {userData.firstName} {userData.lastName}
                    </h3>
                    <p className="text-slate-600">{userData.designation}</p>
                    <p className="text-sm text-slate-500">{userData.company}</p>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Company Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Logo Section */}
                <div className="flex items-center space-x-6">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={userData.companyLogo} alt={userData.company} />
                    <AvatarFallback className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                      {userData.company.split(' ').map(word => word[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{userData.company}</h3>
                    <p className="text-slate-600">{userData.industry} • {userData.companySize} employees</p>
                  </div>
                </div>

                <Separator />

                {/* Company Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="designation">Your Designation</Label>
                    <Input
                      id="designation"
                      value={formData.designation}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)} disabled={!isEditing}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
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
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)} disabled={!isEditing}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
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
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Company Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="about">About Company</Label>
                    <Textarea
                      id="about"
                      value={formData.about}
                      onChange={(e) => handleInputChange('about', e.target.value)}
                      disabled={!isEditing}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">Email Notifications</h4>
                      <p className="text-sm text-slate-600">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={formData.notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">SMS Notifications</h4>
                      <p className="text-sm text-slate-600">Receive updates via SMS</p>
                    </div>
                    <Switch
                      checked={formData.notifications.sms}
                      onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">Push Notifications</h4>
                      <p className="text-sm text-slate-600">Receive browser notifications</p>
                    </div>
                    <Switch
                      checked={formData.notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">Job Applications</h4>
                      <p className="text-sm text-slate-600">Notify when candidates apply</p>
                    </div>
                    <Switch
                      checked={formData.notifications.jobApplications}
                      onCheckedChange={(checked) => handleNotificationChange('jobApplications', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">Candidate Matches</h4>
                      <p className="text-sm text-slate-600">Notify about matching candidates</p>
                    </div>
                    <Switch
                      checked={formData.notifications.candidateMatches}
                      onCheckedChange={(checked) => handleNotificationChange('candidateMatches', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Subscription Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{userData.subscription.plan} Plan</h3>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        {userData.subscription.status}
                      </Badge>
                    </div>
                    <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                      Upgrade Plan
                    </Button>
                  </div>
                  <p className="text-slate-600 mb-4">Next billing date: {userData.subscription.nextBilling}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900">Included Features:</h4>
                    <ul className="space-y-1">
                      {userData.subscription.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-slate-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" className="flex-1">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing History
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-700">Delete Account</h4>
                <p className="text-sm text-red-600">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <EmployerFooter />
    </div>
  )
} 