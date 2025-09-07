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
  Loader2
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
  const [activeTab, setActiveTab] = useState("overview")
  const [candidate, setCandidate] = useState<any>(null)
  const [requirement, setRequirement] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCandidateProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await apiService.getCandidateProfile(
          params.id as string,
          params.candidateId as string
        )
        
        if (response.success) {
          setCandidate(response.data.candidate)
          setRequirement(response.data.requirement)
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
              <Link href={`/employer-dashboard/requirements/${params.id}/candidates`}>
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Candidates
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
            <Link href={`/employer-dashboard/requirements/${params.id}/candidates`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Candidates
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
                    {candidate.keySkills.slice(0, 8).map((skill) => (
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
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Mail className="w-4 h-4 mr-2" />
                Contact Candidate
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Resume
              </Button>
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Shortlist
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
                      {candidate.preferredLocations.map((location) => (
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
                      {candidate.keySkills.slice(0, 6).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Languages</p>
                    <div className="space-y-1">
                      {candidate.languages.map((language) => (
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
                  {candidate.certifications.map((cert) => (
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
                  {candidate.workExperience.map((exp) => (
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
                        {exp.skills.map((skill) => (
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
                  {candidate.educationDetails.map((edu) => (
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
                            {edu.relevantCourses.map((course) => (
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
                  {candidate.projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-6">
                      <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                      <p className="text-slate-600 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.map((tech) => (
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Resume/CV</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {candidate.resumes && candidate.resumes.length > 0 ? (
                    <>
                  {/* CV Preview */}
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {candidate.resumes[0].filename}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            PDF • {candidate.resumes[0].fileSize} • Uploaded {new Date(candidate.resumes[0].uploadDate).toLocaleDateString()}
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
                            <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                              <a href={candidate.resumes[0].fileUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-2" />
                          View CV
                              </a>
                        </Button>
                            <Button variant="outline" asChild>
                              <a href={candidate.resumes[0].fileUrl} download>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                              </a>
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
                              <span className="font-medium">{candidate.resumes[0].filename}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">File Size</span>
                              <span className="font-medium">{candidate.resumes[0].fileSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Upload Date</span>
                              <span className="font-medium">{new Date(candidate.resumes[0].uploadDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Last Updated</span>
                              <span className="font-medium">{new Date(candidate.resumes[0].lastUpdated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Format</span>
                          <span className="font-medium">PDF</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">CV Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                              <a href={candidate.resumes[0].fileUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-2" />
                          View Full CV
                              </a>
                        </Button>
                            <Button variant="outline" className="w-full" asChild>
                              <a href={candidate.resumes[0].fileUrl} download>
                          <Download className="w-4 h-4 mr-2" />
                          Download CV
                              </a>
                        </Button>
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
          </TabsContent>
        </Tabs>
      </div>

      <EmployerFooter />
    </div>
  )
} 