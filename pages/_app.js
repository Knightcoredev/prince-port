import '../styles/globals.css'
import ErrorBoundary from '../components/ErrorBoundary'
import { ToastProvider } from '../components/ui/Toast'
import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  // Global error handling setup
  useEffect(() => {
    // Log app initialization
    console.log('Portfolio app initialized');
    
    // Handle global errors
    const handleError = (error) => {
      console.error('Global error:', error);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </ErrorBoundary>
  )
}