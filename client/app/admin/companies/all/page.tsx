"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import {
  Building2,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Globe,
  Star,
  Users,
  Briefcase
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

export default function AllCompaniesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterRegion, setFilterRegion] = useState("all")
  const [filterVerification, setFilterVerification] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [showCompanyDialog, setShowCompanyDialog] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user || ((user.userType !== 'admin' && user.userType !== 'superadmin') && user.userType !== 'superadmin')) {
      router.push('/admin-login')
      return
    }

    loadCompanies()
  }, [user, authLoading, router, currentPage, filterStatus, filterRegion, filterVerification])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAllCompanies({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: filterStatus === 'all' ? undefined : filterStatus,
        region: filterRegion === 'all' ? undefined : filterRegion,
        verification: filterVerification === 'all' ? undefined : filterVerification
      })
      
      if (response.success) {
        setCompanies(response.data.companies)
        setTotalPages(response.data.totalPages)
      } else {
        toast.error('Failed to load companies')
      }
    } catch (error) {
      console.error('Failed to load companies:', error)
      toast.error('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadCompanies()
  }

  const toggleCompanyStatus = async (companyId: string, currentStatus: boolean) => {
    try {
      const response = await apiService.updateCompanyStatus(companyId, !currentStatus)
      
      if (response.success) {
        toast.success(`Company ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        loadCompanies()
      } else {
        toast.error('Failed to update company status')
      }
    } catch (error) {
      console.error('Failed to update company status:', error)
      toast.error('Failed to update company status')
    }
  }

  const toggleVerification = async (companyId: string, currentVerification: boolean) => {
    try {
      const response = await apiService.updateCompanyVerification(companyId, !currentVerification)
      
      if (response.success) {
        toast.success(`Company ${!currentVerification ? 'verified' : 'unverified'} successfully`)
        loadCompanies()
      } else {
        toast.error('Failed to update company verification')
      }
    } catch (error) {
      console.error('Failed to update company verification:', error)
      toast.error('Failed to update company verification')
    }
  }

  const deleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiService.deleteCompany(companyId)
      
      if (response.success) {
        toast.success('Company deleted successfully')
        loadCompanies()
      } else {
        toast.error('Failed to delete company')
      }
    } catch (error) {
      console.error('Failed to delete company:', error)
      toast.error('Failed to delete company')
    }
  }

  const exportCompanies = async () => {
    try {
      const response = await apiService.exportCompanies({
        status: filterStatus === 'all' ? undefined : filterStatus,
        region: filterRegion === 'all' ? undefined : filterRegion,
        verification: filterVerification === 'all' ? undefined : filterVerification
      })
      
      if (response.success) {
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `companies-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast.success('Companies exported successfully')
      } else {
        toast.error('Failed to export companies')
      }
    } catch (error) {
      console.error('Failed to export companies:', error)
      toast.error('Failed to export companies')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading Companies...</p>
        </div>
      </div>
    )
  }

  if (!user || ((user.userType !== 'admin' && user.userType !== 'superadmin') && user.userType !== 'superadmin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">All Companies</h1>
                <p className="text-sm text-gray-400">Manage all companies across the platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportCompanies}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadCompanies}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-6">
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterRegion} onValueChange={setFilterRegion}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="gulf">Gulf</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterVerification} onValueChange={setFilterVerification}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verification</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Companies List */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Companies ({companies.length})</span>
              <div className="flex space-x-2">
                <Link href="/admin/companies/india">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    India Companies
                  </Button>
                </Link>
                <Link href="/admin/companies/gulf">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    Gulf Companies
                  </Button>
                </Link>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {companies.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No companies found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {companies.map((company) => (
                  <div key={company.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          {company.logo ? (
                            <img 
                              src={company.logo} 
                              alt={company.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <Building2 className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg">{company.name}</h3>
                          <p className="text-sm text-gray-400">{company.email}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            {company.region && (
                              <Badge 
                                variant="outline" 
                                className={company.region === 'india' ? 'border-orange-500 text-orange-400' : 'border-cyan-500 text-cyan-400'}
                              >
                                {company.region === 'india' ? (
                                  <>
                                    <MapPin className="w-3 h-3 mr-1" />
                                    India
                                  </>
                                ) : (
                                  <>
                                    <Globe className="w-3 h-3 mr-1" />
                                    Gulf
                                  </>
                                )}
                              </Badge>
                            )}
                            <Badge 
                              variant={company.isVerified ? 'default' : 'destructive'}
                              className={company.isVerified ? 'bg-green-600' : 'bg-red-600'}
                            >
                              {company.isVerified ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Verified
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Unverified
                                </>
                              )}
                            </Badge>
                            <Badge 
                              variant={company.isActive ? 'default' : 'destructive'}
                              className={company.isActive ? 'bg-blue-600' : 'bg-gray-600'}
                            >
                              {company.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                            <div className="flex items-center">
                              <Briefcase className="w-3 h-3 mr-1" />
                              {company.totalJobsPosted || 0} jobs
                            </div>
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {company.totalApplications || 0} applications
                            </div>
                            {company.rating && (
                              <div className="flex items-center">
                                <Star className="w-3 h-3 mr-1" />
                                {company.rating.toFixed(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company)
                            setShowCompanyDialog(true)
                          }}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleVerification(company.id, company.isVerified)}
                          className={`border-white/20 text-white hover:bg-white/10 ${
                            company.isVerified ? 'hover:text-red-400' : 'hover:text-green-400'
                          }`}
                        >
                          {company.isVerified ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCompanyStatus(company.id, company.isActive)}
                          className={`border-white/20 text-white hover:bg-white/10 ${
                            company.isActive ? 'hover:text-red-400' : 'hover:text-green-400'
                          }`}
                        >
                          {company.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setSelectedCompany(company)
                              setShowCompanyDialog(true)
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleVerification(company.id, company.isVerified)}>
                              {company.isVerified ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Unverify
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Verify
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleCompanyStatus(company.id, company.isActive)}>
                              {company.isActive ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteCompany(company.id)}
                              className="text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Details Dialog */}
        <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
          <DialogContent className="max-w-4xl bg-slate-800 border-white/20 text-white max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Company Details</DialogTitle>
              <DialogDescription>
                Complete information about {selectedCompany?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedCompany && (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    {selectedCompany.logo ? (
                      <img 
                        src={selectedCompany.logo} 
                        alt={selectedCompany.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">{selectedCompany.name}</h2>
                    <p className="text-gray-400">{selectedCompany.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {selectedCompany.region && (
                        <Badge 
                          variant="outline" 
                          className={selectedCompany.region === 'india' ? 'border-orange-500 text-orange-400' : 'border-cyan-500 text-cyan-400'}
                        >
                          {selectedCompany.region === 'india' ? 'India' : 'Gulf'}
                        </Badge>
                      )}
                      <Badge 
                        variant={selectedCompany.isVerified ? 'default' : 'destructive'}
                        className={selectedCompany.isVerified ? 'bg-green-600' : 'bg-red-600'}
                      >
                        {selectedCompany.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                      <Badge 
                        variant={selectedCompany.isActive ? 'default' : 'destructive'}
                        className={selectedCompany.isActive ? 'bg-blue-600' : 'bg-gray-600'}
                      >
                        {selectedCompany.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Industry</label>
                      <p className="text-white">{selectedCompany.industry || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Sector</label>
                      <p className="text-white">{selectedCompany.sector || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Company Size</label>
                      <p className="text-white">{selectedCompany.companySize || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Founded Year</label>
                      <p className="text-white">{selectedCompany.foundedYear || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Website</label>
                      <p className="text-white">
                        {selectedCompany.website ? (
                          <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            {selectedCompany.website}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Phone</label>
                      <p className="text-white">{selectedCompany.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Address</label>
                      <p className="text-white">{selectedCompany.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">City</label>
                      <p className="text-white">{selectedCompany.city || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">State</label>
                      <p className="text-white">{selectedCompany.state || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Country</label>
                      <p className="text-white">{selectedCompany.country || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {selectedCompany.description && (
                  <div>
                    <label className="text-sm text-gray-400">Description</label>
                    <p className="text-white mt-1">{selectedCompany.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Jobs</p>
                        <p className="text-2xl font-bold text-white">{selectedCompany.totalJobsPosted || 0}</p>
                      </div>
                      <Briefcase className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Applications</p>
                        <p className="text-2xl font-bold text-white">{selectedCompany.totalApplications || 0}</p>
                      </div>
                      <Users className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Rating</p>
                        <p className="text-2xl font-bold text-white">{selectedCompany.rating?.toFixed(1) || 'N/A'}</p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-400" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-sm text-gray-400">
                    Created: {new Date(selectedCompany.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleVerification(selectedCompany.id, selectedCompany.isVerified)}
                      className={`border-white/20 text-white hover:bg-white/10 ${
                        selectedCompany.isVerified ? 'hover:text-red-400' : 'hover:text-green-400'
                      }`}
                    >
                      {selectedCompany.isVerified ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Unverify
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Verify
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCompanyStatus(selectedCompany.id, selectedCompany.isActive)}
                      className={`border-white/20 text-white hover:bg-white/10 ${
                        selectedCompany.isActive ? 'hover:text-red-400' : 'hover:text-green-400'
                      }`}
                    >
                      {selectedCompany.isActive ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
