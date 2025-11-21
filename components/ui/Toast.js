import { useState, useEffect, createContext, useContext } from 'react';

// Toast context
const ToastContext = createContext();

// Toast types
export const ToastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Individual toast component
const Toast = ({ toast, onRemove }) => {
  const { id, type, title, message, duration = 5000, persistent = false } = toast;

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, persistent, onRemove]);

  const getToastStyles = () => {
    const baseStyles = "relative flex items-start p-4 mb-3 rounded-lg shadow-lg border-l-4 max-w-md w-full transform transition-all duration-300 ease-in-out";
    
    switch (type) {
      case ToastTypes.SUCCESS:
        return `${baseStyles} bg-green-50 border-green-400 text-green-800`;
      case ToastTypes.ERROR:
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
      case ToastTypes.WARNING:
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case ToastTypes.INFO:
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-400 text-gray-800`;
    }
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5 mr-3 flex-shrink-0 mt-0.5";
    
    switch (type) {
      case ToastTypes.SUCCESS:
        return (
          <svg className={`${iconClass} text-green-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case ToastTypes.ERROR:
        return (
          <svg className={`${iconClass} text-red-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case ToastTypes.WARNING:
        return (
          <svg className={`${iconClass} text-yellow-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case ToastTypes.INFO:
        return (
          <svg className={`${iconClass} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-medium text-sm mb-1">{title}</h4>
        )}
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// Toast container component
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toast };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const success = (message, options = {}) => {
    return addToast({
      type: ToastTypes.SUCCESS,
      message,
      ...options
    });
  };

  const error = (message, options = {}) => {
    return addToast({
      type: ToastTypes.ERROR,
      message,
      duration: 7000, // Longer duration for errors
      ...options
    });
  };

  const warning = (message, options = {}) => {
    return addToast({
      type: ToastTypes.WARNING,
      message,
      ...options
    });
  };

  const info = (message, options = {}) => {
    return addToast({
      type: ToastTypes.INFO,
      message,
      ...options
    });
  };

  const contextValue = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Hook to use toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

// Higher-order component for adding toast functionality
export const withToast = (Component) => {
  return function WrappedComponent(props) {
    const toast = useToast();
    return <Component {...props} toast={toast} />;
  };
};

export default Toast;