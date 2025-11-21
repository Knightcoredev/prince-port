import { useAuth } from '../auth/withAuth';
import LogoutButton from './LogoutButton';

export default function AuthStatus({ 
  showUserInfo = true, 
  showLogoutButton = true,
  className = '',
  variant = 'full' // 'full', 'compact', 'minimal'
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse flex space-x-2">
          <div className="rounded-full bg-gray-300 h-8 w-8"></div>
          <div className="flex-1 space-y-1 py-1">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Not authenticated
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-gray-700">{user.username}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between space-x-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700">{user.username}</span>
        </div>
        {showLogoutButton && (
          <LogoutButton variant="icon" showConfirmation={false} />
        )}
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-medium text-blue-600">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {showUserInfo && (
            <div>
              <p className="text-sm font-medium text-gray-900">{user.username}</p>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {user.role}
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {showLogoutButton && (
          <LogoutButton variant="button" className="text-xs px-3 py-1" />
        )}
      </div>

      {user.email && showUserInfo && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">{user.email}</p>
          {user.lastLogin && (
            <p className="text-xs text-gray-400 mt-1">
              Last login: {new Date(user.lastLogin).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Session expiry warning component
export function SessionExpiryWarning({ timeRemaining, onExtend, onLogout }) {
  const minutes = Math.ceil(timeRemaining / (60 * 1000));

  return (
    <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-md p-4 shadow-lg z-50 max-w-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Session Expiring Soon
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>Your session will expire in {minutes} minute{minutes !== 1 ? 's' : ''}.</p>
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={onExtend}
              className="bg-yellow-100 px-2 py-1 rounded text-sm text-yellow-800 hover:bg-yellow-200 transition-colors"
            >
              Extend Session
            </button>
            <button
              onClick={onLogout}
              className="bg-transparent px-2 py-1 rounded text-sm text-yellow-800 hover:bg-yellow-100 transition-colors"
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}