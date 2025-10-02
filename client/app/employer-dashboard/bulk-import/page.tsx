"use client"

import { useState, useEffect } from "react"
import { Upload, Download, FileText, CheckCircle, XCircle, Clock, AlertCircle, BarChart3, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"
import { apiService } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function BulkImportPage() {
  const { user } = useAuth()
  const [imports, setImports] = useState([])
  const [loading, setLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // Fetch bulk imports on component mount
  useEffect(() => {
    fetchBulkImports()
  }, [])

  const fetchBulkImports = async () => {
    try {
      setLoading(true)
      const response = await apiService.getBulkImports()
      if (response.success) {
        setImports(response.data.imports)
      }
    } catch (error) {
      console.error('Error fetching bulk imports:', error)
      toast.error('Failed to fetch bulk imports')
    } finally {
      setLoading(false)
    }
  }

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

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "csv":
        return <FileText className="w-4 h-4" />
      case "excel":
        return <FileText className="w-4 h-4" />
      case "json":
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <EmployerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Bulk Job Import</h1>
            <p className="text-slate-600">Import multiple job postings from CSV, Excel, or JSON files</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Job Import File</DialogTitle>
                  <DialogDescription>
                    Upload a CSV, Excel, or JSON file with job data
                  </DialogDescription>
                </DialogHeader>
                <UploadForm 
                  onClose={() => setIsUploadDialogOpen(false)} 
                  onSuccess={fetchBulkImports}
                />
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline"
              onClick={async () => {
                try {
                  const blob = await apiService.downloadBulkImportTemplate('csv');
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'job-import-template.csv';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  toast.success('Template downloaded successfully');
                } catch (error) {
                  console.error('Download error:', error);
                  toast.error('Failed to download template');
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Imports</p>
                  <p className="text-2xl font-bold text-slate-900">{imports.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
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

        {/* Import History */}
        <Card>
          <CardHeader>
            <CardTitle>Import History</CardTitle>
            <CardDescription>Track your bulk import jobs and their status</CardDescription>
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
                        <span className="font-medium ml-1">
                          {new Date(importJob.startedAt).toLocaleDateString()}
                        </span>
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
  )
}

function UploadForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importName, setImportName] = useState("")
  const [importType, setImportType] = useState("csv")
  const [templateId, setTemplateId] = useState("")
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImportName(file.name.replace(/\.[^/.]+$/, ""))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !importName) {
      toast.error('Please select a file and enter an import name')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('importName', importName)
      formData.append('importType', importType)
      if (templateId) formData.append('templateId', templateId)

      const response = await apiService.createBulkImport(formData)
      if (response.success) {
        toast.success('Bulk import started successfully')
        onSuccess()
        onClose()
      } else {
        toast.error(response.message || 'Failed to start bulk import')
      }
    } catch (error) {
      console.error('Error creating bulk import:', error)
      toast.error('Failed to create bulk import')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="importName">Import Name</Label>
        <Input
          id="importName"
          value={importName}
          onChange={(e) => setImportName(e.target.value)}
          placeholder="Enter a name for this import"
          required
        />
      </div>

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
            required
          />
          <Button type="button" variant="outline" onClick={() => document.getElementById('file')?.click()}>
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
          placeholder="e.g., Tech Jobs Batch 1"
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
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={!selectedFile || uploading}>
          {uploading ? 'Starting Import...' : 'Start Import'}
        </Button>
      </div>
    </form>
  )
}


