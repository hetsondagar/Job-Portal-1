"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { EmployerNavbar } from "@/components/employer-navbar"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line } from "recharts"

export default function EmployerAnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Recruiter-level
  const [myActivitiesCount, setMyActivitiesCount] = useState({ accessed: 0, contacted: 0, shortlisted: 0 })

  // Company-admin level
  const [companyTotals, setCompanyTotals] = useState({ accessed: 0, contacted: 0, shortlisted: 0 })
  const [perRecruiter, setPerRecruiter] = useState<Array<{ userId: string; name?: string; email?: string; accessed: number; contacted: number; shortlisted: number }>>([])

  // Shared charts
  const [recruiterPerformance, setRecruiterPerformance] = useState<any[]>([])

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace("/login"); return }

    // Both recruiters and admins can access analytics, but scope differs
    if (user.userType !== "employer" && user.userType !== "admin") {
      router.replace("/")
      return
    }

    // Load data
    void loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])

  const loadData = async () => {
    try {
      // Recruiter (self) activity snapshot
      // Using usage activities with filters for current user to derive quick counts.
      // Backend returns activities array; we count by type if available.
      const myActs = await apiService.getUsageActivities({ userId: user?.id, limit: 500 })
      if (myActs.success && Array.isArray(myActs.data)) {
        const counts = { accessed: 0, contacted: 0, shortlisted: 0 }
        const accessedSet = new Set([
          'profile_viewed', 'resume_view', 'resume_downloaded', 'profile_visits'
        ])
        const contactedSet = new Set([
          'contact_candidate', 'message_sent', 'application_contacted'
        ])
        const shortlistedSet = new Set([
          // most likely shortlist events
          'application_shortlisted', 'candidate_shortlisted', 'requirement_shortlist',
          // common status change pattern
          'application_status_changed',
          // fallback generic
          'shortlisted'
        ])

        for (const a of myActs.data) {
          const t = String(a.activityType || '').toLowerCase()
          if (accessedSet.has(t)) counts.accessed += 1
          if (contactedSet.has(t)) counts.contacted += 1
          if (shortlistedSet.has(t)) counts.shortlisted += 1
        }
        setMyActivitiesCount(counts)
      }

      // Recruiter leaderboard (company scoped in backend by auth user)
      const perf = await apiService.getRecruiterPerformance({})
      if (perf.success && Array.isArray(perf.data)) {
        setRecruiterPerformance(perf.data)
      }

      // Company admin view: compute totals and per recruiter aggregations from usage summary + activities
      if (user?.userType === "admin" && user.companyId) {
        const summary = await apiService.getUsageSummary()
        const activities = await apiService.getUsageActivities({ limit: 2000 })

        if (activities.success && Array.isArray(activities.data)) {
          // Build perRecruiter rollup
          const byRecruiter: Record<string, { userId: string; name?: string; email?: string; accessed: number; contacted: number; shortlisted: number }> = {}
          const accessedSet = new Set([
            'profile_viewed', 'resume_view', 'resume_downloaded', 'profile_visits'
          ])
          const contactedSet = new Set([
            'contact_candidate', 'message_sent', 'application_contacted'
          ])
          const shortlistedSet = new Set([
            'application_shortlisted', 'candidate_shortlisted', 'requirement_shortlist',
            'application_status_changed',
            'shortlisted'
          ])
          for (const a of activities.data) {
            const uid = a.userId || a.user?.id
            if (!uid) continue
            if (!byRecruiter[uid]) {
              byRecruiter[uid] = { userId: uid, name: a.user?.name, email: a.user?.email, accessed: 0, contacted: 0, shortlisted: 0 }
            }
            const t = String(a.activityType || '').toLowerCase()
            if (accessedSet.has(t)) byRecruiter[uid].accessed += 1
            if (contactedSet.has(t)) byRecruiter[uid].contacted += 1
            if (shortlistedSet.has(t)) byRecruiter[uid].shortlisted += 1
          }
          const rows = Object.values(byRecruiter)
          setPerRecruiter(rows)

          // Totals
          setCompanyTotals(rows.reduce((acc, r) => ({
            accessed: acc.accessed + r.accessed,
            contacted: acc.contacted + r.contacted,
            shortlisted: acc.shortlisted + r.shortlisted,
          }), { accessed: 0, contacted: 0, shortlisted: 0 }))
        }

        // Optionally merge recruiter identity from summary
        if (summary.success && Array.isArray(summary.data)) {
          const identityIndex = new Map(summary.data.map((r: any) => [r.userId, { name: r.name, email: r.email }]))
          setPerRecruiter(prev => prev.map(r => ({ ...r, ...identityIndex.get(r.userId) })))
        }
      }
    } catch (e) {
      // Fail silently to avoid breaking existing flows
      // console.error(e)
    }
  }

  const perRecruiterChart = useMemo(() => perRecruiter.map(r => ({ recruiter: r.email || r.name || r.userId, accessed: r.accessed, contacted: r.contacted, shortlisted: r.shortlisted })), [perRecruiter])

  if (loading) return <div className="p-6">Loading...</div>
  if (!user || (user.userType !== "employer" && user.userType !== "admin")) return null

  const isCompanyAdmin = user.userType === "admin" && !!user.companyId

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar />
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <div className="text-sm text-gray-600">{isCompanyAdmin ? "Company Admin View" : "Recruiter View"}</div>
        </div>

        {/* Recruiter (self) quick stats */}
        <section className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Your Activity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border rounded p-3">
              <div className="text-gray-600 text-sm">Candidates Accessed</div>
              <div className="text-2xl font-semibold">{myActivitiesCount.accessed}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-gray-600 text-sm">Candidates Contacted</div>
              <div className="text-2xl font-semibold">{myActivitiesCount.contacted}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-gray-600 text-sm">Candidates Shortlisted</div>
              <div className="text-2xl font-semibold">{myActivitiesCount.shortlisted}</div>
            </div>
          </div>
        </section>

        {/* Recruiter leaderboard (available to all) */}
        <section className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Recruiter Performance</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <LineChart data={recruiterPerformance as any[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="email" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="activityCount" name="Activities" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Company admin only: company-wide analytics */}
        {isCompanyAdmin && (
          <section className="bg-white border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">Company-wide Analytics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="border rounded p-3">
                <div className="text-gray-600 text-sm">Total Accessed</div>
                <div className="text-2xl font-semibold">{companyTotals.accessed}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-gray-600 text-sm">Total Contacted</div>
                <div className="text-2xl font-semibold">{companyTotals.contacted}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-gray-600 text-sm">Total Shortlisted</div>
                <div className="text-2xl font-semibold">{companyTotals.shortlisted}</div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer>
                <BarChart data={perRecruiterChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="recruiter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accessed" name="Accessed" fill="#60a5fa" />
                  <Bar dataKey="contacted" name="Contacted" fill="#34d399" />
                  <Bar dataKey="shortlisted" name="Shortlisted" fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}


