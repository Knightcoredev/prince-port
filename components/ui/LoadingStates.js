import LoadingSpinner from './LoadingSpinner';

// Page-level loading component
export const PageLoading = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

// Section loading component
export const SectionLoading = ({ message = 'Loading...', className = '' }) => (
  <div className={`flex items-center justify-center py-12 ${className}`}>
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-2 text-gray-600">{message}</p>
    </div>
  </div>
);

// Inline loading component
export const InlineLoading = ({ message = 'Loading...', size = 'sm' }) => (
  <div className="flex items-center space-x-2">
    <LoadingSpinner size={size} />
    <span className="text-gray-600">{message}</span>
  </div>
);

// Button loading state
export const ButtonLoading = ({ children, loading, disabled, ...props }) => (
  <button
    {...props}
    disabled={loading || disabled}
    className={`${props.className} ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {loading ? (
      <span className="flex items-center justify-center">
        <LoadingSpinner size="sm" color="white" className="mr-2" />
        {typeof children === 'string' ? 'Loading...' : children}
      </span>
    ) : (
      children
    )}
  </button>
);

// Skeleton components for better UX
export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`bg-gray-200 rounded h-4 ${index < lines - 1 ? 'mb-2' : ''} ${
          index === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`animate-pulse bg-white rounded-lg shadow-sm p-6 ${className}`}>
    <div className="bg-gray-200 rounded h-48 mb-4" />
    <div className="bg-gray-200 rounded h-6 mb-2" />
    <div className="bg-gray-200 rounded h-4 w-3/4 mb-4" />
    <div className="flex space-x-2 mb-4">
      <div className="bg-gray-200 rounded-full h-6 w-16" />
      <div className="bg-gray-200 rounded-full h-6 w-20" />
      <div className="bg-gray-200 rounded-full h-6 w-14" />
    </div>
    <div className="bg-gray-200 rounded h-4 mb-2" />
    <div className="bg-gray-200 rounded h-4 w-2/3" />
  </div>
);

export const SkeletonBlogCard = ({ className = '' }) => (
  <div className={`animate-pulse bg-white rounded-lg shadow-sm p-6 ${className}`}>
    <div className="bg-gray-200 rounded h-40 mb-4" />
    <div className="bg-gray-200 rounded h-6 mb-2" />
    <div className="bg-gray-200 rounded h-4 w-1/2 mb-4" />
    <div className="bg-gray-200 rounded h-4 mb-2" />
    <div className="bg-gray-200 rounded h-4 mb-2" />
    <div className="bg-gray-200 rounded h-4 w-3/4 mb-4" />
    <div className="flex justify-between items-center">
      <div className="bg-gray-200 rounded h-4 w-24" />
      <div className="bg-gray-200 rounded h-4 w-16" />
    </div>
  </div>
);

export const SkeletonProjectGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export const SkeletonBlogGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonBlogCard key={index} />
    ))}
  </div>
);

// Form loading overlay
export const FormLoading = ({ loading, children }) => (
  <div className="relative">
    {children}
    {loading && (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
        <LoadingSpinner size="lg" />
      </div>
    )}
  </div>
);

// Table loading skeleton
export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="animate-pulse">
    <div className="bg-gray-100 rounded-t-lg p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="bg-gray-200 rounded h-4" />
        ))}
      </div>
    </div>
    <div className="bg-white rounded-b-lg">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 border-b border-gray-100 last:border-b-0">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="bg-gray-200 rounded h-4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Dashboard stats skeleton
export const SkeletonStats = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="animate-pulse bg-white rounded-lg shadow-sm p-4">
        <div className="bg-gray-200 rounded h-8 w-12 mb-2" />
        <div className="bg-gray-200 rounded h-4 w-20" />
      </div>
    ))}
  </div>
);

export default {
  PageLoading,
  SectionLoading,
  InlineLoading,
  ButtonLoading,
  SkeletonText,
  SkeletonCard,
  SkeletonBlogCard,
  SkeletonProjectGrid,
  SkeletonBlogGrid,
  FormLoading,
  SkeletonTable,
  SkeletonStats
};