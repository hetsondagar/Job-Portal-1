"use client"

import { useState, useEffect, createContext, useContext } from 'react';
import { apiService, User, SignupData, EmployerSignupData, LoginData, AuthResponse } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signup: (data: SignupData) => Promise<AuthResponse | undefined>;
  employerSignup: (data: EmployerSignupData) => Promise<AuthResponse | undefined>;
  login: (data: LoginData) => Promise<AuthResponse | undefined>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Normalize backend /auth/me response (snake_case) to frontend User (camelCase)
  const mapUserFromApi = (u: any): User => ({
    id: u.id,
    email: u.email,
    firstName: u.first_name ?? u.firstName,
    lastName: u.last_name ?? u.lastName,
    userType: (u.user_type ?? u.userType) as User['userType'],
    isEmailVerified: u.is_email_verified ?? u.isEmailVerified,
    accountStatus: u.account_status ?? u.accountStatus,
    avatar: u.avatar,
    phone: u.phone,
    currentLocation: u.current_location ?? u.currentLocation,
    headline: u.headline,
    summary: u.summary,
    profileCompletion: u.profile_completion ?? u.profileCompletion,
    lastLoginAt: u.last_login_at ?? u.lastLoginAt,
    companyId: u.company_id ?? u.companyId,
  });

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        // Rely on token presence, then validate with server; avoid trusting stale localStorage user
        if (apiService.isAuthenticated()) {
          const response = await apiService.getCurrentUser();
          if (response.success && response.data?.user) {
            const normalized = mapUserFromApi(response.data.user as any);
            setUser(normalized);
            // Keep storage in sync in camelCase to prevent future stale shape
            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(normalized));
            }
          } else {
            apiService.clearAuth();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        apiService.clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signup = async (data: SignupData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiService.signup(data);
      
      if (response.success && response.data?.user) {
        const normalized = mapUserFromApi(response.data.user as any);
        setUser(normalized);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(normalized));
        }
        // Return the response data so the calling component can handle redirection
        return { ...response.data, user: normalized } as any;
      } else {
        setError(response.message || 'Signup failed');
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error: any) {
      setError(error.message || 'Signup failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const employerSignup = async (data: EmployerSignupData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiService.employerSignup(data);
      
      if (response.success && response.data?.user) {
        const normalized = mapUserFromApi(response.data.user as any);
        setUser(normalized);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(normalized));
        }
        // Return the response data so the calling component can handle redirection
        return { ...response.data, user: normalized } as any;
      } else {
        setError(response.message || 'Employer signup failed');
        throw new Error(response.message || 'Employer signup failed');
      }
    } catch (error: any) {
      setError(error.message || 'Employer signup failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setError(null);
      setLoading(true);
      // Clear any stale auth before performing login to avoid misrouting due to old data
      apiService.clearAuth();

      const response = await apiService.login(data);
      
      if (response.success && response.data?.user) {
        const normalized = mapUserFromApi(response.data.user as any);
        setUser(normalized);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(normalized));
        }
        // Return the response data so the calling component can handle redirection
        return { ...response.data, user: normalized } as any;
      } else {
        setError(response.message || 'Login failed');
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error; // Re-throw the error so the login page can handle it
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      apiService.clearAuth();
      router.push('/');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    signup,
    employerSignup,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
