// Sample Job Manager - Handles sample job applications and bookmarks
// This works alongside the backend data to provide a seamless experience

interface SampleJobApplication {
  jobId: string;
  appliedAt: string;
  status: string;
  jobTitle: string;
  companyName: string;
  location: string;
  salary: string;
  type: string;
}

interface SampleJobBookmark {
  id: string;
  jobId: string;
  createdAt: string;
  jobTitle: string;
  companyName: string;
  location: string;
  salary: string;
  type: string;
  folder?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}

class SampleJobManager {
  private static instance: SampleJobManager;
  private applications: SampleJobApplication[] = [];
  private bookmarks: SampleJobBookmark[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): SampleJobManager {
    if (!SampleJobManager.instance) {
      SampleJobManager.instance = new SampleJobManager();
    }
    return SampleJobManager.instance;
  }

  private loadFromStorage() {
    try {
      const storedApplications = localStorage.getItem('sampleJobApplications');
      const storedBookmarks = localStorage.getItem('sampleJobBookmarks');
      
      if (storedApplications) {
        this.applications = JSON.parse(storedApplications);
      }
      if (storedBookmarks) {
        this.bookmarks = JSON.parse(storedBookmarks);
      }
    } catch (error) {
      console.error('Error loading sample job data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('sampleJobApplications', JSON.stringify(this.applications));
      localStorage.setItem('sampleJobBookmarks', JSON.stringify(this.bookmarks));
    } catch (error) {
      console.error('Error saving sample job data to storage:', error);
    }
  }

  // Application methods
  addApplication(jobData: {
    jobId: string;
    jobTitle: string;
    companyName: string;
    location: string;
    salary: string;
    type: string;
  }): SampleJobApplication {
    const application: SampleJobApplication = {
      ...jobData,
      appliedAt: new Date().toISOString(),
      status: 'applied'
    };

    // Check if already applied
    const existingIndex = this.applications.findIndex(app => app.jobId === jobData.jobId);
    if (existingIndex >= 0) {
      this.applications[existingIndex] = application;
    } else {
      this.applications.push(application);
    }

    this.saveToStorage();
    return application;
  }

  getApplications(): SampleJobApplication[] {
    return [...this.applications];
  }

  hasApplied(jobId: string): boolean {
    return this.applications.some(app => app.jobId === jobId);
  }

  // Bookmark methods
  addBookmark(jobData: {
    jobId: string;
    jobTitle: string;
    companyName: string;
    location: string;
    salary: string;
    type: string;
  }): SampleJobBookmark {
    const bookmark: SampleJobBookmark = {
      id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...jobData,
      createdAt: new Date().toISOString(),
      folder: 'General',
      notes: '',
      priority: 'medium'
    };

    // Check if already bookmarked
    const existingIndex = this.bookmarks.findIndex(book => book.jobId === jobData.jobId);
    if (existingIndex >= 0) {
      this.bookmarks[existingIndex] = bookmark;
    } else {
      this.bookmarks.push(bookmark);
    }

    this.saveToStorage();
    return bookmark;
  }

  removeBookmark(jobId: string): boolean {
    const initialLength = this.bookmarks.length;
    this.bookmarks = this.bookmarks.filter(book => book.jobId !== jobId);
    const removed = this.bookmarks.length < initialLength;
    if (removed) {
      this.saveToStorage();
    }
    return removed;
  }

  getBookmarks(): SampleJobBookmark[] {
    return [...this.bookmarks];
  }

  isBookmarked(jobId: string): boolean {
    return this.bookmarks.some(book => book.jobId === jobId);
  }

  updateBookmark(bookmarkId: string, updates: Partial<SampleJobBookmark>): boolean {
    const index = this.bookmarks.findIndex(book => book.id === bookmarkId);
    if (index >= 0) {
      this.bookmarks[index] = { ...this.bookmarks[index], ...updates };
      this.saveToStorage();
      return true;
    }
    return false;
  }

  deleteBookmark(bookmarkId: string): boolean {
    const initialLength = this.bookmarks.length;
    this.bookmarks = this.bookmarks.filter(book => book.id !== bookmarkId);
    const deleted = this.bookmarks.length < initialLength;
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  // Combined methods for dashboard
  getCombinedApplications(backendApplications: any[] = []): any[] {
    const sampleApps = this.applications.map(app => ({
      ...app,
      isSample: true,
      id: `sample-${app.jobId}`,
      job: {
        id: app.jobId,
        title: app.jobTitle,
        company: { name: app.companyName },
        location: app.location,
        salary: app.salary,
        type: app.type
      }
    }));

    return [...sampleApps, ...backendApplications];
  }

  getCombinedBookmarks(backendBookmarks: any[] = []): any[] {
    const sampleBooks = this.bookmarks.map(book => ({
      ...book,
      isSample: true,
      job: {
        id: book.jobId,
        title: book.jobTitle,
        company: { name: book.companyName },
        location: book.location,
        salary: book.salary,
        type: book.type
      }
    }));

    return [...sampleBooks, ...backendBookmarks];
  }

  // Clear all data (for testing)
  clearAllData() {
    this.applications = [];
    this.bookmarks = [];
    this.saveToStorage();
  }
}

export const sampleJobManager = SampleJobManager.getInstance();
export type { SampleJobApplication, SampleJobBookmark };
