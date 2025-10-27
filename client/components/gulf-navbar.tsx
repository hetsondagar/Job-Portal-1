"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  Bell,
  Search,
  Globe,
  Building2,
  Briefcase,
  Users,
  TrendingUp,
  Loader2
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function GulfNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
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
  const { user, logout, login, signup } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoggingIn(true)
    try {
      await login(loginData)
      toast.success("Welcome to Gulf Jobs!")
      setShowLoginDialog(false)
      setLoginData({ email: '', password: '' })
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Login failed. Please check your credentials.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerData.fullName || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      toast.error("Please fill in all required fields")
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (!registerData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions")
      return
    }

    setIsRegistering(true)
    try {
      await signup(registerData)
      toast.success("Account created successfully! Welcome to Gulf Jobs!")
      setShowRegisterDialog(false)
      setRegisterData({ 
        fullName: '', 
        email: '', 
        password: '', 
        confirmPassword: '',
        phone: '',
        experience: '',
        agreeToTerms: false,
        subscribeNewsletter: false
      })
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Registration failed. Please try again.")
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gradient-to-r from-yellow-500 via-green-500 to-yellow-600 shadow-lg backdrop-blur-sm' 
        : 'bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xl font-bold text-white">Gulf Jobs</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/gulf-jobs" 
              className="text-white hover:text-green-100 transition-colors font-medium"
            >
              Jobs
            </Link>
            <Link 
              href="/gulf-companies" 
              className="text-white hover:text-green-100 transition-colors font-medium"
            >
              Companies
            </Link>
            <Link 
              href="/gulf-opportunities" 
              className="text-white hover:text-green-100 transition-colors font-medium"
            >
              Opportunities
            </Link>
            {/* Show appropriate dashboard link based on user region */}
            {user?.region === 'gulf' ? (
              <Link 
                href="/gulf-dashboard" 
                className="text-white hover:text-green-100 transition-colors font-medium"
              >
                Gulf Dashboard
              </Link>
            ) : (
              <Link 
                href="/dashboard" 
                className="text-white hover:text-green-100 transition-colors font-medium"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user && user.region === 'gulf' ? (
              <div className="flex items-center space-x-4">
                {/* Only show Gulf-specific features for Gulf users */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Bell className="w-4 h-4" />
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-medium">{user.firstName}</span>
                  <span className="text-xs bg-green-500/20 text-green-200 px-2 py-1 rounded-full">
                    Gulf
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLoginDialog(true)}
                  className="text-white hover:bg-white/20"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowRegisterDialog(true)}
                  className="bg-white text-green-600 hover:bg-green-50"
                >
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-white/20"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-sm rounded-lg mt-2 p-4 shadow-lg">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/gulf-jobs" 
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Jobs
              </Link>
              <Link 
                href="/gulf-companies" 
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Companies
              </Link>
              <Link 
                href="/gulf-opportunities" 
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Opportunities
              </Link>
              {/* Show appropriate dashboard link based on user region */}
              {user?.region === 'gulf' ? (
                <Link 
                  href="/gulf-dashboard" 
                  className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Gulf Dashboard
                </Link>
              ) : (
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              
              <div className="border-t pt-4">
                {user && user.region === 'gulf' ? (
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-700 font-medium">{user.firstName}</span>
                        <span className="text-xs text-green-600 font-medium">Gulf User</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowLoginDialog(true)
                        setIsMenuOpen(false)
                      }}
                      className="w-full"
                    >
                      Login
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowRegisterDialog(true)
                        setIsMenuOpen(false)
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Register
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-slate-900">
              Sign In to Gulf Jobs
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600">
              Access your Gulf career opportunities
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setShowLoginDialog(false)
                  setShowRegisterDialog(true)
                }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Create one here
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-slate-900">
              Create Gulf Account
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600">
              Start your Gulf career journey
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={registerData.fullName}
                onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                placeholder="Create a password"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={registerData.agreeToTerms}
                onCheckedChange={(checked) => setRegisterData({...registerData, agreeToTerms: !!checked})}
              />
              <Label htmlFor="agreeToTerms" className="text-sm">
                I agree to the{' '}
                <Link href="/terms" className="text-green-600 hover:text-green-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-green-600 hover:text-green-700">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setShowRegisterDialog(false)
                  setShowLoginDialog(true)
                }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  )
}
