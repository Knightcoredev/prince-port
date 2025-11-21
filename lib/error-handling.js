/**
 * Comprehensive error handling utilities
 */

// Error types
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  FILE_UPLOAD: 'FILE_UPLOAD_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Custom error class
export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Error classification helper
export const classifyError = (error) => {
  if (error instanceof AppError) {
    return error;
  }

  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new AppError(
      'Network connection failed. Please check your internet connection.',
      ErrorTypes.NETWORK,
      0
    );
  }

  // HTTP errors
  if (error.response) {
    const status = error.response.status;
    
    if (status === 401) {
      return new AppError(
        'Authentication required. Please log in.',
        ErrorTypes.AUTHENTICATION,
        401
      );
    }
    
    if (status === 403) {
      return new AppError(
        'Access denied. You don\'t have permission to perform this action.',
        ErrorTypes.AUTHORIZATION,
        403
      );
    }
    
    if (status === 404) {
      return new AppError(
        'The requested resource was not found.',
        ErrorTypes.NOT_FOUND,
        404
      );
    }
    
    if (status === 429) {
      return new AppError(
        'Too many requests. Please wait a moment before trying again.',
        ErrorTypes.RATE_LIMIT,
        429
      );
    }
    
    if (status >= 500) {
      return new AppError(
        'Server error. Please try again later.',
        ErrorTypes.SERVER,
        status
      );
    }
    
    if (status >= 400) {
      return new AppError(
        error.response.data?.message || 'Invalid request.',
        ErrorTypes.CLIENT,
        status,
        error.response.data
      );
    }
  }

  // Default unknown error
  return new AppError(
    error.message || 'An unexpected error occurred.',
    ErrorTypes.UNKNOWN,
    500
  );
};

// API error handler
export const handleApiError = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: 'An error occurred' };
    }

    const error = new Error(errorData.message || `HTTP ${response.status}`);
    error.response = {
      status: response.status,
      data: errorData
    };
    
    throw error;
  }
  
  return response;
};

// Retry mechanism for failed requests
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429
      const classifiedError = classifyError(error);
      if (classifiedError.statusCode >= 400 && 
          classifiedError.statusCode < 500 && 
          classifiedError.type !== ErrorTypes.RATE_LIMIT) {
        throw classifiedError;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw classifiedError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw classifyError(lastError);
};

// Enhanced fetch with error handling and retry
export const apiRequest = async (url, options = {}, retries = 2) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  return withRetry(async () => {
    const response = await fetch(url, defaultOptions);
    await handleApiError(response);
    return response.json();
  }, retries);
};

// Form validation error handler
export const handleValidationErrors = (error) => {
  if (error.type === ErrorTypes.VALIDATION || 
      (error.details && typeof error.details === 'object')) {
    return error.details;
  }
  
  return {};
};

// User-friendly error messages
export const getUserFriendlyMessage = (error) => {
  const classifiedError = classifyError(error);
  
  const messages = {
    [ErrorTypes.NETWORK]: 'Connection problem. Please check your internet and try again.',
    [ErrorTypes.AUTHENTICATION]: 'Please log in to continue.',
    [ErrorTypes.AUTHORIZATION]: 'You don\'t have permission to do that.',
    [ErrorTypes.NOT_FOUND]: 'The page or resource you\'re looking for doesn\'t exist.',
    [ErrorTypes.RATE_LIMIT]: 'You\'re doing that too quickly. Please wait a moment.',
    [ErrorTypes.SERVER]: 'Something went wrong on our end. Please try again later.',
    [ErrorTypes.FILE_UPLOAD]: 'File upload failed. Please check the file and try again.',
    [ErrorTypes.UNKNOWN]: 'Something unexpected happened. Please try again.'
  };
  
  return messages[classifiedError.type] || classifiedError.message;
};

// Error logging utility
export const logError = (error, context = {}) => {
  const classifiedError = classifyError(error);
  
  const errorLog = {
    message: classifiedError.message,
    type: classifiedError.type,
    statusCode: classifiedError.statusCode,
    details: classifiedError.details,
    timestamp: classifiedError.timestamp,
    context,
    stack: error.stack,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    url: typeof window !== 'undefined' ? window.location.href : null
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorLog);
  }
  
  // In production, you would send this to your error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error tracking service
    // errorTrackingService.log(errorLog);
  }
  
  return errorLog;
};

// React hook for error handling
export const useErrorHandler = () => {
  const handleError = (error, context = {}) => {
    const classifiedError = classifyError(error);
    logError(error, context);
    
    // You can integrate with toast notifications here
    // toast.error(getUserFriendlyMessage(classifiedError));
    
    return classifiedError;
  };
  
  return { handleError, getUserFriendlyMessage, classifyError };
};

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, { type: 'unhandledRejection' });
  });
  
  window.addEventListener('error', (event) => {
    logError(event.error, { 
      type: 'globalError',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
}

export default {
  ErrorTypes,
  AppError,
  classifyError,
  handleApiError,
  withRetry,
  apiRequest,
  handleValidationErrors,
  getUserFriendlyMessage,
  logError,
  useErrorHandler
};