'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Info, Search, Zap, MessageCircle, Users, Filter, Eye, Download, Mail, Database } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DatabasePricingPage() {
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const handleQuantityChange = (quantity: number) => {
    setSelectedQuantity(quantity);
  };

  const handleBuyNow = () => {
    const price = 4000;
    const totalPrice = price * selectedQuantity;
    const discount = selectedQuantity >= 3 ? 1500 * selectedQuantity : 0;
    const finalPrice = totalPrice - discount;
    
    toast.success(`Redirecting to payment for Resdex Lite - Quantity: ${selectedQuantity}, Total: ₹${finalPrice.toLocaleString()}${discount > 0 ? ` (₹${discount.toLocaleString()} OFF)` : ''}`);
    
    // Here you would integrate with your payment gateway
  };

  const handleContactSales = () => {
    toast.success('Redirecting to contact sales...');
    // Redirect to contact page or open contact modal
  };

  const resdexLiteFeatures = [
    { icon: Eye, text: '100 CV views per requirement', included: true },
    { icon: Search, text: 'Up to 500 search results', included: true },
    { icon: Users, text: 'Candidates active in last 6 months', included: true },
    { icon: Filter, text: '10+ advanced filters', included: true },
    { icon: Users, text: 'Single user access', included: true },
    { icon: Search, text: '1 search query (role, location) per requirement', included: true }
  ];

  const resdexFeatures = [
    { icon: Eye, text: 'CV views as per plan', included: true },
    { icon: Search, text: 'Unlimited search results', included: true },
    { icon: Users, text: 'All available candidates', included: true },
    { icon: Filter, text: '20+ advanced filters', included: true },
    { icon: Users, text: 'Multiple user access', included: true },
    { icon: Mail, text: 'Email multiple candidates together', included: true },
    { icon: Search, text: 'Boolean keyword search', included: true },
    { icon: Download, text: 'Download CVs in bulk', included: true }
  ];

  const calculateDiscount = () => {
    return selectedQuantity >= 3 ? 1500 * selectedQuantity : 0;
  };

  const calculateFinalPrice = () => {
    const price = 4000;
    const totalPrice = price * selectedQuantity;
    const discount = calculateDiscount();
    return totalPrice - discount;
  };

  return (
    <div className="min-h-screen bg-white">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-blue-500 text-white">
                RESDEX
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Search India's largest talent pool
              </h1>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Contact sales
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Explore plans
                </Button>
              </div>
            </div>
            <div className="relative">
              {/* Search Bar Overlay */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Discover talent"
                    className="flex-1 text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-center mt-4 text-purple-100">Total Responses 345</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
                  <span>Divya Patel</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-6 h-6 bg-green-400 rounded-full"></div>
                  <span>Rohit Kumar</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
                  <span>Ananya Rao</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Search from an extensive database of <strong>10Cr+ resumes</strong></h3>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Hire faster with <strong>AI-powered search, advanced filters,</strong> & more</h3>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect instantly via <strong>call, email, & app notifications</strong></h3>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-500 text-white">
              RESDEX
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Search India's largest resume database
            </h2>
            <p className="text-xl text-slate-600">
              by location, industry, skills, and more to find the right fit
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Resdex Lite */}
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-blue-600 mb-2">Resdex Lite</CardTitle>
                <CardDescription className="text-slate-600">
                  Best for small and medium businesses with smaller hiring needs
                </CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-slate-800">₹4,000</span>
                  <p className="text-sm text-slate-500 mt-1">*GST as applicable</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Discount Offer */}
                <div className="bg-slate-100 rounded-lg p-4">
                  <div className="flex items-center">
                    <Info className="w-5 h-5 text-blue-600 mr-2" />
                    <p className="text-sm text-slate-700">
                      Flat <strong>₹1,500 OFF</strong> on purchasing 3 requirements
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-4">Key Features</h4>
                  <ul className="space-y-3">
                    {resdexLiteFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{feature.text}</span>
                        <Info className="w-4 h-4 text-slate-400 ml-2 mt-0.5" />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Purchase Controls */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <select 
                      value={selectedQuantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                      className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num.toString().padStart(2, '0')} Requirements</option>
                      ))}
                    </select>
                  </div>

                  {selectedQuantity >= 3 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-green-800">
                        <strong>You save ₹{calculateDiscount().toLocaleString()}</strong> with this quantity!
                      </p>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <p className="text-2xl font-bold text-slate-800">
                      ₹{calculateFinalPrice().toLocaleString()}
                      {calculateDiscount() > 0 && (
                        <span className="text-lg text-green-600 ml-2">
                          (Save ₹{calculateDiscount().toLocaleString()})
                        </span>
                      )}
                    </p>
                  </div>

                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleBuyNow}
                  >
                    Buy now
                  </Button>
                  
                  <p className="text-center text-sm text-slate-500 mt-3">
                    Database validity 15 days
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Resdex */}
            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-purple-600 mb-2">Resdex</CardTitle>
                <CardDescription className="text-slate-600">
                  Get customised solutions and dedicated support for your bigger hiring needs
                </CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-slate-800">Custom price</span>
                  <p className="text-sm text-slate-500 mt-1">Based on your plan</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-4">Key Features</h4>
                  <ul className="space-y-3">
                    {resdexFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{feature.text}</span>
                        <Info className="w-4 h-4 text-slate-400 ml-2 mt-0.5" />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Purchase Controls */}
                <div className="border-t pt-6">
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleContactSales}
                  >
                    Contact sales
                  </Button>
                  
                  <p className="text-center text-sm text-slate-500 mt-3">
                    Database validity as per the plan
                  </p>
                </div>
              </CardContent>
            </Card>
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

      {/* Social Proof */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Join <span className="text-blue-600">7 Lakh+ businesses</span>
          </h2>
          <p className="text-xl text-slate-600">
            who choose our platform for their hiring needs
          </p>
        </div>
      </div>
    </div>
  );
}
