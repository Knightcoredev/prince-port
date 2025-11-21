const { create, read, update, deleteRecord } = require('../../../lib/db');
const { 
  withAdminAuth,
  withMethods,
  withCSRF,
  withSanitization,
  withSecurityHeaders,
  withValidation,
  withErrorHandling,
  compose
} = require('../../../lib/middleware');
const { generateId } = require('../../../lib/utils');
const { projectSchema } = require('../../../lib/security');

/**
 * Filter and search projects
 */
function filterProjects(projects, query) {
  let filtered = [...projects];
  
  // Filter by category
  if (query.category && query.category !== 'all') {
    filtered = filtered.filter(project => project.category === query.category);
  }
  
  // Filter by technology
  if (query.technology) {
    filtered = filtered.filter(project => 
      project.technologies.some(tech => 
        tech.toLowerCase().includes(query.technology.toLowerCase())
      )
    );
  }
  
  // Filter by featured status
  if (query.featured === 'true') {
    filtered = filtered.filter(project => project.featured === true);
  }
  
  // Search by title or description
  if (query.search) {
    const searchTerm = query.search.toLowerCase();
    filtered = filtered.filter(project => 
      project.title.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm) ||
      (project.longDescription && project.longDescription.toLowerCase().includes(searchTerm))
    );
  }
  
  return filtered;
}

/**
 * Sort projects
 */
function sortProjects(projects, sortBy = 'order', sortOrder = 'asc') {
  return projects.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle date sorting
    if (sortBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Handle string sorting
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    // Handle numeric sorting (order, featured)
    if (typeof aValue === 'number') {
      // For order, lower numbers come first
      // For other numeric fields, standard comparison
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

// Validation is now handled by middleware using Joi schema

async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Get all projects with optional filtering
      const {
        category = 'all',
        technology = '',
        featured = '',
        search = '',
        sortBy = 'order',
        sortOrder = 'asc',
        limit
      } = req.query;
      
      // Read all projects
      const allProjects = await read('projects');
      
      // Apply filters
      const filteredProjects = filterProjects(allProjects, {
        category,
        technology,
        featured,
        search
      });
      
      // Sort projects
      const sortedProjects = sortProjects(filteredProjects, sortBy, sortOrder);
      
      // Apply limit if specified
      const finalProjects = limit ? sortedProjects.slice(0, parseInt(limit)) : sortedProjects;
      
      // Get unique categories and technologies for filtering
      const categories = [...new Set(allProjects.map(p => p.category))];
      const technologies = [...new Set(allProjects.flatMap(p => p.technologies))];
      
      res.status(200).json({
        success: true,
        data: finalProjects,
        meta: {
          total: allProjects.length,
          filtered: filteredProjects.length,
          categories,
          technologies,
          filters: {
            category,
            technology,
            featured,
            search,
            sortBy,
            sortOrder
          }
        }
      });
      
    } else if (req.method === 'POST') {
      // Create new project (admin only)
      const {
        title,
        description,
        longDescription = '',
        technologies,
        category,
        images = [],
        liveUrl = '',
        githubUrl = '',
        featured = false,
        order = 0
      } = req.body;
      
      // Data is already validated by middleware
      
      // Create project data
      const projectId = generateId();
      const projectData = {
        id: projectId,
        title: title.trim(),
        description: description.trim(),
        longDescription: longDescription.trim(),
        technologies,
        category: category.trim(),
        images,
        liveUrl: liveUrl.trim(),
        githubUrl: githubUrl.trim(),
        featured: Boolean(featured),
        order: Number(order),
        createdAt: new Date()
      };
      
      try {
        const newProject = await create('projects', projectData);
        
        res.status(201).json({
          success: true,
          message: 'Project created successfully',
          data: newProject
        });
      } catch (error) {
        console.error('Project creation error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create project'
          }
        });
      }
      
    } else {
      res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only GET and POST requests are allowed'
        }
      });
    }
    
  } catch (error) {
    console.error('Projects API error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
}

// Apply middleware based on method
export default function protectedHandler(req, res) {
  if (req.method === 'GET') {
    // Public access for GET requests
    return compose(
      withMethods(['GET', 'POST']),
      withSecurityHeaders,
      withErrorHandling
    )(handler)(req, res);
  } else {
    // Admin access required for POST requests
    return compose(
      withMethods(['GET', 'POST']),
      withSecurityHeaders,
      withCSRF,
      withSanitization({ urlFields: ['liveUrl', 'githubUrl'] }),
      withValidation(projectSchema),
      withAdminAuth,
      withErrorHandling
    )(handler)(req, res);
  }
}