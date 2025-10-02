"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQsPage() {
  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Click on the 'Sign Up' button on our homepage and fill in your details. You can choose to sign up as a job seeker or an employer."
    },
    {
      question: "Is it free to use Job Portal?",
      answer: "Yes, basic features are free for both job seekers and employers. We also offer premium features for enhanced visibility and advanced tools."
    },
    {
      question: "How do I apply for a job?",
      answer: "Browse jobs on our platform, click on a job that interests you, and click the 'Apply Now' button. You'll need to upload your resume and cover letter."
    },
    {
      question: "How do I post a job?",
      answer: "Create an employer account, go to your dashboard, and click 'Post a Job'. Fill in the job details and requirements, then publish your listing."
    },
    {
      question: "Can I edit my profile after creating it?",
      answer: "Yes, you can edit your profile at any time by going to your dashboard and clicking on 'Edit Profile'."
    },
    {
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page, enter your email address, and follow the instructions sent to your email."
    },
    {
      question: "What file formats are accepted for resumes?",
      answer: "We accept PDF, DOC, and DOCX file formats for resumes. The maximum file size is 5MB."
    },
    {
      question: "How do I delete my account?",
      answer: "Go to your account settings and click on 'Delete Account'. Please note that this action cannot be undone."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h1>
          
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
