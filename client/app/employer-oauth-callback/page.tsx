"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Building2, CheckCircle, Loader2, Shield, Users } from 'lucide-react'
import { apiService } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export default function EmployerOAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'password-setup'>('loading')
  const [message, setMessage] = useState('Processing authentication...')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [settingPassword, setSettingPassword] = useState(false)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token')
        const provider = searchParams.get('provider')
        const needsPasswordSetup = searchParams.get('needsPasswordSetup') === 'true'
        const userType = searchParams.get('userType') || 'employer'

        console.log('🔍 Employer OAuth callback - Params:', {
          token: token ? 'present' : 'missing',
          provider,
          needsPasswordSetup,
          userType
        });

        // Log all search params for debugging
        console.log('🔍 All search params:', Object.fromEntries(searchParams.entries()));

        if (!token) {
          throw new Error('No authentication token received')
        }

        // Store the token and get user data
        console.log('🔄 Storing token and getting user data...')
        await apiService.handleOAuthCallback(token)
        
        // Get user data using the token
        console.log('🔄 Getting current user data...')
        const response = await apiService.getCurrentUser()
        
        console.log('🔍 Employer OAuth callback - User response:', {
          success: response.success,
          userType: response.data?.user?.userType,
          email: response.data?.user?.email,
          companyId: response.data?.user?.companyId
        });
        
        if (response.success && response.data?.user) {
          // Store user data
          localStorage.setItem('user', JSON.stringify(response.data.user))
          console.log('✅ User data stored in localStorage')
          
          // FORCE user to be employer type for this callback page
          console.log('🔄 Force setting user type to employer for employer OAuth callback')
          const updatedUser = {
            ...response.data.user,
            userType: 'employer'
          }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          response.data.user = updatedUser
          console.log('✅ User type forced to employer')
          
          if (needsPasswordSetup) {
            // User needs to set up a password
            console.log('🔄 User needs password setup')
            setStatus('password-setup')
            setMessage(`Welcome! Please set up a password for your ${provider} account`)
            toast.success(`Welcome! Please set up a password for your ${provider} account`)
          } else {
            // User already has a password, proceed to employer dashboard
            console.log('✅ User has password, proceeding to employer dashboard')
            setStatus('success')
            setMessage(`Successfully signed in with ${provider}`)
            toast.success(`Welcome to your employer dashboard!`)
            
            console.log('✅ Redirecting employer to employer dashboard')
            // Redirect to employer dashboard after a short delay
            setTimeout(() => {
              console.log('🔄 Executing redirect to /employer-dashboard')
              router.push('/employer-dashboard')
            }, 2000)
          }
        } else {
          console.error('❌ Failed to get user data:', response)
          throw new Error('Failed to get user data')
        }
      } catch (error: any) {
        console.error('❌ Employer OAuth callback error:', error)
        setStatus('error')
        setMessage(`Authentication failed: ${error.message}`)
        toast.error('Authentication failed. Please try again.')
        
        // Clear any stored data
        apiService.clearAuth()
        const token = searchParams.get('token')
        if (token) {
          console.log('🔄 Attempting to redirect to employer dashboard despite error')
          setTimeout(() => {
            router.push('/employer-dashboard')
          }, 3000)
        } else {
          setTimeout(() => {
            console.log('🔄 Redirecting to employer-login due to error')
            router.push('/employer-login')
          }, 3000)
        }
      }
    }

    handleOAuthCallback()
  }, [searchParams, router, login])

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }
    
    try {
      setSettingPassword(true)
      console.log('🔄 Setting up password for OAuth user')
      
      const response = await apiService.setupOAuthPassword(password)
      
      if (response.success) {
        console.log('✅ Password setup successful')
        toast.success('Password set successfully!')
        
        setStatus('success')
        setMessage('Password set successfully! Redirecting to employer dashboard...')
        
        // Redirect to employer dashboard
        setTimeout(() => {
          console.log('🔄 Redirecting to employer dashboard after password setup')
          router.push('/employer-dashboard')
        }, 2000)
      } else {
        console.error('❌ Password setup failed:', response)
        toast.error(response.message || 'Failed to set password')
      }
    } catch (error: any) {
      console.error('❌ Password setup error:', error)
      toast.error(error.message || 'Failed to set password')
    } finally {
      setSettingPassword(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Employer Authentication
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              {message}
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Please wait while we complete your authentication...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'password-setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Set Up Password
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              {message}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={settingPassword}
              >
                {settingPassword ? 'Setting Password...' : 'Set Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome Back!
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              {message}
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Redirecting to your employer dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Authentication Error
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              {message}
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600 dark:text-slate-300">
              Please try signing in again or contact support if the problem persists.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/employer-login')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Back to Employer Login
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
