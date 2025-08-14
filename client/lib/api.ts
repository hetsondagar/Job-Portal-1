const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'jobseeker' | 'employer' | 'admin';
  isEmailVerified: boolean;
  accountStatus: string;
  phone?: string;
  currentLocation?: string;
  headline?: string;
  summary?: string;
  profileCompletion?: number;
  lastLoginAt?: string;
  companyId?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  companySize: string;
  website?: string;
  email: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  company?: Company;
  token: string;
}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  experience?: string;
  agreeToTerms: boolean;
  subscribeNewsletter?: boolean;
}

export interface EmployerSignupData {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  phone: string;
  companySize?: string;
  industry?: string;
  website?: string;
  agreeToTerms: boolean;
  subscribeUpdates?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  currentLocation?: string;
  headline?: string;
  summary?: string;
  expectedSalary?: number;
  noticePeriod?: number;
  willingToRelocate?: boolean;
  gender?: 'male' | 'female' | 'other';
  profileVisibility?: 'public' | 'private' | 'connections_only';
  contactVisibility?: 'public' | 'private' | 'connections_only';
  skills?: string[];
  languages?: any[];
  certifications?: any[];
  socialLinks?: any;
  preferences?: any;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    
    return data;
  }

  // Authentication endpoints
  async signup(data: SignupData): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<AuthResponse>(response);
    
    if (result.success && result.data?.token) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }

    return result;
  }

  async employerSignup(data: EmployerSignupData): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/employer-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<AuthResponse>(response);

    if (result.success && result.data?.token) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      if (result.data.company) {
        localStorage.setItem('company', JSON.stringify(result.data.company));
      }
    }

    return result;
  }

  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<AuthResponse>(response);

    if (result.success && result.data?.token) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      if (result.data.company) {
        localStorage.setItem('company', JSON.stringify(result.data.company));
      }
    }

    return result;
  }

  async logout(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return this.handleResponse(response);
  }

  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async verifyResetToken(token: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token/${token}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return this.handleResponse(response);
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<{ user: User }>(response);
  }

  // User profile endpoints
  async getUserProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<{ user: User }>(response);
  }

  async updateProfile(data: ProfileUpdateData): Promise<ApiResponse<{ user: User }>> {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<{ user: User }>(response);
    
    if (result.success && result.data?.user) {
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }

    return result;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/user/change-password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    return this.handleResponse(response);
  }

  async updateNotificationPreferences(
    emailNotifications?: any,
    pushNotifications?: any
  ): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/user/notifications`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ emailNotifications, pushNotifications }),
    });

    return this.handleResponse(response);
  }

  async deleteAccount(password: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/user/account`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return this.handleResponse(response);
  }

  // Company endpoints
  async getCompanyInfo(companyId: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // Utility methods
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }

  getCurrentUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getCompanyFromStorage(): Company | null {
    if (typeof window === 'undefined') return null;
    const companyStr = localStorage.getItem('company');
    return companyStr ? JSON.parse(companyStr) : null;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
  }

  // OAuth methods
  async getOAuthUrls(userType: 'jobseeker' | 'employer' = 'jobseeker'): Promise<ApiResponse<{ google: string; facebook: string }>> {
    console.log('🔍 Getting OAuth URLs for userType:', userType);
    
    const response = await fetch(`${API_BASE_URL}/oauth/urls?userType=${userType}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await this.handleResponse<{ google: string; facebook: string }>(response);
    console.log('✅ OAuth URLs received:', result.data);
    
    return result;
  }

  async handleOAuthCallback(token: string): Promise<ApiResponse<AuthResponse>> {
    console.log('🔍 Handling OAuth callback with token:', token ? 'present' : 'missing');
    
    // Store the token temporarily
    localStorage.setItem('token', token);
    
    // Get user data
    const response = await this.getCurrentUser();
    
    if (response.success && response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('✅ OAuth callback - User data stored:', {
        id: response.data.user.id,
        email: response.data.user.email,
        userType: response.data.user.userType
      });
      
      // If user is an employer, get company information
      if (response.data.user.userType === 'employer' && response.data.user.companyId) {
        const companyResponse = await this.getCompanyInfo(response.data.user.companyId);
        if (companyResponse.success && companyResponse.data) {
          localStorage.setItem('company', JSON.stringify(companyResponse.data));
          console.log('✅ OAuth callback - Company data stored:', companyResponse.data);
        }
      }
    }
    
    return response;
  }

  async getCompanyInfo(companyId: string): Promise<ApiResponse<Company>> {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Company>(response);
  }

  async setupOAuthPassword(password: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/oauth/setup-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
