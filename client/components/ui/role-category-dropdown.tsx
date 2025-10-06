"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface RoleCategoryDropdownProps {
  selectedRoles: string[]
  onRoleChange: (roles: string[]) => void
}

// All role categories extracted from the images (names only, no numbers)
const roleCategories = [
  // From the images - exact order and names
  "HR Operations",
  "DevOps",
  "Marketing",
  "Doctor",
  "Administration",
  "Sales Support & Operations",
  "Digital Marketing",
  "Data Science & Machine Learning",
  "Banking Operations",
  "Non Voice",
  "IT Support",
  "IT Infrastructure Services",
  "IT Security",
  "Procurement & Purchase",
  "Life Insurance",
  "Other Program / Project Management",
  "Finance & Accounting - Other",
  "Other Design",
  "SCM & Logistics",
  "Production & Manufacturing",
  "Software Development",
  "Retail & B2C Sales",
  "BD / Pre Sales",
  "Enterprise & B2B Sales",
  "Voice / Blended",
  "Quality Assurance and Testing",
  "Accounting & Taxation",
  "IT Consulting",
  "Engineering",
  "DBA / Data warehousing",
  "Recruitment & Talent Acquisition",
  "Finance",
  "Other",
  "Customer Success, Service Operations",
  "Construction Engineering",
  "Business Intelligence & Analytics",
  "Operations, Maintenance & Support",
  "IT Network",
  "Operations",
  "Customer Success",
  "Lending",
  "Content Management (Print)",
  "Engineering & Manufacturing",
  "Production & Manufacturing",
  "Architecture & Interior Design",
  "Technology / IT",
  "Health Informatics",
  "IT & Information Security",
  "Trading, Asset & Wealth Management",
  "Human Resources - Other",
  "General Insurance",
  "Healthcare & Life Sciences",
  "Operations Support",
  "Management Consulting",
  "Business Process Quality",
  "BFSI, Investments & Trading",
  "Other Consulting",
  "Quality Assurance - Other",
  "Back Office",
  "Data Science & Analytics",
  "Management",
  "Facility Management",
  "Product Management - Technology",
  "Kitchen / F&B Production",
  "Advertising & Creative",
  "Corporate Training",
  "Treasury",
  "Pharmaceutical & Biotechnology",
  "Audit & Control",
  "Hardware",
  "Stores & Material Management",
  "Front Office & Guest Services",
  "Teaching & Training - Other",
  "After Sales Service & Repair",
  "Content, Editorial & Journalism",
  "Other Hospital Staff",
  "Nursing",
  "Corporate Communication",
  "F&B Service",
  "Subject / Specialization Teaching",
  "Research & Development",
  "UI / UX",
  "Investment Banking, Private Equity",
  "Employee Relations",
  "Food, Beverage & Hospitality",
  "Retail Store Operations",
  "Construction / Manufacturing",
  "Risk Management & Compliance",
  "University Level Educator",
  "Administration & Staff",
  "Marketing and Communications",
  "Legal Operations",
  "Legal & Regulatory - Other",
  "Top Management",
  "Product Management - Other",
  "Security Officer",
  "Corporate Affairs",
  "Strategic Management",
  "Preschool & Primary Education",
  "Editing",
  "Environment Health and Safety",
  "Service Delivery",
  "Compensation & Benefits",
  "Merchandising & Planning",
  "Tourism Services",
  "Editing (Print / Online / Electronic)",
  "Imaging & Diagnostics",
  "Import & Export",
  "Language Teacher",
  "Housekeeping & Laundry",
  "Telecom",
  "Payroll & Transactions",
  "Occupational Health & Safety",
  "eCommerce Operations",
  "HR Business Advisory",
  "Hardware and Networks - Operations",
  "Surveying",
  "Fashion & Accessories",
  "Procurement & Supply Chain",
  "Market Research & Insights",
  "Strategic & Top Management",
  "Security / Fraud",
  "Health & Fitness",
  "Life Skills / ECA Teacher",
  "Community Health & Safety",
  "Assessment / Advisory",
  "Artists",
  "Category Management & Operations",
  "Beauty & Personal Care",
  "Media Production & Entertainment",
  "CSR & Sustainability",
  "Operations / Strategy",
  "Events & Banquet",
  "Flight & Airport Operations",
  "Merchandising, Retail & eCommerce",
  "Security Services - Other",
  "Business",
  "Animation / Effects",
  "Recruitment Marketing & Branding",
  "Production",
  "Direction",
  "Treasury & Forex",
  "Aviation & Aerospace - Other",
  "Social & Public Service",
  "Mining",
  "Power Generation",
  "Port & Maritime Operations",
  "Journalism",
  "Energy & Mining - Other",
  "Airline Services",
  "Shipping & Maritime - Other",
  "Aviation Engineering",
  "Power Supply and Distribution",
  "Sound / Light / Technical Support",
  "Sports Staff and Management",
  "Sports, Fitness & Personal Care",
  "Upstream",
  "Shipping Engineering & Technology",
  "Pilot",
  "Downstream"
]

export function RoleCategoryDropdown({ selectedRoles, onRoleChange }: RoleCategoryDropdownProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter role categories based on search term
  const filteredRoles = roleCategories.filter(role =>
    role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Split roles into two columns
  const leftColumn = filteredRoles.filter((_, index) => index % 2 === 0)
  const rightColumn = filteredRoles.filter((_, index) => index % 2 === 1)

  const handleRoleToggle = (role: string) => {
    if (selectedRoles.includes(role)) {
      onRoleChange(selectedRoles.filter(r => r !== role))
    } else {
      onRoleChange([...selectedRoles, role])
    }
  }

  return (
    <div className="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-[9999]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Role Category</h3>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search Role category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Role Categories */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-2">
            {leftColumn.map((role, index) => {
              const isSelected = selectedRoles.includes(role)
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${index}`}
                    checked={isSelected}
                    onCheckedChange={() => handleRoleToggle(role)}
                  />
                  <label 
                    htmlFor={`role-${index}`}
                    className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer flex-1"
                  >
                    {role}
                  </label>
                </div>
              )
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            {rightColumn.map((role, index) => {
              const isSelected = selectedRoles.includes(role)
              
              return (
                <div key={index + 1000} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${index + 1000}`}
                    checked={isSelected}
                    onCheckedChange={() => handleRoleToggle(role)}
                  />
                  <label 
                    htmlFor={`role-${index + 1000}`}
                    className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer flex-1"
                  >
                    {role}
                  </label>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Horizontal scrollbar styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .overflow-y-auto::-webkit-scrollbar {
            height: 8px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `
      }} />
    </div>
  )
}