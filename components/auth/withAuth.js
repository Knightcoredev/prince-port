import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * Higher-order component for protecting pages that require authentication
 */
function withAuth(WrappedComponent, options = {}) {
  const {
    redirectTo = '/admin/login',
    requireAdmin = false,
    loadingComponent = null
  } = options;

  return function AuthenticatedComponent(props) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
      checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
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
          
          if (data.success && data.data.authenticated) {
            const userData = data.data.user;
            
            // Check admin requirement
            if (requireAdmin && userData.role !== 'admin') {
              router.replace('/admin/login?error=insufficient_permissions');
              return;
            }
            
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            router.replace(redirectTo);
            return;
          }
        } else {
          router.replace(redirectTo);
          return;
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        router.replace(redirectTo);
        return;
      } finally {
        setIsLoading(false);
      }
    };

    // Show loading component while checking authentication
    if (isLoading) {
      if (loadingComponent) {
        return loadingComponent;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying authentication...</p>
          </div>
        </div>
      );
    }

    // Don't render the component if not authenticated
    if (!isAuthenticated) {
      return null;
    }

    // Pass user data and authentication status to wrapped component
    return (
      <WrappedComponent 
        {...props} 
        user={user}
        isAuthenticated={isAuthenticated}
      />
    );
  };
}

/**
 * Hook for accessing authentication state in components
 */
export function useAuth() {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
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
        
        if (data.success && data.data.authenticated) {
          setAuthState({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const login = async (username, password) => {
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
        setAuthState({
          user: data.data.user,
          isAuthenticated: true,
          isLoading: false
        });
        return { success: true, user: data.data.user };
      } else {
        return { 
          success: false, 
          error: data.error?.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Network error occurred' 
      };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      return { success: false, error: 'Logout failed' };
    }
  };

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus
  };
}

/**
 * Component for protecting routes that require admin access
 */
export function withAdminAuth(WrappedComponent, options = {}) {
  return withAuth(WrappedComponent, {
    ...options,
    requireAdmin: true,
    redirectTo: '/admin/login?error=admin_required'
  });
}

/**
 * Component for optional authentication (user data available if logged in)
 */
export function withOptionalAuth(WrappedComponent) {
  return function OptionallyAuthenticatedComponent(props) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
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
          
          if (data.success && data.data.authenticated) {
            setUser(data.data.user);
          }
        }
      } catch (error) {
        console.error('Optional auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <WrappedComponent 
        {...props} 
        user={user}
        isAuthenticated={!!user}
        isLoading={isLoading}
      />
    );
  };
}

export default withAuth;