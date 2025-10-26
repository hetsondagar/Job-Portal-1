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
import { JobseekerAuthGuard } from '@/components/jobseeker-auth-guard'

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

    // File validation
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, DOC, or DOCX files only.')
      return
    }

    if (file.size > maxSize) {
      toast.error('File size too large. Please upload a file smaller than 5MB.')
      return
    }

    try {
      setUploading(true)
      const response = await apiService.uploadResumeFile(file)
      if (response.success) {
        toast.success('Resume uploaded successfully!')
        fetchResumes()
        
        // If this is the first resume, show additional info
        if (resumes.length === 0) {
          toast.success('This resume has been set as your default resume.')
        }
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      toast.error('Failed to upload resume. Please try again.')
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

  const handleDownloadResume = async (resumeId: string) => {
    try {
      await apiService.downloadResume(resumeId)
      toast.success('Resume downloaded successfully')
    } catch (error) {
      console.error('Error downloading resume:', error)
      toast.error('Failed to download resume')
    }
  }

  const handleViewResume = async (resumeId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/user/resumes/${resumeId}/download`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to view resume');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Error viewing resume:', error)
      toast.error('Failed to view resume')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50/40 to-indigo-50/40 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 relative overflow-auto">
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
    <JobseekerAuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50/40 to-indigo-50/40 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 relative overflow-auto">
      <Navbar />
      
      {/* Welcome Back Div Style Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-200/45 via-blue-200/35 to-indigo-200/45"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-purple-300/10 to-blue-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-36 h-36 bg-gradient-to-br from-blue-300/10 to-indigo-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-indigo-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-0 right-0 h-24 bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-indigo-400/20"></div>
      </div>
      
      <div className="pt-20 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link href={user?.region === 'gulf' ? (user?.userType === 'employer' ? '/gulf-dashboard' : '/jobseeker-gulf-dashboard') : '/dashboard'}>
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
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => handleViewResume(resume.id)}
                           className="flex-1 sm:flex-none"
                         >
                           <Eye className="w-4 h-4 mr-1" />
                           View
                         </Button>
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => handleDownloadResume(resume.id)}
                           className="flex-1 sm:flex-none"
                         >
                           <Download className="w-4 h-4 mr-1" />
                           Download
                         </Button>
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
    </JobseekerAuthGuard>
  )
}
