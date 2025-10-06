'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, Search, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function RecruitmentSolutionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Recruitment Solutions</h1>
          <p className="text-xl text-gray-600">Comprehensive hiring solutions for your business</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Job Posting Services</CardTitle>
              <CardDescription>
                Reach thousands of qualified candidates with our premium job posting services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• Featured job listings</li>
                <li>• Multi-platform distribution</li>
                <li>• Enhanced visibility</li>
                <li>• Priority placement</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Candidate Search</CardTitle>
              <CardDescription>
                Access our extensive database of qualified professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• Advanced search filters</li>
                <li>• AI-powered matching</li>
                <li>• Direct candidate contact</li>
                <li>• Resume database access</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Recruitment Management</CardTitle>
              <CardDescription>
                Streamline your entire recruitment process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• Applicant tracking system</li>
                <li>• Interview scheduling</li>
                <li>• Candidate communication</li>
                <li>• Analytics & reporting</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Employer Branding</CardTitle>
              <CardDescription>
                Build and showcase your company culture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• Custom company profiles</li>
                <li>• Employee testimonials</li>
                <li>• Company videos & photos</li>
                <li>• Social media integration</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to transform your recruitment?</h2>
          <p className="text-gray-600 mb-6">
            Get in touch with our team to discuss your specific needs
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg">Contact Sales</Button>
            </Link>
            <Link href="/employer-register">
              <Button size="lg" variant="outline">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

