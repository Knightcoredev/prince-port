/**
 * Projects Grid Component
 * Displays projects in a responsive grid layout with filtering
 */

import { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';

export default function ProjectsGrid() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalProjects: 0,
    featuredProjects: 0,
    completedProjects: 0
  });

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: '20',
        offset: '0'
      });
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (showFeaturedOnly) {
        params.append('featured', 'true');
      }
      
      const response = await fetch(`/api/projects-static?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch projects');
      }
      
      if (data.success) {
        setProjects(data.data.projects);
        setCategories(['all', ...data.data.categories]);
        setStats(data.data.stats);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, showFeaturedOnly]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleFeaturedToggle = () => {
    setShowFeaturedOnly(!showFeaturedOnly);
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Projects</h3>
          <p>{error}</p>
          <button onClick={fetchProjects} className="retry-button">
            Try Again
          </button>
        </div>
        
        <style jsx>{`
          .error-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
            padding: 2rem;
          }

          .error-content {
            text-align: center;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 12px;
            padding: 2rem;
            max-width: 400px;
          }

          .error-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          .error-content h3 {
            color: #dc2626;
            margin-bottom: 0.5rem;
          }

          .error-content p {
            color: #7f1d1d;
            margin-bottom: 1.5rem;
          }

          .retry-button {
            background: #dc2626;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.2s ease;
          }

          .retry-button:hover {
            background: #b91c1c;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="projects-container">
      {/* Header */}
      <div className="projects-header">
        <div className="header-content">
          <h1>My Projects</h1>
          <p>A showcase of my full-stack development skills and professional experience</p>
        </div>
        
        {/* Stats */}
        <div className="projects-stats">
          <div className="stat">
            <span className="stat-number">{stats.totalProjects}</span>
            <span className="stat-label">Total Projects</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.featuredProjects}</span>
            <span className="stat-label">Featured</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.completedProjects}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="projects-filters">
        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-label">Category:</label>
          <div className="category-buttons">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              >
                {category === 'all' ? 'All Projects' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Toggle */}
        <div className="filter-group">
          <label className="toggle-container">
            <input
              type="checkbox"
              checked={showFeaturedOnly}
              onChange={handleFeaturedToggle}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">Featured Only</span>
          </label>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading projects...</p>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && (
        <>
          {projects.length > 0 ? (
            <div className="projects-grid">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="no-projects">
              <div className="no-projects-icon">📁</div>
              <h3>No Projects Found</h3>
              <p>
                {selectedCategory !== 'all' || showFeaturedOnly
                  ? 'Try adjusting your filters to see more projects.'
                  : 'Projects will be displayed here once available.'
                }
              </p>
              {(selectedCategory !== 'all' || showFeaturedOnly) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setShowFeaturedOnly(false);
                  }}
                  className="clear-filters-button"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .projects-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .projects-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .header-content h1 {
          font-size: 3rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .header-content p {
          font-size: 1.2rem;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto 2rem;
        }

        .projects-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 2rem;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
          color: #4f46e5;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .projects-filters {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .filter-label {
          font-weight: 600;
          color: #374151;
        }

        .category-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .category-button {
          padding: 0.5rem 1rem;
          border: 2px solid #e5e7eb;
          background: white;
          color: #374151;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .category-button:hover {
          border-color: #4f46e5;
          color: #4f46e5;
        }

        .category-button.active {
          background: #4f46e5;
          border-color: #4f46e5;
          color: white;
        }

        .toggle-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .toggle-input {
          display: none;
        }

        .toggle-slider {
          width: 44px;
          height: 24px;
          background: #e5e7eb;
          border-radius: 12px;
          position: relative;
          transition: background 0.2s ease;
        }

        .toggle-slider::before {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: transform 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-input:checked + .toggle-slider {
          background: #4f46e5;
        }

        .toggle-input:checked + .toggle-slider::before {
          transform: translateX(20px);
        }

        .toggle-label {
          font-weight: 500;
          color: #374151;
        }

        .loading-container {
          text-align: center;
          padding: 4rem 2rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .no-projects {
          text-align: center;
          padding: 4rem 2rem;
        }

        .no-projects-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .no-projects h3 {
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .no-projects p {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .clear-filters-button {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .clear-filters-button:hover {
          background: #4338ca;
        }

        @media (max-width: 768px) {
          .projects-container {
            padding: 1rem;
          }

          .header-content h1 {
            font-size: 2rem;
          }

          .projects-stats {
            gap: 1rem;
          }

          .stat-number {
            font-size: 2rem;
          }

          .projects-filters {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .filter-group {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }

          .category-buttons {
            justify-content: center;
          }

          .projects-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}