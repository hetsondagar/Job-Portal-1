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
  avatar?: string;
  phone?: string;
  currentLocation?: string;
  headline?: string;
  summary?: string;
  profileCompletion?: number;
  lastLoginAt?: string;
  companyId?: string;
  skills?: string[];
  languages?: string[];
  expectedSalary?: number;
  noticePeriod?: number;
  willingToRelocate?: boolean;
  gender?: 'male' | 'female' | 'other';
  profileVisibility?: 'public' | 'private' | 'connections_only';
  contactVisibility?: 'public' | 'private' | 'connections_only';
  certifications?: any[];
  socialLinks?: any;
  preferences?: any;
  oauthProvider?: string;
  oauthId?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  company?: Company;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  status: 'applied' | 'reviewing' | 'shortlisted' | 'interviewed' | 'offered' | 'hired' | 'rejected' | 'withdrawn';
  coverLetter?: string;
  expectedSalary?: number;
  appliedAt: string;
  job?: Job;
}

export interface JobAlert {
  id: string;
  userId: string;
  name: string;
  keywords?: string[];
  locations?: string[];
  categories?: string[];
  experienceLevel?: string;
  jobType?: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  remoteWork?: 'on_site' | 'hybrid' | 'remote' | 'any';
  maxResults?: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  lastSentAt?: string;
  nextSendAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobBookmark {
  id: string;
  userId: string;
  jobId: string;
  folder?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  isApplied: boolean;
  job?: Job;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  applicationCount: number;
  profileViews: number;
  recentApplications: JobApplication[];
  // Employer-specific stats
  activeJobs?: number;
  totalApplications?: number;
  hiredCandidates?: number;
}

export interface SearchHistory {
  id: string;
  searchQuery: any;
  filters: any;
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  summary?: string;
  objective?: string;
  skills: string[];
  languages: any[];
  certifications: any[];
  projects: any[];
  achievements: any[];
  isDefault: boolean;
  isPublic: boolean;
  views: number;
  downloads: number;
  lastUpdated: string;
  metadata?: any;
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  location: string;
  companyId: string;
  createdBy: string;
  experience?: string;
  experienceMin?: number;
  experienceMax?: number;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  skills?: string[];
  keySkills?: string[];
  education?: string;
  industry?: string;
  department?: string;
  validTill?: string;
  noticePeriod?: string;
  remoteWork?: 'on-site' | 'remote' | 'hybrid';
  travelRequired?: boolean;
  shiftTiming?: 'day' | 'night' | 'rotational' | 'flexible';
  benefits?: string[];
  candidateDesignations?: string[];
  candidateLocations?: string[];
  includeWillingToRelocate?: boolean;
  currentSalaryMin?: number;
  currentSalaryMax?: number;
  includeNotMentioned?: boolean;
  status: 'draft' | 'active' | 'paused' | 'closed';
  isUrgent?: boolean;
  isFeatured?: boolean;
  views?: number;
  matches?: number;
  applications?: number;
  publishedAt?: string;
  closedAt?: string;
  tags?: string[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private baseURL: string
  private authToken: string | null = null
  private requestQueue: Map<string, Promise<any>> = new Map()
  private lastRequestTime: Map<string, number> = new Map()
  private readonly MIN_REQUEST_INTERVAL = 2000 // 2 seconds between requests to same endpoint (balanced for rate limiting)

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
  }

  // Rate limiting helper
  private async throttleRequest(endpoint: string): Promise<void> {
    const now = Date.now()
    const lastRequest = this.lastRequestTime.get(endpoint) || 0
    const timeSinceLastRequest = now - lastRequest

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    this.lastRequestTime.set(endpoint, Date.now())
  }

