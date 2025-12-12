/**
 * Simple Blog Page - No external dependencies
 * Self-contained with inline components
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function BlogIndex() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/blog-static');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch blog posts');
      }
      
      if (data.success) {
        setPosts(data.data.posts);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Blog - [Your Name] | Full Stack Developer</title>
        <meta name="description" content="Insights, tutorials, and thoughts on web development, technology, and design." />
      </Head>

      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
            <p className="text-xl text-gray-600">
              Insights, tutorials, and thoughts on web development, technology, and design.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-red-800 font-semibold mb-2">Error Loading Posts</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchPosts}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Posts Grid */}
          {!loading && !error && (
            <div className="space-y-8">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {post.categories.map((category, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                          <span>⏱️ {post.readingTime} min read</span>
                        </div>
                        
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Read More →
                        </Link>
                      </div>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Blog Posts Yet</h3>
                  <p className="text-gray-600">Check back soon for new content!</p>
                </div>
              )}
            </div>
          )}

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}