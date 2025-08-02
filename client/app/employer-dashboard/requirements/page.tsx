"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Filter, Plus, Search, MoreHorizontal, Edit, Trash2, Copy, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export default function RequirementsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [requirementStatusFilter, setRequirementStatusFilter] = useState({
    active: true,
    limitReached: true,
    expired: true,
  })
  const [requirements, setRequirements] = useState([
    {
      id: 1,
      title: "Software Engineer",
      status: "active",
      location: "Vadodara",
      validTill: "04 Aug, 2025",
      cvAccessLeft: 99,
      candidates: 500,
      accessed: 1,
      description: "Looking for experienced software engineers with React and Node.js expertise",
    },
    {
      id: 2,
      title: "Product Manager",
      status: "active",
      location: "Mumbai",
      validTill: "15 Aug, 2025",
      cvAccessLeft: 85,
      candidates: 320,
      accessed: 12,
      description: "Seeking strategic product managers with 5+ years experience",
    },
    {
      id: 3,
      title: "UX Designer",
      status: "limit-reached",
      location: "Bangalore",
      validTill: "28 Jul, 2025",
      cvAccessLeft: 0,
      candidates: 180,
      accessed: 50,
      description: "Creative UX designers for mobile and web applications",
    },
    {
      id: 4,
      title: "Data Scientist",
      status: "expired",
      location: "Delhi",
      validTill: "20 Jul, 2025",
      cvAccessLeft: 45,
      candidates: 250,
      accessed: 25,
      description: "Experienced data scientists with ML and Python expertise",
    },
  ])

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requirementToDelete, setRequirementToDelete] = useState<number | null>(null)

  // Filter requirements based on search query and status filters
  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = 
      (requirementStatusFilter.active && req.status === "active") ||
      (requirementStatusFilter.limitReached && req.status === "limit-reached") ||
      (requirementStatusFilter.expired && req.status === "expired")
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">ACTIVE</Badge>
      case "limit-reached":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">LIMIT REACHED</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800 border-red-200">EXPIRED</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const handleEditRequirement = (id: number) => {
    router.push(`/employer-dashboard/requirements/${id}/edit`)
    toast({
      title: "Edit Requirement",
      description: "Redirecting to edit page...",
    })
  }

  const handleDuplicateRequirement = (id: number) => {
    const requirement = requirements.find(req => req.id === id)
    if (requirement) {
      const newRequirement = {
        ...requirement,
        id: Math.max(...requirements.map(r => r.id)) + 1,
        title: `${requirement.title} (Copy)`,
        status: "active" as const,
        cvAccessLeft: 100,
        candidates: 0,
        accessed: 0,
      }
      setRequirements([...requirements, newRequirement])
      toast({
        title: "Requirement Duplicated",
        description: "A copy of the requirement has been created successfully.",
      })
    }
  }

  const handleDeleteRequirement = (id: number) => {
    setRequirementToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (requirementToDelete) {
      setRequirements(requirements.filter(req => req.id !== requirementToDelete))
      toast({
        title: "Requirement Deleted",
        description: "The requirement has been deleted successfully.",
      })
      setDeleteDialogOpen(false)
      setRequirementToDelete(null)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  const clearFilters = () => {
    setRequirementStatusFilter({
      active: true,
      limitReached: true,
      expired: true,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <EmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My requirements</h1>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-slate-300 rounded"></div>
                <span>Requirement remaining: 0</span>
              </div>
            </div>
          </div>
          <Link href="/employer-dashboard/create-requirement">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create new requirement
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50 sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 flex items-center justify-between">
                  <div className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <h3 className="font-medium text-slate-900">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search requirements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-8"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Requirement Status */}
                <div className="space-y-4">
                  <h3 className="font-medium text-slate-900">Requirement status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="active"
                        checked={requirementStatusFilter.active}
                        onCheckedChange={(checked) =>
                          setRequirementStatusFilter((prev) => ({ ...prev, active: checked as boolean }))
                        }
                      />
                      <label htmlFor="active" className="text-sm text-slate-700">
                        Active ({requirements.filter(r => r.status === "active").length})
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="limit-reached"
                        checked={requirementStatusFilter.limitReached}
                        onCheckedChange={(checked) =>
                          setRequirementStatusFilter((prev) => ({ ...prev, limitReached: checked as boolean }))
                        }
                      />
                      <label htmlFor="limit-reached" className="text-sm text-slate-700">
                        Limit reached ({requirements.filter(r => r.status === "limit-reached").length})
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="expired"
                        checked={requirementStatusFilter.expired}
                        onCheckedChange={(checked) =>
                          setRequirementStatusFilter((prev) => ({ ...prev, expired: checked as boolean }))
                        }
                      />
                      <label htmlFor="expired" className="text-sm text-slate-700">
                        Expired ({requirements.filter(r => r.status === "expired").length})
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">
                    All requirements ({filteredRequirements.length})
                  </h2>
                  {searchQuery && (
                    <div className="text-sm text-slate-600">
                      Showing results for "{searchQuery}"
                    </div>
                  )}
                </div>

                {/* Requirements List */}
                <AnimatePresence>
                  {filteredRequirements.length > 0 ? (
                    filteredRequirements.map((requirement, index) => (
                    <motion.div
                      key={requirement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="border border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Link
                              href={`/employer-dashboard/requirements/${requirement.id}`}
                              className="text-xl font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              {requirement.title}
                            </Link>
                            {getStatusBadge(requirement.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-600 mb-4">
                            <span>{requirement.location}</span>
                            <span>•</span>
                            <span>Valid till {requirement.validTill}</span>
                            <span>•</span>
                            <span>CV access left: {requirement.cvAccessLeft}</span>
                          </div>
                          <p className="text-sm text-slate-700 mb-4">{requirement.description}</p>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">{requirement.candidates}</div>
                            <div className="text-sm text-slate-500">Candidates</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{requirement.accessed}</div>
                            <div className="text-sm text-slate-500">Accessed</div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditRequirement(requirement.id)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Requirement
                              </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateRequirement(requirement.id)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteRequirement(requirement.id)}
                                >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No requirements found</h3>
                      <p className="text-slate-600 mb-4">
                        {searchQuery 
                          ? `No requirements match "${searchQuery}". Try adjusting your search.`
                          : "Try adjusting your filters or create a new requirement."
                        }
                      </p>
                      <Link href="/employer-dashboard/create-requirement">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        Create Requirement
                      </Button>
                    </Link>
                    </motion.div>
                )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Requirement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this requirement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EmployerFooter />
    </div>
  )
}
