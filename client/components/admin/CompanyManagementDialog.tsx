"use client"

import { useState } from "react"
import { 
  Building2, CheckCircle2, XCircle, FileText, Download, 
  Briefcase, Users, Star, Clock, AlertCircle, FileCheck, ShieldCheck 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface CompanyDialogProps {
  company: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (companyId: string) => void
  onReject: (companyId: string, reason: string, notes: string) => void
  onToggleStatus: (companyId: string, currentStatus: boolean) => void
  onToggleVerification: (companyId: string, currentVerification: boolean) => void
  processing: boolean
}

export function CompanyManagementDialog({
  company,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onToggleStatus,
  onToggleVerification,
  processing
}: CompanyDialogProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectionNotes, setRejectionNotes] = useState("")

  const getImageUrl = (path: string) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${path}`
  }

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
      case 'premium_verified':
        return <Badge className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>
      case 'pending':
        return <Badge className="bg-amber-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge className="bg-gray-600"><AlertCircle className="w-3 h-3 mr-1" />Unverified</Badge>
    }
  }

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case 'direct_employer':
        return <Badge variant="outline" className="border-blue-500 text-blue-400">Direct Employer</Badge>
      case 'agency':
      case 'recruiting_agency':
      case 'consulting_firm':
        return <Badge variant="outline" className="border-purple-500 text-purple-400">Agency/Consultancy</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleRejectClick = () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    onReject(company.id, rejectReason, rejectionNotes)
    setShowRejectDialog(false)
    setRejectReason('')
    setRejectionNotes('')
  }

  if (!company) return null

  const verificationDocs = company.verificationDocuments || {}
  const documents = verificationDocs.documents || []
  const gstNumber = verificationDocs.gstNumber || verificationDocs.data?.gstNumber || ''
  const panNumber = verificationDocs.panNumber || verificationDocs.data?.panNumber || ''
  const additionalNotes = verificationDocs.additionalNotes || verificationDocs.data?.additionalNotes || ''
  const submittedBy = verificationDocs.submittedBy || verificationDocs.data?.submittedBy || {}

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Company Details
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Complete information about {company.name}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger value="details">Company Details</TabsTrigger>
              <TabsTrigger value="verification">
                <FileCheck className="w-4 h-4 mr-2" />
                Verification {company.verificationStatus === 'pending' && <Badge className="ml-2 bg-amber-600">Pending</Badge>}
              </TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>

            {/* Company Details Tab */}
            <TabsContent value="details" className="space-y-6 mt-6">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center overflow-hidden">
                  {company.logo ? (
                    <img src={getImageUrl(company.logo) || ''} alt={company.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{company.name}</h2>
                  <p className="text-gray-400">{company.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {company.region && (
                      <Badge variant="outline" className={company.region === 'india' ? 'border-orange-500 text-orange-400' : 'border-cyan-500 text-cyan-400'}>
                        {company.region === 'india' ? 'India' : 'Gulf'}
                      </Badge>
                    )}
                    {getVerificationStatusBadge(company.verificationStatus || (company.isVerified ? 'verified' : 'unverified'))}
                    {getAccountTypeBadge(company.companyAccountType)}
                    <Badge variant={company.isActive ? 'default' : 'destructive'} className={company.isActive ? 'bg-blue-600' : 'bg-gray-600'}>
                      {company.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div><label className="text-sm text-gray-400">Industry</label><p className="text-white">{company.industry || 'Not specified'}</p></div>
                  <div><label className="text-sm text-gray-400">Sector</label><p className="text-white">{company.sector || 'Not specified'}</p></div>
                  <div><label className="text-sm text-gray-400">Company Size</label><p className="text-white">{company.companySize || 'Not specified'}</p></div>
                  <div><label className="text-sm text-gray-400">Founded Year</label><p className="text-white">{company.foundedYear || 'Not specified'}</p></div>
                  <div><label className="text-sm text-gray-400">Website</label><p className="text-white">{company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{company.website}</a> : 'Not provided'}</p></div>
                </div>
                <div className="space-y-4">
                  <div><label className="text-sm text-gray-400">Phone</label><p className="text-white">{company.phone || 'Not provided'}</p></div>
                  <div><label className="text-sm text-gray-400">Address</label><p className="text-white">{company.address || 'Not provided'}</p></div>
                  <div><label className="text-sm text-gray-400">City</label><p className="text-white">{company.city || 'Not specified'}</p></div>
                  <div><label className="text-sm text-gray-400">State</label><p className="text-white">{company.state || 'Not specified'}</p></div>
                  <div><label className="text-sm text-gray-400">Country</label><p className="text-white">{company.country || 'Not specified'}</p></div>
                </div>
              </div>

              {company.description && (
                <div><label className="text-sm text-gray-400">Description</label><p className="text-white mt-1">{company.description}</p></div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="text-sm text-gray-400">Created: {new Date(company.createdAt).toLocaleDateString()}</div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onToggleVerification(company.id, company.isVerified)} className="border-white/20 text-white hover:bg-white/10">
                    {company.isVerified ? <><XCircle className="w-4 h-4 mr-2" />Unverify</> : <><CheckCircle2 className="w-4 h-4 mr-2" />Verify</>}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onToggleStatus(company.id, company.isActive)} className="border-white/20 text-white hover:bg-white/10">
                    {company.isActive ? <><XCircle className="w-4 h-4 mr-2" />Deactivate</> : <><CheckCircle2 className="w-4 h-4 mr-2" />Activate</>}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Verification Tab */}
            <TabsContent value="verification" className="space-y-6 mt-6">
              <Card className="bg-slate-700/50 border-slate-600 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-amber-400" />
                    <div>
                      <h3 className="text-xl font-bold text-white">Verification Status</h3>
                      <p className="text-sm text-gray-400">Review employer verification request</p>
                    </div>
                  </div>
                  {getVerificationStatusBadge(company.verificationStatus || 'unverified')}
                </div>

                {/* Additional Information */}
                {(gstNumber || panNumber || additionalNotes || submittedBy.email) && (
                  <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center"><FileText className="w-4 h-4 mr-2" />Additional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {gstNumber && <div><span className="text-gray-400">GST Number:</span><span className="text-white ml-2 font-mono">{gstNumber}</span></div>}
                      {panNumber && <div><span className="text-gray-400">PAN Number:</span><span className="text-white ml-2 font-mono">{panNumber}</span></div>}
                      {submittedBy.email && <div><span className="text-gray-400">Submitted By:</span><span className="text-white ml-2">{submittedBy.firstName} {submittedBy.lastName} ({submittedBy.email})</span></div>}
                    </div>
                    {additionalNotes && (
                      <div className="mt-3 pt-3 border-t border-slate-700"><span className="text-gray-400 block mb-1">Notes:</span><p className="text-white text-sm">{additionalNotes}</p></div>
                    )}
                  </div>
                )}

                {/* Verification Documents */}
                {documents.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-white flex items-center"><FileText className="w-4 h-4 mr-2" />Verification Documents ({documents.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.map((doc: any, index: number) => (
                        <Card key={index} className="bg-slate-800/50 border-slate-600 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <FileText className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-sm truncate">{doc.type || `Document ${index + 1}`}</p>
                                <p className="text-xs text-gray-400 mt-1 truncate">{doc.filename || doc.url?.split('/').pop() || 'document.pdf'}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="flex-shrink-0 ml-2">
                              <a href={getImageUrl(doc.url) || '#'} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No verification documents submitted</p>
                  </div>
                )}

                {/* Verification Actions */}
                {company.verificationStatus === 'pending' && (
                  <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-700">
                    <Button variant="outline" onClick={() => setShowRejectDialog(true)} disabled={processing} className="border-red-500 text-red-400 hover:bg-red-500/10">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button onClick={() => onApprove(company.id)} disabled={processing} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {processing ? 'Processing...' : 'Approve Verification'}
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/5 border-white/10 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Jobs</p>
                      <p className="text-3xl font-bold text-white mt-1">{company.totalJobsPosted || 0}</p>
                    </div>
                    <Briefcase className="w-10 h-10 text-blue-400" />
                  </div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Applications</p>
                      <p className="text-3xl font-bold text-white mt-1">{company.totalApplications || 0}</p>
                    </div>
                    <Users className="w-10 h-10 text-green-400" />
                  </div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Rating</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {company.rating && typeof company.rating === 'number' ? company.rating.toFixed(1) : 'N/A'}
                      </p>
                    </div>
                    <Star className="w-10 h-10 text-yellow-400" />
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription className="text-slate-300">
              Please provide a reason for rejecting this verification request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Reason for Rejection *</label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="incomplete_documents">Incomplete Documents</SelectItem>
                  <SelectItem value="invalid_documents">Invalid or Unreadable Documents</SelectItem>
                  <SelectItem value="mismatch_information">Information Mismatch</SelectItem>
                  <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Additional Notes (Optional)</label>
              <Textarea value={rejectionNotes} onChange={(e) => setRejectionNotes(e.target.value)} placeholder="Provide more details about the rejection..." className="bg-slate-700 border-slate-600 text-white min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="border-slate-600">Cancel</Button>
            <Button onClick={handleRejectClick} disabled={processing || !rejectReason} className="bg-red-600 hover:bg-red-700">
              {processing ? 'Rejecting...' : 'Reject Verification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