  // Deduplicate requests to same endpoint
  private async makeRequest<T>(endpoint: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if there's already a request in progress for this endpoint
    if (this.requestQueue.has(endpoint)) {
      console.log(`🔄 Request to ${endpoint} already in progress, waiting...`)
      return this.requestQueue.get(endpoint)!
    }

    // Throttle requests to prevent rate limiting
    await this.throttleRequest(endpoint)

    // Create the request promise
    const requestPromise = requestFn()
    
    // Store it in the queue
    this.requestQueue.set(endpoint, requestPromise)
    
    try {
      const result = await requestPromise
      return result
    } finally {
      // Remove from queue when done
      this.requestQueue.delete(endpoint)
    }
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log('🔍 getAuthHeaders - Token present:', !!token);
    console.log('🔍 getAuthHeaders - Token value:', token ? `${token.substring(0, 20)}...` : 'null');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    
    console.log('🔍 getAuthHeaders - Final headers:', headers);
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const url = response.url;
    let data: any;
    
    try {
      data = await response.json();
    } catch (error) {
      console.error('❌ Failed to parse response as JSON:', error);
      throw new Error(`Invalid response format: ${response.statusText}`);
    }

    console.log('🔍 handleResponse - Parsed data:', data);

    if (!response.ok) {
      console.error('❌ API error:', { url, status: response.status, statusText: response.statusText, body: data });
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        console.warn('⚠️ Rate limit exceeded - too many requests');
        
        // Add exponential backoff for rate-limited requests
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
        
        console.log(`⏳ Waiting ${waitTime}ms before retrying...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime/1000)} seconds before trying again.`);
      }
      
      // Handle validation errors
      if (data && data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map((err: any) => err.msg || err.message).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      
      throw new Error((data && data.message) || `Request failed (${response.status}): ${response.statusText}`);
    }

    console.log('✅ handleResponse - Success:', data);
    return data as ApiResponse<T>;
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
    localStorage.removeItem('company');

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
    try {
      console.log('🔍 API Service - Getting current user...')
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: this.getAuthHeaders(),
      });

