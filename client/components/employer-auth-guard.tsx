"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Loader2, Shield } from 'lucide-react'
import { apiService } from '@/lib/api'

interface EmployerAuthGuardProps {
  children: React.ReactNode
}

export function EmployerAuthGuard({ children }: EmployerAuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('⏰ EmployerAuthGuard timeout reached')
      setTimeoutReached(true)
      setIsChecking(false)
    }, 10000) // 10 second timeout

    // While auth provider is loading, or we have a token but no user yet, keep checking
    if (loading) {
      return () => clearTimeout(timeout)
    }

    const hasToken = typeof window !== 'undefined' && apiService.isAuthenticated()

    console.log('🔍 EmployerAuthGuard - State:', {
      loading,
      hasUser: !!user,
      userType: user?.userType,
      hasToken,
      timeoutReached
    })
      
    if (!user) {
      // If we have a token, wait for profile fetch to hydrate user instead of redirecting
      if (hasToken && !timeoutReached) {
        setIsChecking(true)
        return () => clearTimeout(timeout)
      }
      
      // No token and no user → go to employer-login
      clearTimeout(timeout)
      router.replace('/employer-login')
      return
    }
      
    // We have a user - check if they're employer or admin
    if (user.userType !== 'employer' && user.userType !== 'admin') {
      clearTimeout(timeout)
      if (user.userType === 'jobseeker') {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
      return
    }
      
    // Auth OK
    clearTimeout(timeout)
    setIsChecking(false)
    
    return () => clearTimeout(timeout)
  }, [user, loading, router, timeoutReached])

  // Show loading while checking authentication
  if (loading || isChecking) {
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
              Employer Access
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              {timeoutReached ? 'Taking longer than expected...' : 'Verifying your credentials...'}
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              {timeoutReached 
                ? 'Still verifying your account. You can try refreshing the page.'
                : 'Please wait while we verify your employer account'
              }
            </p>
            {timeoutReached && (
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="mt-2"
              >
                Refresh Page
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show access denied if user is not an employer or admin
  if (user && user.userType !== 'employer' && user.userType !== 'admin') {
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
              Access Denied
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              This area is restricted to employer and admin accounts only
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600 dark:text-slate-300">
              Your account is registered as a job seeker. Please use the job seeker dashboard.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Go to Job Seeker Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/employer-register')}
                className="w-full"
              >
                Register as Employer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User is authenticated and is an employer, render children
  return <>{children}</>
}
