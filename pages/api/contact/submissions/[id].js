const { findById, update, deleteRecord } = require('../../../../lib/db');
const { requireAuth } = require('../../../../lib/middleware');

async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_ID',
        message: 'Submission ID is required'
      }
    });
  }
  
  try {
    if (req.method === 'GET') {
      // Get single contact submission
      const submission = await findById('contacts', id);
      
      if (!submission) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SUBMISSION_NOT_FOUND',
            message: 'Contact submission not found'
          }
        });
      }
      
      res.status(200).json({
        success: true,
        data: submission
      });
      
    } else if (req.method === 'PUT') {
      // Update contact submission
      const { status, notes } = req.body;
      
      const updateData = {};
      
      if (status) {
        if (!['unread', 'read', 'responded'].includes(status)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_STATUS',
              message: 'Status must be one of: unread, read, responded'
            }
          });
        }
        updateData.status = status;
      }
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_UPDATE_DATA',
            message: 'No valid update data provided'
          }
        });
      }
      
      try {
        const updatedSubmission = await update('contacts', id, updateData);
        
        res.status(200).json({
          success: true,
          message: 'Submission updated successfully',
          data: updatedSubmission
        });
      } catch (error) {
        if (error.message.includes('not found')) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'SUBMISSION_NOT_FOUND',
              message: 'Contact submission not found'
            }
          });
        }
        throw error;
      }
      
    } else if (req.method === 'DELETE') {
      // Delete contact submission
      try {
        const deletedSubmission = await deleteRecord('contacts', id);
        
        res.status(200).json({
          success: true,
          message: 'Submission deleted successfully',
          data: deletedSubmission
        });
      } catch (error) {
        if (error.message.includes('not found')) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'SUBMISSION_NOT_FOUND',
              message: 'Contact submission not found'
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
    console.error('Contact submission API error:', error);
    
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