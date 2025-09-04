"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Edit, Copy, Trash2, Eye, BookOpen, Users, User, Star, Clock, Globe, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface JobTemplate {
  id: string
  name: string
  description: string
  category: string
  isPublic: boolean
  usageCount: number
  lastUsedAt: string
  tags: string[]
  templateData: any
  createdBy: string
  createdAt: string
  updatedAt: string
}

export default function JobTemplatesPage() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<JobTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<JobTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTemplates()
    }
  }, [user])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await apiService.getJobTemplates({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined
      })
      
      if (response.success) {
        setTemplates(response.data || [])
      } else {
        toast.error('Failed to fetch templates')
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchTemplates()
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchTemplates()
  }

  const handleCreateTemplate = async (formData: any) => {
    try {
      setCreating(true)
      const response = await apiService.createJobTemplate(formData)
      
      if (response.success) {
        toast.success('Template created successfully')
        setIsCreateDialogOpen(false)
        fetchTemplates()
      } else {
        toast.error(response.message || 'Failed to create template')
      }
    } catch (error) {
      console.error('Error creating template:', error)
      toast.error('Failed to create template')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateTemplate = async (id: string, formData: any) => {
    try {
      setUpdating(true)
      const response = await apiService.updateJobTemplate(id, formData)
      
      if (response.success) {
        toast.success('Template updated successfully')
        setIsEditDialogOpen(false)
        setEditingTemplate(null)
        fetchTemplates()
      } else {
        toast.error(response.message || 'Failed to update template')
      }
    } catch (error) {
      console.error('Error updating template:', error)
      toast.error('Failed to update template')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      const response = await apiService.deleteJobTemplate(id)
      
      if (response.success) {
        toast.success('Template deleted successfully')
        fetchTemplates()
      } else {
        toast.error(response.message || 'Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    }
  }

  const handleTogglePublic = async (id: string) => {
    try {
      const response = await apiService.toggleTemplatePublic(id)
      
      if (response.success) {
        toast.success(response.message || 'Template visibility updated')
        fetchTemplates()
      } else {
        toast.error(response.message || 'Failed to update template visibility')
      }
    } catch (error) {
      console.error('Error toggling template visibility:', error)
      toast.error('Failed to update template visibility')
    }
  }

  const handleUseTemplate = async (id: string) => {
    try {
      const response = await apiService.useJobTemplate(id)
      
      if (response.success) {
        toast.success('Template usage recorded')
        fetchTemplates()
      } else {
        toast.error(response.message || 'Failed to record template usage')
      }
    } catch (error) {
      console.error('Error recording template usage:', error)
      toast.error('Failed to record template usage')
    }
  }

  const handleCreateJobFromTemplate = async (templateId: string) => {
    try {
      // Create job from template
      const response = await apiService.createJobFromTemplate(templateId)
      
      if (response.success) {
        const job = response.data
        toast.success('Job created from template successfully!')
        
        // Navigate to edit the newly created job
        window.location.href = `/employer-dashboard/post-job?draft=${job.id}`
      } else {
        toast.error(response.message || 'Failed to create job from template')
      }
    } catch (error) {
      console.error('Error creating job from template:', error)
      toast.error('Failed to create job from template')
    }
  }

  const handleEditTemplate = (template: JobTemplate) => {
    setEditingTemplate(template)
    setIsEditDialogOpen(true)
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical": return <BookOpen className="w-4 h-4" />
      case "non-technical": return <Users className="w-4 h-4" />
      case "management": return <Star className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "technical": return "bg-blue-100 text-blue-800"
      case "non-technical": return "bg-green-100 text-green-800"
      case "management": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <EmployerNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading templates...</p>
          </div>
        </div>
        <EmployerFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <EmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Job Templates</h1>
            <p className="text-slate-600">Create and manage reusable job posting templates</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a reusable template for job postings
                </DialogDescription>
              </DialogHeader>
              <CreateTemplateForm onSubmit={handleCreateTemplate} loading={creating} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Search Templates</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Category</Label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="non-technical">Non-Technical</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full" onClick={handleSearch}>
                  <Filter className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(template.category)}
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Ownership indicator */}
                    {template.createdBy === user?.id ? (
                      <Badge variant="outline" className="text-xs flex items-center bg-blue-50 text-blue-700 border-blue-200">
                        <User className="w-3 h-3 mr-1" />
                        My Template
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs flex items-center bg-gray-50 text-gray-600 border-gray-200">
                        <Users className="w-3 h-3 mr-1" />
                        Shared
                      </Badge>
                    )}
                    {template.isPublic ? (
                      <Badge variant="outline" className="text-xs flex items-center">
                        <Globe className="w-3 h-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs flex items-center">
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Used {template.usageCount} times</span>
                    <span>Last used: {new Date(template.lastUsedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Primary Action - Create Job */}
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      onClick={() => handleCreateJobFromTemplate(template.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Job from Template
                    </Button>
                    
                    {/* Secondary Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        {/* Only show edit button for user's own templates */}
                        {template.createdBy === user?.id && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditTemplate(template)}
                            title="Edit Template"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUseTemplate(template.id)}
                          title="Copy Template"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {/* Only show toggle public/private button for user's own templates */}
                        {template.createdBy === user?.id && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTogglePublic(template.id)}
                            title={template.isPublic ? "Make Private" : "Make Public"}
                          >
                            {template.isPublic ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                      {/* Only show delete button for user's own templates */}
                      {template.createdBy === user?.id && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteTemplate(template.id)}
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No templates found</h3>
              <p className="text-slate-600 mb-4">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search criteria'
                  : 'Create your first job template to get started'
                }
              </p>
              {!searchQuery && selectedCategory === 'all' && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update your job template
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <EditTemplateForm 
              template={editingTemplate} 
              onSubmit={(data) => handleUpdateTemplate(editingTemplate.id, data)}
              loading={updating}
            />
          )}
        </DialogContent>
      </Dialog>

      <EmployerFooter />
    </div>
  )
}

function CreateTemplateForm({ onSubmit, loading }: { onSubmit: (data: any) => void, loading: boolean }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    isPublic: false,
    tags: [] as string[],
    templateData: {
      title: "",
      department: "",
      location: "",
      type: "",
      experience: "",
      salary: "",
      description: "",
      requirements: "",
      benefits: "",
      skills: []
    }
  })
  const [currentTag, setCurrentTag] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }
    onSubmit(formData)
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Template Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Senior Software Engineer"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="non-technical">Non-Technical</SelectItem>
              <SelectItem value="management">Management</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what this template is for..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <div className="flex space-x-2 mb-2">
          <Input
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            placeholder="Add a tag..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="flex items-center">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isPublic" 
          checked={formData.isPublic}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked as boolean }))}
        />
        <Label htmlFor="isPublic">Make this template public</Label>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Template'}
        </Button>
      </div>
    </form>
  )
}

function EditTemplateForm({ template, onSubmit, loading }: { 
  template: JobTemplate, 
  onSubmit: (data: any) => void, 
  loading: boolean 
}) {
  const [formData, setFormData] = useState({
    name: template.name,
    description: template.description,
    category: template.category,
    isPublic: template.isPublic,
    tags: template.tags,
    templateData: template.templateData
  })
  const [currentTag, setCurrentTag] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }
    onSubmit(formData)
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Template Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Senior Software Engineer"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="non-technical">Non-Technical</SelectItem>
              <SelectItem value="management">Management</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what this template is for..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <div className="flex space-x-2 mb-2">
          <Input
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            placeholder="Add a tag..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="flex items-center">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isPublic" 
          checked={formData.isPublic}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked as boolean }))}
        />
        <Label htmlFor="isPublic">Make this template public</Label>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Template'}
        </Button>
      </div>
    </form>
  )
}
