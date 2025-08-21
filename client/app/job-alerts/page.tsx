"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  ArrowLeft,
  Bell,
  Plus,
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Edit,
  Trash2,
  Save
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { toast } from 'sonner'
import { apiService, JobAlert } from '@/lib/api'

export default function JobAlertsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [alerts, setAlerts] = useState<JobAlert[]>([])
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    locations: '',
    categories: '',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    emailEnabled: true,
    pushEnabled: false,
    smsEnabled: false
  })

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to manage job alerts')
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !loading) {
      fetchAlerts()
    }
  }, [user, loading])

  const fetchAlerts = async () => {
    try {
      setAlertsLoading(true)
      const response = await apiService.getJobAlerts()
      if (response.success && response.data) {
        setAlerts(response.data)
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
      toast.error('Failed to load job alerts')
    } finally {
      setAlertsLoading(false)
    }
  }

  const handleCreateAlert = async () => {
    try {
      const alertData = {
        ...formData,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
        locations: formData.locations ? formData.locations.split(',').map(l => l.trim()) : [],
        categories: formData.categories ? formData.categories.split(',').map(c => c.trim()) : [],
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined
      }

      const response = await apiService.createJobAlert(alertData)
      if (response.success) {
        toast.success('Job alert created successfully')
        setShowCreateForm(false)
        resetForm()
        fetchAlerts()
      }
    } catch (error) {
      console.error('Error creating alert:', error)
      toast.error('Failed to create job alert')
    }
  }

  const handleUpdateAlert = async () => {
    if (!editingAlert) return

    try {
      const alertData = {
        ...formData,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
        locations: formData.locations ? formData.locations.split(',').map(l => l.trim()) : [],
        categories: formData.categories ? formData.categories.split(',').map(c => c.trim()) : [],
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined
      }

      const response = await apiService.updateJobAlert(editingAlert.id, alertData)
      if (response.success) {
        toast.success('Job alert updated successfully')
        setEditingAlert(null)
        resetForm()
        fetchAlerts()
      }
    } catch (error) {
      console.error('Error updating alert:', error)
      toast.error('Failed to update job alert')
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const response = await apiService.deleteJobAlert(alertId)
      if (response.success) {
        toast.success('Job alert deleted successfully')
        fetchAlerts()
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
      toast.error('Failed to delete job alert')
    }
  }

  const handleEditAlert = (alert: JobAlert) => {
    setEditingAlert(alert)
    setFormData({
      name: alert.name,
      keywords: alert.keywords?.join(', ') || '',
      locations: alert.locations?.join(', ') || '',
      categories: alert.categories?.join(', ') || '',
      experienceLevel: alert.experienceLevel || '',
      salaryMin: alert.salaryMin?.toString() || '',
      salaryMax: alert.salaryMax?.toString() || '',
      frequency: alert.frequency,
      emailEnabled: alert.emailEnabled,
      pushEnabled: alert.pushEnabled,
      smsEnabled: alert.smsEnabled
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      keywords: '',
      locations: '',
      categories: '',
      experienceLevel: '',
      salaryMin: '',
      salaryMax: '',
      frequency: 'daily',
      emailEnabled: true,
      pushEnabled: false,
      smsEnabled: false
    })
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Job Alerts
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage your job alerts and saved searches
            </p>
          </div>

          {/* Create/Edit Form */}
          {(showCreateForm || editingAlert) && (
            <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>
                  {editingAlert ? 'Edit Job Alert' : 'Create New Job Alert'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Alert Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Software Engineer in NYC"
                    />
                  </div>
                  <div>
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="e.g., React, Node.js, TypeScript"
                    />
                  </div>
                  <div>
                    <Label htmlFor="locations">Locations</Label>
                    <Input
                      id="locations"
                      value={formData.locations}
                      onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                      placeholder="e.g., New York, Remote, San Francisco"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categories">Job Categories</Label>
                    <Input
                      id="categories"
                      value={formData.categories}
                      onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                      placeholder="e.g., Technology, Engineering, Design"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="frequency">Alert Frequency</Label>
                    <Select value={formData.frequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setFormData({ ...formData, frequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="salaryMin">Minimum Salary</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                      placeholder="e.g., 50000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryMax">Maximum Salary</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                      placeholder="e.g., 150000"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Notification Settings</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailEnabled"
                      checked={formData.emailEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, emailEnabled: checked })}
                    />
                    <Label htmlFor="emailEnabled">Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pushEnabled"
                      checked={formData.pushEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, pushEnabled: checked })}
                    />
                    <Label htmlFor="pushEnabled">Push Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smsEnabled"
                      checked={formData.smsEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, smsEnabled: checked })}
                    />
                    <Label htmlFor="smsEnabled">SMS Notifications</Label>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={editingAlert ? handleUpdateAlert : handleCreateAlert}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingAlert ? 'Update Alert' : 'Create Alert'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowCreateForm(false)
                    setEditingAlert(null)
                    resetForm()
                  }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerts List */}
          {alertsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No job alerts yet
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Create your first job alert to get notified about new opportunities
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {alert.name}
                          </h3>
                          <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                            {alert.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {alert.frequency}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
                          {alert.keywords && alert.keywords.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Search className="w-4 h-4" />
                              <span>{alert.keywords.join(', ')}</span>
                            </div>
                          )}
                          {alert.locations && alert.locations.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{alert.locations.join(', ')}</span>
                            </div>
                          )}
                          {alert.experienceLevel && (
                            <div className="flex items-center space-x-1">
                              <Briefcase className="w-4 h-4" />
                              <span className="capitalize">{alert.experienceLevel}</span>
                            </div>
                          )}
                          {(alert.salaryMin || alert.salaryMax) && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>
                                {alert.salaryMin && `$${alert.salaryMin.toLocaleString()}`}
                                {alert.salaryMin && alert.salaryMax && ' - '}
                                {alert.salaryMax && `$${alert.salaryMax.toLocaleString()}`}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                          {alert.emailEnabled && <span>📧 Email</span>}
                          {alert.pushEnabled && <span>🔔 Push</span>}
                          {alert.smsEnabled && <span>📱 SMS</span>}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleEditAlert(alert)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteAlert(alert.id)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

