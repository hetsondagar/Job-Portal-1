"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react"

interface IndustryDropdownProps {
  selectedIndustries: string[]
  onIndustryChange: (industries: string[]) => void
  onClose: () => void
}

// All industry categories extracted from ALL the images
const industryCategories = [
  // Page 1 - IT Services & Technology
  { category: "IT Services", industries: [
    "IT Services & Consulting (2378)"
  ]},
  { category: "Technology", industries: [
    "Software Product (532)",
    "Internet (246)",
    "Electronics Manufacturing (74)",
    "Electronic Components (61)",
    "Hardware & Networking (54)",
    "Emerging Technology (44)"
  ]},
  
  // Page 1 - Education
  { category: "Education", industries: [
    "Education / Training (297)",
    "E-Learning / EdTech (165)"
  ]},
  
  // Page 1 - Manufacturing & Production
  { category: "Manufacturing & Production", industries: [
    "Industrial Equipment (270)",
    "Auto Components (155)",
    "Chemicals (112)",
    "Building Material (74)",
    "Automobile (72)",
    "Electrical Equipment (70)",
    "Industrial Automation (52)",
    "Iron & Steel (38)",
    "Packaging & Containers (37)",
    "Metals & Mining (32)",
    "Petrochemical / Plastics (25)"
  ]},
  
  // Page 2 - Healthcare & Life Sciences
  { category: "Healthcare & Life Sciences", industries: [
    "Defence & Aerospace (22)",
    "Fertilizers / Pesticides (18)",
    "Pulp & Paper (7)",
    "Medical Services (264)",
    "Pharmaceutical & Life Sciences (252)",
    "Medical Devices (58)",
    "Biotechnology (40)",
    "Clinical Research (33)"
  ]},
  
  // Page 2 - Infrastructure, Transport & Real Estate
  { category: "Infrastructure, Transport & Real Estate", industries: [
    "Engineering & Construction (249)",
    "Real Estate (208)",
    "Courier / Logistics (86)",
    "Power (85)",
    "Oil & Gas (49)",
    "Water Treatment (28)",
    "Ports & Shipping (23)",
    "Aviation (19)",
    "Urban Transport (10)",
    "Railways (4)"
  ]},
  
  // Page 3 - Professional Services & BFSI
  { category: "Professional Services", industries: [
    "Facility Management (35)",
    "Architecture / Interior Design (33)",
    "Design (24)",
    "Legal (23)",
    "Law Enforcement (22)",
    "Content Development (7)"
  ]},
  { category: "BFSI", industries: [
    "Financial Services (211)"
  ]},
  
  // Page 3 - Media, Entertainment & Telecom
  { category: "Media, Entertainment & Telecom", industries: [
    "FinTech / Payments (134)",
    "NBFC (72)",
    "Insurance (62)",
    "Banking (41)",
    "Investment Banking (16)",
    "Advertising & Marketing (146)",
    "Telecom / ISP (64)",
    "Printing & Publishing (50)",
    "Film / Music / Entertainment (35)",
    "Gaming (22)",
    "TV / Radio (12)",
    "Animation & VFX (7)",
    "Events / Live Entertainment (5)",
    "Sports / Leisure & Recreation (3)"
  ]},
  
  // Page 4 - BPM & Consumer, Retail & Hospitality
  { category: "BPM", industries: [
    "Analytics / KPO / Research (107)",
    "BPM / BPO (104)"
  ]},
  { category: "Consumer, Retail & Hospitality", industries: [
    "Textile & Apparel (101)",
    "Retail (91)",
    "Food Processing (86)",
    "FMCG (69)",
    "Consumer Electronics (65)",
    "Hotels & Restaurants (50)",
    "Travel & Tourism (32)",
    "Furniture & Furnishings (29)",
    "Beauty & Personal Care (27)",
    "Fitness & Wellness (26)",
    "Gems & Jewellery (23)",
    "Beverage (22)",
    "Leather (2)"
  ]},
  
  // Page 4 - Miscellaneous
  { category: "Miscellaneous", industries: [
    "NGO / Social Services (66)",
    "Agriculture / Forestry (19)",
    "Miscellaneous (17)",
    "Import & Export (14)",
    "Government / Public Sector (2)"
  ]}
]

export function IndustryDropdown({ selectedIndustries, onIndustryChange, onClose }: IndustryDropdownProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  
  // Flatten all industries for search
  const allIndustries = industryCategories.flatMap(cat => cat.industries)
  
  // Filter categories based on search term
  const filteredCategories = industryCategories.filter(cat => {
    if (!searchTerm) return true
    return cat.industries.some(industry => 
      industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Split filtered categories into pages (3 categories per page)
  const categoriesPerPage = 3
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage)
  const currentCategories = filteredCategories.slice(
    currentPage * categoriesPerPage,
    (currentPage + 1) * categoriesPerPage
  )

  const handleIndustryToggle = (industry: string) => {
    const industryName = industry.split(' (')[0] // Extract industry name without count
    if (selectedIndustries.includes(industryName)) {
      onIndustryChange(selectedIndustries.filter(i => i !== industryName))
    } else {
      onIndustryChange([...selectedIndustries, industryName])
    }
  }

  const handleApply = () => {
    onClose()
  }

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
  }

  return (
    <div className="w-full max-w-6xl bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Industry</h3>
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
            placeholder="Search Industry"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(0) // Reset to first page when searching
            }}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Industry Categories */}
      <div className="p-4 max-h-96 overflow-y-auto overflow-x-auto">
        <div className="grid grid-cols-3 gap-6 min-w-max">
          {currentCategories.map((categoryGroup, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              {/* Category Header */}
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded">
                {categoryGroup.category}
              </h4>
              
              {/* Industries in this category */}
              <div className="space-y-2">
                {categoryGroup.industries.map((industry, industryIndex) => {
                  const industryName = industry.split(' (')[0]
                  const isSelected = selectedIndustries.includes(industryName)
                  
                  return (
                    <div key={industryIndex} className="flex items-center space-x-2">
                      <Checkbox
                        id={`industry-${groupIndex}-${industryIndex}`}
                        checked={isSelected}
                        onCheckedChange={() => handleIndustryToggle(industry)}
                      />
                      <label 
                        htmlFor={`industry-${groupIndex}-${industryIndex}`}
                        className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer flex-1"
                      >
                        {industry}
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with Navigation and Apply Button */}
      <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {/* Pagination Dots */}
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === currentPage ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Apply Button */}
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
          width: 8px;
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
