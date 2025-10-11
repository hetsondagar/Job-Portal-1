'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Briefcase, Database } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-blue-500 text-white">
            EMPLOYER SOLUTIONS
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your Hiring Solution
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Find the perfect plan for your recruitment needs
          </p>
        </div>
      </div>

      {/* Main Pricing Options */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Employer Dashboard Pricing
            </h2>
            <p className="text-xl text-slate-600">
              Access detailed pricing for job posting and database features
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Job Posting Pricing */}
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-blue-600 mb-2">Job Posting</CardTitle>
                <CardDescription className="text-slate-600">
                  Post jobs and attract candidates with our comprehensive job posting plans
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>Hot Vacancy</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>Classified</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>Standard</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>Free Posting</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Link href="/employer-dashboard/pricing">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      View Job Posting Plans
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Database Pricing */}
            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-purple-600 mb-2">Resume Database</CardTitle>
                <CardDescription className="text-slate-600">
                  Search India's largest talent pool with our database plans
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>Database Lite</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>Database Pro</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>AI Search</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>Bulk Download</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Link href="/employer-dashboard/database-pricing">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      View Database Plans
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Legacy General Pricing */}
      <div className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">General Plans</h2>
            <p className="text-xl text-slate-600">Choose the right plan for your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹0</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Post up to 3 jobs</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Basic candidate search</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Link href="/employer-register">
                  <Button className="w-full mt-6">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-blue-500 border-2 relative">
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                Popular
              </div>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <CardDescription>For growing businesses</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹4,999</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Unlimited job postings</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Advanced candidate search</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>ATS AI scoring</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Featured job listings</span>
                  </li>
                </ul>
                <Link href="/contact">
                  <Button className="w-full mt-6 bg-blue-500 hover:bg-blue-600">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For large organizations</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Everything in Professional</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>24/7 priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Custom branding</span>
                  </li>
                </ul>
                <Link href="/contact">
                  <Button className="w-full mt-6" variant="outline">Contact Us</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}