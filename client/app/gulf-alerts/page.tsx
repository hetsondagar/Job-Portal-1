"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Bell, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { apiService, JobAlert } from '@/lib/api'

export default function GulfAlertsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [alerts, setAlerts] = useState<JobAlert[]>([])
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<{ title: string; keywords: string; location: string; jobType: string; experienceLevel: string }>(
    { title: '', keywords: '', location: '', jobType: 'full-time', experienceLevel: 'mid' }
  )

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to view job alerts')
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
      const response = await apiService.getGulfJobAlerts()
      if (response.success && response.data) {
        setAlerts(response.data.alerts || [])
      }
    } catch (error) {
      console.error('Error fetching Gulf alerts:', error)
      setAlerts([])
    } finally {
      setAlertsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setCreating(true)
      const payload: any = {
        title: form.title || 'Gulf Job Alert',
        keywords: form.keywords ? form.keywords.split(',').map(s => s.trim()).filter(Boolean) : [],
        location: form.location || 'Gulf',
        jobType: form.jobType,
        experienceLevel: form.experienceLevel,
        isActive: true,
        region: 'gulf'
      }
      const res = await apiService.createGulfJobAlert(payload)
      if (res.success) {
        toast.success('Alert created')
        setForm({ title: '', keywords: '', location: '', jobType: 'full-time', experienceLevel: 'mid' })
        fetchAlerts()
      } else {
        toast.error(res.message || 'Failed to create alert')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to create alert')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/jobseeker-gulf-dashboard">
              <Button variant="outline" size="sm" className="border-green-600 text-green-600">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
            <CardTitle className="text-green-700">Gulf Alerts</CardTitle>
          </div>
          <Badge variant="secondary">{alerts.length}</Badge>
        </div>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-green-200 dark:border-green-800 mb-6">
          <CardHeader>
            <CardTitle className="text-green-700">Create Gulf Job Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="Keywords (comma separated)" value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} />
              <Input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              <Select value={form.jobType} onValueChange={(v) => setForm({ ...form, jobType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.experienceLevel} onValueChange={(v) => setForm({ ...form, experienceLevel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fresher">Fresher</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
              <div className="md:col-span-5 flex justify-end">
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={creating}>{creating ? 'Creating...' : 'Create Alert'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-400">
              <Bell className="w-5 h-5" />
              <span>Job Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="text-sm text-slate-600">Loading...</div>
            ) : alerts.length === 0 ? (
              <div className="text-sm text-slate-600">No job alerts yet</div>
            ) : (
              <div className="space-y-3">
                {alerts.map(a => (
                  <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded border border-green-200">
                    <div className="font-medium">{(a as any).title || 'Job Alert'}</div>
                    { (a as any).keywords && (
                      <div className="text-xs text-slate-600 mt-1">Keywords: {(a as any).keywords?.join(', ')}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


