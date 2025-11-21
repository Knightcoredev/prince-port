import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import BlogPost from '../../components/blog/BlogPost';

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the blog post by slug
        const response = await fetch(`/api/blog/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            setError('Blog post not found');
          } else {
            throw new Error(data.error?.message || 'Failed to fetch blog post');
          }
          return;
        }

        if (data.success) {
          setPost(data.data.post);
          
          // Fetch related posts based on categories
          if (data.data.post.categories && data.data.post.categories.length > 0) {
            const relatedResponse = await fetch(
              `/api/blog?limit=3&category=${data.data.post.categories[0]}`
            );
            const relatedData = await relatedResponse.json();
            
            if (relatedData.success) {
              // Filter out the current post from related posts
              const filtered = relatedData.data.posts.filter(
                (relatedPost) => relatedPost.id !== data.data.post.id
              );
              setRelatedPosts(filtered.slice(0, 3));
            }
          }
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-indigo-500 bg-white">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading post...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-8 max-w-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading blog post</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <button
                  onClick={() => router.push('/blog')}
                  className="mt-3 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                >
                  Back to Blog
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return <BlogPost post={post} relatedPosts={relatedPosts} />;
}