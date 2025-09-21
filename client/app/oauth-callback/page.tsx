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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'password-setup' | 'profile-setup'>('loading')
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [settingPassword, setSettingPassword] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [currentLocation, setCurrentLocation] = useState('')
  // Optional professional details
  const [headline, setHeadline] = useState('')
  const [summary, setSummary] = useState('')
  const [experienceYears, setExperienceYears] = useState<number | ''>('')
  const [currentSalary, setCurrentSalary] = useState<number | ''>('')
  const [expectedSalary, setExpectedSalary] = useState<number | ''>('')
  const [noticePeriod, setNoticePeriod] = useState<number | ''>('')
  const [willingToRelocate, setWillingToRelocate] = useState(false)
  const [skills, setSkills] = useState('') // comma-separated
  const [preferredLocations, setPreferredLocations] = useState('') // comma-separated
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token')
        const provider = searchParams.get('provider')
        const userType = searchParams.get('userType') || 'jobseeker'
        const state = searchParams.get('state')
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
        console.log('🔍 Storing token:', token ? 'Token present' : 'No token')
        localStorage.setItem('token', token)

        // Get user data using the token
        console.log('🔍 Getting user data with token...')
        console.log('🔍 API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
        console.log('🔍 Token stored:', !!localStorage.getItem('token'))
        
        const response = await apiService.getCurrentUser()
        console.log('🔍 User data response:', response)
        
        if (response.success && response.data?.user) {
          console.log('✅ User data retrieved successfully:', response.data.user)
          
          // Check if this is an employer or admin user - if so, redirect to employer callback
          if (response.data.user.userType === 'employer' || response.data.user.userType === 'admin') {
            console.log('❌ Employer/Admin user detected in jobseeker OAuth callback - redirecting to employer callback')
            toast.error('This account is registered as an employer. Redirecting to employer login.')
            setTimeout(() => {
              router.push('/employer-login')
            }, 2000)
            return
          }
          
          // Store user data and keep token stable; block dashboard if password missing
          localStorage.setItem('user', JSON.stringify(response.data.user))
          const existingToken = localStorage.getItem('token')
          if (!existingToken && token) {
            localStorage.setItem('token', token)
          }
          
          // Sync Google profile data if it's a Google OAuth user
          if (provider === 'google' && response.data.user.oauth_provider === 'google') {
            try {
              console.log('🔄 Syncing Google profile data for jobseeker...')
              const syncResponse = await apiService.syncGoogleProfile()
              if (syncResponse.success && syncResponse.data?.user) {
                // Update stored user data with synced profile
                localStorage.setItem('user', JSON.stringify(syncResponse.data.user))
                console.log('✅ Google profile data synced successfully for jobseeker')
                
                // Show success message about profile sync
                toast.success('Google profile data synced successfully!')
              }
            } catch (error) {
              console.error('❌ Failed to sync Google profile for jobseeker:', error)
              // Continue with the flow even if sync fails
              toast.info('Profile sync failed, but you can continue to your dashboard')
            }
          }
          
          // Check if user has previously skipped password setup (from API or localStorage)
          const apiPasswordSkipped = Boolean((response.data.user as any).passwordSkipped)
          const localStorageSkipped = localStorage.getItem(`oauth:pwdSkipped:${response.data.user.id}`) === 'true' || 
                                     localStorage.getItem(`oauth:pwdSkipped:${response.data.user.email}`) === 'true'
          const hasSkippedPassword = apiPasswordSkipped || localStorageSkipped
          
          // Determine if required personal details are missing
          const needsProfileSetup = !response.data.user.firstName || !response.data.user.lastName || !response.data.user.phone
          const hasPassword = Boolean((response.data.user as any).hasPassword)
          // Use the backend-calculated requiresPasswordSetup field
          const mustSetupPassword = Boolean((response.data.user as any).requiresPasswordSetup)
          const profileCompleted = Boolean((response.data.user as any).profileCompleted)
          
          // Check if user has already completed initial setup
          // A user who has completed setup has either:
          // 1. Set a password OR skipped password setup
          // 2. AND has basic profile info (phone number)
          const hasCompletedInitialSetup = (hasPassword || hasSkippedPassword) && 
                                          Boolean(response.data.user.phone)
          
          // For debugging: log the exact values
          console.log('🔍 JOBSEEKER SETUP CHECK:', {
            hasPassword,
            hasSkippedPassword,
            phone: response.data.user.phone,
            hasCompletedInitialSetup,
            willShowDialogs: !hasCompletedInitialSetup
          })
          
          // Also check profile completion for returning users  
          const hasCompletedProfileBefore = response.data.user.profileCompletion && response.data.user.profileCompletion >= 60
          
          // DEBUG: Log all the key values
          console.log('🔍 DEBUG - OAuth Callback Values:', {
            userType: response.data.user.userType,
            oauthProvider: (response.data.user as any).oauthProvider,
            last_login_at: response.data.user.last_login_at,
            hasPassword: hasPassword,
            passwordValue: (response.data.user as any).password || 'null',
            passwordSkipped: (response.data.user as any).passwordSkipped,
            hasSkippedPassword: hasSkippedPassword,
            hasCompletedInitialSetup: hasCompletedInitialSetup,
            profileCompletion: response.data.user.profileCompletion,
            hasCompletedProfileBefore: hasCompletedProfileBefore,
            requiresPasswordSetup: (response.data.user as any).requiresPasswordSetup,
            mustSetupPassword: mustSetupPassword,
            needsProfileSetup: needsProfileSetup,
            profileCompleted: profileCompleted,
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            phone: response.data.user.phone
          })

          console.log('🚨 PASSWORD DIALOG CONDITION:', {
            'isFirstTime': !hasCompletedInitialSetup,
            'requiresPasswordSetup': (response.data.user as any).requiresPasswordSetup,
            'mustSetupPassword': mustSetupPassword,
            'willShowPasswordDialog': !hasCompletedInitialSetup && mustSetupPassword
          })

          console.log('🔍 DETAILED CONDITION BREAKDOWN:', {
            'hasPassword': hasPassword,
            'hasSkippedPassword': hasSkippedPassword,
            'phone': response.data.user.phone,
            'hasCompletedInitialSetup': hasCompletedInitialSetup,
            'profileCompletion': response.data.user.profileCompletion,
            'hasCompletedProfileBefore': hasCompletedProfileBefore,
            'isFirstTime': !hasCompletedInitialSetup,
            'requiresPasswordSetup': (response.data.user as any).requiresPasswordSetup,
            'FINAL_RESULT': !hasCompletedInitialSetup && mustSetupPassword
          })

          // Prime form fields
          setFirstName(response.data.user.firstName || '')
          setLastName(response.data.user.lastName || '')
          setPhone(response.data.user.phone || '')
          setCurrentLocation((response.data.user as any).currentLocation || '')
          setHeadline((response.data.user as any).headline || '')
          setSummary((response.data.user as any).summary || '')
          setExperienceYears((response.data.user as any).experienceYears ?? '')
          setCurrentSalary((response.data.user as any).currentSalary ?? '')
          setExpectedSalary((response.data.user as any).expectedSalary ?? '')
          setNoticePeriod((response.data.user as any).noticePeriod ?? '')
          setWillingToRelocate((response.data.user as any).willingToRelocate || false)
          const skillsArr = (response.data.user as any).skills || []
          setSkills(Array.isArray(skillsArr) ? skillsArr.join(', ') : '')
          const prefLocArr = (response.data.user as any).preferredLocations || []
          setPreferredLocations(Array.isArray(prefLocArr) ? prefLocArr.join(', ') : '')
          
          // For first-time users, show both dialogs in sequence
          console.log('🔍 DEBUG - Dialog Logic Check:', {
            '!hasCompletedInitialSetup': !hasCompletedInitialSetup,
            'willShowDialogs': !hasCompletedInitialSetup
          })
          
          // Fallback: If user has no password and no phone, they need setup
          const needsSetup = !hasPassword && !response.data.user.phone
          console.log('🔍 FALLBACK CHECK:', { needsSetup, hasPassword, phone: response.data.user.phone })
          
          if (!hasCompletedInitialSetup || needsSetup) {
            console.log('🔍 DEBUG - First-time user detected, checking dialog conditions')
            if (mustSetupPassword) {
              // First: Show password setup dialog
              console.log('🔄 New user needs password setup')
              setStatus('password-setup')
              setMessage(`Welcome! Please set up a password for your ${provider} account`)
              toast.success(`Welcome! Please set up a password for your ${provider} account`)
              setDialogOpen(true)
            } else if (!profileCompleted && needsProfileSetup) {
              // Second: Show profile setup dialog (after password or if no password needed)
              console.log('🔄 New user needs profile setup')
              setStatus('profile-setup')
              setMessage('Complete your basic details to continue')
              toast.message('Almost there', { description: 'Please complete your basic details to continue' })
              setDialogOpen(true)
            } else {
              // User has completed both, proceed to dashboard
              console.log('✅ New user completed setup, proceeding to jobseeker dashboard')
              setStatus('success')
              setMessage(`Successfully signed in with ${provider}`)
              toast.success(`Welcome! You've been signed in with ${provider}`)
              
              // Check if this is a Gulf flow
              if (state === 'gulf') {
                console.log('✅ Redirecting Gulf jobseeker to Gulf dashboard')
                setTimeout(() => {
                  router.push('/jobseeker-gulf-dashboard')
                }, 1500)
              } else {
                setTimeout(() => {
                  router.push('/dashboard')
                }, 1500)
              }
            }
          } else {
            console.log('🔍 DEBUG - Returning user or completed profile, skipping dialogs')
            // User already has a password, proceed to jobseeker dashboard
            setStatus('success')
            setMessage(`Successfully signed in with ${provider}`)
            toast.success(`Welcome! You've been signed in with ${provider}`)
            
            // Check user region for proper routing
            const userRegion = (response.data.user as any)?.region
            
            if (userRegion === 'gulf' || state === 'gulf') {
              console.log('✅ Redirecting Gulf jobseeker to Gulf dashboard')
              setTimeout(() => {
                router.push('/jobseeker-gulf-dashboard')
              }, 1500)
            } else {
              // Always redirect to jobseeker dashboard from this callback
              console.log('✅ Redirecting jobseeker to dashboard')
              setTimeout(() => {
                router.push('/dashboard')
              }, 1500) // Reduced timeout for better UX
            }
          }
        } else {
          console.error('❌ Failed to get user data:', response)
          
          // Fallback: Create a basic user object if we have a token but API fails
          if (token) {
            console.log('🔄 Creating fallback user object...')
            const fallbackUser = {
              id: 'temp-oauth-user',
              email: 'oauth-user@temp.com',
              firstName: 'OAuth',
              lastName: 'User',
              userType: 'jobseeker',
              isEmailVerified: true,
              accountStatus: 'active',
              profileCompletion: 60
            }
            
            localStorage.setItem('user', JSON.stringify(fallbackUser))
            console.log('✅ Fallback user created, proceeding to dashboard')
            
            setStatus('success')
            setMessage('Successfully signed in with Google')
            toast.success('Welcome! You\'ve been signed in with Google')
            
            // Check if this is a Gulf flow
            if (state === 'gulf') {
              setTimeout(() => {
                router.push('/jobseeker-gulf-dashboard')
              }, 1500)
            } else {
            setTimeout(() => {
              router.push('/dashboard')
            }, 1500)
            }
            return
          }
          
          throw new Error(`Failed to get user data: ${response.message || 'Unknown error'}`)
        }
      } catch (error: any) {
        console.error('OAuth callback error:', error)
        // If we have a token already, stay on this page and let the dialogs guide completion
        const token = searchParams.get('token') || localStorage.getItem('token')
        if (token) {
          toast.error('There was a temporary error. Please complete the steps to continue.')
          // Keep user on the page; do not clear auth or redirect to login
          setStatus((prev) => (prev === 'loading' ? 'password-setup' : prev))
          setDialogOpen(true)
          return
        }
        // No token: fall back to login
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        toast.error('Authentication failed')
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
        toast.success('Password set successfully!')
        // After password setup, check if profile needs completion
        const me = await apiService.getCurrentUser()
        const needsProfileSetup = me.success && me.data?.user && (!me.data.user.firstName || !me.data.user.lastName || !me.data.user.phone)
        if (needsProfileSetup) {
          // After password setup, show profile setup dialog
          setStatus('profile-setup')
          setMessage('Complete your basic details to continue')
          setDialogOpen(true)
        } else {
          // User has completed both password and profile setup
          setStatus('success')
          setMessage('Password set successfully! Redirecting...')
          // Use replace and refresh after a tiny delay to avoid login bounce
          await new Promise((r) => setTimeout(r, 150))
          router.replace('/dashboard')
          router.refresh?.()
        }
      } else {
        throw new Error(response.message || 'Failed to set password')
      }
    } catch (error: any) {
      console.error('Password setup error:', error)
      // Treat any conflict as success
      setStatus('success')
      setMessage('Password already set. Redirecting...')
      await new Promise((r) => setTimeout(r, 150))
      router.replace('/dashboard')
      router.refresh?.()
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
      const payload: any = {
        firstName,
        lastName,
        phone,
        currentLocation,
      }
      if (headline) payload.headline = headline
      if (summary) payload.summary = summary
      if (experienceYears !== '') payload.experienceYears = Number(experienceYears)
      if (currentSalary !== '') payload.currentSalary = Number(currentSalary)
      if (expectedSalary !== '') payload.expectedSalary = Number(expectedSalary)
      if (noticePeriod !== '') payload.noticePeriod = Number(noticePeriod)
      payload.willingToRelocate = !!willingToRelocate
      if (skills.trim()) payload.skills = skills.split(',').map(s => s.trim()).filter(Boolean)
      if (preferredLocations.trim()) payload.preferredLocations = preferredLocations.split(',').map(s => s.trim()).filter(Boolean)

      const resp = await apiService.updateProfile(payload)
      if (resp.success) {
        // Re-fetch current user to stabilize session before navigation
        const me = await apiService.getCurrentUser()
        if (me.success && me.data?.user) {
          localStorage.setItem('user', JSON.stringify(me.data.user))
        }
        toast.success('Profile updated')
        setStatus('success')
        setMessage('Profile completed! Redirecting...')
        setDialogOpen(false)
        // Small delay and refresh to avoid transient 401s
        await new Promise((r) => setTimeout(r, 150))
        router.replace('/dashboard')
        router.refresh?.()
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
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
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 pr-10 h-12" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={settingPassword} className="h-12">{settingPassword ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Saving...</>) : 'Save password'}</Button>
                <Button type="button" variant="secondary" className="h-12" onClick={() => {
                  (async () => {
                    try {
                      const me = await apiService.getCurrentUser();
                      if (me.success && me.data?.user) {
                        try { localStorage.setItem(`oauth:pwdSkipped:${me.data.user.id}`, 'true') } catch {}
                        try { 
                          localStorage.setItem(`oauth:pwdSkipped:${me.data.user.email}`, 'true') 
                          // Also set the password_skipped flag in the database
                          await apiService.updateProfile({ passwordSkipped: true })
                        } catch {}
                        const needsProfileSetup = !me.data.user.firstName || !me.data.user.lastName || !me.data.user.phone
                        const profileCompleted = Boolean((me.data.user as any).profileCompleted)
                        if (!profileCompleted && needsProfileSetup) {
                          // After skipping password, show profile setup dialog
                          setStatus('profile-setup'); 
                          setMessage('Complete your basic details to continue'); 
                          setDialogOpen(true); 
                          return;
                        }
                      }
                    } catch {}
                    setStatus('success'); setMessage('Continuing without password...'); await new Promise(r => setTimeout(r, 150)); router.replace('/dashboard'); router.refresh?.();
                  })();
                }}>Skip for now</Button>
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
                <Label htmlFor="currentLocation">Current location (optional)</Label>
                <Input id="currentLocation" value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Headline (optional)</Label>
                <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary (optional)</Label>
                <Input id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} className="h-12" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experienceYears">Experience (years, optional)</Label>
                  <Input id="experienceYears" type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noticePeriod">Notice period (days, optional)</Label>
                  <Input id="noticePeriod" type="number" min={0} value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value === '' ? '' : Number(e.target.value))} className="h-12" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentSalary">Current salary (optional)</Label>
                  <Input id="currentSalary" type="number" min={0} value={currentSalary} onChange={(e) => setCurrentSalary(e.target.value === '' ? '' : Number(e.target.value))} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedSalary">Expected salary (optional)</Label>
                  <Input id="expectedSalary" type="number" min={0} value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value === '' ? '' : Number(e.target.value))} className="h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated, optional)</Label>
                <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredLocations">Preferred locations (comma separated, optional)</Label>
                <Input id="preferredLocations" value={preferredLocations} onChange={(e) => setPreferredLocations(e.target.value)} className="h-12" />
              </div>
              <div className="flex items-center gap-2">
                <input id="relocate" type="checkbox" checked={willingToRelocate} onChange={(e) => setWillingToRelocate(e.target.checked)} />
                <Label htmlFor="relocate">Willing to relocate (optional)</Label>
              </div>
              <Button type="submit" disabled={savingProfile} className="w-full h-12">{savingProfile ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Saving...</>) : 'Save & Continue'}</Button>
              </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
