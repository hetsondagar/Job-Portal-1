"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, MapPin, Briefcase, Search, Loader2 } from "lucide-react"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api"

export default function GulfCompaniesPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [companies, setCompanies] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <EmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gulf Companies</h1>
            <p className="text-slate-600">Browse employers hiring in the Gulf region</p>
          </div>
        </div>

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

      <EmployerFooter />
    </div>
  )
}


