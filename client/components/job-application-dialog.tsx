"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

interface JobApplicationDialogProps {
  isOpen: boolean
  onClose: () => void
  job: {
    id: string
    title: string
    company: {
      name: string
    }
    location: string
  }
  onSuccess?: () => void
  isGulfJob?: boolean
}

export function JobApplicationDialog({ 
  isOpen, 
  onClose, 
  job, 
  onSuccess,
  isGulfJob = false 
}: JobApplicationDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [applicationData, setApplicationData] = useState({
    expectedSalary: '',
    noticePeriod: '30',
    coverLetter: '',
    willingToRelocate: isGulfJob // Default to true for Gulf jobs
  })

  const handleSubmit = async () => {
    if (!job) return

    setSubmitting(true)
    try {
      const response = await apiService.applyJob(job.id, {
        coverLetter: applicationData.coverLetter || `I am interested in the ${job.title} position at ${job.company.name}.${isGulfJob ? ' I am excited about the opportunity to work in the Gulf region.' : ''}`,
        expectedSalary: applicationData.expectedSalary ? parseInt(applicationData.expectedSalary) : undefined,
        noticePeriod: applicationData.noticePeriod ? parseInt(applicationData.noticePeriod) : 30,
        availableFrom: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isWillingToRelocate: applicationData.willingToRelocate,
        preferredLocations: [job.location],
        resumeId: undefined
      })
      
      if (response.success) {
        toast.success(`Application submitted successfully for ${job.title} at ${job.company.name}!`, {
          description: 'Your application has been submitted and is under review.',
          duration: 5000,
        })
        onClose()
        setApplicationData({
          expectedSalary: '',
          noticePeriod: '30',
          coverLetter: '',
          willingToRelocate: isGulfJob
        })
        onSuccess?.()
      } else {
        toast.error(response.message || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying for job:', error)
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply for {job?.title}</DialogTitle>
          <DialogDescription>
            {isGulfJob 
              ? "Complete your application for this Gulf opportunity. Make sure your profile and resume are up to date."
              : "Submit your application for this position. Make sure your profile and resume are up to date."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expectedSalary">
                Expected Salary {isGulfJob ? '(USD)' : '(LPA)'}
              </Label>
              <Input
                id="expectedSalary"
                type="number"
                placeholder={isGulfJob ? "e.g., 50000" : "e.g., 8-12"}
                value={applicationData.expectedSalary}
                onChange={(e) => setApplicationData(prev => ({ ...prev, expectedSalary: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="noticePeriod">Notice Period (Days)</Label>
              <Input
                id="noticePeriod"
                type="number"
                placeholder="e.g., 30"
                value={applicationData.noticePeriod}
                onChange={(e) => setApplicationData(prev => ({ ...prev, noticePeriod: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="coverLetter">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              rows={4}
              value={applicationData.coverLetter}
              onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="willingToRelocate"
              checked={applicationData.willingToRelocate}
              onChange={(e) => setApplicationData(prev => ({ ...prev, willingToRelocate: e.target.checked }))}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            <Label htmlFor="willingToRelocate">
              I am willing to relocate for this position
            </Label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
