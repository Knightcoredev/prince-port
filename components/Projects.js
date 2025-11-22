import { useState, useEffect } from 'react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    technology: '',
    search: '',
    showFeatured: false,
    sortBy: 'order',
    sortOrder: 'asc'
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableTechnologies, setAvailableTechnologies] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    featured: 0,
    categories: 0,
    technologies: 0
  });

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        category: filters.category,
        technology: filters.technology,
        search: filters.search,
        featured: filters.showFeatured ? 'true' : '',
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      }).toString();

      const response = await fetch(`/api/projects?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setProjects(result.data);
        setAvailableCategories(result.meta.categories || []);
        setAvailableTechnologies(result.meta.technologies || []);
        setProjectStats({
          total: result.meta.total || 0,
          featured: result.data.filter(p => p.featured).length,
          categories: result.meta.categories?.length || 0,
          technologies: result.meta.technologies?.length || 0
        });
        setError(null);
      } else {
        setError('Failed to load projects');
      }
    } catch (err) {
      setError('Failed to load projects');
      console.error('Projects fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Open project detail modal
  const openProjectDetail = (project) => {
    setSelectedProject(project);
  };

  // Close project detail modal
  const closeProjectDetail = () => {
    setSelectedProject(null);
  };

  // Project card component
  const ProjectCard = ({ project }) => (
    <div className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      {/* Project Image */}
      {project.images && project.images.length > 0 && (
        <div className="mb-4 overflow-hidden rounded-md">
          <img
            src={project.images[0]}
            alt={project.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Project Info */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
          {project.title}
        </h3>
        {project.featured && (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Featured
          </span>
        )}
      </div>

      {/* Category */}
      <p className="text-sm text-blue-600 font-medium mb-2">{project.category}</p>

      {/* Technologies */}
      <div className="flex flex-wrap gap-1 mb-3">
        {project.technologies.slice(0, 3).map((tech, index) => (
          <span
            key={index}
            className="inline-flex px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700"
          >
            {tech}
          </span>
        ))}
        {project.technologies.length > 3 && (
          <span className="inline-flex px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700">
            +{project.technologies.length - 3}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {project.description}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => openProjectDetail(project)}
          className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
        >
          View Details →
        </button>
        <div className="flex space-x-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Live Demo"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="GitHub Repository"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );

  // Project detail modal
  const ProjectDetailModal = ({ project, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
            <p className="text-blue-600 font-medium">{project.category}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Project Images */}
          {project.images && project.images.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${project.title} screenshot ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Technologies */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {project.longDescription || project.description}
            </p>
          </div>

          {/* Links */}
          <div className="flex space-x-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Live Demo
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="projects" className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Selected Projects</h2>
        <p className="mt-2 text-gray-600">
          Explore my recent work and technical projects
        </p>
        <div className="mt-4">
          <a
            href="/projects"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View All Projects
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Project Statistics */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{projectStats.total}</div>
          <div className="text-sm text-gray-600">Total Projects</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{projectStats.featured}</div>
          <div className="text-sm text-gray-600">Featured</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{projectStats.categories}</div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{projectStats.technologies}</div>
          <div className="text-sm text-gray-600">Technologies</div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Technology Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technology</label>
            <select
              value={filters.technology}
              onChange={(e) => handleFilterChange('technology', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Technologies</option>
              {availableTechnologies.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="order-asc">Order (Default)</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="category-asc">Category (A-Z)</option>
            </select>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-end">
            <label className="flex items-center cursor-pointer h-10">
              <input
                type="checkbox"
                checked={filters.showFeatured}
                onChange={(e) => handleFilterChange('showFeatured', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Featured Only</span>
            </label>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.search || filters.category !== 'all' || filters.technology || filters.showFeatured) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.category !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Category: {filters.category}
                  <button
                    onClick={() => handleFilterChange('category', 'all')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.technology && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Tech: {filters.technology}
                  <button
                    onClick={() => handleFilterChange('technology', '')}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.showFeatured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Featured Only
                  <button
                    onClick={() => handleFilterChange('showFeatured', false)}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => setFilters({
                  category: 'all',
                  technology: '',
                  search: '',
                  showFeatured: false,
                  sortBy: 'order',
                  sortOrder: 'asc'
                })}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading projects...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-lg font-medium text-gray-900">No projects found</p>
          <p className="mt-1 text-gray-500">
            {filters.search || filters.category !== 'all' || filters.technology || filters.showFeatured
              ? 'Try adjusting your filters to see more projects.'
              : 'Projects will appear here once they are added.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={closeProjectDetail}
        />
      )}
    </section>
  );
}