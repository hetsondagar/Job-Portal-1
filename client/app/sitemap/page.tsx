"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SitemapPage() {
  const sections = [
    {
      title: "Main Pages",
      links: [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Careers", href: "/careers" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "FAQs", href: "/faqs" }
      ]
    },
    {
      title: "Job Seeker",
      links: [
        { name: "Find Jobs", href: "/jobs" },
        { name: "Companies", href: "/companies" },
        { name: "Featured Companies", href: "/featured-companies" },
        { name: "Salary Calculator", href: "/salary-calculator" },
        { name: "Job Alerts", href: "/job-alerts" },
        { name: "Login", href: "/login" },
        { name: "Register", href: "/register" }
      ]
    },
    {
      title: "Employer",
      links: [
        { name: "Post Jobs", href: "/employer-dashboard/post-job" },
        { name: "Manage Jobs", href: "/employer-dashboard/manage-jobs" },
        { name: "Bulk Import", href: "/employer-dashboard/bulk-import" },
        { name: "Analytics", href: "/employer-dashboard/analytics" },
        { name: "Employer Login", href: "/employer-login" },
        { name: "Employer Register", href: "/employer-register" }
      ]
    },
    {
      title: "Premium Features",
      links: [
        { name: "Job at Pace", href: "/job-at-pace" },
        { name: "ResumeAI", href: "/job-at-pace" },
        { name: "Combo Plans", href: "/job-at-pace" },
        { name: "Value Plans", href: "/job-at-pace" },
        { name: "Premium Features", href: "/job-at-pace" }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Sitemap</h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sections.map((section, index) => (
              <Card key={index} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link 
                          href={link.href}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
