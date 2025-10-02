"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Eye, Lock, AlertTriangle } from "lucide-react"

export default function WhistleblowerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Whistleblower Protection</h1>
            <p className="text-xl text-gray-600">
              Report misconduct safely and anonymously. Your identity is protected.
            </p>
          </div>

          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Lock className="h-6 w-6 mr-2" />
                Anonymous Reporting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Eye className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Anonymous</h3>
                    <p className="text-sm text-gray-600">Your identity remains completely confidential</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lock className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Secure</h3>
                    <p className="text-sm text-gray-600">All reports are encrypted and securely stored</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Protected</h3>
                    <p className="text-sm text-gray-600">Legal protection against retaliation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Report Misconduct</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Misconduct
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type of misconduct" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fraud">Fraud</SelectItem>
                      <SelectItem value="corruption">Corruption</SelectItem>
                      <SelectItem value="harassment">Harassment</SelectItem>
                      <SelectItem value="discrimination">Discrimination</SelectItem>
                      <SelectItem value="safety">Safety Violation</SelectItem>
                      <SelectItem value="financial">Financial Misconduct</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department/Area
                  </label>
                  <Input placeholder="Which department or area is involved?" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Description
                  </label>
                  <Textarea 
                    placeholder="Please provide a detailed description of the incident..."
                    rows={6}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When did this occur?
                  </label>
                  <Input type="date" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <Textarea 
                    placeholder="Any additional information that might be helpful..."
                    rows={4}
                  />
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">Important Notice</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        This report will be handled confidentially. False reports may result in legal action.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Submit Anonymous Report
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Card className="shadow-lg bg-gray-50">
              <CardContent className="pt-6 pb-6">
                <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
                <p className="text-gray-600 mb-4">
                  If you need immediate assistance or have questions about the reporting process,
                  contact our ethics hotline.
                </p>
                <div className="space-x-4">
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Ethics Hotline
                  </Button>
                  <Button variant="outline">
                    <Lock className="h-4 w-4 mr-2" />
                    Secure Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