      console.log('🔍 API Service - Response status:', response.status)
      const result = await this.handleResponse<{ user: User }>(response);
      console.log('🔍 API Service - Result:', result)
      return result;
    } catch (error) {
      console.error('❌ API Service - getCurrentUser error:', error)
      throw error;
    }
  }

  // User profile endpoints
  async getUserProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<{ user: User }>(response);
  }

  async updateProfile(data: ProfileUpdateData): Promise<ApiResponse<{ user: User }>> {
    try {
      console.log('🔍 API Service - Updating profile...');
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      console.log('🔍 API Service - Profile update response status:', response.status);
      const result = await this.handleResponse<{ user: User }>(response);
      console.log('🔍 API Service - Profile update result:', result);
      
      if (result.success && result.data?.user) {
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }

      return result;
    } catch (error) {
      console.error('❌ API Service - updateProfile error:', error);
      throw error;
    }
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

    localStorage.removeItem('company');

    return this.handleResponse(response);
  }

  // Company endpoints
  async createCompany(data: any): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<any>(response);
  }

  async getCompany(companyId: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async updateCompany(companyId: string, data: any): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<any>(response);
  }

  // Job endpoints
  async postJob(data: any): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/jobs/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<any>(response);
  }

  async getJobs(params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<any>> {
    const query = params
      ? '?' + Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&')
      : '';
    const response = await fetch(`${API_BASE_URL}/jobs${query}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<any>(response);
  }

  async getJobById(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<any>(response);
  }

  async getCompanyJobs(companyId?: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<any>> {
    const finalCompanyId = companyId || this.getCompanyFromStorage()?.id || this.getCurrentUserFromStorage()?.companyId || '';
    const query = params
      ? '?' + Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&')
      : '';
    const endpoint = `/jobs/company/${finalCompanyId}${query}`;
    
    return this.makeRequest(endpoint, async () => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse<any>(response);
    });
  }

  async updateJob(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
  }

  async deleteJob(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<any>(response);
  }

  async updateJobStatus(id: string, status: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return this.handleResponse<any>(response);
  }

  async getEmployerJobs(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<any>> {
    // Retain logging for debugging
    console.log('🔍 API: Fetching employer jobs with params:', params);
    const queryParams = new URLSearchParams();

    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `/jobs/employer/manage-jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest(endpoint, async () => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse<any>(response);
    });
  }

  async getJobForEdit(jobId: string): Promise<ApiResponse<any>> {
    // Retain logging for debugging
    console.log('🔍 API: Fetching job for edit:', jobId);
    const response = await fetch(`${API_BASE_URL}/jobs/edit/${jobId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<any>(response);
  }

  // Job application endpoint
  async applyJob(jobId: string, applicationData?: {
    coverLetter?: string;
    expectedSalary?: number;
    noticePeriod?: number;
    availableFrom?: string;
    isWillingToRelocate?: boolean;
    preferredLocations?: string[];
    resumeId?: string;
  }): Promise<ApiResponse<{ applicationId: string; status: string; appliedAt: string }>> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData || {}),
    });

    return this.handleResponse<{ applicationId: string; status: string; appliedAt: string }>(response);
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

  async handleOAuthCallback(token: string): Promise<ApiResponse<{ user: User }>> {
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
        const companyResponse = await this.getCompany(response.data.user.companyId);
        if (companyResponse.success && companyResponse.data) {
          localStorage.setItem('company', JSON.stringify(companyResponse.data));
          console.log('✅ OAuth callback - Company data stored:', companyResponse.data);
        }
      }
    }
    
    return response;
  }

  async setupOAuthPassword(password: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/oauth/setup-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    return this.handleResponse(response);
  }

  // Applications endpoints
  async getApplications(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_BASE_URL}/user/applications`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<any[]>(response);
  }

  // Job Alerts endpoints
  async getJobAlerts(): Promise<ApiResponse<JobAlert[]>> {
    const response = await fetch(`${API_BASE_URL}/job-alerts`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<JobAlert[]>(response);
  }

  async createJobAlert(data: Partial<JobAlert>): Promise<ApiResponse<JobAlert>> {
    console.log('🔍 createJobAlert - Sending data:', data);
    console.log('🔍 createJobAlert - Headers:', this.getAuthHeaders());
    console.log('🔍 createJobAlert - API URL:', `${API_BASE_URL}/job-alerts`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/job-alerts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      console.log('🔍 createJobAlert - Response status:', response.status);
      console.log('🔍 createJobAlert - Response statusText:', response.statusText);
      console.log('🔍 createJobAlert - Response headers:', response.headers);
      console.log('🔍 createJobAlert - Response ok:', response.ok);
      
      // Log the raw response text for debugging
      const responseText = await response.text();
      console.log('🔍 createJobAlert - Raw response text:', responseText);
      
      // Try to parse as JSON if possible
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('🔍 createJobAlert - Parsed response data:', responseData);
      } catch (parseError) {
        console.error('❌ createJobAlert - Failed to parse response as JSON:', parseError);
        console.log('🔍 createJobAlert - Response was not valid JSON');
      }
      
      // Create a new response object with the parsed data
      const newResponse = new Response(responseText, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      
      return this.handleResponse<JobAlert>(newResponse);
    } catch (fetchError) {
      console.error('❌ createJobAlert - Fetch error:', fetchError);
      throw fetchError;
    }
  }

  async updateJobAlert(id: string, data: Partial<JobAlert>): Promise<ApiResponse<JobAlert>> {
    const response = await fetch(`${API_BASE_URL}/job-alerts/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<JobAlert>(response);
  }

  async deleteJobAlert(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/job-alerts/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async toggleJobAlert(id: string): Promise<ApiResponse<JobAlert>> {
    const response = await fetch(`${API_BASE_URL}/job-alerts/${id}/toggle`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<JobAlert>(response);
  }

  // Job Bookmarks endpoints
  async getBookmarks(): Promise<ApiResponse<JobBookmark[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/bookmarks`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return this.handleResponse<JobBookmark[]>(response);
    } catch (error) {
      // Fallback to localStorage if API is not available
      console.warn('API not available, using localStorage fallback for bookmarks');
      
      const user = this.getCurrentUserFromStorage();
      if (!user) {
        return {
          success: true,
          data: [],
          message: 'No bookmarks found'
        };
      }

      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const userBookmarks = bookmarks.filter((bookmark: JobBookmark) => bookmark.userId === user.id);

      return {
        success: true,
        data: userBookmarks,
        message: 'Bookmarks retrieved successfully'
      };
    }
  }

  async createBookmark(data: Partial<JobBookmark>): Promise<ApiResponse<JobBookmark>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/bookmarks`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return this.handleResponse<JobBookmark>(response);
    } catch (error) {
      // Fallback to localStorage if API is not available
      console.warn('API not available, using localStorage fallback for bookmarks');
      
      const user = this.getCurrentUserFromStorage();
      if (!user) {
        throw new Error('User not authenticated');
      }

             const bookmark: JobBookmark = {
         id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
         userId: user.id,
         jobId: data.jobId || '',
         folder: data.folder || 'Saved Jobs',
         notes: data.notes || '',
         priority: data.priority || 'medium',
         isApplied: false,
         createdAt: new Date().toISOString(),
       };

      // Store in localStorage
      const existingBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      existingBookmarks.push(bookmark);
      localStorage.setItem('bookmarks', JSON.stringify(existingBookmarks));

      return {
        success: true,
        data: bookmark,
        message: 'Bookmark created successfully'
      };
    }
  }

  async updateBookmark(id: string, data: Partial<JobBookmark>): Promise<ApiResponse<JobBookmark>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/bookmarks/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return this.handleResponse<JobBookmark>(response);
    } catch (error) {
      // Fallback to localStorage if API is not available
      console.warn('API not available, using localStorage fallback for bookmark update');
      
      const user = this.getCurrentUserFromStorage();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const bookmarkIndex = bookmarks.findIndex((bookmark: JobBookmark) => 
        bookmark.id === id && bookmark.userId === user.id
      );

      if (bookmarkIndex === -1) {
        throw new Error('Bookmark not found');
      }

      // Update the bookmark
      const updatedBookmark = {
        ...bookmarks[bookmarkIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      bookmarks[bookmarkIndex] = updatedBookmark;
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

      return {
        success: true,
        data: updatedBookmark,
        message: 'Bookmark updated successfully'
      };
    }
  }

  async deleteBookmark(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/bookmarks/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return this.handleResponse(response);
    } catch (error) {
      // Fallback to localStorage if API is not available
      console.warn('API not available, using localStorage fallback for bookmark deletion');
      
      const user = this.getCurrentUserFromStorage();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const updatedBookmarks = bookmarks.filter((bookmark: JobBookmark) => 
        bookmark.id !== id && bookmark.userId === user.id
      );
      localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));

      return {
        success: true,
        message: 'Bookmark deleted successfully'
      };
    }
  }

  // Search History endpoints
  async getSearchHistory(): Promise<ApiResponse<SearchHistory[]>> {
    const response = await fetch(`${API_BASE_URL}/user/search-history`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<SearchHistory[]>(response);
  }

  // Requirements endpoints
  async getRequirements(): Promise<ApiResponse<Requirement[]>> {
    const response = await fetch(`${API_BASE_URL}/requirements`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Requirement[]>(response);
  }

  async createRequirement(data: any): Promise<ApiResponse<any>> {
    // Ensure companyId is present for employers
    const company = this.getCompanyFromStorage();
    const user = this.getCurrentUserFromStorage();
    const withCompany = {
      ...data,
      companyId: data.companyId || company?.id || user?.companyId,
    };

    const response = await fetch(`${API_BASE_URL}/requirements`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(withCompany),
    });

    return this.handleResponse<any>(response);
  }

  // Dashboard Stats endpoint
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const endpoint = '/user/dashboard-stats';
    
    return this.makeRequest(endpoint, async () => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<DashboardStats>(response);
    });
  }



  // Resume endpoints
  async getResumes(): Promise<ApiResponse<Resume[]>> {
    const response = await fetch(`${API_BASE_URL}/user/resumes`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Resume[]>(response);
  }

  async getResumeStats(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/user/resumes/stats`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async createResume(data: Partial<Resume>): Promise<ApiResponse<Resume>> {
    const response = await fetch(`${API_BASE_URL}/user/resumes`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Resume>(response);
  }

  async updateResume(id: string, data: Partial<Resume>): Promise<ApiResponse<Resume>> {
    const response = await fetch(`${API_BASE_URL}/user/resumes/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Resume>(response);
  }

  async deleteResume(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/user/resumes/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async uploadResumeFile(file: File): Promise<ApiResponse<{ resumeId: string; filename: string }>> {
    const formData = new FormData();
    formData.append('resume', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/user/resumes/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<{ resumeId: string; filename: string }>(response);
  }

  async setDefaultResume(id: string): Promise<ApiResponse<Resume>> {
    const response = await fetch(`${API_BASE_URL}/user/resumes/${id}/set-default`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Resume>(response);
  }

  async downloadResume(id: string): Promise<void> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/user/resumes/${id}/download`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to download resume');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'resume.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Avatar upload endpoint
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string; user: User }>> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log('🔍 API Service - Uploading avatar...');
      const response = await fetch(`${API_BASE_URL}/user/avatar`, {
        method: 'POST',
        headers,
        body: formData,
      });

      console.log('🔍 API Service - Avatar upload response status:', response.status);
      const result = await this.handleResponse<{ avatarUrl: string; user: User }>(response);
      console.log('🔍 API Service - Avatar upload result:', result);
      return result;
    } catch (error) {
      console.error('❌ API Service - uploadAvatar error:', error);
      throw error;
    }
  }


  // Google OAuth sync endpoint
  async syncGoogleProfile(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/oauth/sync-google-profile`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<any>(response);
  }
}

export const apiService = new ApiService();
