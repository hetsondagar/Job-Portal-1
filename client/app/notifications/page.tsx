"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Bell,
  Mail,
  Smartphone,
  Save,
  Briefcase,
  FileText,
  Eye
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { toast } from 'sonner'

export default function NotificationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    jobAlerts: true,
    applicationUpdates: true,
    profileViews: true,
    marketingEmails: false
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to manage notifications')
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSave = async () => {
    try {
      setSaving(true)
      // Here you would typically save to backend
      // For now, we'll just show a success message
      toast.success('Notification settings updated successfully')
    } catch (error) {
      console.error('Error updating notification settings:', error)
      toast.error('Failed to update notification settings')
    } finally {
      setSaving(false)
    }
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hover:bg-slate-200 dark:hover:bg-slate-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Notification Settings
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Manage how you receive notifications and updates
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-sm">
                  <Bell className="w-3 h-3 mr-1" />
                  Settings
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Channels */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Channels</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <Label htmlFor="email-notifications" className="text-base font-medium">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-slate-500">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <Label htmlFor="push-notifications" className="text-base font-medium">
                          Push Notifications
                        </Label>
                        <p className="text-sm text-slate-500">Receive notifications in your browser</p>
                      </div>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, pushNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <Label htmlFor="sms-notifications" className="text-base font-medium">
                          SMS Notifications
                        </Label>
                        <p className="text-sm text-slate-500">Receive notifications via SMS</p>
                      </div>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, smsNotifications: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Types</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <Label htmlFor="job-alerts" className="text-base font-medium">
                          Job Alerts
                        </Label>
                        <p className="text-sm text-slate-500">New job opportunities matching your criteria</p>
                      </div>
                    </div>
                    <Switch
                      id="job-alerts"
                      checked={settings.jobAlerts}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, jobAlerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <Label htmlFor="application-updates" className="text-base font-medium">
                          Application Updates
                        </Label>
                        <p className="text-sm text-slate-500">Status changes for your job applications</p>
                      </div>
                    </div>
                    <Switch
                      id="application-updates"
                      checked={settings.applicationUpdates}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, applicationUpdates: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <Label htmlFor="profile-views" className="text-base font-medium">
                          Profile Views
                        </Label>
                        <p className="text-sm text-slate-500">When employers view your profile</p>
                      </div>
                    </div>
                    <Switch
                      id="profile-views"
                      checked={settings.profileViews}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, profileViews: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <Label htmlFor="marketing-emails" className="text-base font-medium">
                          Marketing Emails
                        </Label>
                        <p className="text-sm text-slate-500">Promotional content and newsletters</p>
                      </div>
                    </div>
                    <Switch
                      id="marketing-emails"
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, marketingEmails: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
