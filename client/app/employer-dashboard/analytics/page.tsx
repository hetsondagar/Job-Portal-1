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
  const [myActivitiesCount, setMyActivitiesCount] = useState({ accessed: 0, hired: 0, shortlisted: 0 })

  // Company-admin level
  const [companyTotals, setCompanyTotals] = useState({ accessed: 0, hired: 0, shortlisted: 0 })
  const [perRecruiter, setPerRecruiter] = useState<Array<{ userId: string; name?: string; email?: string; accessed: number; hired: number; shortlisted: number }>>([])

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
      const myActs = await apiService.getUsageActivities({ userId: user?.id, limit: 1000 })
      if (myActs.success && Array.isArray(myActs.data)) {
        const counts = { accessed: 0, hired: 0, shortlisted: 0 }
        const shortlistedKeys = new Set<string>()
        const hiredKeys = new Set<string>()
        const shortlistedDebugSelf: Array<{ appKey: string; activityType: string; activityId?: string; candidate?: any; details?: any }>=[]
        const accessedSet = new Set([
          'profile_viewed', 'resume_view', 'resume_downloaded', 'profile_visits'
        ])
        const hiredSet = new Set([
          'application_hired', 'candidate_hired', 'hired'
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
          const appKey = (a.applicationId || a.details?.applicationId || a.details?.candidateId || a.id || '').toString()
          const newStatus = (a.details && (a.details.newStatus || a.details.status))?.toString().toLowerCase()
          if (hiredSet.has(t) && appKey && !hiredKeys.has(appKey)) { hiredKeys.add(appKey); counts.hired += 1 }
          // Only count shortlist events if not an 'under_review' state; if status present, require 'shortlisted'
          if (shortlistedSet.has(t) && appKey && !shortlistedKeys.has(appKey)) {
            if (newStatus && newStatus !== 'shortlisted') {
              // skip counting non-shortlisted status changes (e.g., under_review)
            } else {
              shortlistedKeys.add(appKey); counts.shortlisted += 1; shortlistedDebugSelf.push({ appKey, activityType: t, activityId: a.id, candidate: a.applicant || a.details?.candidate, details: a.details })
            }
          }
          // Status change payloads
          if (newStatus === 'hired' && appKey && !hiredKeys.has(appKey)) { hiredKeys.add(appKey); counts.hired += 1 }
          if (newStatus === 'shortlisted' && appKey && !shortlistedKeys.has(appKey)) { shortlistedKeys.add(appKey); counts.shortlisted += 1; shortlistedDebugSelf.push({ appKey, activityType: 'status_change', activityId: a.id, candidate: a.applicant || a.details?.candidate, details: a.details }) }
        }
        const selfNames = shortlistedDebugSelf.map(e => {
          const c = e.candidate || {};
          const n = (c.first_name && c.last_name) ? `${c.first_name} ${c.last_name}` : (c.name || c.email || c.fullName);
          return n || 'Unknown Candidate';
        })
        console.log('🔍 Self shortlisted candidates (names):', Array.from(new Set(selfNames)))
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
          const byRecruiter: Record<string, { userId: string; name?: string; email?: string; accessed: number; hired: number; shortlisted: number; hiredKeys: Set<string>; shortlistedKeys: Set<string>; }> = {}
          const shortlistedDebugCompany: Array<{ recruiterId: string; recruiterEmail?: string; appKey: string; activityType: string; activityId?: string; candidate?: any; details?: any }>=[]
          const accessedSet = new Set([
            'profile_viewed', 'resume_view', 'resume_downloaded', 'profile_visits'
          ])
          const hiredSet = new Set([
            'application_hired', 'candidate_hired', 'hired'
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
              byRecruiter[uid] = { userId: uid, name: a.user?.name, email: a.user?.email, accessed: 0, hired: 0, shortlisted: 0, hiredKeys: new Set(), shortlistedKeys: new Set() }
            }
            const t = String(a.activityType || '').toLowerCase()
            if (accessedSet.has(t)) byRecruiter[uid].accessed += 1
            const appKey = (a.applicationId || a.details?.applicationId || a.details?.candidateId || a.id || '').toString()
            if (hiredSet.has(t) && appKey && !byRecruiter[uid].hiredKeys.has(appKey)) { byRecruiter[uid].hiredKeys.add(appKey); byRecruiter[uid].hired += 1 }
            const newStatus = (a.details && (a.details.newStatus || a.details.status))?.toString().toLowerCase()
            if (shortlistedSet.has(t) && appKey && !byRecruiter[uid].shortlistedKeys.has(appKey)) {
              if (newStatus && newStatus !== 'shortlisted') {
                // skip non-shortlisted (e.g., under_review)
              } else {
                byRecruiter[uid].shortlistedKeys.add(appKey); byRecruiter[uid].shortlisted += 1; shortlistedDebugCompany.push({ recruiterId: uid, recruiterEmail: a.user?.email, appKey, activityType: t, activityId: a.id, candidate: a.applicant || a.details?.candidate, details: a.details })
              }
            }
            // reuse newStatus from above
            if (newStatus === 'hired' && appKey && !byRecruiter[uid].hiredKeys.has(appKey)) { byRecruiter[uid].hiredKeys.add(appKey); byRecruiter[uid].hired += 1 }
            if (newStatus === 'shortlisted' && appKey && !byRecruiter[uid].shortlistedKeys.has(appKey)) { byRecruiter[uid].shortlistedKeys.add(appKey); byRecruiter[uid].shortlisted += 1; shortlistedDebugCompany.push({ recruiterId: uid, recruiterEmail: a.user?.email, appKey, activityType: 'status_change', activityId: a.id, candidate: a.applicant || a.details?.candidate, details: a.details }) }
          }
          const rows = Object.values(byRecruiter).map(r => ({ userId: r.userId, name: r.name, email: r.email, accessed: r.accessed, hired: r.hired, shortlisted: r.shortlisted }))
          const companyNames = shortlistedDebugCompany.map(e => {
            const c = e.candidate || {};
            const n = (c.first_name && c.last_name) ? `${c.first_name} ${c.last_name}` : (c.name || c.email || c.fullName);
            return n || 'Unknown Candidate';
          })
          console.log('🔍 Company shortlisted candidates (names):', Array.from(new Set(companyNames)))
          setPerRecruiter(rows)

          // Totals
          setCompanyTotals(rows.reduce((acc, r) => ({
            accessed: acc.accessed + r.accessed,
            hired: acc.hired + r.hired,
            shortlisted: acc.shortlisted + r.shortlisted,
          }), { accessed: 0, hired: 0, shortlisted: 0 }))
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

  const perRecruiterChart = useMemo(() => perRecruiter.map(r => ({ recruiter: r.email || r.name || r.userId, accessed: r.accessed, hired: r.hired, shortlisted: r.shortlisted })), [perRecruiter])

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
              <div className="text-gray-600 text-sm">Candidates Hired</div>
              <div className="text-2xl font-semibold">{myActivitiesCount.hired}</div>
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
                <div className="text-gray-600 text-sm">Total Hired</div>
                <div className="text-2xl font-semibold">{companyTotals.hired}</div>
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
                  <Bar dataKey="hired" name="Hired" fill="#34d399" />
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


