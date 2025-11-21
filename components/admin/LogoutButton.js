import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../auth/withAuth';

export default function LogoutButton({ 
  className = '', 
  variant = 'button', // 'button', 'link', 'icon'
  showConfirmation = true,
  onLogout = null 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (showConfirmation) {
      const confirmed = window.confirm('Are you sure you want to log out?');
      if (!confirmed) return;
    }

    setIsLoading(true);

    try {
      const result = await logout();
      
      if (result.success) {
        // Call custom logout handler if provided
        if (onLogout) {
          onLogout();
        }
        
        // Redirect to login page
        router.push('/admin/login?message=logged_out');
      } else {
        console.error('Logout failed:', result.error);
        // Still redirect even if logout API fails
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect on error
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses = 'transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  if (variant === 'link') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`${baseClasses} text-red-600 hover:text-red-800 underline ${className}`}
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`${baseClasses} p-2 text-gray-600 hover:text-red-600 rounded-md hover:bg-gray-100 ${className}`}
        title="Logout"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        )}
      </button>
    );
  }

  // Default button variant
  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`${baseClasses} inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${className}`}
    >
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      )}
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
}