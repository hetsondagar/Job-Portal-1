"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface DepartmentDropdownProps {
  selectedDepartments: string[]
  onDepartmentChange: (departments: string[]) => void
  onClose: () => void
}

// All department categories extracted from the images
const departmentCategories = [
  // High count departments
  "Engineering - Software & QA (16822)",
  "Sales & Business Development (10035)",
  "Customer Success, Service & Operations (6679)",
  "Finance & Accounting (3999)",
  "Production, Manufacturing & Maintenance (3083)",
  "BFSI, Investments & Trading (2936)",
  "Human Resources (2765)",
  "IT & Information Security (2332)",
  "Marketing & Communication (2159)",
  "Consulting (2152)",
  "Data Science & Analytics (2090)",
  "Healthcare & Life Sciences (1912)",
  "Procurement & Supply Chain (1447)",
  "Engineering - Hardware & Networks (1195)",
  "Other (1182)",
  "Project & Program Management (1121)",
  "Construction & Site Engineering (1115)",
  "Teaching & Training (1096)",
  "UX, Design & Architecture (1087)",
  "Administration & Facilities (1028)",
  
  // Medium count departments
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
  
  // Lower count departments
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

export function DepartmentDropdown({ selectedDepartments, onDepartmentChange, onClose }: DepartmentDropdownProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter departments based on search term
  const filteredDepartments = departmentCategories.filter(department =>
    department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Split departments into two columns
  const leftColumn = filteredDepartments.filter((_, index) => index % 2 === 0)
  const rightColumn = filteredDepartments.filter((_, index) => index % 2 === 1)

  const handleDepartmentToggle = (department: string) => {
    const departmentName = department.split(' (')[0] // Extract department name without count
    if (selectedDepartments.includes(departmentName)) {
      onDepartmentChange(selectedDepartments.filter(d => d !== departmentName))
    } else {
      onDepartmentChange([...selectedDepartments, departmentName])
    }
  }

  const handleApply = () => {
    onClose()
  }

  return (
    <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Department</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search Department"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Department Categories */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-2">
            {leftColumn.map((department, index) => {
              const departmentName = department.split(' (')[0]
              const isSelected = selectedDepartments.includes(departmentName)
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dept-${index}`}
                    checked={isSelected}
                    onCheckedChange={() => handleDepartmentToggle(department)}
                  />
                  <label 
                    htmlFor={`dept-${index}`}
                    className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer flex-1"
                  >
                    {department}
                  </label>
                </div>
              )
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            {rightColumn.map((department, index) => {
              const departmentName = department.split(' (')[0]
              const isSelected = selectedDepartments.includes(departmentName)
              
              return (
                <div key={index + 1000} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dept-${index + 1000}`}
                    checked={isSelected}
                    onCheckedChange={() => handleDepartmentToggle(department)}
                  />
                  <label 
                    htmlFor={`dept-${index + 1000}`}
                    className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer flex-1"
                  >
                    {department}
                  </label>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
        <Button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Apply
        </Button>
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
