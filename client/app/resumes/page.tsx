"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  Upload,
  FileText,
  Edit,
  Trash2,
  Star,
  Eye,
  Download,
  Plus,
  X
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { toast } from 'sonner'
import { apiService, Resume } from '@/lib/api'

export default function ResumesPage() {
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
        toast.success('Resume uploaded successfully')
        fetchResumes()
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      toast.error('Failed to upload resume')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      const response = await apiService.deleteResume(resumeId)
      if (response.success) {
        toast.success('Resume deleted successfully')
        fetchResumes()
      }
    } catch (error) {
      console.error('Error deleting resume:', error)
      toast.error('Failed to delete resume')
    }
  }

  const handleSetDefault = async (resumeId: string) => {
    try {
      const response = await apiService.setDefaultResume(resumeId)
      if (response.success) {
        toast.success('Default resume updated')
        fetchResumes()
      }
    } catch (error) {
      console.error('Error setting default resume:', error)
      toast.error('Failed to set default resume')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />
      
      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
               <div>
                 <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                   My Resumes
                 </h1>
                 <p className="text-slate-600 dark:text-slate-300">
                   Manage your resumes and CVs
                 </p>
               </div>
               <div className="flex items-center space-x-2">
                 <Badge variant="outline" className="text-sm">
                   <FileText className="w-3 h-3 mr-1" />
                   {resumes.length} resumes
                 </Badge>
                 <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                   <Upload className="w-4 h-4 mr-2" />
                   Upload Resume
                 </Button>
                 <input
                   ref={fileInputRef}
                   type="file"
                   accept=".pdf,.doc,.docx"
                   onChange={handleFileUpload}
                   className="hidden"
                 />
               </div>
             </div>
          </div>

          {uploading && (
            <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-600 dark:text-blue-400">Uploading resume...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {resumesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : resumes.length === 0 ? (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No resumes yet
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Upload your first resume to get started
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume
                </Button>
              </CardContent>
            </Card>
          ) : (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {resumes.map((resume) => (
                 <Card key={resume.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200">
                   <CardContent className="p-6">
                     <div className="flex flex-col space-y-4">
                       <div className="flex items-start justify-between">
                         <div className="flex-1 min-w-0">
                           <div className="flex flex-wrap items-center gap-2 mb-2">
                             <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                               {resume.title}
                             </h3>
                             {resume.isDefault && (
                               <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex-shrink-0">
                                 <Star className="w-3 h-3 mr-1" />
                                 Default
                               </Badge>
                             )}
                             <Badge variant={resume.isPublic ? "default" : "secondary"} className="flex-shrink-0">
                               {resume.isPublic ? "Public" : "Private"}
                             </Badge>
                           </div>
                           
                           {resume.summary && (
                             <p className="text-slate-600 dark:text-slate-300 mb-3 line-clamp-2 text-sm">
                               {resume.summary}
                             </p>
                           )}

                           <div className="flex flex-wrap gap-2 mb-3">
                             {resume.skills.slice(0, 3).map((skill, index) => (
                               <Badge key={index} variant="outline" className="text-xs">
                                 {skill}
                               </Badge>
                             ))}
                             {resume.skills.length > 3 && (
                               <Badge variant="outline" className="text-xs">
                                 +{resume.skills.length - 3} more
                               </Badge>
                             )}
                           </div>
                         </div>
                       </div>

                       <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
                         <div className="flex flex-wrap items-center gap-4">
                           <div className="flex items-center space-x-1">
                             <Eye className="w-4 h-4" />
                             <span>{resume.views} views</span>
                           </div>
                           <div className="flex items-center space-x-1">
                             <Download className="w-4 h-4" />
                             <span>{resume.downloads} downloads</span>
                           </div>
                           <div className="flex items-center space-x-1">
                             <span>Updated: {new Date(resume.lastUpdated).toLocaleDateString()}</span>
                           </div>
                         </div>
                       </div>

                       <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                         {!resume.isDefault && (
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => handleSetDefault(resume.id)}
                             className="flex-1 sm:flex-none"
                           >
                             <Star className="w-4 h-4 mr-1" />
                             Set Default
                           </Button>
                         )}
                         <Button 
                           variant="outline" 
                           size="sm"
                           className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                           onClick={() => handleDeleteResume(resume.id)}
                         >
                           <Trash2 className="w-4 h-4 mr-1" />
                           Delete
                         </Button>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
