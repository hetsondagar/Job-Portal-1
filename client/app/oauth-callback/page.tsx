"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Loader2, Lock, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'password-setup'>('loading')
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [settingPassword, setSettingPassword] = useState(false)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token')
        const provider = searchParams.get('provider')
        const needsPasswordSetup = searchParams.get('needsPasswordSetup') === 'true'
        const userType = searchParams.get('userType') || 'jobseeker'
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setMessage('OAuth authentication failed. Please try again.')
          toast.error('OAuth authentication failed')
          setTimeout(() => {
            router.push('/login')
          }, 3000)
          return
        }

        if (!token) {
          setStatus('error')
          setMessage('No authentication token received')
          toast.error('Authentication failed')
          setTimeout(() => {
            router.push('/login')
          }, 3000)
          return
        }

        // Store the token
        localStorage.setItem('token', token)

        // Get user data using the token
        const response = await apiService.getCurrentUser()
        
        if (response.success && response.data?.user) {
          // Store user data
          localStorage.setItem('user', JSON.stringify(response.data.user))
          
          // Sync Google profile data if it's a Google OAuth user
          if (provider === 'google' && response.data.user.oauth_provider === 'google') {
            try {
              console.log('🔄 Syncing Google profile data...')
              const syncResponse = await apiService.syncGoogleProfile()
              if (syncResponse.success && syncResponse.data?.user) {
                // Update stored user data with synced profile
                localStorage.setItem('user', JSON.stringify(syncResponse.data.user))
                console.log('✅ Google profile data synced successfully')
              }
            } catch (error) {
              console.error('❌ Failed to sync Google profile:', error)
              // Continue with the flow even if sync fails
            }
          }
          
          if (needsPasswordSetup) {
            // User needs to set up a password
            setStatus('password-setup')
            setMessage(`Welcome! Please set up a password for your ${provider} account`)
            toast.success(`Welcome! Please set up a password for your ${provider} account`)
          } else {
            // User already has a password, proceed to appropriate dashboard based on user type
            setStatus('success')
            setMessage(`Successfully signed in with ${provider}`)
            toast.success(`Welcome! You've been signed in with ${provider}`)
            
            // Redirect to appropriate dashboard based on user type
            const finalUserType = response.data.user.userType || userType
            const dashboardPath = finalUserType === 'employer' ? '/employer-dashboard' : '/dashboard'
            
            console.log('🔄 Redirecting to dashboard:', dashboardPath, 'for user type:', finalUserType)
            
            setTimeout(() => {
              router.push(dashboardPath)
            }, 2000)
          }
        } else {
          throw new Error('Failed to get user data')
        }
      } catch (error: any) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        toast.error('Authentication failed')
        
        // Clear any stored data
        apiService.clearAuth()
        
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    handleOAuthCallback()
  }, [searchParams, router, login])

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      toast.error("Password must contain at least one uppercase letter, one lowercase letter, and one number")
      return
    }

    setSettingPassword(true)
    
    try {
      const response = await apiService.setupOAuthPassword(password)
      
      if (response.success) {
        setStatus('success')
        setMessage('Password set successfully! Welcome to your account.')
        toast.success('Password set successfully!')
        
        // Get current user data to determine user type
        const userResponse = await apiService.getCurrentUser()
        const userType = userResponse.success && userResponse.data?.user ? userResponse.data.user.userType : 'jobseeker'
        const dashboardPath = userType === 'employer' ? '/employer-dashboard' : '/dashboard'
        
        // Redirect to appropriate dashboard after a short delay
        setTimeout(() => {
          router.push(dashboardPath)
        }, 2000)
      } else {
        throw new Error(response.message || 'Failed to set password')
      }
    } catch (error: any) {
      console.error('Password setup error:', error)
      toast.error(error.message || 'Failed to set password')
    } finally {
      setSettingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {status === 'loading' && 'Signing you in...'}
            {status === 'success' && 'Welcome!'}
            {status === 'error' && 'Authentication Failed'}
            {status === 'password-setup' && 'Set Up Your Password'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-slate-600 dark:text-slate-300">
                Completing your sign-in...
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <p className="text-slate-600 dark:text-slate-300">
                {message}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Redirecting to dashboard...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="w-12 h-12 text-red-600" />
              <p className="text-slate-600 dark:text-slate-300">
                {message}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Redirecting to login page...
              </p>
            </div>
          )}

          {status === 'password-setup' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  {message}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Setting up a password will allow you to sign in with email and password in the future.
                </p>
              </div>

              <form onSubmit={handlePasswordSetup} className="space-y-4">
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={settingPassword}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {settingPassword ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Setting Password...
                    </>
                  ) : (
                    "Set Password & Continue"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push('/dashboard')}
                  className="w-full h-12"
                >
                  Skip for now
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
