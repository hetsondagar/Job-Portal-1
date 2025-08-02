"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

export default function EmployerLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Employer login attempt:", { email, password, rememberMe })
    // Redirect to employer dashboard after successful login
    router.push("/employer-dashboard")
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
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Employer Portal</h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
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
                  >
                    Sign In to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </form>

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
                  <Link href="/jobatpace" className="hover:text-white transition-colors font-medium">
                    JobAtPace Premium
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
