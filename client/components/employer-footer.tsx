import Link from "next/link"
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export function EmployerFooter() {
  return (
    <footer className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-gray-800/50 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Company Logo */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                JobPortal
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              India's leading job portal connecting talent with opportunities. Find your dream job or hire the perfect candidate.
            </p>
              </div>

          {/* Recruiter Helpline */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Recruiter Helpline</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="w-3 h-3 text-slate-400" />
                <span className="text-slate-600 text-xs font-medium">1800 102 5558</span>
              </div>
              <div className="text-slate-600 text-xs">
                10:00 AM to 8:00 PM Mon - Sat
              </div>
              <div className="space-y-1">
                <Link href="/contact" className="text-slate-600 hover:text-blue-600 transition-colors text-xs block">
                  Contact Us
                </Link>
                <Link href="/report-problem" className="text-slate-600 hover:text-blue-600 transition-colors text-xs block">
                  Report a Problem
                </Link>
              </div>
            </div>
          </div>

          {/* Recruiter Solutions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Recruiter Solutions</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/employer-dashboard" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/employer-dashboard/manage-jobs" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  Jobs & Responses
                </Link>
              </li>
              <li>
                <Link href="/employer-dashboard/requirements" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  Database
                </Link>
              </li>
              <li>
                <Link href="/employer-dashboard/analytics" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Information</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  Jobseeker Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/clients" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  Clients
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/jobatpace" className="text-slate-600 hover:text-blue-600 transition-colors text-xs font-medium">
                  JobAtPace Premium
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  Site Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
            <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Legal</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/grievances" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  Grievances
                </Link>
              </li>
              <li>
                <Link href="/summons-notice" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  Summons and Notice
                </Link>
              </li>
              <li>
                <Link href="/trust-safety" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  Trust and Safety
                </Link>
              </li>
              <li>
                <Link href="/whistleblower" className="text-slate-600 hover:text-blue-600 transition-colors text-xs">
                  Whistleblower
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-6 pt-6 text-center">
          <div className="text-slate-600 text-xs">
            © 2025 JobPortal. All rights reserved. Made with ❤️ in India
          </div>
        </div>
      </div>
    </footer>
  )
}
