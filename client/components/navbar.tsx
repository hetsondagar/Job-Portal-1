"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, Briefcase, ChevronDown, Menu, Search, MapPin, Users, TrendingUp, Moon, Sun, User, LogOut, Settings, Bell, Bookmark, FileText, Zap, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
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
                className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 relative"
              >
                Jobs
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              
              {/* Jobs Dropdown Menu */}
              <div className="absolute left-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-8">
                    {/* Popular Categories */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Popular categories</h4>
                      <div className="space-y-3">
                        <Link href="/jobs?category=it" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">IT jobs</Link>
                        <Link href="/jobs?category=sales" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Sales jobs</Link>
                        <Link href="/jobs?category=marketing" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Marketing jobs</Link>
                        <Link href="/jobs?category=data-science" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Data Science jobs</Link>
                        <Link href="/jobs?category=hr" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">HR jobs</Link>
                        <Link href="/jobs?category=engineering" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Engineering jobs</Link>
                      </div>
                    </div>

                    {/* Jobs in demand */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Jobs in demand</h4>
                      <div className="space-y-3">
                        <Link href="/jobs?type=fresher" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Fresher jobs</Link>
                        <Link href="/jobs?type=mnc" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">MNC jobs</Link>
                        <Link href="/jobs?type=remote" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Remote jobs</Link>
                        <Link href="/jobs?type=work-from-home" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Work from home jobs</Link>
                        <Link href="/jobs?type=walk-in" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Walk-in jobs</Link>
                        <Link href="/jobs?type=part-time" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Part-time jobs</Link>
                      </div>
                    </div>

                    {/* Jobs by location */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Jobs by location</h4>
                      <div className="space-y-3">
                        <Link href="/jobs?location=Delhi" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Jobs in Delhi</Link>
                        <Link href="/jobs?location=Mumbai" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Jobs in Mumbai</Link>
                        <Link href="/jobs?location=Bangalore" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Jobs in Bangalore</Link>
                        <Link href="/jobs?location=Hyderabad" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Jobs in Hyderabad</Link>
                        <Link href="/jobs?location=Chennai" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Jobs in Chennai</Link>
                        <Link href="/jobs?location=Pune" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Jobs in Pune</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Companies Dropdown */}
            <div className="relative group">
              <Button 
                variant="ghost" 
                className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 relative"
              >
                Companies
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              
              {/* Companies Dropdown Menu */}
              <div className="absolute left-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-8">
                    {/* Explore Categories */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Explore categories</h4>
                      <div className="space-y-3">
                        <Link href="/companies?type=unicorn" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Unicorn</Link>
                        <Link href="/companies?type=mnc" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">MNC</Link>
                        <Link href="/companies?type=startup" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Startup</Link>
                        <Link href="/companies?type=product-based" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Product based</Link>
                        <Link href="/companies?type=internet" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Internet</Link>
                      </div>
                    </div>

                    {/* Explore Collections */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Explore collections</h4>
                      <div className="space-y-3">
                        <Link href="/featured-companies" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Top companies</Link>
                        <Link href="/companies?category=it" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">IT companies</Link>
                        <Link href="/companies?category=fintech" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Fintech companies</Link>
                        <Link href="/companies?type=sponsored" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Sponsored companies</Link>
                        <Link href="/featured-companies" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Featured companies</Link>
                      </div>
                    </div>

                    {/* Research companies by Ambitionbox */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Research companies by <span className="text-blue-600">Ambitionbox</span></h4>
                      <div className="space-y-3">
                        <Link href="/companies/interviews" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Interview questions</Link>
                        <Link href="/salary-guide" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Company salaries</Link>
                        <Link href="/companies/reviews" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Company reviews</Link>
                        <Link href="/salary-calculator" className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Salary Calculator</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job at Pace - Premium Link */}
            <Link href="/job-at-pace">
              <Button variant="ghost" className="text-slate-700 dark:text-slate-300 relative group">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Job at Pace</span>
                  <div className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full">
                    Premium
                  </div>
                </div>
              </Button>
            </Link>

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
                <Link href="/employer-login">
                  <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-300">
                    Employer Login
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
                <Link href="/job-at-pace" className="flex items-center space-x-2 text-lg font-medium text-slate-900 dark:text-white">
                  <Zap className="w-5 h-5" />
                  <span>Job at Pace</span>
                  <div className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full">
                    Premium
                  </div>
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
                    <Link href="/employer-login">
                      <Button variant="outline" className="w-full">
                        Employer Login
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
