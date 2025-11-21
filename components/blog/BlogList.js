import { useState, useEffect } from 'react';
import BlogCard from './BlogCard';
import BlogFilter from './BlogFilter';
import BlogPagination from './BlogPagination';

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and pagination state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  
  const postsPerPage = 6;

  // Fetch posts and categories
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: postsPerPage.toString(),
        offset: ((currentPage - 1) * postsPerPage).toString(),
        includeCategories: 'true'
      });
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await fetch(`/api/blog-static?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch blog posts');
      }
      
      if (data.success) {
        setPosts(data.data.posts);
        setTotalPosts(data.data.pagination.total);
        
        if (data.data.categories) {
          setCategories(data.data.categories);
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching blog data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters or page changes
  useEffect(() => {
    fetchData();
  }, [selectedCategory, searchQuery, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading blog posts</h3>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                  <button
                    onClick={fetchData}
                    className="mt-3 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Insights, tutorials, and thoughts on web development, technology, and design.
          </p>
        </div>

        {/* Filter Component */}
        <BlogFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-indigo-500 bg-white">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading posts...
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && (
          <>
            {posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                <BlogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalPosts={totalPosts}
                  postsPerPage={postsPerPage}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No blog posts found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedCategory || searchQuery 
                    ? 'Try adjusting your filters or search terms.'
                    : 'Get started by creating your first blog post.'
                  }
                </p>
                {(selectedCategory || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery('');
                    }}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}