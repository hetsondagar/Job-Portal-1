"use client"

import { useState, useEffect } from "react"
import { Building2, Edit, Save, X, Loader2, Globe, MapPin, Phone, Mail, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { apiService } from "@/lib/api"

interface CompanyManagementProps {
  companyId: string
  onCompanyUpdated: () => void
}

export function CompanyManagement({ companyId, onCompanyUpdated }: CompanyManagementProps) {
  const [company, setCompany] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  const companySizes = [
    "1-50", "51-200", "201-500", "500-1000", "1000+"
  ]

  const industries = [
    "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
    "Retail", "Consulting", "Marketing", "Real Estate", "Other"
  ]

  useEffect(() => {
    loadCompanyData()
  }, [companyId])

  const loadCompanyData = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getCompany(companyId)
      if (response.success && response.data) {
        setCompany(response.data)
        setFormData(response.data)
      } else {
        toast.error("Failed to load company data")
      }
    } catch (error: any) {
      console.error("Error loading company data:", error)
      toast.error("Failed to load company data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await apiService.updateCompany(companyId, formData)
      if (response.success) {
        setCompany(response.data)
        setIsEditing(false)
        toast.success("Company updated successfully")
        onCompanyUpdated()
      } else {
        toast.error(response.message || "Failed to update company")
      }
    } catch (error: any) {
      console.error("Error updating company:", error)
      toast.error("Failed to update company")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(company)
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading company data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!company) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-slate-500">
            Company data not found
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Company Profile</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Manage your company information
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          // Edit Form
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry || ""} onValueChange={(value) => handleInputChange("industry", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select value={formData.companySize || ""} onValueChange={(value) => handleInputChange("companySize", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://company.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="about">About Company</Label>
              <Textarea
                id="about"
                value={formData.about || ""}
                onChange={(e) => handleInputChange("about", e.target.value)}
                placeholder="Company description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whyJoinUs">Why Join Us</Label>
              <Textarea
                id="whyJoinUs"
                value={formData.whyJoinUs || ""}
                onChange={(e) => handleInputChange("whyJoinUs", e.target.value)}
                placeholder="Tell jobseekers why they should join your company"
                rows={5}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Company Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Company Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@company.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Company Address</Label>
              <Textarea
                id="address"
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Full company address"
                rows={2}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Display View
          <div className="space-y-6">
            {/* Company Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-sm text-slate-600 dark:text-slate-300">Company</div>
                <div className="font-semibold text-slate-900 dark:text-white">{company.name}</div>
              </div>
              
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-sm text-slate-600 dark:text-slate-300">Size</div>
                <div className="font-semibold text-slate-900 dark:text-white">{company.companySize || 'N/A'}</div>
              </div>
              
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Globe className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-sm text-slate-600 dark:text-slate-300">Industry</div>
                <div className="font-semibold text-slate-900 dark:text-white">{company.industry || 'N/A'}</div>
              </div>
              
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-sm text-slate-600 dark:text-slate-300">Status</div>
                <Badge variant={company.companyStatus === 'active' ? 'default' : 'secondary'}>
                  {company.companyStatus || 'N/A'}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Company Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-slate-500">Company Name</Label>
                    <p className="font-medium">{company.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-slate-500">Industry</Label>
                    <p className="font-medium">{company.industry || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-slate-500">Company Size</Label>
                    <p className="font-medium">{company.companySize || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-slate-500">About</Label>
                    <p className="text-slate-700 dark:text-slate-300">
                      {company.about || 'No description provided'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-sm text-slate-500">Website</Label>
                      <p className="font-medium">
                        {company.website ? (
                          <a href={company.website} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline">
                            {company.website}
                          </a>
                        ) : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-sm text-slate-500">Phone</Label>
                      <p className="font-medium">{company.phone || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-sm text-slate-500">Email</Label>
                      <p className="font-medium">{company.email || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-sm text-slate-500">Address</Label>
                      <p className="font-medium">{company.address || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
