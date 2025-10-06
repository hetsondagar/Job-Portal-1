"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Filter, ChevronDown, Search, MapPin, Briefcase, GraduationCap, Star, Clock, Users, ArrowLeft, Loader2, ArrowUp, Brain } from "lucide-react"
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
import { apiService, constructAvatarUrl } from "@/lib/api"
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
  likeCount?: number;
  likedByCurrent?: boolean;
  atsScore?: number | null;
  atsCalculatedAt?: string | null;
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
  const [calculatingATS, setCalculatingATS] = useState(false)
  
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
        console.log('🔍 Previous candidates count:', candidates.length)
        
        const response = await apiService.getRequirementCandidates(params.id as string, {
          page: pagination.page,
          limit: parseInt(showCount),
          search: searchQuery || undefined,
          sortBy: sortBy
        })
        
        console.log('🔍 Candidates API response:', response)
        
        if (response.success && response.data) {
          const newCandidates = response.data.candidates || []
          console.log('📊 New candidates data with ATS scores:', newCandidates.map(c => ({ 
            name: c.name, 
            atsScore: c.atsScore,
            requirementId: params.id 
          })))
          
          // Verify no old ATS scores are persisting
          const candidatesWithOldScores = newCandidates.filter(c => 
            c.atsScore !== null && c.atsCalculatedAt && 
            new Date(c.atsCalculatedAt).getTime() < Date.now() - 60000 // More than 1 minute old
          )
          
          if (candidatesWithOldScores.length > 0) {
            console.log('⚠️ Found candidates with potentially old ATS scores:', candidatesWithOldScores.length)
          }
          
          setCandidates(newCandidates)
          setRequirement(response.data.requirement)
          setPagination(response.data.pagination || pagination)
          console.log('✅ Successfully fetched candidates:', newCandidates.length)
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
      console.log('🔄 Requirement changed, clearing candidates and fetching new data')
      // Clear any existing ATS scores when requirement changes
      setCandidates([])
      setRequirement(null)
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

  const handleCalculateATS = async (processAll = false) => {
    try {
      setCalculatingATS(true)
      
      const candidateCount = processAll ? 'all candidates' : candidates.length
      toast.info('Starting STREAMING ATS calculation...', {
        description: `Processing ${candidateCount} one by one for real-time updates.`
      })
      
      // Prepare request body based on processing mode
      const requestBody = processAll 
        ? { 
            page: pagination.page, 
            limit: parseInt(showCount), 
            processAll: true 
          }
        : { 
            candidateIds: candidates.map(c => c.id) 
          }
      
      console.log('🚀 STREAMING ATS calculation request:', { processAll, requestBody })
      
      // Start streaming ATS calculation
      const response = await apiService.calculateATSScores(params.id as string, requestBody)
      
      if (response.success && response.data.streaming) {
        const { candidateIds: targetCandidateIds, totalCandidates } = response.data
        
        console.log('✅ Streaming ATS started:', { targetCandidateIds: targetCandidateIds.length, totalCandidates })
        
        toast.success('ATS streaming started!', {
          description: `Processing ${targetCandidateIds.length} candidates one by one...`
        })
        
        // Process candidates one by one with streaming updates
        let completedCount = 0
        let failedCount = 0
        
        for (let i = 0; i < targetCandidateIds.length; i++) {
          const candidateId = targetCandidateIds[i]
          
          try {
            console.log(`🎯 Processing candidate ${i + 1}/${targetCandidateIds.length}: ${candidateId}`)
            
            // Calculate ATS for individual candidate
            const individualResponse = await apiService.calculateIndividualATS(params.id as string, candidateId)
            
            if (individualResponse.success) {
              const { atsScore, candidate } = individualResponse.data
              completedCount++
              
              console.log(`✅ ATS score calculated for ${candidate.name}: ${atsScore}`)
              
              // Update the specific candidate in the current list
              setCandidates(prevCandidates => {
                const updatedCandidates = prevCandidates.map(c => 
                  c.id === candidateId 
                    ? { ...c, atsScore: atsScore, atsCalculatedAt: new Date().toISOString() }
                    : c
                )
                
                // Sort by ATS score (highest first) after each update
                return updatedCandidates.sort((a, b) => {
                  const scoreA = a.atsScore || 0
                  const scoreB = b.atsScore || 0
                  return scoreB - scoreA
                })
              })
              
              // Show progress toast for each completed candidate
              if (completedCount % 2 === 0 || completedCount === targetCandidateIds.length) {
                toast.success(`Progress: ${completedCount}/${targetCandidateIds.length} completed`, {
                  description: `Latest: ${candidate.name} - ATS Score: ${atsScore}`
                })
              }
              
            } else {
              failedCount++
              console.log(`❌ ATS calculation failed for candidate ${candidateId}: ${individualResponse.message}`)
            }
            
            // Small delay between candidates to avoid overwhelming the server
            if (i < targetCandidateIds.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 800))
            }
            
          } catch (error) {
            failedCount++
            console.error(`❌ Error processing candidate ${candidateId}:`, error)
          }
        }
        
        // Final success message
        toast.success('ATS streaming completed!', {
          description: `Successfully processed ${completedCount} candidates. ${failedCount > 0 ? `${failedCount} failed.` : 'All candidates scored!'}`
        })
        
        // Set sort to ATS by default after completion
        setSortBy('ats')
        
      } else {
        toast.error('Failed to start streaming ATS calculation', {
          description: response.message || 'Unknown error occurred'
        })
      }
    } catch (error: any) {
      console.error('❌ Error calculating ATS scores:', error)
      toast.error('Failed to calculate ATS scores', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setCalculatingATS(false)
    }
  }

  return (
    <div key={params.id} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <EmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/employer-dashboard/requirements">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Requirements
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

            {/* ATS Score Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleCalculateATS(false)}
                disabled={calculatingATS || candidates.length === 0}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {calculatingATS ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Calculating ATS...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>{calculatingATS ? 'Streaming...' : 'Stream ATS (Current)'}</span>
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => handleCalculateATS(true)}
                disabled={calculatingATS}
                variant="outline"
                className="flex items-center space-x-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                {calculatingATS ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing All...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>{calculatingATS ? 'Streaming...' : 'Stream ATS (All)'}</span>
                  </>
                )}
              </Button>
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
                            <SelectItem value="ats">ATS Score</SelectItem>
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

        {/* ATS Streaming Progress */}
        {calculatingATS && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <div>
                  <h3 className="text-sm font-medium text-purple-900">Streaming ATS Calculation</h3>
                  <p className="text-xs text-purple-700">
                    Processing candidates one by one with real-time UI updates. 
                    Each score appears immediately when calculated...
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-500">Real-time streaming</p>
                <p className="text-xs text-purple-400">Individual processing</p>
                <p className="text-xs text-purple-300">Live UI updates</p>
              </div>
            </div>
          </div>
        )}

        {/* Candidates List */}
        {!loading && !error && (
        <div className="space-y-4">
            {candidates.length > 0 ? (
              candidates.map((candidate) => (
            <Card key={candidate.id} className={`p-6 hover:shadow-lg transition-shadow ${calculatingATS ? 'opacity-75' : ''}`}>
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage 
                    src={constructAvatarUrl(candidate.avatar)} 
                    alt={candidate.name}
                    onError={(e) => {
                      console.log('Avatar image failed to load:', candidate.avatar);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 text-lg">{candidate.name}</h3>
                        {(candidate as any)?.verification_level === 'premium' || (candidate as any)?.verificationLevel === 'premium' || (candidate as any)?.preferences?.premium ? (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Premium</Badge>
                        ) : null}
                      </div>
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
                          {/* ATS Score Badge */}
                          {(() => {
                            const atsScore = Number(candidate.atsScore);
                            const hasValidScore = !isNaN(atsScore) && atsScore > 0;
                            
                            console.log(`🔍 Candidate ${candidate.name} ATS data:`, {
                              originalAtsScore: candidate.atsScore,
                              convertedAtsScore: atsScore,
                              hasValidScore: hasValidScore,
                              atsCalculatedAt: candidate.atsCalculatedAt
                            });
                            
                            return hasValidScore ? (
                              <Badge 
                                variant="secondary" 
                                className={`text-xs font-semibold px-3 py-1 ${
                                  atsScore >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm' :
                                  atsScore >= 60 ? 'bg-blue-100 text-blue-800 border-blue-200 shadow-sm' :
                                  atsScore >= 40 ? 'bg-yellow-100 text-yellow-800 border-yellow-200 shadow-sm' :
                                  'bg-red-100 text-red-800 border-red-200 shadow-sm'
                                }`}
                                title={`ATS Score: ${atsScore}/100 - ${
                                  atsScore >= 80 ? 'Excellent Match' :
                                  atsScore >= 60 ? 'Good Match' :
                                  atsScore >= 40 ? 'Average Match' :
                                  'Poor Match'
                                }`}
                              >
                                <Brain className="w-3 h-3 mr-1" />
                                ATS: {atsScore}
                              </Badge>
                            ) : (
                              <Badge 
                                variant="outline" 
                                className="text-xs text-gray-500 border-gray-300 px-3 py-1"
                                title="Click 'Calculate ATS Scores' to generate ATS score for this candidate"
                              >
                                <Brain className="w-3 h-3 mr-1" />
                                No ATS Score
                              </Badge>
                            );
                          })()}
                          <button
                            aria-label={candidate.likedByCurrent ? 'Remove upvote' : 'Upvote candidate'}
                            onClick={async (e) => {
                              e.preventDefault();
                              const btn = e.currentTarget as HTMLButtonElement | null;
                              try {
                                if (btn) btn.disabled = true;
                                if (candidate.likedByCurrent) {
                                  const res = await apiService.unlikeCandidate(candidate.id);
                                  if (res.success) {
                                    setCandidates(prev => prev.map(c => c.id === candidate.id ? {
                                      ...c,
                                      likedByCurrent: false,
                                      likeCount: Math.max(0, (c.likeCount || 1) - 1)
                                    } : c));
                                  }
                                } else {
                                  const res = await apiService.likeCandidate(candidate.id);
                                  if (res.success) {
                                    setCandidates(prev => prev.map(c => c.id === candidate.id ? {
                                      ...c,
                                      likedByCurrent: true,
                                      likeCount: (c.likeCount || 0) + 1
                                    } : c));
                                  }
                                }
                              } catch (err) {
                                toast.error('Failed to update upvote');
                              } finally {
                                if (btn) btn.disabled = false;
                              }
                            }}
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${candidate.likedByCurrent ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                          >
                            <svg className={`w-3.5 h-3.5 ${candidate.likedByCurrent ? 'fill-green-600 text-green-600' : 'text-slate-500'}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 5l7 12H5l7-12z"/></svg>
                            <span>{candidate.likeCount ?? 0}</span>
                          </button>
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
