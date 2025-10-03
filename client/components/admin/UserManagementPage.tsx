"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Eye,
  ArrowLeft,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Building2,
  Globe
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface UserManagementPageProps {
  portal: 'normal' | 'gulf' | 'both'
  title: string
  description: string
  icon: React.ReactNode
}

export default function UserManagementPage({ portal, title, description, icon }: UserManagementPageProps) {
  const { user, authLoading } = useAuth()
  const router = useRouter()
  
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user || (user.userType !== 'admin' && user.userType !== 'superadmin')) {
      router.push('/admin-login')
      return
    }

    loadUsers()
  }, [user, authLoading, router, currentPage, filterType, filterStatus])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getUsersByPortal(portal, {
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
        toast.error(`Failed to load ${title.toLowerCase()} users`)
      }
    } catch (error) {
      console.error(`Failed to load ${title.toLowerCase()} users:`, error)
      toast.error(`Failed to load ${title.toLowerCase()} users`)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await apiService.updateUserStatus(userId, !currentStatus)
      
      if (response.success) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        loadUsers()
      } else {
        toast.error('Failed to update user status')
      }
    } catch (error) {
      console.error('Failed to update user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadUsers()
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
    loadUsers()
  }

  const exportUsers = async () => {
    try {
      const response = await apiService.exportUsers({
        search: searchTerm,
        userType: filterType === 'all' ? undefined : filterType,
        status: filterStatus === 'all' ? undefined : filterStatus,
        portal: portal
      })
      
      if (response.success) {
        const csvContent = response.data.csv
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${portal}-portal-users-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Users exported successfully')
      } else {
        toast.error('Failed to export users')
      }
    } catch (error) {
      console.error('Failed to export users:', error)
      toast.error('Failed to export users')
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading {title.toLowerCase()} users...</p>
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
              className="text-white hover:bg-white/10"
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
              onClick={exportUsers}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={loadUsers}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
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
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={(value) => { setFilterType(value); handleFilterChange() }}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="User Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="jobseeker">Jobseekers</SelectItem>
                    <SelectItem value="employer">Employers</SelectItem>
                  </SelectContent>
                </Select>
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
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {title} ({users.length})
            </CardTitle>
            <CardDescription className="text-blue-200">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No users found</h3>
                <p className="text-blue-200">No {title.toLowerCase()} users match your current filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.first_name?.[0] || user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}` 
                            : user.email
                          }
                        </h3>
                        <p className="text-blue-200 text-sm">{user.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge 
                            variant={user.user_type === 'employer' ? 'default' : 'secondary'}
                            className={user.user_type === 'employer' ? 'bg-green-600' : 'bg-blue-600'}
                          >
                            {user.user_type}
                          </Badge>
                          <Badge 
                            variant={user.is_active ? 'default' : 'destructive'}
                            className={user.is_active ? 'bg-green-600' : 'bg-gray-600'}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {user.region && (
                            <Badge variant="outline" className="text-blue-200 border-blue-200">
                              {user.region}
                            </Badge>
                          )}
                          {portal === 'both' && user.willing_to_relocate && (
                            <Badge variant="outline" className="text-green-200 border-green-200">
                              Willing to Relocate
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setShowUserDialog(true)
                        }}
                        className="text-white hover:bg-white/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        className={user.is_active ? 'hover:text-red-400' : 'hover:text-green-400'}
                      >
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
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
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Details Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                User Details
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Detailed information about the selected user
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Name</label>
                    <p className="text-white">
                      {selectedUser.first_name && selectedUser.last_name 
                        ? `${selectedUser.first_name} ${selectedUser.last_name}` 
                        : 'Not provided'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Email</label>
                    <p className="text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">User Type</label>
                    <Badge 
                      variant={selectedUser.user_type === 'employer' ? 'default' : 'secondary'}
                      className={selectedUser.user_type === 'employer' ? 'bg-green-600' : 'bg-blue-600'}
                    >
                      {selectedUser.user_type}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Status</label>
                    <Badge 
                      variant={selectedUser.is_active ? 'default' : 'destructive'}
                      className={selectedUser.is_active ? 'bg-green-600' : 'bg-gray-600'}
                    >
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Region</label>
                    <p className="text-white">{selectedUser.region || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Phone</label>
                    <p className="text-white">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  {portal === 'both' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-slate-300">Willing to Relocate</label>
                        <Badge variant={selectedUser.willing_to_relocate ? 'default' : 'secondary'}>
                          {selectedUser.willing_to_relocate ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300">Preferred Locations</label>
                        <p className="text-white">
                          {selectedUser.preferred_locations && selectedUser.preferred_locations.length > 0
                            ? selectedUser.preferred_locations.join(', ')
                            : 'Not specified'
                          }
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowUserDialog(false)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => toggleUserStatus(selectedUser.id, selectedUser.is_active)}
                    className={selectedUser.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {selectedUser.is_active ? 'Deactivate' : 'Activate'} User
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
