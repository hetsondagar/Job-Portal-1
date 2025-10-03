"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import {
  Users,
  Search,
  MapPin,
  MoreVertical,
  UserCheck,
  UserX,
  Eye,
  Trash2,
  ArrowLeft,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

export default function IndiaUsersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user || user.userType !== 'admin') {
      router.push('/admin-login')
      return
    }

    loadIndiaUsers()
  }, [user, authLoading, router, currentPage, filterType, filterStatus])

  const loadIndiaUsers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getUsersByRegion('india', {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        userType: filterType === 'all' ? undefined : filterType,
        status: filterStatus === 'all' ? undefined : filterStatus
      })
      
      if (response.success) {
        setUsers(response.data.users)
        setTotalPages(response.data.totalPages)
      } else {
        toast.error('Failed to load India users')
      }
    } catch (error) {
      console.error('Failed to load India users:', error)
      toast.error('Failed to load India users')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadIndiaUsers()
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await apiService.updateUserStatus(userId, !currentStatus)
      
      if (response.success) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        loadIndiaUsers()
      } else {
        toast.error('Failed to update user status')
      }
    } catch (error) {
      console.error('Failed to update user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiService.deleteUser(userId)
      
      if (response.success) {
        toast.success('User deleted successfully')
        loadIndiaUsers()
      } else {
        toast.error('Failed to delete user')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Failed to delete user')
    }
  }

  const exportIndiaUsers = async () => {
    try {
      const response = await apiService.exportUsers({
        region: 'india',
        userType: filterType === 'all' ? undefined : filterType,
        status: filterStatus === 'all' ? undefined : filterStatus
      })
      
      if (response.success) {
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `india-users-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast.success('India users exported successfully')
      } else {
        toast.error('Failed to export users')
      }
    } catch (error) {
      console.error('Failed to export users:', error)
      toast.error('Failed to export users')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading India Users...</p>
        </div>
      </div>
    )
  }

  if (!user || user.userType !== 'admin') {
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
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-orange-400" />
                  India Users
                </h1>
                <p className="text-sm text-gray-400">Manage users from India region</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportIndiaUsers}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadIndiaUsers}
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
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search India users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="jobseeker">Jobseekers</SelectItem>
                  <SelectItem value="employer">Employers</SelectItem>
                </SelectContent>
              </Select>
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
            </div>
            <div className="mt-4">
              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-400" />
                India Users ({users.length})
              </span>
              <div className="flex space-x-2">
                <Link href="/admin/users/all">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    All Users
                  </Button>
                </Link>
                <Link href="/admin/users/gulf">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    Gulf Users
                  </Button>
                </Link>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No India users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {user.first_name} {user.last_name}
                          </h3>
                          <p className="text-sm text-gray-400">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="bg-orange-600">
                              India
                            </Badge>
                            <Badge 
                              variant={user.user_type === 'admin' ? 'default' : 'secondary'}
                              className={user.user_type === 'admin' ? 'bg-red-600' : 'bg-blue-600'}
                            >
                              {user.user_type}
                            </Badge>
                            <Badge 
                              variant={user.is_active ? 'default' : 'destructive'}
                              className={user.is_active ? 'bg-green-600' : 'bg-red-600'}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserDialog(true)
                          }}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          className={`border-white/20 text-white hover:bg-white/10 ${
                            user.is_active ? 'hover:text-red-400' : 'hover:text-green-400'
                          }`}
                        >
                          {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user)
                              setShowUserDialog(true)
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleUserStatus(user.id, user.is_active)}>
                              {user.is_active ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteUser(user.id)}
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

        {/* User Details Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="max-w-2xl bg-slate-800 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>India User Details</DialogTitle>
              <DialogDescription>
                Complete information about {selectedUser?.first_name} {selectedUser?.last_name}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Name</label>
                    <p className="text-white">{selectedUser.first_name} {selectedUser.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Phone</label>
                    <p className="text-white">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">User Type</label>
                    <p className="text-white capitalize">{selectedUser.user_type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <Badge className={selectedUser.is_active ? 'bg-green-600' : 'bg-red-600'}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Region</label>
                    <Badge className="bg-orange-600">India</Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email Verified</label>
                    <Badge className={selectedUser.is_email_verified ? 'bg-green-600' : 'bg-red-600'}>
                      {selectedUser.is_email_verified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Phone Verified</label>
                    <Badge className={selectedUser.is_phone_verified ? 'bg-green-600' : 'bg-red-600'}>
                      {selectedUser.is_phone_verified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Last Login</label>
                    <p className="text-white">
                      {selectedUser.last_login_at 
                        ? new Date(selectedUser.last_login_at).toLocaleDateString()
                        : 'Never'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Created</label>
                    <p className="text-white">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedUser.current_location && (
                  <div>
                    <label className="text-sm text-gray-400">Location</label>
                    <p className="text-white">{selectedUser.current_location}</p>
                  </div>
                )}
                {selectedUser.headline && (
                  <div>
                    <label className="text-sm text-gray-400">Headline</label>
                    <p className="text-white">{selectedUser.headline}</p>
                  </div>
                )}
                {selectedUser.summary && (
                  <div>
                    <label className="text-sm text-gray-400">Summary</label>
                    <p className="text-white">{selectedUser.summary}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
