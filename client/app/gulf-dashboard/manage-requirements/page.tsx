"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, Search, X, Users, MoreHorizontal, Edit, Copy, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService, Requirement } from "@/lib/api"

export default function GulfManageRequirementsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({ active: true, limitReached: true, expired: true })
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [statsByReqId, setStatsByReqId] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        // Ensure employer auth
        const me = await apiService.getCurrentUser()
        const user = me?.data?.user
        if (!user || (user.userType !== 'employer' && user.userType !== 'admin')) {
          setError('Access denied. Please login as employer')
          setTimeout(() => router.push('/employer-login'), 1500)
          return
        }

        // Fetch employer requirements (reuse same API as employer dashboard)
        const resp = await apiService.getRequirements()
        if (resp.success && Array.isArray(resp.data)) {
          setRequirements(resp.data)
          const statResults = await Promise.all(resp.data.map(async (r: Requirement) => {
            try {
              const s = await apiService.getRequirementStats(r.id)
              if (s.success && s.data) return { id: r.id, ...s.data }
            } catch {}
            return { id: r.id, totalCandidates: 0, accessedCandidates: 0, cvAccessLeft: 0 }
          }))
          const map: Record<string, any> = {}
          statResults.forEach((s) => { map[s.id] = s })
          setStatsByReqId(map)
        } else {
          setRequirements([])
          setError(resp.message || 'Failed to load requirements')
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load requirements')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const computeUiStatus = (r: Requirement) => {
    if (r.status === 'closed') return 'expired'
    if (r.status === 'paused') return 'limit-reached'
    if (r.status === 'draft') return 'active'
    return r.status || 'active'
  }

  const filtered = useMemo(() => {
    const q = (searchQuery || '').toLowerCase()
    return requirements.filter((r) => {
      const text = [r.title, r.location, r.description].filter(Boolean).join(' ').toLowerCase()
      const matches = !q || text.includes(q)
      const s = computeUiStatus(r)
      const matchesStatus = (filters.active && s === 'active') || (filters.limitReached && s === 'limit-reached') || (filters.expired && s === 'expired')
      return matches && matchesStatus
    })
  }, [requirements, searchQuery, filters])

  const clearSearch = () => setSearchQuery("")
  const clearFilters = () => setFilters({ active: true, limitReached: true, expired: true })

  const getValidTill = (r: Requirement) => r.validTill ? new Date(r.validTill).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No expiry date'
  const getStats = (id: string) => statsByReqId[id] || { totalCandidates: 0, accessedCandidates: 0, cvAccessLeft: 0 }

  const handleEdit = (id: string) => router.push(`/employer-dashboard/requirements/${id}/edit`)
  const handleDuplicate = (id: string) => toast({ title: 'Coming soon', description: 'Duplicate requirement will be implemented with API.' })
  const handleDelete = (id: string) => { setDeleteId(id); setDeleteDialogOpen(true) }
  const confirmDelete = () => {
    if (deleteId) {
      setRequirements((prev) => prev.filter(r => r.id !== deleteId))
      setDeleteDialogOpen(false)
      setDeleteId(null)
      toast({ title: 'Requirement deleted' })
    }
  }

  const statusBadge = (s: string) => {
    switch (s) {
      case 'active': return <Badge className="bg-green-100 text-green-800 border-green-200">ACTIVE</Badge>
      case 'limit-reached': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">LIMIT REACHED</Badge>
      case 'expired': return <Badge className="bg-red-100 text-red-800 border-red-200">EXPIRED</Badge>
      default: return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <EmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Gulf Manage Requirements</h1>
            <div className="text-sm text-slate-600">View and manage all your Gulf region requirements</div>
          </div>
          <Link href="/gulf-dashboard/create-requirement">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Requirement
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50 sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Filter
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-slate-500 hover:text-slate-700">Clear</Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium text-slate-900">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search requirements..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-8" />
                    {searchQuery && (
                      <Button variant="ghost" size="sm" onClick={clearSearch} className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"><X className="w-3 h-3" /></Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-slate-900">Requirement status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="active" checked={filters.active} onCheckedChange={(v) => setFilters(prev => ({ ...prev, active: v as boolean }))} />
                      <label htmlFor="active" className="text-sm text-slate-700">Active ({requirements.filter(r => computeUiStatus(r) === 'active').length})</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="limit-reached" checked={filters.limitReached} onCheckedChange={(v) => setFilters(prev => ({ ...prev, limitReached: v as boolean }))} />
                      <label htmlFor="limit-reached" className="text-sm text-slate-700">Limit reached ({requirements.filter(r => computeUiStatus(r) === 'limit-reached').length})</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="expired" checked={filters.expired} onCheckedChange={(v) => setFilters(prev => ({ ...prev, expired: v as boolean }))} />
                      <label htmlFor="expired" className="text-sm text-slate-700">Expired ({requirements.filter(r => computeUiStatus(r) === 'expired').length})</label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">All requirements ({filtered.length})</h2>
                  {searchQuery && <div className="text-sm text-slate-600">Showing results for "{searchQuery}"</div>}
                </div>

                <AnimatePresence>
                  {loading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Loading requirements...</h3>
                    </motion.div>
                  ) : error ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Error loading requirements</h3>
                      <p className="text-slate-600 mb-4">{error}</p>
                      <div className="flex space-x-3 justify-center">
                        <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">Try Again</Button>
                        <Button variant="outline" onClick={() => router.push('/employer-login')}>Go to Login</Button>
                      </div>
                    </motion.div>
                  ) : filtered.length > 0 ? (
                    filtered.map((r) => {
                      const uiStatus = computeUiStatus(r)
                      const s = getStats(r.id)
                      return (
                        <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="border border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors mb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <Link href={`/employer-dashboard/requirements/${r.id}`} className="text-xl font-semibold text-blue-600 hover:text-blue-700 transition-colors">{r.title}</Link>
                                {statusBadge(uiStatus)}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-slate-600 mb-4">
                                <span>{r.location}</span>
                                <span>•</span>
                                <span>Valid till {getValidTill(r)}</span>
                                <span>•</span>
                                <span>CV access left: {s.cvAccessLeft}</span>
                              </div>
                              <p className="text-sm text-slate-700 mb-4">{r.description}</p>
                            </div>
                            <div className="flex items-center space-x-6">
                              <div className="text-center">
                                <Link href={`/employer-dashboard/requirements/${r.id}/candidates`}>
                                  <div className="text-2xl font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors">{s.totalCandidates}</div>
                                </Link>
                                <div className="text-sm text-slate-500">Candidates</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{s.accessedCandidates}</div>
                                <div className="text-sm text-slate-500">Accessed</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Link href={`/employer-dashboard/requirements/${r.id}/candidates`}>
                                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                    <Users className="w-4 h-4 mr-1" />
                                    View Candidates
                                  </Button>
                                </Link>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(r.id)}><Edit className="w-4 h-4 mr-2" />Edit Requirement</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDuplicate(r.id)}><Copy className="w-4 h-4 mr-2" />Duplicate</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No requirements found</h3>
                      <p className="text-slate-600 mb-4">Create your first Gulf requirement to start getting matches.</p>
                      <Link href="/gulf-dashboard/create-requirement">
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">Create Requirement</Button>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Requirement</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EmployerFooter />
    </div>
  )
}


