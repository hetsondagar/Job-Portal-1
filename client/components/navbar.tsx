"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, Briefcase, ChevronDown, Menu, Search, MapPin, Users, TrendingUp, Moon, Sun, User, LogOut, Settings, Bell, Bookmark, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showJobsDropdown, setShowJobsDropdown] = useState(false)
  const [showCompaniesDropdown, setShowCompaniesDropdown] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const getEmployerServices = (userRegion: string) => [
    { name: "Post a Job", href: userRegion === 'gulf' ? "/gulf-dashboard/post-job" : "/employer-dashboard/post-job" },
    { name: "Browse Candidates", href: userRegion === 'gulf' ? "/gulf-dashboard/applications" : "/employer-dashboard/candidates" },
    { name: "Company Dashboard", href: userRegion === 'gulf' ? "/gulf-dashboard" : "/employer-dashboard" },
    { name: "Analytics", href: userRegion === 'gulf' ? "/gulf-dashboard/analytics" : "/employer-dashboard/analytics" }
  ]

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">JobPortal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Jobs Dropdown */}
            <div className="relative group">
              <Button 
                variant="ghost" 
                className="text-slate-700 dark:text-slate-300"
                onMouseEnter={() => setShowJobsDropdown(true)}
                onMouseLeave={() => setShowJobsDropdown(false)}
              >
                Jobs
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              
              <AnimatePresence>
                {showJobsDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
                    onMouseEnter={() => setShowJobsDropdown(true)}
                    onMouseLeave={() => setShowJobsDropdown(false)}
                  >
                    <div className="py-2">
                      <Link href="/jobs" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                        Browse All Jobs
                      </Link>
                      <Link href="/jobs?type=remote" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                        Remote Jobs
                      </Link>
                      <Link href="/jobs?type=fulltime" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                        Full-time Jobs
                      </Link>
                      <Link href="/jobs?type=parttime" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                        Part-time Jobs
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Companies Dropdown */}
            <div className="relative group">
              <Button 
                variant="ghost" 
                className="text-slate-700 dark:text-slate-300"
                onMouseEnter={() => setShowCompaniesDropdown(true)}
                onMouseLeave={() => setShowCompaniesDropdown(false)}
              >
                Companies
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              
              <AnimatePresence>
                {showCompaniesDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
                    onMouseEnter={() => setShowCompaniesDropdown(true)}
                    onMouseLeave={() => setShowCompaniesDropdown(false)}
                  >
                    <div className="py-2">
                      <Link href="/companies" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                        Browse Companies
                      </Link>
                      <Link href="/featured-companies" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                        Featured Companies
                      </Link>
                      <Link href="/gulf-opportunities" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                        Gulf Opportunities
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tools Dropdown */}
            <div className="relative group">
              <Button variant="ghost" className="text-slate-700 dark:text-slate-300">
                Tools
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <Link
                    href="/salary-calculator"
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Salary Calculator
                  </Link>
                </div>
              </div>
            </div>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback>{user.firstName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={user?.userType === 'employer' ? (user?.region === 'gulf' ? '/gulf-dashboard' : '/employer-dashboard') : (user?.region === 'gulf' ? '/jobseeker-gulf-dashboard' : '/dashboard')} className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={user?.userType === 'employer' ? (user?.region === 'gulf' ? '/gulf-dashboard/applications' : '/employer-dashboard/applications') : '/applications'} className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Applications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookmarks" className="flex items-center">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Bookmarks
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-300">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
              <div className="flex flex-col space-y-6 mt-6">
                <Link href="/jobs" className="text-lg font-medium text-slate-900 dark:text-white">
                  Jobs
                </Link>
                <Link href="/companies" className="text-lg font-medium text-slate-900 dark:text-white">
                  Companies
                </Link>
                <Link href="/salary-calculator" className="text-lg font-medium text-slate-900 dark:text-white">
                  Salary Calculator
                </Link>
                
                {/* Mobile User Menu */}
                {user ? (
                  <div className="border-t pt-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={`${user.firstName} ${user.lastName}`} />
                        <AvatarFallback>{user.firstName?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Link href="/profile" className="block text-sm text-slate-700 dark:text-slate-300">
                        Profile
                      </Link>
                      <Link href={user?.userType === 'employer' ? (user?.region === 'gulf' ? '/gulf-dashboard' : '/employer-dashboard') : (user?.region === 'gulf' ? '/jobseeker-gulf-dashboard' : '/dashboard')} className="block text-sm text-slate-700 dark:text-slate-300">
                        Dashboard
                      </Link>
                      <Link href={user?.userType === 'employer' ? (user?.region === 'gulf' ? '/gulf-dashboard/applications' : '/employer-dashboard/applications') : '/applications'} className="block text-sm text-slate-700 dark:text-slate-300">
                        Applications
                      </Link>
                      <Link href="/bookmarks" className="block text-sm text-slate-700 dark:text-slate-300">
                        Bookmarks
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block text-sm text-red-600 hover:text-red-700"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-6 space-y-3">
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
