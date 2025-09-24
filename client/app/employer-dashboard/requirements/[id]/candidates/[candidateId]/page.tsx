"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Clock, 
  Mail, 
  Phone, 
  Download, 
  Star, 
  Calendar,
  Users,
  Building2,
  Award,
  Globe,
  Linkedin,
  Github,
  ExternalLink,
  Eye,
  Share2,
  FileText,
  Loader2,
  X,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function CandidateProfilePage() {
  const params = useParams()
  const requirementId: string = String((params as any)?.id || '')
  const candidateIdStr: string = String((params as any)?.candidateId || '')
  const [activeTab, setActiveTab] = useState("overview")
  const [candidate, setCandidate] = useState<any>(null)
  const [requirement, setRequirement] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isShortlisted, setIsShortlisted] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isContacting, setIsContacting] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [message, setMessage] = useState("")
  const [subject, setSubject] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const { toast } = useToast()

  // Ensure API links hit backend, not the Next.js origin
  const toAbsoluteApiUrl = (url?: string) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    return `${base}${url}`;
  }

  useEffect(() => {
    const fetchCandidateProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Track profile view for quota consumption
        try {
          await apiService.trackProfileView(candidateIdStr)
          console.log('✅ Profile view tracked successfully')
        } catch (error) {
          console.error('⚠️ Failed to track profile view:', error)
          // Don't fail the profile load if tracking fails
        }
        
        const response = await apiService.getCandidateProfile(
          requirementId,
          candidateIdStr
        )
        
        if (response.success) {
          console.log('📄 Candidate data received:', response.data.candidate)
          console.log('📄 Resumes in candidate data:', response.data.candidate?.resumes)
          setCandidate(response.data.candidate)
          setRequirement(response.data.requirement)
          setIsShortlisted(response.data.candidate?.isShortlisted || false)
        } else {
          setError(response.message || 'Failed to fetch candidate profile')
          toast({
            title: "Error",
            description: response.message || 'Failed to fetch candidate profile',
            variant: "destructive"
          })
        }
      } catch (err) {
        console.error('Error fetching candidate profile:', err)
        setError('Failed to fetch candidate profile')
        toast({
          title: "Error",
          description: 'Failed to fetch candidate profile',
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id && params.candidateId) {
      fetchCandidateProfile()
    }
  }, [params.id, params.candidateId, toast])

  // Handle resume download
  const handleDownloadResume = async (resume: any) => {
    if (!resume?.id) {
      toast({
        title: "Error",
        description: "Resume not available for download",
        variant: "destructive"
      })
      return
    }

    try {
      setIsDownloading(true)
      
      // Use the API service to download the resume
      const response = await apiService.downloadCandidateResume(requirementId, candidateIdStr, resume.id)
      
      // Get the filename from the response headers or use a default
      const contentDisposition = response.headers.get('content-disposition')
      let filename = resume.filename || `${candidate.name}_Resume.pdf`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Success",
        description: "Resume download started"
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download resume",
        variant: "destructive"
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle resume view (mimic Applications viewer)
  const handleViewResume = async (resume: any) => {
    if (!resume?.id) {
      toast({
        title: "Error",
        description: "Resume not available for viewing",
        variant: "destructive"
      })
      return
    }

    try {
      // Prefer direct file URL if available
      const directUrl = toAbsoluteApiUrl(resume?.metadata?.fileUrl || resume?.fileUrl)
      if (directUrl) {
        window.open(directUrl, '_blank', 'noopener,noreferrer')
        return
      }

      // Fallback: fetch via API and open blob URL
      const response = await apiService.downloadCandidateResume(requirementId, candidateIdStr, resume.id)
      if (!response.ok) {
        throw new Error(`Failed to load resume: ${response.status} ${response.statusText}`)
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 10000)
      if (!newWindow) {
        toast({ title: 'Popup blocked', description: 'Please allow popups to view the resume', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error viewing resume:', error)
      toast({ title: 'Error', description: 'Failed to view resume', variant: 'destructive' })
    }
  }

  // Handle cover letter view
  const handleViewCoverLetter = (coverLetter: any) => {
    try {
      // Try direct url first
      const direct = toAbsoluteApiUrl(coverLetter?.fileUrl || coverLetter?.metadata?.fileUrl)
      if (direct) {
        window.open(direct, '_blank', 'noopener,noreferrer')
        return
      }
      // Fallback to API download -> blob view
      if (coverLetter?.id) {
        apiService.downloadCandidateCoverLetter(candidate.id, coverLetter.id)
          .then(async (resp) => {
            if (!resp.ok) throw new Error(`Failed: ${resp.status}`)
            const blob = await resp.blob()
            const url = window.URL.createObjectURL(blob)
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
            setTimeout(() => window.URL.revokeObjectURL(url), 10000)
            if (!newWindow) {
              toast({ title: 'Popup blocked', description: 'Please allow popups to view the cover letter', variant: 'destructive' })
            }
          })
          .catch((e) => {
            console.error('Cover letter view error:', e)
            toast({ title: 'Error', description: 'Failed to view cover letter', variant: 'destructive' })
          })
        return
      }
      // Last resort: show inline content
      toast({ title: 'Cover Letter', description: coverLetter?.content || 'Cover letter not available' })
    } catch (e) {
      console.error('Cover letter view error:', e)
      toast({ title: 'Error', description: 'Failed to view cover letter', variant: 'destructive' })
    }
  }

  // Handle cover letter download
  const handleDownloadCoverLetter = async (coverLetter: any) => {
    console.log('🔍 Downloading cover letter:', coverLetter)
    
    if (!coverLetter?.id) {
      toast({
        title: "Error",
        description: "Cover letter not available for download",
        variant: "destructive"
      })
      return
    }

    try {
      setIsDownloading(true)
      
      // Try direct file download first if fileUrl is available
      const fileUrl = toAbsoluteApiUrl(coverLetter?.fileUrl || coverLetter?.metadata?.fileUrl)
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
        
        toast({
          title: "Success",
          description: "Cover letter download started"
        })
        return
      }
      
      // Fallback to API download
      console.log('📄 Downloading cover letter via API:', coverLetter.id)
      const response = await apiService.downloadCandidateCoverLetter(candidateIdStr, String(coverLetter.id))
      
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
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Success",
        description: "Cover letter download started"
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download cover letter",
        variant: "destructive"
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle shortlist candidate
  const handleShortlistCandidate = async () => {
    try {
      setIsContacting(true) // Reuse this state for shortlist loading
      
      const response = await apiService.shortlistCandidate(
        params.id as string,
        params.candidateId as string
      )
      
      if (response.success) {
        setIsShortlisted(!isShortlisted)
        toast({
          title: "Success",
          description: isShortlisted ? "Candidate removed from shortlist" : "Candidate added to shortlist"
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update shortlist",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Shortlist error:', error)
      toast({
        title: "Error",
        description: "Failed to update shortlist",
        variant: "destructive"
      })
    } finally {
      setIsContacting(false)
    }
  }

  // Handle contact candidate - show contact info modal
  const handleContactCandidate = () => {
    setShowContactModal(true)
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!message.trim() || !subject.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSendingMessage(true)
      
      const response = await apiService.contactCandidate(
        params.id as string,
        params.candidateId as string,
        message.trim(),
        subject.trim()
      )
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Message sent to candidate successfully"
        })
        setShowMessageModal(false)
        setMessage("")
        setSubject("")
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to send message",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Send message error:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setIsSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <EmployerNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-slate-600">Loading candidate profile...</p>
            </div>
          </div>
        </div>
        <EmployerFooter />
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <EmployerNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Profile Not Found</h2>
              <p className="text-slate-600 mb-4">{error || 'The candidate profile could not be found.'}</p>
              <Link href="/employer-dashboard/requirements">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Requirements
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <EmployerFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <EmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/employer-dashboard/requirements">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Requirements
              </Button>
            </Link>
            {requirement && (
              <div className="text-sm text-slate-600">
                Viewing profile for requirement: <span className="font-medium">{requirement.title}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Header */}
            <div className="flex-1">
              <div className="flex items-start space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={candidate.avatar} alt={candidate.name} />
                  <AvatarFallback className="text-2xl font-bold">{candidate.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">{candidate.name}</h1>
                      <p className="text-xl text-slate-600 mb-2">{candidate.designation}</p>
                      <p className="text-slate-500">{candidate.about}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {candidate.phoneVerified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Phone ✓
                        </Badge>
                      )}
                      {candidate.emailVerified && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Email ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{candidate.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{candidate.experience}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{candidate.noticePeriod}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">Active {candidate.activeStatus}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {candidate.keySkills.slice(0, 8).map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.keySkills.length > 8 && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                        +{candidate.keySkills.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleContactCandidate}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Candidate
              </Button>
              
              {candidate?.resumes && candidate.resumes.length > 0 && (
                <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => handleDownloadResume(candidate.resumes[0])}
                  disabled={isDownloading}
                >
                <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? "Downloading..." : "Download Resume"}
                  </Button>
                  {candidate.resumes.length > 1 && (
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('cv')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View All CVs ({candidate.resumes.length})
              </Button>
                  )}
                </div>
              )}
              
              <Button 
                variant={isShortlisted ? "default" : "outline"}
                onClick={handleShortlistCandidate}
                disabled={isContacting}
              >
                <Star className={`w-4 h-4 mr-2 ${isShortlisted ? 'fill-current' : ''}`} />
                {isContacting ? "Updating..." : (isShortlisted ? "Shortlisted" : "Add to Shortlist")}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="cv">CV</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{candidate.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{candidate.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{candidate.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{candidate.portfolio}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Salary & Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Salary & Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500">Current Salary</p>
                    <p className="font-medium">{candidate.currentSalary}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Expected Salary</p>
                    <p className="font-medium">{candidate.expectedSalary}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Notice Period</p>
                    <p className="font-medium">{candidate.noticePeriod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Preferred Locations</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {candidate.preferredLocations.map((location: string) => (
                        <Badge key={location} variant="outline" className="text-xs">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills & Languages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" />
                    <span>Skills & Languages</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Technical Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.keySkills.slice(0, 6).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Languages</p>
                    <div className="space-y-1">
                      {candidate.languages.map((language: { name: string; proficiency: string }) => (
                        <div key={language.name} className="flex justify-between text-sm">
                          <span>{language.name}</span>
                          <span className="text-slate-500">{language.proficiency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {candidate.certifications.map((cert: { id: string; name: string; issuer: string; date: string }) => (
                    <div key={cert.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-1">{cert.name}</h4>
                      <p className="text-sm text-slate-600 mb-2">{cert.issuer}</p>
                      <p className="text-xs text-slate-500">{cert.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {candidate.workExperience.map((exp: { id: string; title: string; company: string; duration: string; location: string; description?: string; skills: string[] }) => (
                    <div key={exp.id} className="border-l-4 border-blue-500 pl-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{exp.title}</h3>
                          <p className="text-slate-600">{exp.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">{exp.duration}</p>
                          <p className="text-sm text-slate-500">{exp.location}</p>
                        </div>
                      </div>
                      <p className="text-slate-600 mb-3">{exp.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {exp.skills.map((skill: string) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {candidate.educationDetails.map((edu: { id: string; degree: string; institution: string; duration: string; location: string; cgpa?: string; percentage?: string; relevantCourses?: string[] }) => (
                    <div key={edu.id} className="border-l-4 border-green-500 pl-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{edu.degree}</h3>
                          <p className="text-slate-600">{edu.institution}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">{edu.duration}</p>
                          <p className="text-sm text-slate-500">{edu.location}</p>
                        </div>
                      </div>
                      {edu.cgpa && (
                        <p className="text-sm text-slate-600 mb-2">CGPA: {edu.cgpa}</p>
                      )}
                      {edu.percentage && (
                        <p className="text-sm text-slate-600 mb-2">Percentage: {edu.percentage}</p>
                      )}
                      {edu.relevantCourses && (
                        <div>
                          <p className="text-sm text-slate-500 mb-2">Relevant Courses:</p>
                          <div className="flex flex-wrap gap-2">
                            {edu.relevantCourses.map((course: string) => (
                              <Badge key={course} variant="outline" className="text-xs">
                                {course}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {candidate.projects.map((project: { id: string; title: string; description: string; technologies: string[]; github?: string; live?: string }) => (
                    <div key={project.id} className="border rounded-lg p-6">
                      <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                      <p className="text-slate-600 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.map((tech: string) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        {project.github && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`https://${project.github}`} target="_blank" rel="noopener noreferrer">
                              <Github className="w-4 h-4 mr-2" />
                              GitHub
                            </a>
                          </Button>
                        )}
                        {project.live && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`https://${project.live}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cv" className="space-y-6">
            {/* Resume/CV Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Resume/CV</span>
                    {candidate.resumes && candidate.resumes.length > 1 && (
                      <Badge variant="secondary" className="ml-2">
                        {candidate.resumes.length} CVs
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {candidate.resumes && candidate.resumes.length > 0 ? (
                    <>
                      {/* Multiple CVs Selection */}
                      {candidate.resumes.length > 1 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold mb-3">Available CVs</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                      onClick={() => handleViewResume(resume)}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => handleDownloadResume(resume)}
                                      disabled={isDownloading}
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

                      {/* Primary CV Preview */}
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {candidate.resumes[0].filename || candidate.resumes[0].title || 'Resume'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            PDF • {candidate.resumes[0].fileSize || 'Document'} • Uploaded {new Date(candidate.resumes[0].uploadDate || candidate.resumes[0].lastUpdated).toLocaleDateString()}
                      </p>
                      
                      {/* CV Preview Image */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4">
                        <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">CV Preview</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Click to view full document</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleViewResume(candidate.resumes[0])}>
                              <Eye className="w-4 h-4 mr-2" />
                              View CV
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => handleDownloadResume(candidate.resumes[0])}
                              disabled={isDownloading}
                            >
                          <Download className="w-4 h-4 mr-2" />
                          {isDownloading ? "Downloading..." : "Download PDF"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* CV Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">CV Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">File Name</span>
                          <span className="font-medium">{candidate.resumes[0].filename || candidate.resumes[0].title || 'Resume'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">File Size</span>
                          <span className="font-medium">{candidate.resumes[0].fileSize || 'PDF Document'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Upload Date</span>
                          <span className="font-medium">{new Date(candidate.resumes[0].uploadDate || candidate.resumes[0].lastUpdated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Last Updated</span>
                              <span className="font-medium">{new Date(candidate.resumes[0].lastUpdated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Format</span>
                          <span className="font-medium">{candidate.resumes[0].metadata?.mimeType?.includes('pdf') ? 'PDF' : 'Document'}</span>
                        </div>
                        {candidate.resumes[0].metadata?.originalName && (
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Original Name</span>
                            <span className="font-medium">{candidate.resumes[0].metadata.originalName}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">CV Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleViewResume(candidate.resumes[0])}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Full CV
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleDownloadResume(candidate.resumes[0])}
                              disabled={isDownloading}
                            >
                          <Download className="w-4 h-4 mr-2" />
                          {isDownloading ? "Downloading..." : "Download CV"}
                        </Button>
                        {candidate.resumes.length > 1 && (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setActiveTab('cv')}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View All CVs ({candidate.resumes.length})
                          </Button>
                        )}
                        <Button variant="outline" className="w-full">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share CV
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Mail className="w-4 h-4 mr-2" />
                          Email CV
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Resume Summary and Skills */}
                  {candidate.resumes[0].summary && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Resume Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 whitespace-pre-wrap">{candidate.resumes[0].summary}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Resume Skills */}
                  {candidate.resumes[0].skills && candidate.resumes[0].skills.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Resume Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {candidate.resumes[0].skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-sm">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Resume Available</h3>
                      <p className="text-slate-600">This candidate hasn't uploaded a resume yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cover Letter Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Cover Letters</span>
                    {candidate.coverLetters && candidate.coverLetters.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {candidate.coverLetters.length} Letters
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {candidate.coverLetters && candidate.coverLetters.length > 0 ? (
                    <>
                      {/* Multiple Cover Letters */}
                      {candidate.coverLetters.length > 1 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold mb-3">Available Cover Letters</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <div className="border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg p-8 text-center">
                        <div className="max-w-md mx-auto">
                          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {candidate.coverLetters[0].title || 'Cover Letter'}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            {candidate.coverLetters[0].isDefault ? 'Default Cover Letter' : 'Custom Cover Letter'} • 
                            Updated {new Date(candidate.coverLetters[0].lastUpdated).toLocaleDateString()}
                          </p>
                          
                          {/* Cover Letter Preview */}
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4">
                            <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Cover Letter Preview</p>
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Click to view full content</p>
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
                              Download PDF
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Cover Letter Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Cover Letter Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Title</span>
                              <span className="font-medium">{candidate.coverLetters[0].title || 'Cover Letter'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Type</span>
                              <span className="font-medium">{candidate.coverLetters[0].isDefault ? 'Default' : 'Custom'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Last Updated</span>
                              <span className="font-medium">{new Date(candidate.coverLetters[0].lastUpdated).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Status</span>
                              <span className="font-medium">{candidate.coverLetters[0].isPublic ? 'Public' : 'Private'}</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Cover Letter Actions</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleViewCoverLetter(candidate.coverLetters[0])}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Full Cover Letter
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleDownloadCoverLetter(candidate.coverLetters[0])}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Cover Letter
                            </Button>
                            {candidate.coverLetters.length > 1 && (
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => setActiveTab('cv')}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                View All Letters ({candidate.coverLetters.length})
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Cover Letter Summary */}
                      {candidate.coverLetters[0].summary && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Cover Letter Summary</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 whitespace-pre-wrap">{candidate.coverLetters[0].summary}</p>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Cover Letters Available</h3>
                      <p className="text-gray-600">This candidate hasn't uploaded any cover letters yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact Information Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{candidate?.email || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{candidate?.phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-3">
                <Button
                  onClick={() => {
                    setShowContactModal(false)
                    setShowMessageModal(true)
                    setSubject(`Job Opportunity: ${requirement?.title}`)
                    setMessage(`Hello ${candidate?.name},\n\nI'm interested in discussing the ${requirement?.title} position with you. Please let me know if you're available for a conversation.\n\nBest regards`)
                  }}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                
                {candidate?.email && (
                  <a
                    href={`mailto:${candidate.email}?subject=Job Opportunity: ${requirement?.title}&body=Hello ${candidate.name},%0D%0A%0D%0AI'm interested in discussing the ${requirement?.title} position with you. Please let me know if you're available for a conversation.%0D%0A%0D%0ABest regards`}
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send Message to {candidate?.name}</h3>
              <button
                onClick={() => {
                  setShowMessageModal(false)
                  setMessage("")
                  setSubject("")
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter message subject"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your message to the candidate"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSendMessage}
                  disabled={isSendingMessage || !message.trim() || !subject.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSendingMessage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMessageModal(false)
                    setMessage("")
                    setSubject("")
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <EmployerFooter />
    </div>
  )
} 