"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Phone, Download, Share2, Star, Calendar, FileText, Eye, Heart, GraduationCap, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export default function CandidateProfilePage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("profile-detail")
  const [likeCount, setLikeCount] = useState<number>(0)
  const [liked, setLiked] = useState<boolean>(false)
  const [candidate, setCandidate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial like state and candidate profile
  useEffect(() => {
    const loadData = async () => {
      if (!params.id) return;
      
      try {
        // Load likes
        const likesRes = await apiService.getCandidateLikes(String(params.id))
        if (likesRes.success && likesRes.data) {
          setLikeCount(likesRes.data.likeCount)
          setLiked(likesRes.data.likedByCurrent)
        }
        
        // Load candidate profile
        setLoading(true)
        setError(null)
        
        console.log('🔍 Fetching candidate profile for:', params.id)
        
        // Track profile view for quota consumption
        try {
          await apiService.trackProfileView(String(params.id))
          console.log('✅ Profile view tracked successfully')
        } catch (error) {
          console.error('⚠️ Failed to track profile view:', error)
          // Don't fail the profile load if tracking fails
        }
        
        const response = await apiService.getGeneralCandidateProfile(String(params.id))
        
        if (response.success && response.data) {
          console.log('✅ Candidate profile fetched successfully:', response.data)
          setCandidate(response.data)
        } else {
          console.error('❌ Failed to fetch candidate profile:', response.message)
          setError(response.message || 'Failed to fetch candidate profile')
        }
      } catch (err) {
        console.error('❌ Error loading data:', err)
        setError('Failed to load candidate data')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [params.id])

  // Handle resume download
  const handleDownloadResume = async (resume: any) => {
    if (!resume?.id) {
      toast.error('Resume not available for download')
      return
    }

    try {
      // For this page, we'll use a generic download approach
      // Since we don't have requirement context, we'll try the direct resume download
      const response = await apiService.downloadApplicationResume(resume.id)
      
      // Get the filename from the response headers or use a default
      const contentDisposition = response.headers.get('content-disposition')
      let filename = resume.filename || resume.title || 'Resume.pdf'
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Resume downloaded successfully')
    } catch (error) {
      console.error('Error downloading resume:', error)
      toast.error('Failed to download resume')
    }
  }

  // Handle cover letter view
  const handleViewCoverLetter = (coverLetter: any) => {
    console.log('🔍 Viewing cover letter:', coverLetter)
    
    // Try fileUrl first, then metadata.fileUrl
    const fileUrl = coverLetter?.fileUrl || coverLetter?.metadata?.fileUrl
    
    if (fileUrl) {
      console.log('📄 Opening cover letter file:', fileUrl)
      // Open file in new tab
      window.open(fileUrl, '_blank', 'noopener,noreferrer')
    } else {
      console.log('📝 No file URL, showing content')
      // Show content in toast or modal
      toast.info(coverLetter.content || "Cover letter content not available")
    }
  }

  // Handle cover letter download
  const handleDownloadCoverLetter = async (coverLetter: any) => {
    console.log('🔍 Downloading cover letter:', coverLetter)
    
    if (!coverLetter?.id) {
      toast.error('Cover letter not available for download')
      return
    }

    try {
      // Try direct file download first if fileUrl is available
      const fileUrl = coverLetter?.fileUrl || coverLetter?.metadata?.fileUrl
      if (fileUrl) {
        console.log('📄 Downloading cover letter file directly:', fileUrl)
        
        // Get filename from cover letter data
        const filename = coverLetter.filename || 
                        coverLetter.metadata?.filename || 
                        coverLetter.metadata?.originalName || 
                        `${candidate.name}_CoverLetter.pdf`
        
        // Create a temporary link to download the file
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = filename
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success('Cover letter download started')
        return
      }
      
      // Fallback to API download
      console.log('📄 Downloading cover letter via API:', coverLetter.id)
      const response = await apiService.downloadCandidateCoverLetter(candidate.id, coverLetter.id)
      
      // Get the filename from the response headers or use a default
      const contentDisposition = response.headers.get('content-disposition')
      let filename = coverLetter.filename || 
                    coverLetter.metadata?.filename || 
                    coverLetter.metadata?.originalName || 
                    `${candidate.name}_CoverLetter.pdf`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Cover letter downloaded successfully')
    } catch (error) {
      console.error('Error downloading cover letter:', error)
      toast.error('Failed to download cover letter')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployerNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading candidate profile...</p>
            </div>
          </div>
        </div>
        <EmployerFooter />
      </div>
    );
  }

  // Error state
  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployerNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
              <p className="text-gray-600 mb-4">{error || 'The candidate profile you are looking for does not exist.'}</p>
              <Link href="/employer-dashboard/candidates" className="text-blue-600 hover:text-blue-800">
                ← Back to Candidates
              </Link>
            </div>
          </div>
        </div>
        <EmployerFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link
              href="/employer-dashboard/requirements"
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <span>🏠</span>
              <span className="ml-1">My requirement</span>
            </Link>
            <span className="text-gray-400">›</span>
            <Link href="/employer-dashboard/requirements/1" className="text-blue-600 hover:text-blue-700">
              Software Engineer
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">{candidate.name}</span>
            <div className="flex items-center space-x-2 ml-4">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                <Eye className="w-4 h-4 mr-1" />
                Print
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                <Heart className="w-4 h-4 mr-1" />
                Report profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Header Card */}
            <Card className="bg-white shadow-sm border border-gray-200 mb-6">
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={`https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-L27NPW4HTYTvHi6Jkq8bCJCSbGPYvy.png`}
                    />
                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                      {candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{candidate.name}</h1>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge className="bg-blue-50 text-blue-700 text-sm">{candidate.experience}</Badge>
                      <Badge variant="outline">{candidate.location}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      <p className="mb-1">Available to join in {candidate.noticePeriod} • Available for less</p>
                      <p className="mb-1">Highest qualification: {candidate.education}</p>
                      <p>Pref. locations: {candidate.preferredLocations.join(", ")}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button className="bg-blue-600 hover:bg-blue-700">View phone number</Button>
                      <Button variant="outline">Verified phone & email</Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 mb-2">{candidate.designation}</div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                      <button
                        aria-label={liked ? 'Remove upvote' : 'Upvote candidate'}
                        onClick={async () => {
                          try {
                            if (liked) {
                              const res = await apiService.unlikeCandidate(String(candidate.id))
                              if (res.success) {
                                setLiked(false)
                                setLikeCount((c) => Math.max(0, c - 1))
                              }
                            } else {
                              const res = await apiService.likeCandidate(String(candidate.id))
                              if (res.success) {
                                setLiked(true)
                                setLikeCount((c) => c + 1)
                              }
                            }
                          } catch (e) {}
                        }}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${liked ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      >
                        <svg className={`w-3.5 h-3.5 ${liked ? 'fill-green-600 text-green-600' : 'text-slate-500'}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 5l7 12H5l7-12z"/></svg>
                        <span>{likeCount}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status indicators */}
            <div className="flex items-center justify-between mb-6 text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                {candidate.attachedCV.available && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>CV attached</span>
                  </div>
                )}
                <span>Modified in {candidate.lastModified}</span>
                <span>Active in {candidate.activeStatus}</span>
              </div>
            </div>

            {/* Profile Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm border border-gray-200">
                <TabsTrigger value="profile-detail" className="text-sm">
                  Profile detail
                </TabsTrigger>
                <TabsTrigger value="attached-cv" className="text-sm">
                  Attached CV
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile-detail" className="mt-6">
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="space-y-8">
                      {/* Designation */}
                      <div>
                        <div className="bg-orange-50 border-l-4 border-orange-400 p-3 mb-4">
                          <p className="text-sm font-medium text-orange-800">{candidate.designation}</p>
                        </div>
                      </div>

                      {/* Key Skills */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {candidate.keySkills.map((skill) => (
                            <Badge key={skill} className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* May Also Know */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">May also know</h3>
                        <p className="text-gray-700">{candidate.mayAlsoKnow}</p>
                      </div>

                      {/* Work Summary */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Work summary</h3>
                        <p className="text-gray-700 leading-relaxed">{candidate.workSummary}</p>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">Industry:</span>
                            <p className="text-gray-600">{candidate.industry}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Department:</span>
                            <p className="text-gray-600">{candidate.department}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Role:</span>
                            <p className="text-gray-600">{candidate.role}</p>
                          </div>
                        </div>
                      </div>

                      {/* Other Projects */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Other projects</h3>
                        {candidate.projects.map((project, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">{project.title}</h4>
                              <span className="text-xs text-gray-500">{project.lastUpdated}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                            <Button variant="link" className="text-blue-600 p-0 h-auto text-sm">
                              {project.link}
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Education */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{candidate.education}</p>
                          </div>
                        </div>
                      </div>

                      {/* IT Skills */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">IT skills</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Skills
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Version
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Last Used
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Experience
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {candidate.itSkills.map((skill, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-2 text-sm text-gray-900">{skill.name}</td>
                                  <td className="px-4 py-2 text-sm text-gray-600">{skill.version || "-"}</td>
                                  <td className="px-4 py-2 text-sm text-gray-600">{skill.lastUsed}</td>
                                  <td className="px-4 py-2 text-sm text-gray-600">{skill.experience}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attached-cv" className="mt-6">
                <div className="space-y-6">
                  {/* Resume/CV Section */}
                <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Download className="w-5 h-5" />
                        <span>Resume/CV</span>
                        {candidate?.resumes && candidate.resumes.length > 1 && (
                          <Badge variant="secondary" className="ml-2">
                            {candidate.resumes.length} CVs
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                  <CardContent className="p-6">
                      {candidate?.resumes && candidate.resumes.length > 0 ? (
                        <div className="space-y-6">
                          {/* Multiple CVs */}
                          {candidate.resumes.length > 1 && (
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold mb-3">Available CVs ({candidate.resumes.length})</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {candidate.resumes.map((resume: any, index: number) => (
                                  <Card key={resume.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                          <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 truncate">
                                            {resume.filename || resume.title || `CV ${index + 1}`}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {resume.fileSize || 'PDF'} • {new Date(resume.uploadDate || resume.lastUpdated).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex space-x-2 mt-3">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1"
                                          asChild
                                        >
                                          <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <Eye className="w-3 h-3 mr-1" />
                                            View
                                          </a>
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1"
                                          onClick={() => handleDownloadResume(resume)}
                                        >
                                          <Download className="w-3 h-3 mr-1" />
                                          Download
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Primary CV Display */}
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {candidate.resumes[0].filename || candidate.resumes[0].title || 'Resume'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                              {candidate.resumes[0].fileSize || 'PDF Document'} • 
                              Uploaded {new Date(candidate.resumes[0].uploadDate || candidate.resumes[0].lastUpdated).toLocaleDateString()}
                            </p>
                            
                            {/* CV Preview */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                              <div className="aspect-[3/4] bg-white rounded flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                  </div>
                                  <p className="text-sm text-gray-600">CV Preview</p>
                                  <p className="text-xs text-gray-500 mt-1">Click to view full document</p>
                                </div>
                              </div>
                      </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                                <a href={candidate.resumes[0].fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View CV
                                </a>
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => handleDownloadResume(candidate.resumes[0])}
                              >
                          <Download className="w-4 h-4 mr-2" />
                          Download CV
                        </Button>
                      </div>
                    </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resume Available</h3>
                          <p className="text-gray-600 mb-6">This candidate hasn't uploaded a resume yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Cover Letter Section */}
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Cover Letters</span>
                        {candidate?.coverLetters && candidate.coverLetters.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {candidate.coverLetters.length} Letters
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {candidate?.coverLetters && candidate.coverLetters.length > 0 ? (
                        <div className="space-y-6">
                          {/* Multiple Cover Letters */}
                          {candidate.coverLetters.length > 1 && (
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold mb-3">Available Cover Letters</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {candidate.coverLetters.map((coverLetter: any, index: number) => (
                                  <Card key={coverLetter.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                          <FileText className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 truncate">
                                            {coverLetter.title || `Cover Letter ${index + 1}`}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {coverLetter.isDefault ? 'Default' : 'Custom'} • {new Date(coverLetter.lastUpdated).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex space-x-2 mt-3">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1"
                                          onClick={() => handleViewCoverLetter(coverLetter)}
                                        >
                                          <Eye className="w-3 h-3 mr-1" />
                                          View
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1"
                                          onClick={() => handleDownloadCoverLetter(coverLetter)}
                                        >
                                          <Download className="w-3 h-3 mr-1" />
                                          Download
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Primary Cover Letter Display */}
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FileText className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {candidate.coverLetters[0].title || 'Cover Letter'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                              {candidate.coverLetters[0].isDefault ? 'Default Cover Letter' : 'Custom Cover Letter'} • 
                              Updated {new Date(candidate.coverLetters[0].lastUpdated).toLocaleDateString()}
                            </p>
                            
                            {/* Cover Letter Preview */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                              <div className="aspect-[3/4] bg-white rounded flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FileText className="w-6 h-6 text-green-600" />
                                  </div>
                                  <p className="text-sm text-gray-600">Cover Letter Preview</p>
                                  <p className="text-xs text-gray-500 mt-1">Click to view full content</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleViewCoverLetter(candidate.coverLetters[0])}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Cover Letter
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => handleDownloadCoverLetter(candidate.coverLetters[0])}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download Cover Letter
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cover Letters Available</h3>
                          <p className="text-gray-600 mb-6">This candidate hasn't uploaded any cover letters yet.</p>
                        </div>
                      )}
                  </CardContent>
                </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{candidate.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{candidate.phone}</p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Phone className="w-4 h-4 mr-2" />
                  View Contact Details
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Star className="w-4 h-4 mr-2" />
                  Add to Shortlist
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Download Resume
                </Button>
              </CardContent>
            </Card>

            {/* Candidate Stats */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Profile Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Profile Views</span>
                    <span className="font-semibold">42</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Applications</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Response Rate</span>
                    <span className="font-semibold">95%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <EmployerFooter />
    </div>
  )
}
