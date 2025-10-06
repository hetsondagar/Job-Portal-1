"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface RoleCategoryDropdownProps {
  selectedRoles: string[]
  onRoleChange: (roles: string[]) => void
}

// All role categories extracted from the images
const roleCategories = [
  // High count categories
  "Software Development (12424)",
  "Retail & B2C Sales (3632)",
  "BD / Pre Sales (2909)",
  "Enterprise & B2B Sales (2730)",
  "Voice / Blended (2355)",
  "Quality Assurance and Testing (2231)",
  "Accounting & Taxation (1737)",
  "IT Consulting (1552)",
  "Engineering (1400)",
  "DBA / Data warehousing (1344)",
  "Recruitment & Talent Acquisition (1285)",
  "Finance (1235)",
  "Other (1182)",
  "Customer Success, Service (1108)",
  "Construction Engineering (1065)",
  "Business Intelligence & Analytics (1062)",
  "Operations, Maintenance (964)",
  "IT Network (855)",
  "Operations (837)",
  "Customer Success (835)",
  
  // Medium count categories
  "HR Operations (833)",
  "DevOps (828)",
  "Marketing (799)",
  "Doctor (786)",
  "Administration (774)",
  "Sales Support & Operations (768)",
  "Digital Marketing (766)",
  "Data Science & Machine Learning (762)",
  "Banking Operations (742)",
  "Non Voice (677)",
  "IT Support (667)",
  "IT Infrastructure Services (664)",
  "IT Security (642)",
  "Procurement & Purchase (635)",
  "Life Insurance (614)",
  "Other Program / Project Management (577)",
  "Finance & Accounting - Other (509)",
  "Other Design (477)",
  "SCM & Logistics (471)",
  "Production & Manufacturing (457)",
  "Lending (443)",
  "Content Management (Print) (440)",
  "Engineering & Manufacturing (437)",
  "Production & Manufacturing (425)",
  "Architecture & Interior Design (401)",
  "Technology / IT (387)",
  "Health Informatics (363)",
  "IT & Information Security (361)",
  "Trading, Asset & Wealth Management (348)",
  "Human Resources - Other (342)",
  "General Insurance (331)",
  "Healthcare & Life Sciences (329)",
  "Operations Support (314)",
  "Management Consulting (311)",
  "Business Process Quality (298)",
  "BFSI, Investments & Trading (293)",
  "Other Consulting (290)",
  "Quality Assurance - Other (278)",
  "Back Office (276)",
  "Data Science & Analytics (268)",
  
  // Lower count categories
  "Management (262)",
  "Facility Management (254)",
  "Product Management - Technology (249)",
  "Kitchen / F&B Production (246)",
  "Advertising & Creative (241)",
  "Corporate Training (237)",
  "Treasury (230)",
  "Pharmaceutical & Biotechnology (229)",
  "Audit & Control (223)",
  "Hardware (218)",
  "Stores & Material Management (215)",
  "Front Office & Guest Services (201)",
  "Teaching & Training - Other (199)",
  "After Sales Service & Repair (196)",
  "Content, Editorial & Journalism (185)",
  "Other Hospital Staff (180)",
  "Nursing (177)",
  "Corporate Communication (175)",
  "F&B Service (173)",
  "Subject / Specialization Teaching (171)",
  "Research & Development (162)",
  "UI / UX (161)",
  "Investment Banking, Private Equity (156)",
  "Employee Relations (154)",
  "Food, Beverage & Hospitality (151)",
  "Retail Store Operations (148)",
  "Construction / Manufacturing (145)",
  "Risk Management & Compliance (145)",
  "University Level Educator (145)",
  "Administration & Staff (142)",
  "Marketing and Communications (133)",
  "Legal Operations (132)",
  "Legal & Regulatory - Other (130)",
  "Top Management (126)",
  "Product Management - Other (125)",
  "Security Officer (123)",
  "Corporate Affairs (118)",
  "Strategic Management (111)",
  "Preschool & Primary Education (90)",
  "Editing (89)",
  "Environment Health and Safety (85)",
  "Service Delivery (82)",
  "Compensation & Benefits (82)",
  "Merchandising & Planning (81)",
  "Tourism Services (79)",
  "Editing (Print / Online / Electronic) (78)",
  "Imaging & Diagnostics (77)",
  "Import & Export (76)",
  "Language Teacher (75)",
  "Housekeeping & Laundry (74)",
  "Telecom (71)",
  "Payroll & Transactions (66)",
  "Occupational Health & Safety (63)",
  "eCommerce Operations (58)",
  "HR Business Advisory (57)",
  "Hardware and Networks - Other (51)",
  "Surveying (50)",
  "Fashion & Accessories (49)",
  "Procurement & Supply Chain (49)",
  "Market Research & Insights (47)",
  "Strategic & Top Management (42)",
  "Security / Fraud (41)",
  "Health & Fitness (41)",
  "Life Skills / ECA Teacher (37)",
  "Community Health & Safety (35)",
  "Assessment / Advisory (35)",
  "Artists (30)",
  "Category Management & Operations (27)",
  "Beauty & Personal Care (27)",
  "Media Production & Entertainment (26)",
  "CSR & Sustainability (23)",
  "Operations / Strategy (21)",
  "Events & Banquet (19)",
  "Flight & Airport Operations (17)",
  "Merchandising, Retail & eCommerce (17)",
  "Security Services - Other (16)",
  "Business (14)",
  "Animation / Effects (13)",
  "Recruitment Marketing & Branding (12)",
  "Production (12)",
  "Direction (11)",
  "Treasury & Forex (10)",
  "Aviation & Aerospace - Other (10)",
  "Social & Public Service (10)",
  "Mining (9)",
  "Power Generation (8)",
  "Port & Maritime Operations (7)",
  "Journalism (6)",
  "Energy & Mining - Other (6)",
  "Airline Services (5)",
  "Shipping & Maritime - Other (5)",
  "Aviation Engineering (4)",
  "Power Supply and Distribution (4)",
  "Sound / Light / Technical Support (3)",
  "Sports Staff and Management (3)",
  "Sports, Fitness & Personal Care (3)",
  "Upstream (2)",
  "Shipping Engineering & Technology (2)",
  "Pilot (1)",
  "Downstream (1)"
]

