"use client"

import { useState } from "react"
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
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"

export default function CandidateProfilePage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("overview")

  // Mock candidate data
  const candidate = {
    id: params.candidateId,
    name: "Abhijeet Vishwakarma",
    designation: "Software Engineer, UI/UX Design, Front End Developer",
    experience: "Fresher",
    location: "Vadodara, Gujarat",
    education: "B.Tech/B.E. Parul University, Vadodara 2024",
    keySkills: ["Javascript", "CSS", "HTML", "Java", "Data Structures", "UI/UX", "C++", "React", "Node.js", "MongoDB"],
    preferredLocations: ["Ahmedabad", "Mumbai", "Vadodara", "Mumbai Suburban"],
    avatar: "/placeholder.svg?height=120&width=120",
    isAttached: true,
    lastModified: "last 2 months",
    activeStatus: "last 7 days",
    additionalInfo: "Frontend Web Development | Interaction | User Experience | Responsive Design",
    phoneVerified: true,
    emailVerified: true,
    currentSalary: "3-5 LPA",
    expectedSalary: "6-8 LPA",
    noticePeriod: "Immediately",
    email: "abhijeet.vishwakarma@email.com",
    phone: "+91 98765 43210",
    linkedin: "linkedin.com/in/abhijeet-vishwakarma",
    github: "github.com/abhijeet-vishwakarma",
    portfolio: "abhijeet.dev",
    
    // Detailed information
    about: "Passionate software engineer with a strong foundation in frontend development and user experience design. I love creating intuitive and responsive web applications that solve real-world problems. Currently seeking opportunities to work with innovative teams and contribute to meaningful projects.",
    
    workExperience: [
      {
        id: 1,
        title: "Frontend Developer Intern",
        company: "TechStart Solutions",
        duration: "Jan 2024 - Mar 2024",
        location: "Vadodara",
        description: "Developed responsive web applications using React.js and modern CSS. Collaborated with design team to implement UI/UX improvements. Reduced page load time by 40% through optimization techniques.",
        skills: ["React", "JavaScript", "CSS", "HTML", "Git"]
      },
      {
        id: 2,
        title: "Web Developer",
        company: "Freelance",
        duration: "Jun 2023 - Dec 2023",
        location: "Remote",
        description: "Built custom websites for small businesses and startups. Implemented responsive designs and ensured cross-browser compatibility. Managed client relationships and project timelines.",
        skills: ["HTML", "CSS", "JavaScript", "WordPress", "SEO"]
      }
    ],
    
    educationDetails: [
      {
        id: 1,
        degree: "Bachelor of Technology in Computer Science",
        institution: "Parul University",
        duration: "2020 - 2024",
        location: "Vadodara, Gujarat",
        cgpa: "8.2/10",
        relevantCourses: ["Data Structures", "Algorithms", "Database Management", "Web Development", "Software Engineering"]
      },
      {
        id: 2,
        degree: "Higher Secondary Education",
        institution: "Delhi Public School",
        duration: "2018 - 2020",
        location: "Vadodara, Gujarat",
        percentage: "85%"
      }
    ],
    
    projects: [
      {
        id: 1,
        title: "E-Commerce Platform",
        description: "A full-stack e-commerce application built with React, Node.js, and MongoDB. Features include user authentication, product catalog, shopping cart, and payment integration.",
        technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe"],
        github: "github.com/abhijeet-vishwakarma/ecommerce",
        live: "ecommerce-demo.vercel.app"
      },
      {
        id: 2,
        title: "Task Management App",
        description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
        technologies: ["React", "Firebase", "Material-UI", "React DnD"],
        github: "github.com/abhijeet-vishwakarma/task-manager",
        live: "task-manager-demo.vercel.app"
      },
      {
        id: 3,
        title: "Weather Dashboard",
        description: "A weather application that displays current weather and forecasts for multiple cities. Features include location-based weather, 7-day forecast, and weather alerts.",
        technologies: ["JavaScript", "OpenWeather API", "CSS", "HTML"],
        github: "github.com/abhijeet-vishwakarma/weather-app",
        live: "weather-dashboard.vercel.app"
      }
    ],
    
    certifications: [
      {
        id: 1,
        name: "React Developer Certification",
        issuer: "Meta",
        date: "Dec 2023",
        credential: "meta-react-cert"
      },
      {
        id: 2,
        name: "JavaScript Algorithms and Data Structures",
        issuer: "freeCodeCamp",
        date: "Nov 2023",
        credential: "fcc-js-algorithms"
      },
      {
        id: 3,
        name: "Web Development Bootcamp",
        issuer: "Udemy",
        date: "Oct 2023",
        credential: "udemy-web-dev"
      }
    ],
    
    languages: [
      { name: "English", proficiency: "Professional" },
      { name: "Hindi", proficiency: "Native" },
      { name: "Gujarati", proficiency: "Native" }
    ]
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
                  {/* CV Preview */}
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        Abhijeet_Vishwakarma_Resume.pdf
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        PDF • 2.3 MB • Uploaded 2 months ago
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
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Eye className="w-4 h-4 mr-2" />
                          View CV
                        </Button>
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
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
                          <span className="font-medium">Abhijeet_Vishwakarma_Resume.pdf</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">File Size</span>
                          <span className="font-medium">2.3 MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Upload Date</span>
                          <span className="font-medium">2 months ago</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Last Updated</span>
                          <span className="font-medium">1 month ago</span>
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
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <Eye className="w-4 h-4 mr-2" />
                          View Full CV
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download CV
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