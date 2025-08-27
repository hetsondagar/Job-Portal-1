"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function TestEmployerAccessPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [testResults, setTestResults] = useState<any>({})

  useEffect(() => {
    runTests()
  }, [user, loading])

  const runTests = async () => {
    const results = {
      authHook: !loading,
      userExists: !!user,
      userType: user?.userType,
      isEmployer: user?.userType === 'employer',
      localStorage: typeof window !== 'undefined' && !!localStorage.getItem('user'),
      token: typeof window !== 'undefined' && !!localStorage.getItem('token')
    }
    
    setTestResults(results)
  }

  const testDirectAccess = () => {
    window.open('/employer-dashboard', '_blank')
  }

  const testEmployerLogin = () => {
    router.push('/employer-login')
  }

  const testOAuthCallback = () => {
    router.push('/employer-oauth-callback')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Testing Access
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Loading authentication state...
            </p>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
              Employer Dashboard Access Test
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Testing employer dashboard accessibility and authentication
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Test Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-50 dark:bg-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Authentication Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Auth Hook Loaded:</span>
                    {testResults.authHook ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>User Exists:</span>
                    {testResults.userExists ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>User Type:</span>
                    <span className="font-mono text-sm">{testResults.userType || 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Is Employer:</span>
                    {testResults.isEmployer ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-50 dark:bg-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Storage Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>User in localStorage:</span>
                    {testResults.localStorage ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Token in localStorage:</span>
                    {testResults.token ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Test Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Test Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={testDirectAccess}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Test Direct Access
                </Button>
                
                <Button
                  onClick={testEmployerLogin}
                  variant="outline"
                  className="w-full"
                >
                  Go to Employer Login
                </Button>
                
                <Button
                  onClick={testOAuthCallback}
                  variant="outline"
                  className="w-full"
                >
                  Test OAuth Callback
                </Button>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Diagnosis</h3>
              
              {!testResults.authHook && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200">
                    ❌ Auth hook is not loaded. Check if useAuth is properly configured.
                  </p>
                </div>
              )}
              
              {testResults.authHook && !testResults.userExists && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    ⚠️ No user is logged in. You need to log in first to access the employer dashboard.
                  </p>
                </div>
              )}
              
              {testResults.userExists && !testResults.isEmployer && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-orange-800 dark:text-orange-200">
                    ⚠️ User is logged in but not an employer. User type: {testResults.userType}
                  </p>
                </div>
              )}
              
              {testResults.isEmployer && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-800 dark:text-green-200">
                    ✅ User is an employer. Employer dashboard should be accessible.
                  </p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Next Steps</h3>
              
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p>1. If no user is logged in, go to employer login and sign in</p>
                <p>2. If user is not an employer, use OAuth to create a new employer account</p>
                <p>3. If user is an employer, try accessing the employer dashboard directly</p>
                <p>4. Check browser console for any JavaScript errors</p>
                <p>5. Check network tab for failed API requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
