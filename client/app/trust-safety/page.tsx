"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Eye, CheckCircle, AlertTriangle, Users } from "lucide-react"

export default function TrustSafetyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Shield className="h-20 w-20 text-blue-600 mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Trust & Safety</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your safety and security are our top priorities. We're committed to creating a safe, 
              trustworthy environment for job seekers and employers.
            </p>
          </div>

          {/* Safety Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="shadow-lg text-center">
              <CardContent className="pt-6">
                <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
                <p className="text-gray-600">
                  Advanced encryption and security measures protect your data and communications.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg text-center">
              <CardContent className="pt-6">
                <Eye className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Verified Users</h3>
                <p className="text-gray-600">
                  Identity verification and background checks ensure authentic users and opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg text-center">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">24/7 Monitoring</h3>
                <p className="text-gray-600">
                  Continuous monitoring and AI-powered detection of suspicious activities.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Safety Guidelines */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  For Job Seekers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Never share personal financial information</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Verify company information before applying</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Report suspicious job postings immediately</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Use our secure messaging system</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Trust your instincts - if something seems off, it probably is</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  For Employers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Complete company verification process</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Provide accurate job descriptions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Respect candidate privacy and data</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Follow fair hiring practices</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Report any suspicious candidate behavior</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Reporting */}
          <Card className="shadow-lg mb-16">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Report Safety Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Suspicious Activity</h3>
                  <p className="text-gray-600 mb-4">Report fake profiles, scams, or suspicious behavior</p>
                  <Button variant="outline">Report Now</Button>
                </div>
                <div className="text-center">
                  <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Harassment</h3>
                  <p className="text-gray-600 mb-4">Report inappropriate messages or harassment</p>
                  <Button variant="outline">Report Now</Button>
                </div>
                <div className="text-center">
                  <Lock className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Security Issues</h3>
                  <p className="text-gray-600 mb-4">Report security vulnerabilities or data breaches</p>
                  <Button variant="outline">Report Now</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="text-center">
            <Card className="shadow-lg bg-blue-600 text-white">
              <CardContent className="pt-8 pb-8">
                <h2 className="text-3xl font-bold mb-4">Need Immediate Help?</h2>
                <p className="text-xl mb-6 opacity-90">
                  Our Trust & Safety team is available 24/7 to assist you.
                </p>
                <div className="space-x-4">
                  <Button variant="secondary" size="lg">
                    Contact Safety Team
                  </Button>
                  <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
                    Emergency Hotline
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
