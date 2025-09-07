"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Filter, ChevronDown, Search, MapPin, Briefcase, GraduationCap, Star, Clock, Users, ArrowLeft, Loader2 } from "lucide-react"
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
import { apiService } from "@/lib/api"
import { toast } from "sonner"

interface Candidate {
  id: string;
  name: string;
  designation: string;
  experience: string;
  location: string;
  education: string;
  keySkills: string[];
  preferredLocations: string[];
  avatar: string;
  isAttached: boolean;
  lastModified: string;
  activeStatus: string;
  additionalInfo: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  currentSalary: string;
  expectedSalary: string;
  noticePeriod: string;
  profileCompletion: number;
}

interface Requirement {
  id: string;
  title: string;
  totalCandidates: number;
  accessedCandidates: number;
}

export default function CandidatesPage() {
  const params = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [showCount, setShowCount] = useState("50")
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Data states
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [requirement, setRequirement] = useState<Requirement | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })
  
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

  // Filter options
  const filterOptions = {
    locations: ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Ahmedabad", "Kolkata", "Vadodara"],
    skills: ["JavaScript", "React", "Node.js", "Python", "Java", "AWS", "Docker", "Kubernetes", "MongoDB", "PostgreSQL", "CSS", "HTML", "UI/UX", "C++"],
    education: ["B.Tech", "M.Tech", "B.E", "M.E", "BCA", "MCA", "B.Sc", "M.Sc", "MBA", "Ph.D", "Diploma"],
    availability: ["Immediately", "15 days", "1 month", "2 months", "3 months"],
    verification: ["Phone Verified", "Email Verified", "Profile Complete"],
    lastActive: ["Today", "This week", "This month", "Last 3 months", "Last 6 months"],
  }

  // Fetch candidates data
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 Fetching candidates for requirement:', params.id)
        
        const response = await apiService.getRequirementCandidates(params.id as string, {
          page: pagination.page,
          limit: parseInt(showCount),
          search: searchQuery || undefined,
          sortBy: sortBy
        })
        
        console.log('🔍 Candidates API response:', response)
        
        if (response.success && response.data) {
          setCandidates(response.data.candidates || [])
          setRequirement(response.data.requirement)
          setPagination(response.data.pagination || pagination)
          console.log('✅ Successfully fetched candidates:', response.data.candidates?.length || 0)
        } else {
          console.error('❌ Failed to fetch candidates:', response.message)
          setError(response.message || 'Failed to load candidates')
        }
      } catch (error: any) {
        console.error('❌ Error fetching candidates:', error)
        setError(error.message || 'Failed to load candidates. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCandidates()
    }
  }, [params.id, pagination.page, showCount, searchQuery, sortBy])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (params.id) {
        setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page on search
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, params.id])

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

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-slate-600">Loading candidates...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">
                <h3 className="text-lg font-medium">Error loading candidates</h3>
                <p className="text-sm">{error}</p>
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Try Again
              </Button>
            </div>
          ) : requirement ? (
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
          ) : null}
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
        {!loading && !error && (
        <div className="space-y-4">
            {candidates.length > 0 ? (
              candidates.map((candidate) => (
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
                      {/* Relevance Score and Match Reasons */}
                      {candidate.relevanceScore !== undefined && (
                        <div className="mb-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge 
                              variant={candidate.relevanceScore >= 50 ? "default" : candidate.relevanceScore >= 25 ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {candidate.relevanceScore}% Match
                            </Badge>
                          </div>
                          {candidate.matchReasons && candidate.matchReasons.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {candidate.matchReasons.map((reason, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
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
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                            {candidate.profileCompletion}% Complete
                          </Badge>
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
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No candidates found</h3>
                <p className="text-slate-600 mb-4">
                  {searchQuery 
                    ? `No candidates match "${searchQuery}". Try adjusting your search criteria.`
                    : "No candidates match your requirement criteria. Try adjusting your filters or create a new requirement."
                  }
                </p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery("")}
                    className="mr-2"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
        </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <EmployerFooter />
    </div>
  )
}
