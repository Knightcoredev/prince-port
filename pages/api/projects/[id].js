const { findById, update, deleteRecord } = require('../../../lib/db');
const { requireAuth } = require('../../../lib/middleware');

/**
 * Validate project data for updates
 */
function validateProjectData(data, isUpdate = true) {
  const errors = {};
  
  // Title validation
  if (data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0) {
      errors.title = 'Title is required';
    } else if (data.title.trim().length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
  }
  
  // Description validation
  if (data.description !== undefined) {
    if (!data.description || data.description.trim().length === 0) {
      errors.description = 'Description is required';
    } else if (data.description.trim().length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
  }
  
  // Long description validation (optional)
  if (data.longDescription !== undefined && data.longDescription.length > 2000) {
    errors.longDescription = 'Long description must be less than 2000 characters';
  }
  
  // Technologies validation
  if (data.technologies !== undefined) {
    if (!data.technologies || !Array.isArray(data.technologies) || data.technologies.length === 0) {
      errors.technologies = 'At least one technology is required';
    }
  }
  
  // Category validation
  if (data.category !== undefined) {
    if (!data.category || data.category.trim().length === 0) {
      errors.category = 'Category is required';
    }
  }
  
  // URL validations (optional)
  const urlRegex = /^https?:\/\/.+/;
  if (data.liveUrl !== undefined && data.liveUrl && !urlRegex.test(data.liveUrl)) {
    errors.liveUrl = 'Live URL must be a valid HTTP/HTTPS URL';
  }
  
  if (data.githubUrl !== undefined && data.githubUrl && !urlRegex.test(data.githubUrl)) {
    errors.githubUrl = 'GitHub URL must be a valid HTTP/HTTPS URL';
  }
  
  // Order validation (optional)
  if (data.order !== undefined && (typeof data.order !== 'number' || data.order < 0)) {
    errors.order = 'Order must be a non-negative number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_ID',
        message: 'Project ID is required'
      }
    });
  }
  
  try {
    if (req.method === 'GET') {
      // Get single project
      const project = await findById('projects', id);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found'
          }
        });
      }
      
      res.status(200).json({
        success: true,
        data: project
      });
      
    } else if (req.method === 'PUT') {
      // Update project (admin only)
      const {
        title,
        description,
        longDescription,
        technologies,
        category,
        images,
        liveUrl,
        githubUrl,
        featured,
        order
      } = req.body;
      
      // Prepare update data (only include provided fields)
      const updateData = {};
      
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (longDescription !== undefined) updateData.longDescription = longDescription.trim();
      if (technologies !== undefined) updateData.technologies = technologies;
      if (category !== undefined) updateData.category = category.trim();
      if (images !== undefined) updateData.images = images;
      if (liveUrl !== undefined) updateData.liveUrl = liveUrl.trim();
      if (githubUrl !== undefined) updateData.githubUrl = githubUrl.trim();
      if (featured !== undefined) updateData.featured = Boolean(featured);
      if (order !== undefined) updateData.order = Number(order);
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_UPDATE_DATA',
            message: 'No valid update data provided'
          }
        });
      }
      
      // Validate update data
      const validation = validateProjectData(updateData, true);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Project validation failed',
            details: validation.errors
          }
        });
      }
      
      try {
        const updatedProject = await update('projects', id, updateData);
        
        res.status(200).json({
          success: true,
          message: 'Project updated successfully',
          data: updatedProject
        });
      } catch (error) {
        if (error.message.includes('not found')) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'PROJECT_NOT_FOUND',
              message: 'Project not found'
            }
          });
        }
        throw error;
      }
      
    } else if (req.method === 'DELETE') {
      // Delete project (admin only)
      try {
        const deletedProject = await deleteRecord('projects', id);
        
        res.status(200).json({
          success: true,
          message: 'Project deleted successfully',
          data: deletedProject
        });
      } catch (error) {
        if (error.message.includes('not found')) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'PROJECT_NOT_FOUND',
              message: 'Project not found'
            }
          });
        }
        throw error;
      }
      
    } else {
      res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only GET, PUT, and DELETE requests are allowed'
        }
      });
    }
    
  } catch (error) {
    console.error('Project API error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
}

// Apply authentication middleware for PUT and DELETE requests
export default function protectedHandler(req, res) {
  if (req.method === 'PUT' || req.method === 'DELETE') {
    return requireAuth(handler)(req, res);
  }
  return handler(req, res);
}