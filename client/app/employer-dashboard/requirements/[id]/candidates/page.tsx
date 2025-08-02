"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Filter, ChevronDown, Search, MapPin, Briefcase, GraduationCap, Star, Clock, Users, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"

export default function CandidatesPage() {
  const params = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [showCount, setShowCount] = useState("50")
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    experience: [0, 20],
    salary: [0, 50],
    location: [] as string[],
    skills: [] as string[],
    education: [] as string[],
    availability: [] as string[],
    verification: [] as string[],
    lastActive: [] as string[],
  })

  // Mock requirement data
  const requirement = {
    id: params.id,
    title: "Software Engineer",
    totalCandidates: 1247,
    accessedCandidates: 45,
  }

  // Filter options
  const filterOptions = {
    locations: ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Ahmedabad", "Kolkata", "Vadodara"],
    skills: ["JavaScript", "React", "Node.js", "Python", "Java", "AWS", "Docker", "Kubernetes", "MongoDB", "PostgreSQL", "CSS", "HTML", "UI/UX", "C++"],
    education: ["B.Tech", "M.Tech", "B.E", "M.E", "BCA", "MCA", "B.Sc", "M.Sc", "MBA", "Ph.D", "Diploma"],
    availability: ["Immediately", "15 days", "1 month", "2 months", "3 months"],
    verification: ["Phone Verified", "Email Verified", "Profile Complete"],
    lastActive: ["Today", "This week", "This month", "Last 3 months", "Last 6 months"],
  }

  // Enhanced candidate data
  const candidates = [
    {
      id: 1,
      name: "Abhijeet Vishwakarma",
      designation: "Software Engineer, UI/UX Design, Front End Developer",
      experience: "Fresher",
      location: "Vadodara",
      education: "B.Tech/B.E. Parul University, Vadodara 2024",
      keySkills: ["Javascript", "CSS", "HTML", "Java", "Data Structures", "UI/UX", "C++"],
      preferredLocations: ["Ahmedabad", "Mumbai", "Vadodara", "Mumbai Suburban"],
      avatar: "/placeholder.svg?height=80&width=80",
      isAttached: true,
      lastModified: "last 2 months",
      activeStatus: "last 7 days",
      additionalInfo: "Frontend Web Development | Interaction | User Experience | Responsive Design",
      phoneVerified: true,
      emailVerified: true,
      currentSalary: "3-5 LPA",
      expectedSalary: "6-8 LPA",
      noticePeriod: "Immediately",
    },
    {
      id: 2,
      name: "Bishal Singh",
      designation: "Proactive Software Engineer | MERN Stack Developer with a passion for building scalable applications",
      experience: "Fresher",
      location: "Vadodara",
      education: "Diploma Phonics Group of Institutions, Roorkee 2021",
      keySkills: [
        "Node.js",
        "Javascript",
        "React.js",
        "Express",
        "CSS",
        "MongoDB",
        "HTML",
        "MySQL",
        "Java",
        "Problem Solving",
      ],
      preferredLocations: ["Bengaluru", "New Delhi", "Mumbai", "Ahmedabad", "Pune", "Hyderabad", "Chennai", "Kolkata"],
      avatar: "/placeholder.svg?height=80&width=80",
      isAttached: true,
      lastModified: "last 5 months",
      activeStatus: "2 days ago",
      additionalInfo: "Mern Stack | Socket.io | Web Development | API Development | Database Design",
      previousRole: "Stack Edu Tech",
      phoneVerified: true,
      emailVerified: true,
      currentSalary: "4-6 LPA",
      expectedSalary: "8-12 LPA",
      noticePeriod: "15 days",
    },
    {
      id: 3,
      name: "Satyam Samanta",
      designation: "I am a Web Developer and open source Contributor with the passion to create innovative solutions",
      experience: "0y 4m",
      location: "Vadodara",
      currentRole: "Junior Software Engineer at Scalybee Digital",
      education: "B.Tech/B.E. Institute for Technology and Management (ITM) 2023",
      keySkills: [
        "Node.js",
        "Javascript",
        "React.js",
        "Express",
        "Next.js",
        "Npm",
        "React Native",
        "CSS",
        "Bootstrap",
        "HTML",
      ],
      preferredLocations: ["Bengaluru", "Mumbai", "Ahmedabad", "Vadodara"],
      avatar: "/placeholder.svg?height=80&width=80",
      isAttached: true,
      lastModified: "last 3 months",
      activeStatus: "1 week ago",
      additionalInfo: "Web Development | Open Source | Full Stack | Mobile Development | UI/UX",
      phoneVerified: true,
      emailVerified: false,
      currentSalary: "5-7 LPA",
      expectedSalary: "10-15 LPA",
      noticePeriod: "1 month",
    },
    {
      id: 4,
      name: "Priya Sharma",
      designation: "Full Stack Developer with expertise in modern web technologies and cloud platforms",
      experience: "2y 6m",
      location: "Mumbai",
      education: "B.Tech/B.E. Mumbai University 2021",
      keySkills: ["React", "Node.js", "Python", "AWS", "Docker", "MongoDB", "PostgreSQL", "TypeScript"],
      preferredLocations: ["Mumbai", "Bangalore", "Pune", "Hyderabad"],
      avatar: "/placeholder.svg?height=80&width=80",
      isAttached: true,
      lastModified: "last 1 month",
      activeStatus: "3 days ago",
      additionalInfo: "Cloud Computing | DevOps | Microservices | API Development | Database Design",
      previousRole: "Senior Developer at TechCorp",
      phoneVerified: true,
      emailVerified: true,
      currentSalary: "12-15 LPA",
      expectedSalary: "18-25 LPA",
      noticePeriod: "2 months",
    },
    {
      id: 5,
      name: "Rahul Kumar",
      designation: "Data Scientist and Machine Learning Engineer with strong analytical skills",
      experience: "3y 8m",
      location: "Bangalore",
      education: "M.Tech Indian Institute of Technology, Delhi 2020",
      keySkills: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "SQL", "AWS", "Docker"],
      preferredLocations: ["Bangalore", "Mumbai", "Delhi", "Hyderabad"],
      avatar: "/placeholder.svg?height=80&width=80",
      isAttached: true,
      lastModified: "last 2 weeks",
      activeStatus: "Today",
      additionalInfo: "Data Analysis | Statistical Modeling | Computer Vision | NLP | Big Data",
      previousRole: "Data Scientist at AI Solutions",
      phoneVerified: true,
      emailVerified: true,
      currentSalary: "18-22 LPA",
      expectedSalary: "25-35 LPA",
      noticePeriod: "1 month",
    },
  ]

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      experience: [0, 20],
      salary: [0, 50],
      location: [],
      skills: [],
      education: [],
      availability: [],
      verification: [],
      lastActive: [],
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <EmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href={`/employer-dashboard/requirements/${params.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Requirement
              </Button>
          </Link>
        </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Candidates for {requirement.title}</h1>
              <p className="text-slate-600">Found {requirement.totalCandidates} matching candidates</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{requirement.accessedCandidates}</div>
              <div className="text-sm text-slate-600">Accessed Today</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                placeholder="Search candidates by name, skills, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
          </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {/* Sort and Count */}
            <div className="flex space-x-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="relevance">Relevance</SelectItem>
                            <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="lastActive">Last Active</SelectItem>
                            <SelectItem value="salary">Salary</SelectItem>
                          </SelectContent>
                        </Select>
              
                        <Select value={showCount} onValueChange={setShowCount}>
                <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="mt-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Experience Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Experience (Years)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={filters.experience}
                      onValueChange={(value) => handleFilterChange('experience', value)}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{filters.experience[0]} years</span>
                      <span>{filters.experience[1]} years</span>
                    </div>
                  </div>
                </div>

                {/* Salary Range */}
                            <div>
                  <Label className="text-sm font-medium mb-3 block">Salary Range (LPA)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={filters.salary}
                      onValueChange={(value) => handleFilterChange('salary', value)}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{filters.salary[0]} LPA</span>
                      <span>{filters.salary[1]} LPA</span>
                              </div>
                            </div>
                          </div>

                {/* Location */}
                            <div>
                  <Label className="text-sm font-medium mb-3 block">Preferred Locations</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {filterOptions.locations.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location}`}
                          checked={filters.location.includes(location)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleFilterChange('location', [...filters.location, location])
                            } else {
                              handleFilterChange('location', filters.location.filter(l => l !== location))
                            }
                          }}
                        />
                        <Label htmlFor={`location-${location}`} className="text-sm">{location}</Label>
                      </div>
                    ))}
                  </div>
                            </div>

                {/* Skills */}
                            <div>
                  <Label className="text-sm font-medium mb-3 block">Key Skills</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {filterOptions.skills.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skill-${skill}`}
                          checked={filters.skills.includes(skill)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleFilterChange('skills', [...filters.skills, skill])
                            } else {
                              handleFilterChange('skills', filters.skills.filter(s => s !== skill))
                            }
                          }}
                        />
                        <Label htmlFor={`skill-${skill}`} className="text-sm">{skill}</Label>
                      </div>
                    ))}
                  </div>
                            </div>

                {/* Education */}
                            <div>
                  <Label className="text-sm font-medium mb-3 block">Education</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {filterOptions.education.map((edu) => (
                      <div key={edu} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edu-${edu}`}
                          checked={filters.education.includes(edu)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleFilterChange('education', [...filters.education, edu])
                            } else {
                              handleFilterChange('education', filters.education.filter(e => e !== edu))
                            }
                          }}
                        />
                        <Label htmlFor={`edu-${edu}`} className="text-sm">{edu}</Label>
                      </div>
                    ))}
                              </div>
                            </div>

                {/* Verification */}
                              <div>
                  <Label className="text-sm font-medium mb-3 block">Verification</Label>
                  <div className="space-y-2">
                    {filterOptions.verification.map((verification) => (
                      <div key={verification} className="flex items-center space-x-2">
                        <Checkbox
                          id={`verification-${verification}`}
                          checked={filters.verification.includes(verification)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleFilterChange('verification', [...filters.verification, verification])
                            } else {
                              handleFilterChange('verification', filters.verification.filter(v => v !== verification))
                            }
                          }}
                        />
                        <Label htmlFor={`verification-${verification}`} className="text-sm">{verification}</Label>
                      </div>
                    ))}
                  </div>
                              </div>
                              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
                <div className="text-sm text-slate-600">
                  {candidates.length} candidates found
                              </div>
                              </div>
            </Card>
                            )}
                          </div>

        {/* Candidates List */}
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={candidate.avatar} alt={candidate.name} />
                  <AvatarFallback className="text-lg font-bold">{candidate.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-1">{candidate.name}</h3>
                      <p className="text-slate-600 text-sm mb-2">{candidate.designation}</p>
                                </div>
                    <div className="flex items-center space-x-2">
                      {candidate.phoneVerified && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Phone ✓
                        </Badge>
                      )}
                      {candidate.emailVerified && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          Email ✓
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{candidate.experience}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{candidate.location}</span>
                            </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{candidate.education}</span>
                          </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{candidate.noticePeriod}</span>
                        </div>
                      </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {candidate.keySkills.slice(0, 6).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                  ))}
                      {candidate.keySkills.length > 6 && (
                        <Badge variant="secondary" className="text-xs">
                          +{candidate.keySkills.length - 6} more
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{candidate.additionalInfo}</p>
                </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>Modified: {candidate.lastModified}</span>
                      <span>Active: {candidate.activeStatus}</span>
                      <span>Current: {candidate.currentSalary}</span>
                      <span>Expected: {candidate.expectedSalary}</span>
                    </div>
                    <Link href={`/employer-dashboard/requirements/${params.id}/candidates/${candidate.id}`}>
                    <Button variant="outline" size="sm">
                        View Profile
                    </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">1</Button>
            <Button size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>

      <EmployerFooter />
    </div>
  )
}
