"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Building2, Plus, CheckCircle, Clock, XCircle, AlertTriangle, Calendar, Briefcase, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiService } from '@/lib/api'
import { EmployerAuthGuard } from '@/components/employer-auth-guard'
import { EmployerNavbar } from '@/components/employer-navbar'

export default function ManageClientsPage() {
  return (
    <EmployerAuthGuard>
      <ManageClientsContent />
    </EmployerAuthGuard>
  )
}

function ManageClientsContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAgencyClients()
      
      if (response.success) {
        setClients(response.data || [])
      } else {
        toast.error('Failed to load clients')
      }
    } catch (error: any) {
      console.error('Error loading clients:', error)
      toast.error(error.message || 'Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  // Filter clients by status
  const getFilteredClients = (status: string) => {
    if (status === 'all') return clients
    if (status === 'active') return clients.filter((c: any) => c.status === 'active')
    if (status === 'pending') return clients.filter((c: any) => c.status.includes('pending'))
    if (status === 'expired') return clients.filter((c: any) => c.status === 'expired' || c.status === 'revoked')
    return clients
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>
      case 'pending':
      case 'pending_client_confirm':
      case 'pending_admin_review':
        return <Badge className="bg-yellow-600"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
      case 'expired':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Expired</Badge>
      case 'revoked':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Revoked</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Calculate stats
  const stats = {
    total: clients.length,
    active: clients.filter((c: any) => c.status === 'active').length,
    pending: clients.filter((c: any) => c.status.includes('pending')).length,
    expired: clients.filter((c: any) => c.status === 'expired' || c.status === 'revoked').length
  }

  // Render client card
  const ClientCard = ({ client }: { client: any }) => {
    const daysUntilExpiry = client.contractEndDate 
      ? Math.ceil((new Date(client.contractEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {client.ClientCompany?.logo ? (
                <img 
                  src={client.ClientCompany.logo} 
                  alt={client.ClientCompany.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{client.ClientCompany?.name || 'Unknown Company'}</h3>
                <p className="text-sm text-gray-500">{client.ClientCompany?.industry} • {client.ClientCompany?.city}</p>
              </div>
            </div>
            {getStatusBadge(client.status)}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Contract Period
              </p>
              <p className="font-medium">
                {client.contractStartDate && new Date(client.contractStartDate).toLocaleDateString()} - {' '}
                {client.contractEndDate && new Date(client.contractEndDate).toLocaleDateString()}
              </p>
              {daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry < 30 && (
                <p className="text-xs text-amber-600 mt-1">⚠️ Expires in {daysUntilExpiry} days</p>
              )}
            </div>
            
            <div>
              <p className="text-gray-500 flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                Jobs Posted
              </p>
              <p className="font-medium">
                {client.jobsPosted || 0}
                {client.maxActiveJobs && ` / ${client.maxActiveJobs}`}
              </p>
            </div>
          </div>

          {client.status === 'active' && client.canPostJobs && (
            <div className="mt-4 flex gap-2">
              <Button 
                size="sm" 
                onClick={() => router.push(`/employer-dashboard/post-job?clientId=${client.id}`)}
                className="flex-1"
              >
                Post Job for this Client
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => router.push(`/employer-dashboard/manage-clients/${client.id}`)}
              >
                View Details
              </Button>
            </div>
          )}

          {client.status.includes('pending') && (
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                {client.status === 'pending_client_confirm' && '⏳ Waiting for client to confirm authorization'}
                {client.status === 'pending_admin_review' && '⏳ Admin reviewing authorization documents'}
                {client.status === 'pending' && '⏳ Verification in progress'}
              </p>
            </div>
          )}

          {client.status === 'expired' && (
            <div className="mt-4">
              <Button 
                size="sm" 
                variant="outline"
                className="w-full"
                onClick={() => toast.info('Contact client to renew authorization')}
              >
                Renew Authorization
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      <EmployerNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              Manage Clients
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage your authorized client companies
            </p>
          </div>
          
          <Button
            onClick={() => router.push('/employer-dashboard/add-client')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Client
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle>Client Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="expired">Expired ({stats.expired})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : getFilteredClients(activeTab).length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No clients found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {activeTab === 'all' && "You haven't added any clients yet"}
                      {activeTab === 'active' && "You don't have any active clients"}
                      {activeTab === 'pending' && "No pending authorizations"}
                      {activeTab === 'expired' && "No expired authorizations"}
                    </p>
                    {activeTab === 'all' && (
                      <Button onClick={() => router.push('/employer-dashboard/add-client')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Client
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getFilteredClients(activeTab).map((client: any) => (
                      <ClientCard key={client.id} client={client} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

