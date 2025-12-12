/**
 * Simple Projects Page - No external dependencies
 * Self-contained with inline components
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function SimpleProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/projects-static?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch projects');
      }
      
      if (data.success) {
        setProjects(data.data.projects);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Full Stack', 'Frontend', 'Backend'];

  return (
    <>
      <Head>
        <title>Projects - [Your Name] | Full Stack Developer</title>
        <meta name="description" content="A showcase of my full-stack development projects and professional experience." />
      </Head>

      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">My Projects</h1>
            <p className="text-xl text-gray-600">
              A showcase of my full-stack development skills and professional experience
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category === 'all' ? 'All Projects' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading projects...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-red-800 font-semibold mb-2">Error Loading Projects</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchProjects}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Project Image */}
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-4xl mb-2">💻</div>
                        <div className="text-sm font-medium">{project.category}</div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      {/* Project Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {project.category}
                        </span>
                        {project.featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        <Link 
                          href={`/projects/${project.slug}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {project.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {project.description}
                      </p>
                      
                      {/* Technologies */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 4).map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{project.technologies.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Project Links */}
                      <div className="flex gap-2">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Live Demo
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-gray-800 text-white text-center py-2 px-3 rounded text-sm hover:bg-gray-900 transition-colors"
                          >
                            GitHub
                          </a>
                        )}
                        <Link
                          href={`/projects/${project.slug}`}
                          className="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
                  <p className="text-gray-600">
                    {selectedCategory !== 'all' 
                      ? 'Try selecting a different category.' 
                      : 'Projects will be displayed here once available.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}