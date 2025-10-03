"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowLeft,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Globe,
  Star,
  Users,
  Briefcase,
  MoreVertical,
  Trash2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CompanyManagementPageProps {
  portal: 'all' | 'normal' | 'gulf'
  title: string
  description: string
  icon: React.ReactNode
}

export default function CompanyManagementPage({ portal, title, description, icon }: CompanyManagementPageProps) {
  const { user, authLoading } = useAuth()
  const router = useRouter()
  
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterVerification, setFilterVerification] = useState("all")
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [showCompanyDialog, setShowCompanyDialog] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user || (user.userType !== 'admin' && user.userType !== 'superadmin')) {
      router.push('/admin-login')
      return
    }

    loadCompanies()
  }, [user, authLoading, router, currentPage, filterStatus, filterVerification])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      let response
      
      if (portal === 'all') {
        response = await apiService.getAllCompanies({
          page: currentPage,
          limit: 20,
          search: searchTerm,
          status: filterStatus === 'all' ? undefined : filterStatus,
          verification: filterVerification === 'all' ? undefined : filterVerification
        })
      } else {
        // For portal-specific companies, we'll filter by region
        const region = portal === 'gulf' ? 'gulf' : 'india'
        response = await apiService.getAllCompanies({
          page: currentPage,
          limit: 20,
          search: searchTerm,
          status: filterStatus === 'all' ? undefined : filterStatus,
          verification: filterVerification === 'all' ? undefined : filterVerification,
          region: region
        })
      }
      
      if (response.success) {
        setCompanies(response.data.companies)
        setTotalPages(response.data.totalPages)
      } else {
        toast.error(`Failed to load ${title.toLowerCase()}`)
      }
    } catch (error) {
      console.error(`Failed to load ${title.toLowerCase()}:`, error)
      toast.error(`Failed to load ${title.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadCompanies()
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
    loadCompanies()
  }

  const exportCompanies = async () => {
    try {
      const response = await apiService.exportCompanies({
        status: filterStatus === 'all' ? undefined : filterStatus,
        verification: filterVerification === 'all' ? undefined : filterVerification,
        region: portal === 'all' ? undefined : (portal === 'gulf' ? 'gulf' : 'india')
      })
      
      if (response.success) {
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${portal}-companies-${new Date().toISOString().split('T')[0]}.csv`
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

  const getImageUrl = (logoPath: string) => {
    if (!logoPath) return null
    // If it's already a full URL, return as is
    if (logoPath.startsWith('http')) return logoPath
    // Otherwise, construct the full URL
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://job-portal-97q3.onrender.com'}${logoPath}`
  }

  if (loading && companies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading {title.toLowerCase()}...</p>
        </div>
      </div>
    )
  }

  if (!user || (user.userType !== 'admin' && user.userType !== 'superadmin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/dashboard')}
              className="text-white hover:bg-white/10 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                {icon}
                <span className="ml-3">{title}</span>
              </h1>
              <p className="text-blue-200 mt-2">{description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={exportCompanies}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10 bg-white/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={loadCompanies}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10 bg-white/5"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white/5 border-white/10">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search companies by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); handleFilterChange() }}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterVerification} onValueChange={(value) => { setFilterVerification(value); handleFilterChange() }}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Verification</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Companies List */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              {title} ({companies.length})
            </CardTitle>
            <CardDescription className="text-blue-200">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {companies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No companies found</h3>
                <p className="text-blue-200">No {title.toLowerCase()} match your current filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {companies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        {company.logo ? (
                          <img 
                            src={getImageUrl(company.logo) || ''} 
                            alt={company.name}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <Building2 className="w-8 h-8 text-white" style={{ display: company.logo ? 'none' : 'flex' }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg">{company.name}</h3>
                        <p className="text-blue-200 text-sm">{company.email}</p>
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
                          {company.rating && typeof company.rating === 'number' && (
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
                        className="text-white hover:bg-white/10 border-white/20 bg-white/5"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleVerification(company.id, company.isVerified)}
                        className={`text-white hover:bg-white/10 border-white/20 bg-white/5 ${
                          company.isVerified ? 'hover:text-red-400' : 'hover:text-green-400'
                        }`}
                      >
                        {company.isVerified ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCompanyStatus(company.id, company.isActive)}
                        className={`text-white hover:bg-white/10 border-white/20 bg-white/5 ${
                          company.isActive ? 'hover:text-red-400' : 'hover:text-green-400'
                        }`}
                      >
                        {company.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="text-white hover:bg-white/10 border-white/20 bg-white/5">
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
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-blue-200 text-sm">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="text-white border-white/20 hover:bg-white/10 bg-white/5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="text-white border-white/20 hover:bg-white/10 bg-white/5"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Details Dialog */}
        <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Company Details
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Complete information about {selectedCompany?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedCompany && (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    {selectedCompany.logo ? (
                      <img 
                        src={getImageUrl(selectedCompany.logo) || ''} 
                        alt={selectedCompany.name}
                        className="w-20 h-20 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <Building2 className="w-10 h-10 text-white" style={{ display: selectedCompany.logo ? 'none' : 'flex' }} />
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
                        <p className="text-2xl font-bold text-white">
                          {selectedCompany.rating && typeof selectedCompany.rating === 'number' 
                            ? selectedCompany.rating.toFixed(1) 
                            : 'N/A'
                          }
                        </p>
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
                      className={`border-white/20 text-white hover:bg-white/10 bg-white/5 ${
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
                      className={`border-white/20 text-white hover:bg-white/10 bg-white/5 ${
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
