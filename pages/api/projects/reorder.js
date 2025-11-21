const { read, update } = require('../../../lib/db');
const { requireAuth } = require('../../../lib/middleware');

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only PUT requests are allowed'
      }
    });
  }
  
  try {
    const { projectOrders } = req.body;
    
    // Validate input
    if (!projectOrders || !Array.isArray(projectOrders)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'projectOrders must be an array of {id, order} objects'
        }
      });
    }
    
    // Validate each order item
    for (const item of projectOrders) {
      if (!item.id || typeof item.order !== 'number' || item.order < 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ORDER_ITEM',
            message: 'Each order item must have id (string) and order (non-negative number)'
          }
        });
      }
    }
    
    // Get all projects to verify IDs exist
    const allProjects = await read('projects');
    const projectIds = allProjects.map(p => p.id);
    
    // Check if all provided IDs exist
    const invalidIds = projectOrders
      .map(item => item.id)
      .filter(id => !projectIds.includes(id));
    
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROJECT_IDS',
          message: `Projects not found: ${invalidIds.join(', ')}`
        }
      });
    }
    
    // Update project orders
    const updatePromises = projectOrders.map(item => 
      update('projects', item.id, { order: item.order })
    );
    
    try {
      const updatedProjects = await Promise.all(updatePromises);
      
      res.status(200).json({
        success: true,
        message: 'Project order updated successfully',
        data: {
          updatedCount: updatedProjects.length,
          projects: updatedProjects
        }
      });
    } catch (updateError) {
      console.error('Project reorder update error:', updateError);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update project orders'
        }
      });
    }
    
  } catch (error) {
    console.error('Project reorder error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
}

// Apply authentication middleware
export default requireAuth(handler);