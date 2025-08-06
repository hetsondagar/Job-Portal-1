"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, Briefcase, ChevronDown, Menu, Search, MapPin, Users, TrendingUp, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showJobsDropdown, setShowJobsDropdown] = useState(false)
  const [showCompaniesDropdown, setShowCompaniesDropdown] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  // Check if we're on login or register pages
  const isLoginPage = pathname === "/login"
  const isRegisterPage = pathname === "/register"

  const popularCategories = [
    { name: "IT jobs", href: "/jobs?category=it" },
    { name: "Sales jobs", href: "/jobs?category=sales" },
    { name: "Marketing jobs", href: "/jobs?category=marketing" },
    { name: "Data Science jobs", href: "/jobs?category=data-science" },
    { name: "HR jobs", href: "/jobs?category=hr" },
    { name: "Engineering jobs", href: "/jobs?category=engineering" },
  ]

  const jobsInDemand = [
    { name: "Fresher jobs", href: "/jobs?type=fresher" },
    { name: "MNC jobs", href: "/jobs?type=mnc" },
    { name: "Remote jobs", href: "/jobs?type=remote" },
    { name: "Work from home jobs", href: "/jobs?type=wfh" },
    { name: "Walk-in jobs", href: "/jobs?type=walkin" },
    { name: "Part-time jobs", href: "/jobs?type=parttime" },
  ]



  const exploreCategories = [
    { name: "Unicorn", href: "/companies?category=unicorn" },
    { name: "MNC", href: "/companies?category=mnc" },
    { name: "Startup", href: "/companies?category=startup" },
    { name: "Product based", href: "/companies?category=product" },
    { name: "Internet", href: "/companies?category=internet" },
  ]

  const exploreCollections = [
    { name: "Top companies", href: "/companies?collection=top" },
    { name: "IT companies", href: "/companies?collection=it" },
    { name: "Fintech companies", href: "/companies?collection=fintech" },
    { name: "Sponsored companies", href: "/companies?collection=sponsored" },
    { name: "Featured companies", href: "/companies?collection=featured" },
  ]

  const researchCompanies = [
    { name: "Interview questions", href: "/research/interview-questions" },
    { name: "Company salaries", href: "/research/salaries" },
    { name: "Company reviews", href: "/research/reviews" },
    { name: "Salary Calculator", href: "/research/salary-calculator" },
  ]

  const employerServices = [
    { name: "Buy online", href: "/employer/buy-online" },
    { name: "TalentPulse", href: "/employer/talent-pulse" },
    { name: "Post a job", href: "/employer-dashboard/post-job", badge: "FREE" },
    { name: "Employer Login", href: "/employer-login" },
  ]

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              JobPortal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Jobs Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowJobsDropdown(true)}
              onMouseLeave={() => setShowJobsDropdown(false)}
            >
              <Link href="/jobs" className="flex items-center space-x-1 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <span>Jobs</span>
                <ChevronDown className="w-4 h-4" />
              </Link>

              <AnimatePresence>
                {showJobsDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[600px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6"
                    style={{ left: "50%", transform: "translateX(-50%)" }}
                  >
                    <div className="grid grid-cols-2 gap-8">
                      {/* Popular Categories */}
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Popular categories</h3>
                        <div className="space-y-2">
                          {popularCategories.map((category, index) => (
                        <Link
                          key={index}
                              href={category.href}
                              className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                          </div>

                      {/* Jobs in Demand */}
                          <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Jobs in demand</h3>
                        <div className="space-y-2">
                          {jobsInDemand.map((job, index) => (
                            <Link
                              key={index}
                              href={job.href}
                              className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {job.name}
                        </Link>
                      ))}
                    </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Companies Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowCompaniesDropdown(true)}
              onMouseLeave={() => setShowCompaniesDropdown(false)}
            >
              <Link href="/companies" className="flex items-center space-x-1 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <span>Companies</span>
                <ChevronDown className="w-4 h-4" />
              </Link>

              <AnimatePresence>
                {showCompaniesDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[600px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6"
                    style={{ left: "50%", transform: "translateX(-50%)" }}
                  >
                    <div className="grid grid-cols-2 gap-8">
                      {/* Explore Categories */}
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Explore categories</h3>
                        <div className="space-y-2">
                          {exploreCategories.map((category, index) => (
                        <Link
                          key={index}
                              href={category.href}
                              className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                          </div>

                      {/* Explore Collections */}
                          <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Explore collections</h3>
                        <div className="space-y-2">
                          {exploreCollections.map((collection, index) => (
                            <Link
                              key={index}
                              href={collection.href}
                              className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {collection.name}
                        </Link>
                      ))}
                    </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Dark Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Employer Services Dropdown */}
            <div className="relative group">
              <Button variant="ghost" className="text-slate-700 dark:text-slate-300">
                For Employers
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  {employerServices.map((service, index) => (
                    <Link
                      key={index}
                      href={service.href}
                      className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span>{service.name}</span>
                      {service.badge && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          {service.badge}
                        </span>
                      )}
            </Link>
                  ))}
                </div>
              </div>
            </div>

            {!isLoginPage && !isRegisterPage && (
              <>
            <Link href="/login">
                  <Button variant="ghost" className="text-slate-700 dark:text-slate-300">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Register
              </Button>
            </Link>
              </>
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
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-4">
                  <Link href="/employer-login">
                    <Button variant="outline" className="w-full bg-transparent">
                      For Employers
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="w-full bg-transparent">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      Register
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
