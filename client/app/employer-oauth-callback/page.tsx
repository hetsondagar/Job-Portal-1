"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Building2, CheckCircle, Loader2, Shield, Users, Lock, Eye, EyeOff } from 'lucide-react'
import { apiService } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export default function EmployerOAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'password-setup' | 'profile-setup'>('loading')
  const [message, setMessage] = useState('Processing authentication...')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [settingPassword, setSettingPassword] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [region, setRegion] = useState<'india' | 'gulf' | 'other' | ''>('')
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token')
        const provider = searchParams.get('provider')
        // Ignore URL flag; rely on backend profile flag instead
        const userType = searchParams.get('userType') || 'employer'

        console.log('🔍 Employer OAuth callback - Params:', {
          token: token ? 'present' : 'missing',
          provider,
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
          
          const needsProfileSetup = !response.data.user.firstName || !response.data.user.lastName || !response.data.user.phone
          const mustSetupPassword = (response.data.user as any).requiresPasswordSetup === true
          const profileCompleted = Boolean((response.data.user as any).profileCompleted)
          
          // Check if user has previously skipped password setup
          const hasSkippedPassword = localStorage.getItem(`oauth:pwdSkipped:${response.data.user.id}`) === 'true' || 
                                   localStorage.getItem(`oauth:pwdSkipped:${response.data.user.email}`) === 'true'
          setFirstName(response.data.user.firstName || '')
          setLastName(response.data.user.lastName || '')
          setPhone(response.data.user.phone || '')
          setCompanyName((response.data.user as any)?.company?.name || '')
          setCompanyId((response.data.user as any)?.companyId || null)

          // Fetch company to get region if available
          try {
            const cid = (response.data.user as any)?.companyId
            if (cid) {
              const companyResp = await apiService.getCompany(cid)
              if (companyResp.success && companyResp.data) {
                localStorage.setItem('company', JSON.stringify(companyResp.data))
                setRegion((companyResp.data.region as any) || '')
              }
            }
          } catch (err) {
            console.warn('Failed to fetch company for employer OAuth:', err)
          }

          if (mustSetupPassword && !hasSkippedPassword) {
            // User needs to set up a password and hasn't skipped it before
            console.log('🔄 User needs password setup')
            setStatus('password-setup')
            setMessage(`Welcome! Please set up a password for your ${provider} account`)
            toast.success(`Welcome! Please set up a password for your ${provider} account`)
            setDialogOpen(true)
          } else if (!profileCompleted && needsProfileSetup) {
            setStatus('profile-setup')
            setMessage('Complete your basic details to continue')
            setDialogOpen(true)
          } else {
            // User already has a password, proceed to employer dashboard
            console.log('✅ User has password, proceeding to employer dashboard')
            setStatus('success')
            setMessage(`Successfully signed in with ${provider}`)
            toast.success(`Welcome to your employer dashboard!`)
            
            console.log('✅ Redirecting employer to employer dashboard')
            // Redirect based on region
            setTimeout(() => {
              const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
              const storedCompany = JSON.parse(localStorage.getItem('company') || 'null')
              const regionToUse = region || storedCompany?.region || storedUser?.company?.region || storedUser?.region
              const target = regionToUse === 'gulf' ? '/gulf-dashboard' : '/employer-dashboard'
              console.log('🔄 Executing redirect to', target)
              router.replace(target)
            }, 1200)
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
        
        // Clear the skip flag since password was set
        try {
          const me = await apiService.getCurrentUser()
          if (me.success && me.data?.user) {
            localStorage.removeItem(`oauth:pwdSkipped:${me.data.user.id}`)
            localStorage.removeItem(`oauth:pwdSkipped:${me.data.user.email}`)
          }
        } catch (error) {
          console.warn('Failed to clear skip flag:', error)
        }
        
        const me = await apiService.getCurrentUser()
        const needsProfileSetup = me.success && me.data?.user && (!me.data.user.firstName || !me.data.user.lastName || !me.data.user.phone)
        if (needsProfileSetup) {
          setStatus('profile-setup')
          setMessage('Complete your basic details to continue')
        } else {
          setStatus('success')
          setMessage('Password set successfully! Redirecting to your dashboard...')
          setTimeout(() => {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
            const storedCompany = JSON.parse(localStorage.getItem('company') || 'null')
            const regionToUse = region || storedCompany?.region || storedUser?.company?.region || storedUser?.region
            router.replace(regionToUse === 'gulf' ? '/gulf-dashboard' : '/employer-dashboard')
          }, 1000)
        }
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

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !phone) {
      toast.error('Please fill in first name, last name, and phone')
      return
    }
    try {
      setSavingProfile(true)
      const resp = await apiService.updateProfile({
        firstName,
        lastName,
        phone
      } as any)
      if (resp.success) {
        // Update company region if provided
        try {
          if (companyId && region) {
            const companyUpdate = await apiService.updateCompany(companyId, { region })
            if (companyUpdate.success && companyUpdate.data) {
              localStorage.setItem('company', JSON.stringify(companyUpdate.data))
            }
          }
        } catch (err) {
          console.warn('Failed to update company region:', err)
        }

        toast.success('Profile updated')
        setStatus('success')
        setMessage('Profile completed! Redirecting...')
        setTimeout(() => {
          const storedCompany = JSON.parse(localStorage.getItem('company') || 'null')
          const tgtRegion = region || storedCompany?.region
          const tgt = (tgtRegion === 'gulf') ? '/gulf-dashboard' : '/employer-dashboard'
          router.replace(tgt)
        }, 800)
      } else {
        throw new Error(resp.message || 'Failed to update profile')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {status === 'loading' && 'Signing you in...'}
            {status === 'success' && 'Welcome!'}
            {status === 'error' && 'Authentication Failed'}
            {status === 'password-setup' && 'Set Up Your Password'}
            {status === 'profile-setup' && 'Complete Your Details'}
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
              <Shield className="w-12 h-12 text-red-600" />
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
                <p className="text-slate-600 dark:text-slate-300 mb-2">{message}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Please use the dialog to complete this step.</p>
              </div>
            </div>
          )}

          {status === 'profile-setup' && (
            <div className="space-y-6 text-left">
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-300 mb-2">{message}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Please use the dialog to complete this step.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blocking dialog for required steps */}
      <Dialog open={dialogOpen} onOpenChange={(o) => setDialogOpen(o)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {status === 'password-setup' ? 'Set Up Your Password' : 'Complete Your Details'}
            </DialogTitle>
            <DialogDescription>
              {status === 'password-setup' ? 'Create a password to sign in with email next time.' : 'Fill the required details to continue.'}
            </DialogDescription>
          </DialogHeader>

          {status === 'password-setup' && (
            <form onSubmit={handlePasswordSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password (optional)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="pl-10 pr-10 h-12" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="pl-10 pr-10 h-12" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={settingPassword} className="h-12">
                  {settingPassword ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save password'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="h-12" 
                  onClick={() => {
                    (async () => {
                      try {
                        const me = await apiService.getCurrentUser();
                        if (me.success && me.data?.user) {
                          try { localStorage.setItem(`oauth:pwdSkipped:${me.data.user.id}`, 'true') } catch {}
                          try { localStorage.setItem(`oauth:pwdSkipped:${me.data.user.email}`, 'true') } catch {}
                          const needsProfileSetup = !me.data.user.firstName || !me.data.user.lastName || !me.data.user.phone
                          const profileCompleted = Boolean((me.data.user as any).profileCompleted)
                          if (!profileCompleted && needsProfileSetup) {
                            setStatus('profile-setup'); 
                            setMessage('Complete your basic details to continue'); 
                            setDialogOpen(true); 
                            return;
                          }
                        }
                      } catch {}
                      setStatus('success'); 
                      setMessage('Continuing without password...'); 
                      await new Promise(r => setTimeout(r, 150)); 
                      
                      // Redirect based on region
                      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
                      const storedCompany = JSON.parse(localStorage.getItem('company') || 'null')
                      const regionToUse = region || storedCompany?.region || storedUser?.company?.region || storedUser?.region
                      const target = regionToUse === 'gulf' ? '/gulf-dashboard' : '/employer-dashboard'
                      router.replace(target)
                      router.refresh?.();
                    })();
                  }}
                >
                  Skip for now
                </Button>
              </div>
            </form>
          )}

          {status === 'profile-setup' && (
            <form onSubmit={handleProfileSetup} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-12" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-12" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region of Operation</Label>
                <select 
                  id="region" 
                  value={region} 
                  onChange={(e) => setRegion(e.target.value as any)} 
                  className="h-12 w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
                >
                  <option value="">Select region</option>
                  <option value="india">India</option>
                  <option value="gulf">Gulf</option>
                  <option value="other">Other</option>
                </select>
                <p className="text-xs text-slate-500">This decides your dashboard after setup.</p>
              </div>
              <Button type="submit" disabled={savingProfile} className="w-full h-12">
                {savingProfile ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : 'Save & Continue'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
