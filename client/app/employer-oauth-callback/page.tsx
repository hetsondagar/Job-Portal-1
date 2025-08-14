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

        console.log('🔍 Employer OAuth callback - Params:', {
          token: token ? 'present' : 'missing',
          provider,
          needsPasswordSetup
        });

        if (!token) {
          throw new Error('No authentication token received')
        }

        // Store the token and get user data
        await apiService.handleOAuthCallback(token)
        
        // Get user data using the token
        const response = await apiService.getCurrentUser()
        
        console.log('🔍 Employer OAuth callback - User response:', {
          success: response.success,
          userType: response.data?.user?.userType,
          email: response.data?.user?.email
        });
        
        if (response.success && response.data?.user) {
          // Store user data
          localStorage.setItem('user', JSON.stringify(response.data.user))
          
          if (needsPasswordSetup) {
            // User needs to set up a password
            setStatus('password-setup')
            setMessage(`Welcome! Please set up a password for your ${provider} account`)
            toast.success(`Welcome! Please set up a password for your ${provider} account`)
          } else {
            // User already has a password, proceed to employer dashboard
            setStatus('success')
            setMessage(`Successfully signed in with ${provider}`)
            toast.success(`Welcome to your employer dashboard!`)
            
            // Redirect to employer dashboard after a short delay
            setTimeout(() => {
              router.push('/employer-dashboard')
            }, 2000)
          }
        } else {
          throw new Error('Failed to get user data')
        }
      } catch (error: any) {
        console.error('❌ Employer OAuth callback error:', error)
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        toast.error('Authentication failed')
        
        // Clear any stored data
        apiService.clearAuth()
        
        setTimeout(() => {
          router.push('/employer-login')
        }, 3000)
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
      await apiService.setupOAuthPassword(password)
      
      toast.success('Password set successfully!')
      setStatus('success')
      setMessage('Account setup complete! Redirecting to dashboard...')
      
      setTimeout(() => {
        router.push('/employer-dashboard')
      }, 2000)
    } catch (error: any) {
      console.error('Password setup error:', error)
      toast.error(error.message || 'Failed to set password')
    } finally {
      setSettingPassword(false)
    }
  }

  const skipPasswordSetup = () => {
    toast.success('You can set up a password later in your account settings')
    setStatus('success')
    setMessage('Redirecting to dashboard...')
    
    setTimeout(() => {
      router.push('/employer-dashboard')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
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

        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Completing authentication...
              </p>
            </div>
          )}

          {status === 'password-setup' && (
            <form onSubmit={handlePasswordSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                  Set Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700"
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
                  className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700"
                  required
                />
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={settingPassword}
                >
                  {settingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting Password...
                    </>
                  ) : (
                    'Set Password'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 bg-white dark:bg-slate-700"
                  onClick={skipPasswordSetup}
                  disabled={settingPassword}
                >
                  Skip for now
                </Button>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Setting a password allows you to sign in with email and password in the future
              </div>
            </form>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Redirecting to your employer dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Redirecting to login page...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
