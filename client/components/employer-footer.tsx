import Link from "next/link"
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Briefcase, Users, TrendingUp, Shield } from "lucide-react"

export function EmployerFooter() {
  return (
    <footer className="bg-gradient-to-br from-emerald-50 via-lime-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/20 border-t border-white/30 backdrop-blur-xl mt-12 rounded-t-3xl shadow-[0_-10px_40px_rgba(16,185,129,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-lime-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent">
                JobPortal
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs">
              Hire smarter in the Gulf region with translucent, fast and modern tools.
            </p>
            <div className="flex space-x-3">
              <Link href="#" className="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-all">
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-all">
                <Twitter className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-all">
                <Facebook className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-all">
                <Instagram className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Recruiter Solutions */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-emerald-600" />
              Recruiter Solutions
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/employer-dashboard" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Dashboard Home
                </Link>
              </li>
              <li>
                <Link href="/employer-dashboard/post-job" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/employer-dashboard/manage-jobs" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Manage Jobs
                </Link>
              </li>
              <li>
                <Link href="/employer-dashboard/requirements" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Candidate Database
                </Link>
              </li>
              <li>
                <Link href="/employer-dashboard/analytics" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Premium Services */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-emerald-600" />
              Premium Services
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/pricing" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/employer-dashboard/hot-vacancies" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Hot Vacancies
                </Link>
              </li>
              <li>
                <Link href="/job-at-pace" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Job at Pace
                </Link>
              </li>
              <li>
                <Link href="/employer-dashboard/featured-jobs" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Featured Jobs
                </Link>
              </li>
              <li>
                <Link href="/recruitment-solutions" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Enterprise Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center">
              <Users className="w-4 h-4 mr-2 text-emerald-600" />
              Company
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/clients" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Our Clients
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Site Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center">
              <Shield className="w-4 h-4 mr-2 text-emerald-600" />
              Legal & Support
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/terms" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/grievances" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Grievances
                </Link>
              </li>
              <li>
                <Link href="/trust-safety" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 mr-2 transition-colors"></span>
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Help & Contact Bar */}
        <div className="border-t border-slate-200 dark:border-gray-700 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">24/7 Recruiter Helpline</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">1800-102-5558</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Email Support</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">support@jobportal.com</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Monday - Saturday</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">10:00 AM - 8:00 PM IST</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-gray-700 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600 dark:text-slate-400 text-center md:text-left">
              © 2025 JobPortal. All rights reserved. Made with ❤️ in India
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <Link href="/terms" className="text-slate-500 hover:text-blue-600 transition-colors">Terms</Link>
              <span className="text-slate-300">•</span>
              <Link href="/privacy" className="text-slate-500 hover:text-blue-600 transition-colors">Privacy</Link>
              <span className="text-slate-300">•</span>
              <Link href="/grievances" className="text-slate-500 hover:text-blue-600 transition-colors">Grievances</Link>
              <span className="text-slate-300">•</span>
              <Link href="/summons-notice" className="text-slate-500 hover:text-blue-600 transition-colors">Summons</Link>
              <span className="text-slate-300">•</span>
              <Link href="/whistleblower" className="text-slate-500 hover:text-blue-600 transition-colors">Whistleblower</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
