"use client"

import { useState } from "react"
import { Upload, Download, FileText, CheckCircle, XCircle, Clock, AlertCircle, BarChart3, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { GulfEmployerNavbar } from "@/components/gulf-employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { EmployerAuthGuard } from "@/components/employer-auth-guard"
import { GulfEmployerAuthGuard } from "@/components/gulf-employer-auth-guard"

export default function GulfBulkImportPage() {
  const [imports, setImports] = useState([
    {
      id: 1,
      importName: "Gulf Tech Jobs Batch 1",
      importType: "csv",
      status: "completed",
      totalRecords: 25,
      successfulImports: 23,
      failedImports: 2,
      progress: 100,
      startedAt: "2024-01-20T10:30:00",
      completedAt: "2024-01-20T10:35:00"
    },
    {
      id: 2,
      importName: "Gulf Marketing Positions",
      importType: "excel",
      status: "processing",
      totalRecords: 15,
      successfulImports: 8,
      failedImports: 0,
      progress: 53,
      startedAt: "2024-01-20T11:00:00",
      completedAt: null
    },
    {
      id: 3,
      importName: "Gulf Sales Expansion",
      importType: "csv",
      status: "failed",
      totalRecords: 10,
      successfulImports: 0,
      failedImports: 10,
      progress: 0,
      startedAt: "2024-01-19T15:20:00",
      completedAt: "2024-01-19T15:22:00"
    }
  ])

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "processing":
        return <Clock className="w-5 h-5 text-blue-600" />
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "pending":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <EmployerAuthGuard>
      <GulfEmployerAuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
          <GulfEmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Gulf Bulk Job Import</h1>
            <p className="text-slate-600">Import multiple Gulf-region job postings from CSV, Excel, or JSON files</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Gulf Job Import File</DialogTitle>
                  <DialogDescription>
                    Upload a CSV, Excel, or JSON file with Gulf job data
                  </DialogDescription>
                </DialogHeader>
                <UploadForm />
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Imports</p>
                  <p className="text-2xl font-bold text-slate-900">{imports.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600">
                    {imports.reduce((sum, imp) => sum + imp.successfulImports, 0)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {imports.reduce((sum, imp) => sum + imp.failedImports, 0)}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Processing</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {imports.filter(imp => imp.status === "processing").length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Import History</CardTitle>
            <CardDescription>Track your Gulf bulk import jobs and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {imports.map((importJob) => (
                <div key={importJob.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(importJob.status)}
                      <div>
                        <h3 className="font-semibold text-slate-900">{importJob.importName}</h3>
                        <p className="text-sm text-slate-600">
                          {importJob.totalRecords} records • {importJob.importType.toUpperCase()} file
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(importJob.status)}>
                        {importJob.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{importJob.progress}%</span>
                    </div>
                    <Progress value={importJob.progress} className="w-full" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Total Records:</span>
                        <span className="font-medium ml-1">{importJob.totalRecords}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Successful:</span>
                        <span className="font-medium text-green-600 ml-1">{importJob.successfulImports}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Failed:</span>
                        <span className="font-medium text-red-600 ml-1">{importJob.failedImports}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Started:</span>
                        <span className="font-medium ml-1">{new Date(importJob.startedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

          <EmployerFooter />
        </div>
      </GulfEmployerAuthGuard>
    </EmployerAuthGuard>
  )
}

function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importType, setImportType] = useState("csv")
  const [templateId, setTemplateId] = useState("")

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="file">Select File</Label>
        <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 mb-2">
            Drag and drop your file here, or click to browse
          </p>
          <Input
            id="file"
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button variant="outline" onClick={() => document.getElementById('file')?.click()}>
            Choose File
          </Button>
          {selectedFile && (
            <p className="text-sm text-green-600 mt-2">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="importType">File Type</Label>
          <Select value={importType} onValueChange={setImportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="template">Use Template (Optional)</Label>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger>
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="template1">Senior Software Engineer</SelectItem>
              <SelectItem value="template2">Marketing Manager</SelectItem>
              <SelectItem value="template3">Frontend Developer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="importName">Import Name</Label>
        <Input
          id="importName"
          placeholder="e.g., Gulf Tech Jobs Batch 1"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about this import..."
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="schedule" />
        <Label htmlFor="schedule">Schedule for later</Label>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline">Cancel</Button>
        <Button disabled={!selectedFile}>
          Start Import
        </Button>
      </div>
    </div>
  )
}


