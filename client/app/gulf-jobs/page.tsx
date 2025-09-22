"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Bookmark, BookmarkCheck, Search, MapPin, Briefcase, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { apiService } from "@/lib/api"

interface GulfJob {
  id: string
  title: string
  company?: { id?: string; name?: string; logo?: string }
  location: string
  experienceLevel?: string
  salary?: string
  skills?: string[]
  createdAt?: string
  jobType?: string
  isUrgent?: boolean
}

export default function GulfJobsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<GulfJob[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [saved, setSaved] = useState<Set<string>>(new Set())

  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState<string>("")
  const [experienceLevel, setExperienceLevel] = useState<string>("")

  useEffect(() => {
    fetchJobs()
    // Optionally load saved bookmarks to reflect state (best-effort)
    // Not strictly required for MVP parity
    // eslint-disable-next-line
  }, [])

  const fetchJobs = async () => {
    try {
      setJobsLoading(true)
      const res = await apiService.getGulfJobs({ search, location, jobType, experienceLevel, limit: 50 })
      if (res.success && (res.data as any)?.jobs) {
        setJobs((res.data as any).jobs)
      } else if (res.success && Array.isArray(res.data)) {
        // In case API returns array directly
        setJobs(res.data as any)
      } else {
        setJobs([])
      }
    } catch (e) {
      console.error("Failed to load Gulf jobs", e)
      toast.error("Failed to load Gulf jobs")
      setJobs([])
    } finally {
      setJobsLoading(false)
    }
  }

  const toggleBookmark = async (jobId: string) => {
    try {
      const isSaved = saved.has(jobId)
      if (isSaved) {
        const res = await apiService.removeGulfJobBookmark(jobId)
        if (res.success) {
          const s = new Set(saved)
          s.delete(jobId)
          setSaved(s)
          toast.success("Removed from saved")
        } else {
          toast.error(res.message || "Failed to remove bookmark")
        }
      } else {
        const res = await apiService.bookmarkGulfJob(jobId)
        if ((res as any).success || (res as any).data) {
          const s = new Set(saved)
          s.add(jobId)
          setSaved(s)
          toast.success("Saved job")
        } else {
          toast.error((res as any).message || "Failed to save job")
        }
      }
    } catch (e) {
      console.error(e)
      toast.error("Action failed")
    }
  }

  const handleApply = async (job: GulfJob) => {
    if (!user) {
      router.push("/login")
      return
    }
    try {
      const response = await apiService.applyJob(job.id, {
        coverLetter: `I am interested in the ${job.title} position.`,
        isWillingToRelocate: true,
        preferredLocations: [job.location],
      })
      if (response.success) {
        toast.success("Applied successfully")
      } else {
        toast.error(response.message || "Failed to apply")
      }
    } catch (e) {
      console.error(e)
      toast.error("Failed to apply")
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/jobseeker-gulf-dashboard">
              <Button variant="outline" size="sm" className="border-green-600 text-green-600">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
            <CardTitle className="text-green-700">Gulf Jobs</CardTitle>
          </div>
        </div>

        <Card className="mb-5 bg-white/80 dark:bg-slate-800/80 border-green-200 dark:border-green-800">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500" />
              <Input placeholder="Search roles" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <Input placeholder="Location (e.g., Dubai)" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger><SelectValue placeholder="Job Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger><SelectValue placeholder="Experience" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="fresher">Fresher</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
              </SelectContent>
            </Select>
            <div className="md:col-span-5 flex justify-end">
              <Button className="bg-green-600 hover:bg-green-700" onClick={fetchJobs}>Search</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Briefcase className="w-5 h-5" /> Gulf Opportunities
              <Badge variant="secondary" className="ml-2">{jobs.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="text-sm text-slate-600">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="text-sm text-slate-600">No Gulf jobs found</div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded border border-green-200">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{job.title}</div>
                      <div className="text-xs text-slate-600 truncate flex items-center gap-2">
                        {job.company?.name && <span>{job.company.name}</span>}
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                        {job.jobType && (<><span>•</span><span>{job.jobType}</span></>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleApply(job)} className="border-green-600 text-green-600">Apply</Button>
                      <Button size="sm" variant="outline" onClick={() => toggleBookmark(job.id)} className="border-green-600 text-green-600">
                        {saved.has(job.id) ? (<><BookmarkCheck className="w-4 h-4 mr-1" /> Saved</>) : (<><Bookmark className="w-4 h-4 mr-1" /> Save</>)}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
