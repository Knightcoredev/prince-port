import { apiRequest, classifyError, ErrorTypes } from './error-handling';

/**
 * Centralized API client with error handling and retry logic
 */
class ApiClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  // Set authentication token
  setAuthToken(token) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      ...options
    };

    try {
      return await apiRequest(url, config);
    } catch (error) {
      const classifiedError = classifyError(error);
      
      // Handle authentication errors
      if (classifiedError.type === ErrorTypes.AUTHENTICATION) {
        // Clear auth token and redirect to login
        this.setAuthToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }
      
      throw classifiedError;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // File upload request
  async upload(endpoint, formData) {
    const config = {
      method: 'POST',
      body: formData,
      headers: {
        ...this.defaultHeaders
      }
    };
    
    // Remove Content-Type header for FormData
    delete config.headers['Content-Type'];
    
    return this.request(endpoint, config);
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Blog API methods
export const blogApi = {
  // Get all blog posts
  getPosts: (params = {}) => apiClient.get('/blog', params),
  
  // Get single blog post
  getPost: (id) => apiClient.get(`/blog/${id}`),
  
  // Get blog post by slug
  getPostBySlug: (slug) => apiClient.get(`/blog/slug/${slug}`),
  
  // Create blog post (admin)
  createPost: (data) => apiClient.post('/blog', data),
  
  // Update blog post (admin)
  updatePost: (id, data) => apiClient.put(`/blog/${id}`, data),
  
  // Delete blog post (admin)
  deletePost: (id) => apiClient.delete(`/blog/${id}`),
  
  // Upload blog image
  uploadImage: (formData) => apiClient.upload('/blog/upload', formData)
};

// Projects API methods
export const projectsApi = {
  // Get all projects
  getProjects: (params = {}) => apiClient.get('/projects', params),
  
  // Get single project
  getProject: (id) => apiClient.get(`/projects/${id}`),
  
  // Create project (admin)
  createProject: (data) => apiClient.post('/projects', data),
  
  // Update project (admin)
  updateProject: (id, data) => apiClient.put(`/projects/${id}`, data),
  
  // Delete project (admin)
  deleteProject: (id) => apiClient.delete(`/projects/${id}`),
  
  // Reorder projects (admin)
  reorderProjects: (data) => apiClient.post('/projects/reorder', data),
  
  // Upload project image
  uploadImage: (formData) => apiClient.upload('/projects/upload', formData)
};

// Contact API methods
export const contactApi = {
  // Submit contact form
  submitForm: (data) => apiClient.post('/contact', data),
  
  // Get contact submissions (admin)
  getSubmissions: (params = {}) => apiClient.get('/contact/submissions', params),
  
  // Get single submission (admin)
  getSubmission: (id) => apiClient.get(`/contact/submissions/${id}`),
  
  // Update submission status (admin)
  updateSubmission: (id, data) => apiClient.put(`/contact/submissions/${id}`, data)
};

// Authentication API methods
export const authApi = {
  // Login
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  // Logout
  logout: () => apiClient.post('/auth/logout'),
  
  // Check session
  checkSession: () => apiClient.get('/auth/session'),
  
  // Get CSRF token
  getCsrfToken: () => apiClient.get('/auth/csrf')
};

// Admin API methods
export const adminApi = {
  // Get dashboard analytics
  getAnalytics: (params = {}) => apiClient.get('/admin/analytics', params),
  
  // Get security audit
  getSecurityAudit: () => apiClient.get('/admin/security'),
  
  // System health check
  healthCheck: () => apiClient.get('/admin/health')
};

// Export the main client and specific API modules
export { apiClient };
export default {
  apiClient,
  blogApi,
  projectsApi,
  contactApi,
  authApi,
  adminApi
};