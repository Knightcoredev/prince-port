const { read, update } = require('../../../lib/db');
const { requireAuth } = require('../../../lib/middleware');

/**
 * Filter and search contact submissions
 */
function filterSubmissions(submissions, query) {
  let filtered = [...submissions];
  
  // Filter by status
  if (query.status && query.status !== 'all') {
    filtered = filtered.filter(submission => submission.status === query.status);
  }
  
  // Search by name, email, or message
  if (query.search) {
    const searchTerm = query.search.toLowerCase();
    filtered = filtered.filter(submission => 
      submission.name.toLowerCase().includes(searchTerm) ||
      submission.email.toLowerCase().includes(searchTerm) ||
      submission.message.toLowerCase().includes(searchTerm) ||
      (submission.subject && submission.subject.toLowerCase().includes(searchTerm))
    );
  }
  
  // Filter by date range
  if (query.dateFrom) {
    const fromDate = new Date(query.dateFrom);
    filtered = filtered.filter(submission => 
      new Date(submission.submittedAt) >= fromDate
    );
  }
  
  if (query.dateTo) {
    const toDate = new Date(query.dateTo);
    toDate.setHours(23, 59, 59, 999); // End of day
    filtered = filtered.filter(submission => 
      new Date(submission.submittedAt) <= toDate
    );
  }
  
  return filtered;
}

/**
 * Sort submissions
 */
function sortSubmissions(submissions, sortBy = 'submittedAt', sortOrder = 'desc') {
  return submissions.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle date sorting
    if (sortBy === 'submittedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Handle string sorting
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    let comparison = 0;
    if (aValue > bValue) {
      comparison = 1;
    } else if (aValue < bValue) {
      comparison = -1;
    }
    
    return sortOrder === 'desc' ? comparison * -1 : comparison;
  });
}

/**
 * Paginate submissions
 */
function paginateSubmissions(submissions, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const paginatedItems = submissions.slice(offset, offset + limit);
  
  return {
    items: paginatedItems,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(submissions.length / limit),
      totalItems: submissions.length,
      itemsPerPage: limit,
      hasNextPage: offset + limit < submissions.length,
      hasPrevPage: page > 1
    }
  };
}

async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Get all contact submissions with filtering and pagination
      const {
        status = 'all',
        search = '',
        dateFrom,
        dateTo,
        sortBy = 'submittedAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = req.query;
      
      // Read all submissions
      const allSubmissions = await read('contacts');
      
      // Apply filters
      const filteredSubmissions = filterSubmissions(allSubmissions, {
        status,
        search,
        dateFrom,
        dateTo
      });
      
      // Sort submissions
      const sortedSubmissions = sortSubmissions(filteredSubmissions, sortBy, sortOrder);
      
      // Paginate results
      const result = paginateSubmissions(sortedSubmissions, parseInt(page), parseInt(limit));
      
      // Get summary statistics
      const stats = {
        total: allSubmissions.length,
        unread: allSubmissions.filter(s => s.status === 'unread').length,
        read: allSubmissions.filter(s => s.status === 'read').length,
        responded: allSubmissions.filter(s => s.status === 'responded').length
      };
      
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        stats,
        filters: {
          status,
          search,
          dateFrom,
          dateTo,
          sortBy,
          sortOrder
        }
      });
      
    } else if (req.method === 'PUT') {
      // Update submission status
      const { id, status } = req.body;
      
      if (!id || !status) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Submission ID and status are required'
          }
        });
      }
      
      if (!['unread', 'read', 'responded'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Status must be one of: unread, read, responded'
          }
        });
      }
      
      try {
        const updatedSubmission = await update('contacts', id, { status });
        
        res.status(200).json({
          success: true,
          message: 'Submission status updated successfully',
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
      
    } else {
      res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only GET and PUT requests are allowed'
        }
      });
    }
    
  } catch (error) {
    console.error('Contact submissions API error:', error);
    
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