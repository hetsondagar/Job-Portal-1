"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, MapPin, Briefcase, Search, Loader2, Globe } from "lucide-react"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function GulfCompaniesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [companies, setCompanies] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Check if user has access to Gulf pages
  const [accessDenied, setAccessDenied] = useState(false)
  
  useEffect(() => {
    if (!authLoading && user && user.region !== 'gulf') {
      setAccessDenied(true)
      return
    }
  }, [user, authLoading])

  const debouncedSearch = useMemo(() => {
    let t: any
    return (value: string) => {
      if (t) clearTimeout(t)
      t = setTimeout(() => {
        setPage(1)
        setSearch(value)
      }, 300)
    }
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      setError("")
      const resp = await apiService.getGulfCompanies({ page, limit: 24, search })
      if (resp.success) {
        setCompanies(resp.data?.companies || [])
        setTotalPages(resp.data?.pagination?.totalPages || 1)
      } else {
        setCompanies([])
        setError(resp.message || "Failed to load companies")
      }
    } catch (e: any) {
      setCompanies([])
      setError("Failed to load companies")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [page, search])

  // Show access denied message for non-Gulf users
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <EmployerNavbar />
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h1>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                This page is only available for Gulf region users. You need to have a Gulf account to access Gulf company listings.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = '/gulf-opportunities'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Go to Gulf Opportunities
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/companies'}
                  className="w-full"
                >
                  Browse Regular Companies
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-green-100 to-yellow-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <EmployerNavbar />

      {/* Hero Section */}
      <div className="relative pt-20 pb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              <span>Gulf Region Companies</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Discover Top Companies in the
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> Gulf</span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Explore leading companies in the Gulf region offering exceptional career opportunities, competitive benefits, and world-class work environments.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search companies, industries..."
              className="pl-9"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((c) => (
              <Card key={c.id} className="bg-white/80 backdrop-blur-xl border-slate-200/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/gulf-companies/${c.id}`} className="font-semibold text-slate-900 truncate hover:underline">
                          {c.name}
                        </Link>
                        {c.industry && <Badge variant="outline" className="text-xs">{c.industry}</Badge>}
                      </div>
                      <div className="text-sm text-slate-600 flex items-center gap-3">
                        {c.location || c.city || c.country ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {c.location || [c.city, c.state, c.country].filter(Boolean).join(', ')}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {c.activeJobsCount ?? c.activeJobs ?? 0} jobs
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
            <div className="text-sm text-slate-600">Page {page} of {totalPages}</div>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-600/5 via-yellow-600/5 to-green-600/5"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-green-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-yellow-500/10 to-green-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Gulf Companies</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Discover leading companies in the Gulf region. Connect with top employers and explore exceptional career opportunities.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center hover:bg-green-600/20 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center hover:bg-green-600/20 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center hover:bg-green-600/20 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">For Job Seekers</h4>
              <ul className="space-y-3 text-slate-300">
                <li><Link href="/gulf-jobs" className="hover:text-green-400 transition-colors">Browse Gulf Jobs</Link></li>
                <li><Link href="/gulf-companies" className="hover:text-green-400 transition-colors">Gulf Companies</Link></li>
                <li><Link href="/gulf-opportunities" className="hover:text-green-400 transition-colors">Gulf Opportunities</Link></li>
                <li><Link href="/jobseeker-gulf-dashboard" className="hover:text-green-400 transition-colors">Gulf Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">For Employers</h4>
              <ul className="space-y-3 text-slate-300">
                <li><Link href="/gulf-dashboard" className="hover:text-green-400 transition-colors">Gulf Employer Dashboard</Link></li>
                <li><Link href="/gulf-dashboard/post-job" className="hover:text-green-400 transition-colors">Post Gulf Job</Link></li>
                <li><Link href="/gulf-dashboard/applications" className="hover:text-green-400 transition-colors">View Applications</Link></li>
                <li><Link href="/gulf-dashboard/analytics" className="hover:text-green-400 transition-colors">Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-3 text-slate-300">
                <li><Link href="/help" className="hover:text-green-400 transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-green-400 transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-green-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-green-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm mb-4 md:mb-0">
                &copy; 2025 Gulf JobPortal. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm text-slate-400">
                <span>Made with ❤️ for Gulf professionals</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


