"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Globe, 
  MapPin, 
  DollarSign, 
  Building2, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Search,
  Filter,
  Star,
  Briefcase,
  Calendar,
  Clock
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { useAuth } from '@/hooks/useAuth'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'

export default function GulfOpportunitiesPage() {
  const router = useRouter()
  const { user, loading, login, signup } = useAuth()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    phone: '',
    experience: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  })
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [registerError, setRegisterError] = useState('')

  // Mock Gulf job data
  const gulfJobs = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "Dubai Tech Solutions",
      location: "Dubai, UAE",
      salary: "AED 25,000 - 35,000",
      type: "Full-time",
      experience: "5-8 years",
      posted: "2 days ago",
      description: "Leading fintech company seeking experienced software engineer for blockchain projects.",
      benefits: ["Tax-free salary", "Health insurance", "Annual flight tickets", "Housing allowance"],
      featured: true
    },
    {
      id: 2,
      title: "Marketing Manager",
      company: "Qatar Airways",
      location: "Doha, Qatar",
      salary: "QAR 18,000 - 25,000",
      type: "Full-time",
      experience: "3-5 years",
      posted: "1 week ago",
      description: "Global airline seeking marketing professional for digital campaigns.",
      benefits: ["Tax-free salary", "Health insurance", "Annual flight tickets", "Education allowance"],
      featured: false
    },
    {
      id: 3,
      title: "Financial Analyst",
      company: "Saudi Aramco",
      location: "Riyadh, Saudi Arabia",
      salary: "SAR 20,000 - 30,000",
      type: "Full-time",
      experience: "2-4 years",
      posted: "3 days ago",
      description: "Oil & gas giant seeking financial analyst for investment projects.",
      benefits: ["Tax-free salary", "Health insurance", "Annual flight tickets", "Housing allowance"],
      featured: true
    },
    {
      id: 4,
      title: "Project Manager",
      company: "Kuwait Finance House",
      location: "Kuwait City, Kuwait",
      salary: "KWD 1,500 - 2,200",
      type: "Full-time",
      experience: "4-6 years",
      posted: "5 days ago",
      description: "Islamic banking institution seeking project manager for digital transformation.",
      benefits: ["Tax-free salary", "Health insurance", "Annual flight tickets", "Housing allowance"],
      featured: false
    }
  ]

  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Tax-Free Salaries",
      description: "Enjoy 100% tax-free income in most Gulf countries"
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Top Companies",
      description: "Work with Fortune 500 companies and leading organizations"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Exposure",
      description: "Gain international experience in diverse, multicultural environments"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Career Growth",
      description: "Fast-track your career with rapid advancement opportunities"
    }
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError('')
    
    try {
      console.log('🔍 Gulf login attempt with:', { email: loginData.email, password: '[HIDDEN]' })
      
      const result = await login({ 
        email: loginData.email, 
        password: loginData.password,
        rememberMe: false 
      })
      
      console.log('✅ Gulf login successful:', result)
      
      // Check if login was successful and redirect accordingly
      if (result?.user?.userType === 'employer' || result?.user?.userType === 'admin') {
        console.log('❌ Employer/Admin trying to login through Gulf jobseeker login')
        toast.error('This account is registered as an employer/admin. Please use the employer login page.')
        setTimeout(() => {
          window.location.href = '/employer-login'
        }, 2000)
      } else {
        console.log('✅ Gulf jobseeker login successful, redirecting to Gulf dashboard')
        toast.success('Successfully signed in! Redirecting to Gulf dashboard...')
        setTimeout(() => {
          router.push('/jobseeker-gulf-dashboard')
        }, 1000)
      }
    } catch (error: any) {
      console.error('❌ Gulf login error:', error)
      setLoginError(error.message || 'Login failed. Please try again.')
      toast.error(error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError('')
    
    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    
    // Validate terms agreement
    if (!registerData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions")
      return
    }
    
    setIsRegistering(true)
    
    try {
      console.log('🔍 Gulf registration attempt with:', { 
        fullName: registerData.fullName, 
        email: registerData.email, 
        phone: registerData.phone,
        experience: registerData.experience,
        agreeToTerms: registerData.agreeToTerms,
        subscribeNewsletter: registerData.subscribeNewsletter
      })
      
      await signup({
        fullName: registerData.fullName,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone || undefined,
        experience: registerData.experience || undefined,
        agreeToTerms: registerData.agreeToTerms,
        subscribeNewsletter: registerData.subscribeNewsletter,
      })
      
      console.log('✅ Gulf registration successful')
      toast.success("Account created successfully! Please sign in to continue.")
      
      // Close register dialog and show login dialog
      setShowRegisterDialog(false)
      setShowLoginDialog(true)
      
      // Pre-fill login form with registered email
      setLoginData(prev => ({ ...prev, email: registerData.email }))
      
    } catch (error: any) {
      console.error('❌ Gulf registration error:', error)
      setRegisterError(error.message || 'Registration failed. Please try again.')
      
      // Handle specific validation errors from backend
      if (error.message && error.message.includes('Validation failed')) {
        toast.error("Please check your input and try again")
      } else if (error.message && error.message.includes('already exists')) {
        toast.error("An account with this email already exists")
      } else {
        toast.error(error.message || "Registration failed")
      }
    } finally {
      setIsRegistering(false)
    }
  }

  const handleExploreJobs = () => {
    if (user) {
      // User is already logged in, redirect to Gulf dashboard
      router.push('/jobseeker-gulf-dashboard')
    } else {
      // Show login/register options
      setShowLoginDialog(true)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    try {
      console.log(`🔍 Gulf OAuth login with ${provider}`)
      
      // Redirect to OAuth endpoint with state parameter to indicate Gulf flow
      const oauthUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/oauth/${provider}?state=gulf`
      window.location.href = oauthUrl
    } catch (error: any) {
      console.error(`❌ Gulf OAuth login error:`, error)
      toast.error(`Failed to sign in with ${provider}. Please try again.`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />
      
      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              <span>Gulf Region Opportunities</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Discover Your Dream Job in the
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> Gulf</span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Join thousands of professionals who have found their perfect career in the Gulf region. 
              Enjoy tax-free salaries, world-class benefits, and unparalleled growth opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
                onClick={handleExploreJobs}
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Explore Gulf Jobs
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 px-8 py-4 text-lg"
                onClick={() => setShowRegisterDialog(true)}
              >
                <Users className="w-5 h-5 mr-2" />
                Create Gulf Account
              </Button>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
              Why Choose Gulf Opportunities?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-green-200 dark:border-green-800">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <div className="text-green-600 dark:text-green-400">
                        {benefit.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Featured Jobs Section */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Featured Gulf Jobs
              </h2>
              <Button 
                variant="outline" 
                className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={handleExploreJobs}
              >
                View All Jobs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gulfJobs.slice(0, 4).map((job) => (
                <Card key={job.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg text-slate-900 dark:text-white">
                            {job.title}
                          </CardTitle>
                          {job.featured && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-300">
                          <div className="flex items-center space-x-1">
                            <Building2 className="w-4 h-4" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
                      {job.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{job.salary}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{job.experience}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{job.posted}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.benefits.slice(0, 2).map((benefit, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleExploreJobs}
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Your Gulf Career?
              </h2>
              <p className="text-green-100 mb-8 text-lg">
                Join thousands of professionals who have found their dream jobs in the Gulf region
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 text-lg"
                  onClick={handleExploreJobs}
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Start Exploring
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
                  onClick={() => setShowRegisterDialog(true)}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-slate-900 dark:text-white">
              Sign In to Explore Gulf Jobs
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600 dark:text-slate-300">
              Use your existing credentials or create a new account
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>
            
            {/* Error Display */}
            {loginError && (
              <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {loginError}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          
          {/* OAuth Login Options */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300 dark:border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => handleOAuthLogin('google')}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => handleOAuthLogin('facebook')}
              >
                <svg className="w-4 h-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-green-600 hover:text-green-700 font-medium"
                onClick={() => {
                  setShowLoginDialog(false)
                  setShowRegisterDialog(true)
                }}
              >
                Create one here
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-slate-900 dark:text-white">
              Create Gulf Account
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600 dark:text-slate-300">
              Start your journey to Gulf opportunities
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={registerData.fullName}
                onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={registerData.phone}
                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select value={registerData.experience} onValueChange={(value) => setRegisterData({ ...registerData, experience: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fresher">Fresher (0-1 years)</SelectItem>
                  <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                  <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                  <SelectItem value="senior">Senior (5-8 years)</SelectItem>
                  <SelectItem value="lead">Lead (8+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                required
              />
            </div>
            
            {/* Terms Agreement */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={registerData.agreeToTerms}
                onChange={(e) => setRegisterData({ ...registerData, agreeToTerms: e.target.checked })}
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                required
              />
              <Label htmlFor="agreeToTerms" className="text-sm text-slate-600 dark:text-slate-300">
                I agree to the{" "}
                <a href="/terms" className="text-green-600 hover:text-green-700 underline" target="_blank" rel="noopener noreferrer">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-green-600 hover:text-green-700 underline" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
              </Label>
            </div>
            
            {/* Newsletter Subscription */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="subscribeNewsletter"
                checked={registerData.subscribeNewsletter}
                onChange={(e) => setRegisterData({ ...registerData, subscribeNewsletter: e.target.checked })}
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <Label htmlFor="subscribeNewsletter" className="text-sm text-slate-600 dark:text-slate-300">
                Subscribe to Gulf job opportunities newsletter
              </Label>
            </div>
            
            {/* Error Display */}
            {registerError && (
              <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {registerError}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isRegistering}
            >
              {isRegistering ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Already have an account?{" "}
              <button
                type="button"
                className="text-green-600 hover:text-green-700 font-medium"
                onClick={() => {
                  setShowRegisterDialog(false)
                  setShowLoginDialog(true)
                }}
              >
                Sign in here
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