export function RoleCategoryDropdown({ selectedRoles, onRoleChange }: RoleCategoryDropdownProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter categories based on search term
  const filteredCategories = roleCategories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Split categories into two columns
  const leftColumn = filteredCategories.filter((_, index) => index % 2 === 0)
  const rightColumn = filteredCategories.filter((_, index) => index % 2 === 1)

  const handleRoleToggle = (role: string) => {
    const roleName = role.split(' (')[0] // Extract role name without count
    if (selectedRoles.includes(roleName)) {
      onRoleChange(selectedRoles.filter(r => r !== roleName))
    } else {
      onRoleChange([...selectedRoles, roleName])
    }
  }

  return (
    <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Role category</h3>
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
      
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-2">
            {leftColumn.map((category, index) => {
              const roleName = category.split(' (')[0]
              const isSelected = selectedRoles.includes(roleName)
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${index}`}
                    checked={isSelected}
                    onCheckedChange={() => handleRoleToggle(category)}
                  />
                  <label 
                    htmlFor={`role-${index}`}
                    className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer flex-1"
                  >
                    {category}
                  </label>
                </div>
              )
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            {rightColumn.map((category, index) => {
              const roleName = category.split(' (')[0]
              const isSelected = selectedRoles.includes(roleName)
              
              return (
                <div key={index + 1000} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${index + 1000}`}
                    checked={isSelected}
                    onCheckedChange={() => handleRoleToggle(category)}
                  />
                  <label 
                    htmlFor={`role-${index + 1000}`}
                    className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer flex-1"
                  >
                    {category}
                  </label>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Horizontal scrollbar styling */}
      <style jsx>{`
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
      `}</style>
    </div>
  )
}
