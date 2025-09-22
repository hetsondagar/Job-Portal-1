"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { apiService, JobAlert } from '@/lib/api'

export default function GulfAlertsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [alerts, setAlerts] = useState<JobAlert[]>([])
  const [alertsLoading, setAlertsLoading] = useState(true)

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


