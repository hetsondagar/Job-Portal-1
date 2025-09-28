"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  CreditCard, 
  Shield, 
  Check, 
  Crown, 
  Zap, 
  Award,
  ArrowLeft,
  Lock,
  Calendar,
  DollarSign,
  Star,
  Gift,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  MessageSquare,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import JobAtPaceNavbar from "@/components/job-at-pace/JobAtPaceNavbar"

interface PaymentMethod {
  id: string
  name: string
  icon: any
  description: string
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    description: "Visa, Mastercard, RuPay, American Express"
  },
  {
    id: "upi",
    name: "UPI",
    icon: Phone,
    description: "Google Pay, PhonePe, Paytm, BHIM"
  },
  {
    id: "netbanking",
    name: "Net Banking",
    icon: Shield,
    description: "All major banks supported"
  },
  {
    id: "wallet",
    name: "Digital Wallet",
    icon: DollarSign,
    description: "Paytm, Mobikwik, Freecharge"
  }
]

const planFeatures = {
  basic: {
    name: "Job at Pace Basic",
    price: 999,
    originalPrice: 1499,
    duration: "3 months",
    color: "blue",
    icon: Zap,
    features: [
      "Unlimited job applications",
      "Priority job alerts (Email + SMS)",
      "Enhanced profile visibility",
      "Application status tracking",
      "Resume headline boost",
      "Basic recruiter insights",
      "Job recommendation engine",
      "Interview preparation tips",
      "2x more profile views",
      "Priority application status"
    ]
  },
  premium: {
    name: "Job at Pace Premium",
    price: 2499,
    originalPrice: 3499,
    duration: "6 months",
    color: "purple",
    icon: Crown,
    features: [
      "Everything in Basic",
      "Premium profile badge",
      "Recruiter contact information",
      "Advanced job alerts (Email + SMS + WhatsApp)",
      "Profile featured in searches",
      "Premium resume templates",
      "Career consultation call",
      "Interview scheduling assistance",
      "Salary negotiation tips",
      "Industry insights & reports",
      "5x more profile views",
      "Priority recruiter attention",
      "Featured in top search results",
      "Direct recruiter messaging"
    ]
  },
  pro: {
    name: "Job at Pace Pro",
    price: 4999,
    originalPrice: 6999,
    duration: "12 months",
    color: "gold",
    icon: Award,
    features: [
      "Everything in Premium",
      "Dedicated career advisor",
      "Professional resume writing service",
      "LinkedIn profile optimization",
      "Mock interview sessions (3)",
      "Exclusive job opportunities",
      "Priority customer support",
      "Career coaching sessions (2)",
      "Personal branding consultation",
      "Network expansion opportunities",
      "Guaranteed interview calls*",
      "10x more profile views",
      "Exclusive recruiter network access",
      "Professional career guidance",
      "Guaranteed job interview opportunities"
    ]
  }
}

