'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Info, Clock, Users, MapPin, Eye, Star, Building2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function EmployerPricingPage() {
  const [selectedQuantities, setSelectedQuantities] = useState({
    hotVacancy: 1,
    classified: 1,
    standard: 1
  });

  const handleQuantityChange = (plan: string, quantity: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [plan]: quantity
    }));
  };

  const handleBuyNow = (plan: string, price: number) => {
    const quantity = selectedQuantities[plan as keyof typeof selectedQuantities] || 1;
    const totalPrice = price * quantity;
    
    toast.success(`Redirecting to payment for ${plan} - Quantity: ${quantity}, Total: ₹${totalPrice.toLocaleString()}`);
    
    // Here you would integrate with your payment gateway
    // For now, just show success message
  };

  const handlePostFreeJob = () => {
    toast.success('Redirecting to free job posting...');
    // Redirect to post job page
    window.location.href = '/employer-dashboard/post-job';
  };

  const pricingPlans = [
    {
      id: 'hotVacancy',
      name: 'Hot Vacancy',
      price: 1650,
      description: 'Maximum visibility and premium features',
      validity: '30 days',
      color: 'border-orange-500',
      badge: 'Most Popular',
      badgeColor: 'bg-orange-500',
      features: [
        { icon: Check, text: 'Detailed job description', included: true },
        { icon: MapPin, text: '3 job locations', included: true },
        { icon: Users, text: 'Unlimited applies', included: true },
        { icon: Clock, text: 'Applies expiry 90 days', included: true },
        { icon: Eye, text: 'Jobseeker contact details visible', included: true },
        { icon: Star, text: 'Boost on Job Search Page', included: true },
        { icon: Building2, text: 'Job Branding', included: true }
      ],
      offer: 'Flat 10% OFF on 5 Job Postings or more',
      buttonText: 'Buy now',
      buttonAction: () => handleBuyNow('hotVacancy', 1650)
    },
    {
      id: 'classified',
      name: 'Classified',
      price: 850,
      description: 'Balanced features for effective hiring',
      validity: '30 days',
      color: 'border-blue-500',
      features: [
        { icon: Check, text: 'Upto 250 character job description', included: true },
        { icon: MapPin, text: '3 job locations', included: true },
        { icon: Users, text: 'Unlimited applies', included: true },
        { icon: Clock, text: 'Applies expiry 90 days', included: true },
        { icon: Eye, text: 'Jobseeker contact details visible', included: true },
        { icon: Star, text: 'Boost on Job Search Page', included: true },
        { icon: Building2, text: 'Job Branding', included: true }
      ],
      offer: 'Flat 10% OFF on 5 Job Postings or more',
      buttonText: 'Buy now',
      buttonAction: () => handleBuyNow('classified', 850)
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 400,
      description: 'Essential features for basic hiring needs',
      validity: '15 days',
      color: 'border-green-500',
      features: [
        { icon: Check, text: 'Upto 250 character job description', included: true },
        { icon: MapPin, text: '1 job location', included: true },
        { icon: Users, text: '200 applies', included: true },
        { icon: Clock, text: 'Applies expiry 30 days', included: true },
        { icon: Eye, text: 'Jobseeker contact details visible', included: false },
        { icon: Star, text: 'Boost on Job Search Page', included: false },
        { icon: Building2, text: 'Job Branding', included: false }
      ],
      offer: 'Flat 10% OFF on 5 Job Postings or more',
      buttonText: 'Buy now',
      buttonAction: () => handleBuyNow('standard', 400)
    },
    {
      id: 'free',
      name: 'Free Job Posting',
      price: 0,
      description: 'Get started with basic job posting',
      validity: '7 days',
      color: 'border-gray-300',
      badge: 'Free',
      badgeColor: 'bg-green-500',
      features: [
        { icon: Check, text: 'Upto 250 character job description', included: true },
        { icon: MapPin, text: '1 job location', included: true },
        { icon: Users, text: '50 applies', included: true },
        { icon: Clock, text: 'Applies expiry 15 days', included: true },
        { icon: Eye, text: 'Jobseeker contact details visible', included: false },
        { icon: Star, text: 'Boost on Job Search Page', included: false },
        { icon: Building2, text: 'Job Branding', included: false }
      ],
      buttonText: 'Post a free job',
      buttonAction: handlePostFreeJob
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Job Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-600">1800-102-2558</span>
              <Button variant="outline">Buy online</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-blue-500 text-white">
            JOB POSTING
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Hire the right talent on India's #1 job site
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Post a free job
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Explore plans
            </Button>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create & quickly publish job listings in <strong>2 minutes</strong></h3>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reach <strong>10 Cr+ candidates</strong> across <strong>industries, roles, & geographies</strong></h3>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage job listings - <strong>post, edit, & track</strong> in one place</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-500 text-white">
              JOB POSTING
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Attract candidates
            </h2>
            <p className="text-xl text-slate-600">
              with quick and easy plans on India's leading job site
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.color} ${plan.color.includes('orange') ? 'ring-2 ring-orange-500' : ''}`}>
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${plan.badgeColor} text-white px-4 py-1 rounded-full text-sm font-semibold`}>
                    {plan.badge}
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-slate-800">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-600">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className={`text-3xl font-bold ${plan.price === 0 ? 'text-green-600' : 'text-slate-800'}`}>
                      {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString()}`}
                    </span>
                    {plan.price > 0 && (
                      <p className="text-sm text-slate-500 mt-1">*GST as applicable</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">KEY FEATURES</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <feature.icon className={`w-4 h-4 mt-0.5 mr-3 flex-shrink-0 ${
                            feature.included ? 'text-green-500' : 'text-gray-400'
                          }`} />
                          <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-500'}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-slate-600 mb-2">
                      <strong>Job validity:</strong> {plan.validity}
                    </p>
                    
                    {plan.price > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <select 
                          value={selectedQuantities[plan.id as keyof typeof selectedQuantities] || 1}
                          onChange={(e) => handleQuantityChange(plan.id, parseInt(e.target.value))}
                          className="border border-slate-300 rounded px-2 py-1 text-sm"
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map(num => (
                            <option key={num} value={num}>{num.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {plan.offer && (
                      <div className="bg-slate-100 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                          <Info className="w-4 h-4 text-blue-600 mr-2" />
                          <p className="text-sm text-slate-700">{plan.offer}</p>
                        </div>
                      </div>
                    )}

                    <Button 
                      className={`w-full ${
                        plan.price === 0 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      onClick={plan.buttonAction}
                    >
                      {plan.buttonText}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimers */}
      <div className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Important Terms & Conditions</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• <strong>Free Job Posting:</strong> This is not available for accounts registered with public email domains (e.g., gmail, yahoo, etc). Only one free job per company can stay active at a time.</li>
              <li>• <strong>Standard Job Posting:</strong> All job posting credits should be consumed within 30 days of activation/purchase, irrespective of quantity.</li>
              <li>• <strong>Hot Vacancy & Classified (1-4 quantity):</strong> Credits should be consumed within 30 days of activation/purchase.</li>
              <li>• <strong>Hot Vacancy & Classified (5+ quantity):</strong> Credits should be consumed within 1 year from the date of activation/purchase.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Not sure which offering is right for you?</h2>
              <p className="text-xl text-purple-100">Leave your contact details and we'll get back to you shortly.</p>
            </div>
            <div className="text-center md:text-right">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Request callback
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
