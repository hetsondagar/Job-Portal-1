"use client"

import { useState } from "react"
import Link from "next/link"
import { Zap, Crown, CheckCircle, Star, Users, TrendingUp, Shield, Briefcase, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"

export default function JobAtPacePage() {
  const [selectedPlan, setSelectedPlan] = useState("premium")

  const features = [
    {
      icon: Zap,
      title: "Priority Job Alerts",
      description: "Get notified first about new job openings that match your profile",
      premium: true,
    },
    {
      icon: Crown,
      title: "Premium Profile Badge",
      description: "Stand out to recruiters with a verified premium badge",
      premium: true,
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Track your application performance and get insights",
      premium: true,
    },
    {
      icon: Shield,
      title: "Profile Privacy Control",
      description: "Control who can see your profile and contact information",
      premium: true,
    },
    {
      icon: Users,
      title: "Direct Recruiter Connect",
      description: "Connect directly with hiring managers and recruiters",
      premium: true,
    },
    {
      icon: Star,
      title: "Resume Review Service",
      description: "Get your resume reviewed by industry experts",
      premium: true,
    },
  ]

  const plans = [
    {
      name: "Basic",
      price: "Free",
      period: "Forever",
      description: "Perfect for getting started",
      features: ["Basic job search", "Apply to jobs", "Create profile", "Basic job alerts", "Standard support"],
      popular: false,
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
    },
    {
      name: "Premium",
      price: "₹999",
      period: "per month",
      description: "Best for serious job seekers",
      features: [
        "Everything in Basic",
        "Priority job alerts",
        "Premium profile badge",
        "Advanced analytics",
        "Direct recruiter connect",
        "Resume review service",
        "Priority support",
        "Profile privacy controls",
      ],
      popular: true,
      buttonText: "Start Premium",
      buttonVariant: "default" as const,
    },
    {
      name: "Enterprise",
      price: "₹2999",
      period: "per month",
      description: "For professionals and teams",
      features: [
        "Everything in Premium",
        "Personal career coach",
        "Interview preparation",
        "Salary negotiation support",
        "LinkedIn profile optimization",
        "Career roadmap planning",
        "Dedicated account manager",
        "Custom job matching",
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    },
  ]

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      company: "Google",
      image: "/placeholder.svg?height=60&width=60",
      content:
        "JobAtPace helped me land my dream job at Google. The premium features and direct recruiter connect made all the difference!",
    },
    {
      name: "Rahul Kumar",
      role: "Product Manager",
      company: "Microsoft",
      image: "/placeholder.svg?height=60&width=60",
      content:
        "The career coaching and interview preparation were invaluable. I got 3 offers within a month of upgrading to Premium.",
    },
    {
      name: "Anita Patel",
      role: "Data Scientist",
      company: "Amazon",
      image: "/placeholder.svg?height=60&width=60",
      content:
        "The analytics feature helped me understand what recruiters were looking for. Highly recommend JobAtPace Premium!",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white text-sm font-medium mb-8">
              <Zap className="w-4 h-4 mr-2" />
              Premium Job Search Experience
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Accelerate Your Career with{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                JobAtPace
              </span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Get premium features, priority access, and personalized career guidance to land your dream job faster than
              ever before.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                Watch Demo
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { number: "10x", label: "Faster Job Discovery" },
                { number: "85%", label: "Higher Response Rate" },
                { number: "50K+", label: "Premium Jobs" },
                { number: "24/7", label: "Priority Support" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-orange-500 mb-2">{stat.number}</div>
                  <div className="text-slate-600 dark:text-slate-300">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Premium Features That Make a Difference
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Unlock powerful tools designed to accelerate your job search
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 group">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">{feature.description}</p>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">Premium Feature</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Choose Your Plan</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Start free and upgrade when you're ready to accelerate
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <Card
                  className={`border-0 backdrop-blur-xl transition-all duration-500 relative overflow-hidden ${
                    plan.popular
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 ring-2 ring-orange-200 dark:ring-orange-800 shadow-2xl"
                      : "bg-white/70 dark:bg-slate-800/70 hover:shadow-xl"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                      {plan.period !== "Forever" && (
                        <span className="text-slate-600 dark:text-slate-400 ml-2">{plan.period}</span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.buttonVariant}
                      className={`w-full h-12 ${
                        plan.popular
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg"
                          : ""
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Success Stories</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              See how JobAtPace Premium helped professionals land their dream jobs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{testimonial.name}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {testimonial.role} at {testimonial.company}
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 italic">"{testimonial.content}"</p>
                    <div className="flex items-center mt-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Ready to Accelerate Your Career?</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              Join thousands of professionals who've upgraded their job search with JobAtPace Premium
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-xl"
              >
                Start 7-Day Free Trial
                <Zap className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">JobPortal</span>
              </div>
              <p className="text-slate-400 mb-6">India's leading job portal connecting talent with opportunities.</p>
            </div>

            {[
              {
                title: "For Job Seekers",
                links: ["Browse Jobs", "Career Advice", "Resume Builder", "Salary Guide"],
              },
              {
                title: "For Employers",
                links: ["Post Jobs", "Search Resumes", "Recruitment Solutions", "Pricing"],
              },
              {
                title: "Company",
                links: ["About Us", "Contact", "Privacy Policy", "Terms of Service"],
              },
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-6 text-lg">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href="#" className="text-slate-400 hover:text-white transition-colors hover:underline">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2025 JobPortal. All rights reserved. Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
