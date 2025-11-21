const { create, read, update, deleteRecord, findById, findOne } = require('./db');
const { generateId } = require('./utils');

/**
 * Generate a URL-friendly slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
}

/**
 * Validate slug uniqueness
 */
async function validateSlug(slug, excludeId = null) {
  const existingPost = await findOne('blog-posts', { slug });
  if (existingPost && existingPost.id !== excludeId) {
    throw new Error(`Slug "${slug}" already exists`);
  }
  return true;
}

/**
 * Calculate reading time based on content
 * Assumes average reading speed of 200 words per minute
 */
function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Create a new blog post
 */
async function createBlogPost(postData) {
  try {
    // Generate ID if not provided
    const id = postData.id || generateId();
    
    // Generate slug from title if not provided
    let slug = postData.slug || generateSlug(postData.title);
    
    // Ensure slug uniqueness
    await validateSlug(slug);
    
    // Calculate reading time
    const readingTime = calculateReadingTime(postData.content);
    
    // Generate excerpt if not provided (first 150 characters)
    const excerpt = postData.excerpt || 
      postData.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
    
    const blogPost = {
      id,
      title: postData.title,
      slug,
      content: postData.content,
      excerpt,
      featuredImage: postData.featuredImage || '',
      categories: postData.categories || [],
      tags: postData.tags || [],
      status: postData.status || 'draft',
      readingTime,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return await create('blog-posts', blogPost);
  } catch (error) {
    throw new Error(`Failed to create blog post: ${error.message}`);
  }
}

/**
 * Get all blog posts with optional filtering
 */
async function getBlogPosts(options = {}) {
  try {
    const {
      status = null,
      category = null,
      tag = null,
      search = null,
      limit = null,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;
    
    let posts = await read('blog-posts');
    
    // Filter by status
    if (status) {
      posts = posts.filter(post => post.status === status);
    }
    
    // Filter by category
    if (category) {
      posts = posts.filter(post => 
        post.categories && post.categories.includes(category)
      );
    }
    
    // Filter by tag
    if (tag) {
      posts = posts.filter(post => 
        post.tags && post.tags.includes(tag)
      );
    }
    
    // Search in title, content, and excerpt
    if (search) {
      const searchLower = search.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort posts
    posts.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'desc') {
        return new Date(bValue) - new Date(aValue);
      } else {
        return new Date(aValue) - new Date(bValue);
      }
    });
    
    // Apply pagination
    if (limit) {
      posts = posts.slice(offset, offset + limit);
    }
    
    return posts;
  } catch (error) {
    throw new Error(`Failed to get blog posts: ${error.message}`);
  }
}

/**
 * Get a single blog post by ID
 */
async function getBlogPostById(id) {
  try {
    return await findById('blog-posts', id);
  } catch (error) {
    throw new Error(`Failed to get blog post: ${error.message}`);
  }
}

/**
 * Get a single blog post by slug
 */
async function getBlogPostBySlug(slug) {
  try {
    return await findOne('blog-posts', { slug });
  } catch (error) {
    throw new Error(`Failed to get blog post: ${error.message}`);
  }
}

/**
 * Update a blog post
 */
async function updateBlogPost(id, updateData) {
  try {
    // If title is being updated, regenerate slug
    if (updateData.title && !updateData.slug) {
      updateData.slug = generateSlug(updateData.title);
    }
    
    // Validate slug uniqueness if slug is being updated
    if (updateData.slug) {
      await validateSlug(updateData.slug, id);
    }
    
    // Recalculate reading time if content is updated
    if (updateData.content) {
      updateData.readingTime = calculateReadingTime(updateData.content);
      
      // Regenerate excerpt if not provided
      if (!updateData.excerpt) {
        updateData.excerpt = updateData.content
          .replace(/<[^>]*>/g, '')
          .substring(0, 150) + '...';
      }
    }
    
    return await update('blog-posts', id, updateData);
  } catch (error) {
    throw new Error(`Failed to update blog post: ${error.message}`);
  }
}

/**
 * Delete a blog post
 */
async function deleteBlogPost(id) {
  try {
    return await deleteRecord('blog-posts', id);
  } catch (error) {
    throw new Error(`Failed to delete blog post: ${error.message}`);
  }
}

/**
 * Get published blog posts for public display
 */
async function getPublishedPosts(options = {}) {
  return await getBlogPosts({ ...options, status: 'published' });
}

/**
 * Get blog post categories with counts
 */
async function getBlogCategories() {
  try {
    const posts = await getBlogPosts({ status: 'published' });
    const categoryCount = {};
    
    posts.forEach(post => {
      if (post.categories) {
        post.categories.forEach(category => {
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
      }
    });
    
    return Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count
    }));
  } catch (error) {
    throw new Error(`Failed to get blog categories: ${error.message}`);
  }
}

/**
 * Get blog post tags with counts
 */
async function getBlogTags() {
  try {
    const posts = await getBlogPosts({ status: 'published' });
    const tagCount = {};
    
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    
    return Object.entries(tagCount).map(([name, count]) => ({
      name,
      count
    }));
  } catch (error) {
    throw new Error(`Failed to get blog tags: ${error.message}`);
  }
}

/**
 * Search blog posts
 */
async function searchBlogPosts(query, options = {}) {
  return await getBlogPosts({ ...options, search: query });
}

module.exports = {
  createBlogPost,
  getBlogPosts,
  getBlogPostById,
  getBlogPostBySlug,
  updateBlogPost,
  deleteBlogPost,
  getPublishedPosts,
  getBlogCategories,
  getBlogTags,
  searchBlogPosts,
  generateSlug,
  calculateReadingTime
};