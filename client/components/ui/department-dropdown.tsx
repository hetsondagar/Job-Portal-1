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

// All department categories from both images (names only, no numbers)
const departmentCategories = [
  // From first image
  "Engineering - Software & QA",
  "Sales & Business Development",
  "Customer Success, Service & Operations",
  "Finance & Accounting",
  "Production, Manufacturing & Maintenance",
  "BFSI, Investments & Trading",
  "Human Resources",
  "IT & Information Security",
  "Marketing & Communication",
  "Consulting",
  "Data Science & Analytics",
  "Healthcare & Life Sciences",
  "Procurement & Supply Chain",
  "Engineering - Hardware & Networks",
  "Other",
  "Project & Program Management",
  "Construction & Site Engineering",
  "UX, Design & Architecture",
  "Teaching & Training",
  "Administration & Facilities",
  
  // From second image
  "Quality Assurance",
  "Food, Beverage & Hospitality",
  "Research & Development",
  "Content, Editorial & Journalism",
  "Product Management",
  "Legal & Regulatory",
  "Merchandising, Retail & eCommerce",
  "Risk Management & Compliance",
  "Strategic & Top Management",
  "Media Production & Entertainment",
  "Environment Health & Safety",
  "Security Services",
  "Sports, Fitness & Personal Care",
  "Aviation & Aerospace",
  "CSR & Social Service",
  "Energy & Mining",
  "Shipping & Maritime"
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
    <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-[9999]">
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
