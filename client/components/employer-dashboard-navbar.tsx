"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Building2, ChevronDown, Menu, Plus, BarChart3, Users, Briefcase, Database, FileText, Moon, Sun, User, LogOut, Bell, Settings, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"

export function EmployerDashboardNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showJobsDropdown, setShowJobsDropdown] = useState(false)
  const [showDatabaseDropdown, setShowDatabaseDropdown] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, logout, refreshUser } = useAuth()
  const [company, setCompany] = useState<any>(null)
  const isAdmin = (user?.userType === 'admin') || (user?.preferences?.employerRole === 'admin')

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if mock mode is enabled
  const isMockMode = typeof window !== 'undefined' && 
    (localStorage.getItem('useMockData') === 'true' || 
     window.location.search.includes('mock=true'))

  // Mock user for development
  const mockUser = {
    id: "user_123",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    userType: "employer",
    companyId: "company_456",
    company: {
      id: "company_456",
      name: "TechCorp Solutions",
      logo: "/placeholder-logo.png"
    }
  }

  const displayUser = isMockMode ? mockUser : user

  // Get company data if user is an employer
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!isMockMode && (user?.userType === 'employer' || user?.userType === 'admin') && user?.companyId) {
        try {
          const response = await apiService.getCompany(user.companyId)
          if (response.success && response.data) {
            setCompany(response.data)
          }
        } catch (error) {
          console.error('Failed to fetch company data:', error)
        }
      } else if (isMockMode) {
        setCompany(mockUser.company)
      }
    }

    fetchCompanyData()
  }, [user, isMockMode])

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/employer-login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <nav className="bg-gradient-to-r from-blue-200/60 via-cyan-200/50 to-indigo-200/60 dark:from-gray-900/80 dark:via-gray-800/70 dark:to-gray-900/80 backdrop-blur-xl border-b border-white/30 dark:border-gray-700/50 fixed top-0 left-0 right-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/employer-dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-serif font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                Employer Portal
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Dashboard */}
            <Link
              href="/employer-dashboard"
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Dashboard
            </Link>

            {/* Jobs Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowJobsDropdown(true)}
                onMouseLeave={() => setShowJobsDropdown(false)}
                className="flex items-center space-x-1 text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                <span>Jobs</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showJobsDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseEnter={() => setShowJobsDropdown(true)}
                    onMouseLeave={() => setShowJobsDropdown(false)}
                    className="absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/40 rounded-xl shadow-[0_8px_30px_rgba(59,130,246,0.12)] py-2"
                  >
                    <Link
                      href="/employer-dashboard/post-job"
                      className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Post Job</span>
                    </Link>
                    <Link
                      href="/employer-dashboard/manage-jobs"
                      className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Manage Jobs</span>
                    </Link>
                    <Link
                      href="/employer-dashboard/job-templates"
                      className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Templates</span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Applications */}
            <Link
              href="/employer-dashboard/applications"
              className="flex items-center space-x-1 text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Applications</span>
            </Link>

            {/* Analytics */}
            <Link
              href="/employer-dashboard/analytics"
              className="flex items-center space-x-1 text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </Link>

            {/* Database Dropdown (Admin Only) */}
            {isAdmin && (
              <div className="relative">
                <button
                  onMouseEnter={() => setShowDatabaseDropdown(true)}
                  onMouseLeave={() => setShowDatabaseDropdown(false)}
                  className="flex items-center space-x-1 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                >
                  <Database className="w-4 h-4" />
                  <span>Database</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showDatabaseDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseEnter={() => setShowDatabaseDropdown(true)}
                      onMouseLeave={() => setShowDatabaseDropdown(false)}
                      className="absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/40 rounded-xl shadow-[0_8px_30px_rgba(59,130,246,0.12)] py-2"
                    >
                      <Link
                        href="/employer-dashboard/bulk-import"
                        className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Database className="w-4 h-4" />
                        <span>Bulk Import</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-slate-600 hover:text-blue-600"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-slate-700 hover:text-blue-600">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={company?.logo || "/placeholder-logo.png"} />
                    <AvatarFallback>
                      {displayUser?.firstName?.[0]}{displayUser?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium">
                      {displayUser?.firstName} {displayUser?.lastName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {company?.name || 'Company'}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgba(59,130,246,0.12)]">
                <div className="px-3 py-2 border-b border-white/30">
                  <div className="text-sm font-medium">{displayUser?.firstName} {displayUser?.lastName}</div>
                  <div className="text-xs text-slate-500">{displayUser?.email}</div>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/employer-dashboard/settings" className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white/90 backdrop-blur-xl border-white/40">
                <div className="flex flex-col space-y-6 mt-6">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={company?.logo || "/placeholder-logo.png"} />
                      <AvatarFallback>
                        {displayUser?.firstName?.[0]}{displayUser?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{displayUser?.firstName} {displayUser?.lastName}</div>
                      <div className="text-sm text-slate-500">{company?.name || 'Company'}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href="/employer-dashboard"
                      className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/employer-dashboard/post-job"
                      className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Post Job</span>
                    </Link>
                    <Link
                      href="/employer-dashboard/manage-jobs"
                      className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Manage Jobs</span>
                    </Link>
                    <Link
                      href="/employer-dashboard/applications"
                      className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Users className="w-4 h-4" />
                      <span>Applications</span>
                    </Link>
                    <Link
                      href="/employer-dashboard/analytics"
                      className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Analytics</span>
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-white/30">
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