export default function SubscribePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan') || 'premium'
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  })
  const [billingDetails, setBillingDetails] = useState({
    email: "",
    phone: "",
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  })

  const currentPlan = planFeatures[planId as keyof typeof planFeatures] || planFeatures.premium
  const savings = currentPlan.originalPrice - currentPlan.price
  const savingsPercentage = Math.round((savings / currentPlan.originalPrice) * 100)

  const handlePayment = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      router.push('/job-at-pace/success?plan=' + planId)
    }, 3000)
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <JobAtPaceNavbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Subscription</h1>
            <p className="text-lg text-gray-600">
              You're just one step away from accelerating your career
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <currentPlan.icon className="h-5 w-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{currentPlan.name}</h3>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {savingsPercentage}% OFF
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{currentPlan.duration} subscription</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="text-gray-400 line-through">₹{currentPlan.originalPrice}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-green-600 font-medium">-₹{savings}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-gray-900">₹{currentPlan.price}</span>
                  </div>
                </div>

                <Alert>
                  <Gift className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Limited Time Offer!</strong> Save ₹{savings} on your subscription. 
                    This offer expires in 24 hours.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">What's Included:</h4>
                  <ul className="space-y-1">
                    {currentPlan.features.slice(0, 6).map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {currentPlan.features.length > 6 && (
                      <li className="text-sm text-blue-600 font-medium">
                        +{currentPlan.features.length - 6} more features
                      </li>
                    )}
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <Lock className="h-4 w-4" />
                    <span>Secure payment with 256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>7-day money-back guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Billing Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>
                    Enter your billing details for the subscription
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billing-name">Full Name *</Label>
                      <Input
                        id="billing-name"
                        value={billingDetails.name}
                        onChange={(e) => setBillingDetails({...billingDetails, name: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-email">Email Address *</Label>
                      <Input
                        id="billing-email"
                        type="email"
                        value={billingDetails.email}
                        onChange={(e) => setBillingDetails({...billingDetails, email: e.target.value})}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billing-phone">Phone Number *</Label>
                      <Input
                        id="billing-phone"
                        value={billingDetails.phone}
                        onChange={(e) => setBillingDetails({...billingDetails, phone: e.target.value})}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-city">City *</Label>
                      <Input
                        id="billing-city"
                        value={billingDetails.city}
                        onChange={(e) => setBillingDetails({...billingDetails, city: e.target.value})}
                        placeholder="Enter your city"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="billing-address">Address *</Label>
                    <Input
                      id="billing-address"
                      value={billingDetails.address}
                      onChange={(e) => setBillingDetails({...billingDetails, address: e.target.value})}
                      placeholder="Enter your address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billing-state">State *</Label>
                      <Input
                        id="billing-state"
                        value={billingDetails.state}
                        onChange={(e) => setBillingDetails({...billingDetails, state: e.target.value})}
                        placeholder="Enter your state"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-pincode">Pincode *</Label>
                      <Input
                        id="billing-pincode"
                        value={billingDetails.pincode}
                        onChange={(e) => setBillingDetails({...billingDetails, pincode: e.target.value})}
                        placeholder="Enter your pincode"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Choose your preferred payment method
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="relative">
                          <RadioGroupItem
                            value={method.id}
                            id={method.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={method.id}
                            className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-colors"
                          >
                            <method.icon className="h-6 w-6 text-gray-600" />
                            <div>
                              <div className="font-medium text-gray-900">{method.name}</div>
                              <div className="text-sm text-gray-600">{method.description}</div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Card Details (if card payment is selected) */}
              {selectedPaymentMethod === "card" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Card Details</CardTitle>
                    <CardDescription>
                      Enter your card information securely
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="card-number">Card Number *</Label>
                      <Input
                        id="card-number"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({
                          ...cardDetails, 
                          number: formatCardNumber(e.target.value)
                        })}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="card-expiry">Expiry Date *</Label>
                        <Input
                          id="card-expiry"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({
                            ...cardDetails, 
                            expiry: formatExpiry(e.target.value)
                          })}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="card-cvv">CVV *</Label>
                        <Input
                          id="card-cvv"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({
                            ...cardDetails, 
                            cvv: e.target.value.replace(/[^0-9]/g, '')
                          })}
                          placeholder="123"
                          maxLength={4}
                          type="password"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="card-name">Cardholder Name *</Label>
                      <Input
                        id="card-name"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                        placeholder="Enter name as on card"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Terms and Payment */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        By proceeding with the payment, you agree to our{" "}
                        <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and{" "}
                        <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
                        Your subscription will auto-renew unless cancelled.
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing Payment...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Lock className="h-5 w-5" />
                          <span>Pay ₹{currentPlan.price} Securely</span>
                        </div>
                      )}
                    </Button>

                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Shield className="h-4 w-4" />
                          <span>SSL Secured</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>Money Back Guarantee</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">
                        Your payment information is encrypted and secure
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
