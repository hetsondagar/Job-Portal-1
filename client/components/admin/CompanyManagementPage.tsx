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
  Trash2,
  FileText,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileCheck
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CompanyManagementDialog } from "./CompanyManagementDialog"

interface CompanyManagementPageProps {
  portal: 'all' | 'normal' | 'gulf'
  title: string
  description: string
  icon: React.ReactNode
}

export default function CompanyManagementPage({ portal, title, description, icon }: CompanyManagementPageProps) {
  const { user, loading: authLoading } = useAuth()
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
  const [processing, setProcessing] = useState(false)

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

  const toggleCompanyStatus = async (companyId: string, currentStatus: boolean | string) => {
    try {
      const status = typeof currentStatus === 'boolean' ? !currentStatus : currentStatus === 'true'
      const response = await apiService.updateCompanyStatus(companyId, status.toString())
      
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

  const toggleVerification = async (companyId: string, currentVerification: boolean | string) => {
    try {
      const verification = typeof currentVerification === 'boolean' ? !currentVerification : currentVerification === 'true'
      const response = await apiService.updateCompanyVerification(companyId, verification.toString())
      
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

  const handleApproveVerification = async (companyId: string) => {
    if (!confirm('Are you sure you want to approve this company\'s verification?')) {
      return
    }

    try {
      setProcessing(true)
      const response = await apiService.approveVerification(companyId)
      
      if (response.success) {
        toast.success('Company verification approved successfully')
        setShowCompanyDialog(false)
        loadCompanies()
      } else {
        toast.error(response.message || 'Failed to approve verification')
      }
    } catch (error) {
      console.error('Failed to approve verification:', error)
      toast.error('Failed to approve verification')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectVerification = async (companyId: string, reason: string, notes: string) => {
    try {
      setProcessing(true)
      const response = await apiService.rejectVerification(companyId, {
        reason,
        notes
      })
      
      if (response.success) {
        toast.success('Company verification rejected')
        setShowCompanyDialog(false)
        loadCompanies()
      } else {
        toast.error(response.message || 'Failed to reject verification')
      }
    } catch (error) {
      console.error('Failed to reject verification:', error)
      toast.error('Failed to reject verification')
    } finally {
      setProcessing(false)
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
      
      if (response.success && response.data) {
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
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${logoPath}`
  }

  const getDocumentUrl = (docPath: string) => {
    if (!docPath) return null
    if (docPath.startsWith('http')) return docPath
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${docPath}`
  }

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
      case 'premium_verified':
        return (
          <Badge className="bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-amber-600">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-600">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unverified
          </Badge>
        )
    }
  }

  const getAccountTypeBadge = (companyAccountType: string) => {
    switch (companyAccountType) {
      case 'direct_employer':
        return <Badge variant="outline" className="border-blue-500 text-blue-400">Direct Employer</Badge>
      case 'agency':
        return <Badge variant="outline" className="border-purple-500 text-purple-400">Agency/Consultancy</Badge>
      case 'recruiting_agency':
        return <Badge variant="outline" className="border-purple-500 text-purple-400">Recruiting Agency</Badge>
      case 'consulting_firm':
        return <Badge variant="outline" className="border-purple-500 text-purple-400">Consulting Firm</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading && companies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center">
        <div className="text-gray-900 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading {title.toLowerCase()}...</p>
        </div>
      </div>
    )
  }

  if (!user || (user.userType !== 'admin' && user.userType !== 'superadmin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/super-admin/dashboard')}
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
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
                            const nextSibling = e.currentTarget.nextElementSibling as HTMLElement | null
                            if (nextSibling) nextSibling.style.display = 'flex'
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
                          {getVerificationStatusBadge(company.verificationStatus || (company.isVerified ? 'verified' : 'unverified'))}
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
                          router.push(`/super-admin/companies/${company.id}`)
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
        <CompanyManagementDialog
          company={selectedCompany}
          open={showCompanyDialog}
          onOpenChange={setShowCompanyDialog}
          onApprove={handleApproveVerification}
          onReject={handleRejectVerification}
          onToggleStatus={toggleCompanyStatus}
          onToggleVerification={toggleVerification}
          processing={processing}
        />
      </div>
    </div>
  )
}
