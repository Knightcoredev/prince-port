// Temporary redirect to static blog API to avoid bcrypt issues
export default function handler(req, res) {
  // Redirect to static blog API
  return res.redirect(307, '/api/blog-static' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''));
}

// GET /api/blog - Fetch published blog posts (public)
// POST /api/blog - Create new blog post (admin only)
async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { 
        category, 
        tag, 
        search, 
        limit = 10, 
        offset = 0,
        includeCategories = false,
        includeTags = false,
        admin = false
      } = req.query;
      
      const options = {
        category,
        tag,
        search,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
      
      let posts;
      if (admin && req.user) {
        // Admin can see all posts including drafts
        posts = await getBlogPosts(options);
      } else {
        // Public only sees published posts
        posts = await getPublishedPosts(options);
      }
      
      const response = {
        posts,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: posts.length
        }
      };
      
      // Include categories and tags if requested
      if (includeCategories === 'true') {
        response.categories = await getBlogCategories();
      }
      
      if (includeTags === 'true') {
        response.tags = await getBlogTags();
      }
      
      return res.status(200).json({
        success: true,
        data: response
      });
      
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.message
        }
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, content, excerpt, featuredImage, categories, tags, status } = req.body;
      
      const postData = {
        title,
        content,
        excerpt,
        featuredImage,
        categories: categories || [],
        tags: tags || [],
        status: status || 'draft'
      };
      
      const newPost = await createBlogPost(postData);
      
      return res.status(201).json({
        success: true,
        data: {
          post: newPost,
          message: 'Blog post created successfully'
        }
      });
      
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.message
        }
      });
    }
  }
}

// Apply middleware based on method
export default function protectedHandler(req, res) {
  if (req.method === 'GET') {
    // Public access for GET requests
    return compose(
      withMethods(['GET', 'POST']),
      withSecurityHeaders,
      withSanitization({
        sanitizeQuery: true,
        searchFields: ['search', 'category', 'tag'],
        logViolations: true
      }),
      withErrorHandling({
        logErrors: true,
        sanitizeErrorMessages: true
      })
    )(handler)(req, res);
  } else {
    // Admin access required for POST requests
    return compose(
      withMethods(['GET', 'POST']),
      withSecurityHeaders,
      withCSRF({
        logViolations: true
      }),
      withSanitization({ 
        htmlFields: ['content', 'excerpt'],
        databaseFields: ['title', 'content', 'excerpt'],
        urlFields: ['featuredImage'],
        logViolations: true,
        strictMode: false
      }),
      withValidation(blogPostSchema),
      withAdminAuth,
      withErrorHandling({
        logErrors: true,
        sanitizeErrorMessages: true
      })
    )(handler)(req, res);
  }
}