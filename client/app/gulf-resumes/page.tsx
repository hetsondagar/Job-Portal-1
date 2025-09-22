"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Upload, FileText, Eye, Download, ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiService, Resume } from '@/lib/api'

export default function GulfResumesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [resumesLoading, setResumesLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to manage your resumes')
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !loading) {
      fetchResumes()
    }
  }, [user, loading])

  const fetchResumes = async () => {
    try {
      setResumesLoading(true)
      const response = await apiService.getResumes()
      if (response.success && response.data) {
        setResumes(response.data)
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
      toast.error('Failed to load resumes')
    } finally {
      setResumesLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const response = await apiService.uploadResumeFile(file)
      if (response.success) {
        toast.success('Resume uploaded successfully!')
        fetchResumes()
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      toast.error('Failed to upload resume')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleView = async (id: string) => {
    try {
      const response = await apiService.fetchResumeFile(id)
      const blob = await response.blob()
      const mime = response.headers.get('content-type') || 'application/pdf'
      const url = window.URL.createObjectURL(new Blob([blob], { type: mime }))
      window.open(url, '_blank')
      setTimeout(() => window.URL.revokeObjectURL(url), 60000)
    } catch (error) {
      console.error('Error viewing resume:', error)
      toast.error('Failed to view resume')
    }
  }

  const handleDownload = async (id: string) => {
    try {
      await apiService.downloadResume(id)
    } catch (error) {
      console.error('Error downloading resume:', error)
      toast.error('Failed to download resume')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await apiService.deleteResume(id)
      if (res.success) {
        toast.success('Resume deleted')
        fetchResumes()
      } else {
        toast.error(res.message || 'Failed to delete resume')
      }
    } catch (error) {
      console.error('Error deleting resume:', error)
      toast.error('Failed to delete resume')
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/jobseeker-gulf-dashboard">
              <Button variant="outline" size="sm" className="border-green-600 text-green-600">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
            <CardTitle className="text-green-700">Gulf Resumes</CardTitle>
          </div>
          <div>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
            <Button onClick={() => fileInputRef.current?.click()} className="bg-green-600 hover:bg-green-700" disabled={uploading}>
              <Upload className="w-4 h-4 mr-2" /> {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-400">
              <FileText className="w-5 h-5" />
              <span>My Resumes</span>
              <Badge variant="secondary" className="ml-2">{resumes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resumesLoading ? (
              <div className="text-sm text-slate-600">Loading...</div>
            ) : resumes.length === 0 ? (
              <div className="text-sm text-slate-600">No resumes uploaded yet</div>
            ) : (
              <div className="space-y-3">
                {resumes.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded border border-green-200">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{r.title || 'Untitled Resume'}</div>
                      {r.summary && <div className="text-xs text-slate-600 truncate">{r.summary}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleView(r.id)} className="border-green-600 text-green-600">
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownload(r.id)} className="border-green-600 text-green-600">
                        <Download className="w-4 h-4 mr-1" /> Download
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(r.id)} className="border-red-600 text-red-600">
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


