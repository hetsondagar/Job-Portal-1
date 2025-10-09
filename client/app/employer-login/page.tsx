"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  Star,
  Shield,
  Zap,
  Target,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageCircle,
  HelpCircle,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/lib/api"

export default function EmployerLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loading, error, clearError } = useAuth()
  const [checking, setChecking] = useState(true)

  // If already authenticated (e.g., just completed OAuth), send to appropriate employer dashboard
  useEffect(() => {
    // Check for URL parameters first
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    
    if (error === 'account_type_mismatch' && message) {
      toast.error(decodeURIComponent(message))
    }
    
    const checkAlreadyLoggedIn = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const me = await apiService.getCurrentUser()
          if (me.success && me.data?.user && (me.data.user.userType === 'employer' || me.data.user.userType === 'admin')) {
            // Determine region → target dashboard (prefer user region, fallback to company region)
            let region: string | undefined = (me.data.user as any)?.region
            if (!region) {
            const companyId = (me.data.user as any).companyId
            if (companyId) {
              const companyResp = await apiService.getCompany(companyId)
              if (companyResp.success && companyResp.data) {
                localStorage.setItem('company', JSON.stringify(companyResp.data))
                region = companyResp.data.region
                }
              }
            }
            // Allow explicit region override via URL param if none set on user/company
            const requestedRegion = searchParams.get('region') || undefined
            const finalRegion = region || requestedRegion
            const target = finalRegion === 'gulf' ? '/gulf-dashboard' : '/employer-dashboard'
            return router.replace(target)
          }
        }
      } catch {
        // ignore and show login form
      }
      setChecking(false)
    }
    checkAlreadyLoggedIn()
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!email || !password) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      clearError()
      console.log('🔍 Starting employer login for:', email)
      const result = await login({ email, password, rememberMe, loginType: 'employer' })
      
      console.log('✅ Login result:', result)
      console.log('👤 User data:', result?.user)
      console.log('🎯 User type:', result?.user?.userType)
      
      // Check if user is an employer or admin and redirect accordingly
      if (result?.user?.userType === 'employer' || result?.user?.userType === 'admin') {
        console.log('✅ User is employer/admin, using redirectTo from server')
        
        // Use the redirectTo URL from the server response
        const redirectTo = result?.redirectTo || '/employer-dashboard'
        console.log('✅ Redirecting to:', redirectTo)
        
        toast.success('Successfully signed in! Redirecting to your dashboard...')
        router.replace(redirectTo)
      } else {
        console.log('❌ User is not employer or admin, userType:', result?.user?.userType)
        toast.error('This account is not registered as an employer. Please use the regular login.')
        setTimeout(() => {
          console.log('🔄 Redirecting to /login')
          router.push('/login')
        }, 2000)
      }
    } catch (error: any) {
      console.error('❌ Login error:', error)
      
      // Handle specific error types
      if (error.message?.includes('This account is registered as a jobseeker')) {
        toast.error(error.message)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else if (error.message?.includes('Invalid email or password') || 
          error.message?.includes('User not found') ||
          error.message?.includes('does not exist')) {
        toast.error("Account not found. Please register first or check your credentials.")
      } else if (error.message?.includes('Validation failed')) {
        toast.error("Please check your input and try again")
      } else {
        toast.error(error.message || 'Login failed')
      }
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    try {
      setOauthLoading(provider)
      clearError()
      
      console.log('🔍 Starting OAuth login for employer with provider:', provider);
      
      // Get OAuth URLs from backend for employer
      const response = await apiService.getOAuthUrls('employer')
      
      if (response.success && response.data) {
        const url = provider === 'google' ? response.data.google : response.data.facebook
        console.log('✅ OAuth URL received for employer:', url);
        console.log('🔍 URL contains state=employer:', url.includes('state=employer'));
        
        // Store a flag to indicate this is an employer OAuth flow
        sessionStorage.setItem('oauth_flow_type', 'employer')
        console.log('✅ OAuth flow type set to employer in sessionStorage');
        
        // Also store in localStorage for persistence
        localStorage.setItem('oauth_flow_type', 'employer')
        console.log('✅ OAuth flow type set to employer in localStorage');
        
        // Redirect to OAuth provider
        console.log('🔄 Redirecting to OAuth provider:', url);
        window.location.href = url
      } else {
        console.error('❌ Failed to get OAuth URL:', response);
        toast.error('Failed to get OAuth URL')
      }
    } catch (error: any) {
      console.error(`❌ ${provider} OAuth error:`, error)
      toast.error(`Failed to sign in with ${provider}`)
    } finally {
      setOauthLoading(null)
    }
  }

  const features = [
    {
      icon: Search,
      title: "Database",
      description: "Access millions of verified candidate profiles with advanced search and filtering capabilities.",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Get detailed insights into your hiring performance with comprehensive analytics and reports.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work seamlessly with your team using shared candidate lists and collaborative hiring tools.",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security ensures your data and candidate information remain protected.",
    },
  ]

  const premiumServices = [
    {
      icon: Target,
      title: "Premium Job Posting",
      description: "Get 3x more visibility with featured job listings",
      features: ["Priority placement", "Highlighted listings", "Extended reach"],
      price: "₹2,999/month",
    },
    {
      icon: BarChart3,
      title: "TalentPulse",
      description: "AI-powered talent analytics and insights",
      features: ["Candidate scoring", "Market insights", "Hiring trends"],
      price: "₹4,999/month",
    },
    {
      icon: Shield,
      title: "Database",
      description: "Access India's largest resume database",
      features: ["50M+ profiles", "Advanced filters", "Contact details"],
      price: "₹7,999/month",
    },
    {
      icon: Zap,
      title: "Expert Assist",
      description: "Dedicated hiring support from our experts",
      features: ["Personal recruiter", "Interview scheduling", "Candidate screening"],
      price: "₹9,999/month",
    },
  ]

  const faqs = [
    {
      question: "How do I post my first job?",
      answer:
        "After logging in, click on 'Post a Job' button. Fill in the job details, requirements, and publish. Your job will be live within 24 hours.",
    },
    {
      question: "What is included in the free plan?",
      answer:
        "Free plan includes 1 active job posting, basic candidate applications, and standard support. Perfect for small businesses and startups.",
    },
    {
      question: "How can I access premium features?",
      answer:
                "Upgrade to our premium plans to access features like Database, priority job listings, advanced analytics, and dedicated support.",
    },
    {
      question: "Can I get a demo of premium services?",
      answer:
        "Yes! Contact our sales team for a personalized demo of all premium features. We'll show you how to maximize your hiring success.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, debit cards, net banking, UPI, and corporate purchase orders for enterprise clients.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                JobPortal
              </span>
              <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                Employers
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-slate-600 dark:text-slate-300">
                <Phone className="w-4 h-4 mr-2" />
                1800-102-2558
              </Button>
              <Link href="/employer-register">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Features & Hero */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Employer Portal</h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8">
                Access your recruiter dashboard and manage your hiring process
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="flex items-start space-x-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Trusted by 50K+ Companies</h3>
              <p className="text-blue-100">
                From startups to Fortune 500 companies, employers trust us to find the best talent
              </p>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">Employer Sign In</CardTitle>
                <p className="text-slate-600 dark:text-slate-300 mt-2">Access your recruiter dashboard</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                      Company Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your company email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400">
                        Keep me signed in
                      </Label>
                    </div>
                    <Link
                      href="/employer-forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In to Dashboard'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  {error && (
                    <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      {error}
                    </div>
                  )}
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={oauthLoading === 'google'}
                  >
                    {oauthLoading === 'google' ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                    onClick={() => handleOAuthLogin('facebook')}
                    disabled={oauthLoading === 'facebook'}
                  >
                    {oauthLoading === 'facebook' ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                    Facebook
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">New to JobPortal?</span>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <Link href="/employer-register">
                    <Button variant="outline" className="w-full h-12 bg-white dark:bg-slate-700">
                      Create Employer Account
                    </Button>
                  </Link>

                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Need to link to an existing company?{' '}
                    <Link href="/employer-join-company" className="text-blue-600 hover:text-blue-700 font-medium">
                      Join company
                    </Link>
                  </div>

                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Need help? Contact our{" "}
                    <Link href="/sales-support" className="text-blue-600 hover:text-blue-700 font-medium">
                      sales team
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Premium Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Premium Hiring Solutions</h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Supercharge your hiring with our advanced tools and services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {premiumServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-slate-900 dark:text-white">{service.title}</CardTitle>
                  <p className="text-slate-600 dark:text-slate-300">{service.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                        <Star className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">{service.price}</div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Get answers to common questions about our employer services
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50"
            >
              <Collapsible
                open={expandedFaq === index}
                onOpenChange={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <CollapsibleTrigger className="w-full p-6 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{faq.question}</h3>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6">
                  <p className="text-slate-600 dark:text-slate-300">{faq.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-600 dark:text-slate-300 mb-4">Still have questions? We're here to help!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="flex items-center bg-transparent">
              <MessageCircle className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
            <Button variant="outline" className="flex items-center bg-transparent">
              <Phone className="w-4 h-4 mr-2" />
              Call 1800-102-2558
            </Button>
            <Button variant="outline" className="flex items-center bg-transparent">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help Center
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">JobPortal</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                India's leading job portal connecting talent with opportunities. Find your dream job or hire the perfect
                candidate.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link href="/jobs" className="hover:text-white transition-colors">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/companies" className="hover:text-white transition-colors">
                    Browse Companies
                  </Link>
                </li>
                <li>
                  <Link href="/job-at-pace" className="hover:text-white transition-colors font-medium">
                    Job at Pace Premium
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link href="/employer-dashboard/post-job" className="hover:text-white transition-colors">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/employer-dashboard/requirements" className="hover:text-white transition-colors">
                    Search Resume Database
                  </Link>
                </li>
                <li>
                  <Link href="/employer-dashboard/manage-jobs" className="hover:text-white transition-colors">
                    Manage Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/employer-register" className="hover:text-white transition-colors">
                    Employer Registration
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>Email: support@jobportal.com</p>
                <p>Phone: +91 80-4040-0000</p>
                <p>Address: Bangalore, India</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>© 2025 JobPortal. All rights reserved. Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
