"use client"

import { useState, useEffect, createContext, useContext } from 'react';
import { apiService, User, SignupData, EmployerSignupData, LoginData } from '@/lib/api';
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

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const storedUser = apiService.getCurrentUserFromStorage();
        if (storedUser && apiService.isAuthenticated()) {
          // Verify token is still valid with database check
          const response = await apiService.getCurrentUser();
          if (response.success && response.data?.user) {
            setUser(response.data.user);
          } else {
            // Token is invalid or user doesn't exist, clear storage
            apiService.clearAuth();
            setUser(null);
          }
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
        setUser(response.data.user);
        // Return the response data so the calling component can handle redirection
        return response.data;
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
        setUser(response.data.user);
        // Return the response data so the calling component can handle redirection
        return response.data;
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
      
      const response = await apiService.login(data);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        // Return the response data so the calling component can handle redirection
        return response.data;
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
