/**
 * Client-side session management utilities
 */

/**
 * Check if user is authenticated
 */
export async function checkAuth() {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        isAuthenticated: data.success && data.data.authenticated,
        user: data.success ? data.data.user : null,
        error: null
      };
    } else {
      const errorData = await response.json();
      return {
        isAuthenticated: false,
        user: null,
        error: errorData.error?.message || 'Authentication check failed'
      };
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return {
      isAuthenticated: false,
      user: null,
      error: 'Network error occurred'
    };
  }
}

/**
 * Login user with credentials
 */
export async function login(username, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        user: data.data.user,
        error: null
      };
    } else {
      return {
        success: false,
        user: null,
        error: data.error?.message || 'Login failed'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      user: null,
      error: 'Network error occurred'
    };
  }
}

/**
 * Logout current user
 */
export async function logout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        error: null
      };
    } else {
      return {
        success: false,
        error: data.error?.message || 'Logout failed'
      };
    }
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'Network error occurred'
    };
  }
}

/**
 * Make authenticated API request
 */
export async function authenticatedFetch(url, options = {}) {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    // Handle authentication errors
    if (response.status === 401) {
      // Session expired or invalid
      window.location.href = '/admin/login?error=session_expired';
      return null;
    }

    if (response.status === 403) {
      // Insufficient permissions
      throw new Error('Insufficient permissions');
    }

    return response;
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
}

/**
 * Session timeout warning system
 */
class SessionManager {
  constructor() {
    this.warningTime = 5 * 60 * 1000; // 5 minutes before expiry
    this.checkInterval = 60 * 1000; // Check every minute
    this.sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
    this.warningShown = false;
    this.intervalId = null;
  }

  start() {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(() => {
      this.checkSession();
    }, this.checkInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async checkSession() {
    try {
      const authResult = await checkAuth();
      
      if (!authResult.isAuthenticated) {
        this.stop();
        return;
      }

      // Check if session is close to expiring
      const user = authResult.user;
      if (user && user.lastLogin) {
        const sessionAge = Date.now() - new Date(user.lastLogin).getTime();
        const timeUntilExpiry = this.sessionDuration - sessionAge;

        if (timeUntilExpiry <= this.warningTime && !this.warningShown) {
          this.showExpiryWarning(timeUntilExpiry);
        }

        if (timeUntilExpiry <= 0) {
          this.handleSessionExpiry();
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  }

  showExpiryWarning(timeRemaining) {
    this.warningShown = true;
    const minutes = Math.ceil(timeRemaining / (60 * 1000));
    
    if (window.confirm(`Your session will expire in ${minutes} minutes. Would you like to extend it?`)) {
      this.extendSession();
    }
  }

  async extendSession() {
    try {
      // Make a simple authenticated request to extend session
      await authenticatedFetch('/api/auth/session');
      this.warningShown = false;
    } catch (error) {
      console.error('Session extension failed:', error);
    }
  }

  handleSessionExpiry() {
    this.stop();
    alert('Your session has expired. You will be redirected to the login page.');
    window.location.href = '/admin/login?error=session_expired';
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

/**
 * Initialize session management for admin pages
 */
export function initializeSessionManagement() {
  if (typeof window !== 'undefined') {
    sessionManager.start();
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      sessionManager.stop();
    });
  }
}

/**
 * Stop session management
 */
export function stopSessionManagement() {
  sessionManager.stop();
}

/**
 * Utility to check if current user is admin
 */
export function isAdmin(user) {
  return user && user.role === 'admin';
}

/**
 * Utility to redirect to login if not authenticated
 */
export function requireAuth(redirectTo = '/admin/login') {
  if (typeof window !== 'undefined') {
    checkAuth().then(result => {
      if (!result.isAuthenticated) {
        window.location.href = redirectTo;
      }
    });
  }
}

/**
 * Utility to redirect to login if not admin
 */
export function requireAdmin(redirectTo = '/admin/login?error=admin_required') {
  if (typeof window !== 'undefined') {
    checkAuth().then(result => {
      if (!result.isAuthenticated || !isAdmin(result.user)) {
        window.location.href = redirectTo;
      }
    });
  }
}