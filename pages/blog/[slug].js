/**
 * Simple Blog Post Detail Page - Works with static blog data
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    fetchPostBySlug();
  }, [slug]);

  const fetchPostBySlug = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all posts from static API
      const response = await fetch('/api/blog-static');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch blog posts');
      }

      if (data.success) {
        const posts = data.data.posts;
        setAllPosts(posts);
        
        // Find the post with matching slug
        const foundPost = posts.find(p => p.slug === slug);
        
        if (foundPost) {
          setPost(foundPost);
        } else {
          setError('Blog post not found');
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching blog post:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <>
        <Head>
          <title>Blog Post Not Found - Prince F. Obieze</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
              <div className="text-red-400 text-6xl mb-4">📝</div>
              <h1 className="text-2xl font-bold text-red-800 mb-2">Blog Post Not Found</h1>
              <p className="text-red-600 mb-6">
                {error || 'The blog post you\'re looking for doesn\'t exist.'}
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Get related posts (other posts)
  const relatedPosts = allPosts.filter(p => p.id !== post.id).slice(0, 2);

  return (
    <>
      <Head>
        <title>{post.title} - Prince F. Obieze Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={post.tags?.join(', ')} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Article */}
        <article className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                {post.categories?.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-6 text-gray-500 text-sm">
                <span>📅 {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                <span>⏱️ {post.readingTime} min read</span>
                <span>👤 Prince F. Obieze</span>
              </div>
            </header>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="border-t pt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">More Blog Posts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">
                        {relatedPost.excerpt}
                      </p>
                      <div className="text-blue-600 text-sm font-medium">
                        Read more →
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </main>
    </>
  );
}