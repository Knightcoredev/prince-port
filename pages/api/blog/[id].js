import { withAdminAuth, withMethods, withErrorHandling, compose } from '../../../lib/middleware';
import { 
  getBlogPostById, 
  getBlogPostBySlug, 
  updateBlogPost, 
  deleteBlogPost 
} from '../../../lib/blog';

// GET /api/blog/[id] - Fetch single blog post (public for published, admin for all)
// PUT /api/blog/[id] - Update blog post (admin only)
// DELETE /api/blog/[id] - Delete blog post (admin only)
async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    try {
      // Try to get by ID first, then by slug
      let post = await getBlogPostById(id);
      
      if (!post) {
        post = await getBlogPostBySlug(id);
      }
      
      if (!post) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Blog post not found'
          }
        });
      }
      
      // If not admin and post is draft, deny access
      if (!req.user && post.status === 'draft') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Blog post not found'
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          post
        }
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
  
  if (req.method === 'PUT') {
    try {
      const updateData = req.body;
      
      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.createdAt;
      
      const updatedPost = await updateBlogPost(id, updateData);
      
      if (!updatedPost) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Blog post not found'
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          post: updatedPost,
          message: 'Blog post updated successfully'
        }
      });
      
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error.message
        }
      });
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const deletedPost = await deleteBlogPost(id);
      
      if (!deletedPost) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Blog post not found'
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          post: deletedPost,
          message: 'Blog post deleted successfully'
        }
      });
      
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error.message
        }
      });
    }
  }
}

// Apply middleware based on method
export default function protectedHandler(req, res) {
  if (req.method === 'GET') {
    // Public access for GET requests, but admin auth is optional
    return compose(
      withMethods(['GET', 'PUT', 'DELETE']),
      withErrorHandling
    )((req, res) => {
      // Try to authenticate but don't require it for GET
      if (req.headers.authorization || req.headers.cookie) {
        return compose(withAdminAuth)(handler)(req, res);
      } else {
        return handler(req, res);
      }
    })(req, res);
  } else {
    // Admin access required for PUT and DELETE requests
    return compose(
      withMethods(['GET', 'PUT', 'DELETE']),
      withAdminAuth,
      withErrorHandling
    )(handler)(req, res);
  }
}