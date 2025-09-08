"use client"

import { useState } from "react"
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

export default function CandidateProfilePage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("profile-detail")
  const [likeCount, setLikeCount] = useState<number>(0)
  const [liked, setLiked] = useState<boolean>(false)

  // Load initial like state
  useEffect(() => {
    const loadLikes = async () => {
      try {
        const res = await apiService.getCandidateLikes(String(params.id))
        if (res.success && res.data) {
          setLikeCount(res.data.likeCount)
          setLiked(res.data.likedByCurrent)
        }
      } catch (e) {}
    }
    if (params.id) loadLikes()
  }, [params.id])

  // Enhanced candidate data matching the screenshot
  const candidate = {
    id: params.id,
    name: "Abhijeet Vishwakarma",
    designation: "Software Engineer, UI/UX Design, Front End Developer",
    experience: "Fresher",
    location: "Vadodara",
    currentSalary: "Not Disclosed",
    expectedSalary: "₹3-5 Lacs",
    noticePeriod: "Immediate",
    avatar: "/placeholder.svg?height=120&width=120",
    email: "abhijeetv@email.com",
    phone: "+91 98765 43210",
    education: "B.Tech/B.E, Parul University, Vadodara 2024",
    preferredLocations: ["Ahmedabad", "Mumbai", "Vadodara", "Mumbai Suburban"],
    keySkills: ["Javascript", "CSS", "HTML", "Java", "Data Structures", "UI/UX", "C++"],
    mayAlsoKnow: "Frontend Web Development | Interaction Design | ...more",
    lastModified: "last 2 months",
    activeStatus: "last 7 days",
    industry: "Information Technology",
    department: "Engineering - Software & QA",
    role: "Front End Developer",
    workSummary:
      "I am a fresher web developer with a passion for frontend development using modern technologies. My experience lies in creating functional development using HTML5, CSS3, and JavaScript. I am highly skilled in frontend technologies, including React JS, as well as frameworks and libraries such as Bootstrap. I am highly skilled in responsive problem-solving abilities and can handle various tasks in tight schedules. I have worked extensively on various front-end technologies and are capable of working in challenging environments.",
    projects: [
      {
        title: "EV Charging Application",
        description:
          "Complete Project(Full-Stack, GitHub): College Project(Full-Stack) Finding and Charging Application is a project aimed at providing a user-friendly and efficient platform for electric vehicle (EV) owners to locate and book charging stations.",
        lastUpdated: "Jan 23 till date",
        link: "More links",
      },
    ],
    itSkills: [{ name: "HTML", version: "", lastUsed: "3y", experience: "3y" }],
    attachedCV: {
      available: true,
      lastModified: "last 2 months",
    },
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
                        aria-label={liked ? 'Unlike candidate' : 'Like candidate'}
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
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${liked ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-blue-600 text-blue-600' : ''}`} />
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
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Attached CV</h3>
                      <p className="text-gray-600 mb-6">View the candidate's attached resume document</p>
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-M1at02lN6z0NKVSrsaM3gvlpmxtHIE.png"
                        alt="Attached CV"
                        className="mx-auto border border-gray-200 rounded-lg shadow-lg max-w-full h-auto"
                      />
                      <div className="mt-6">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Download className="w-4 h-4 mr-2" />
                          Download CV
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
