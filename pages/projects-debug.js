/**
 * Debug Projects Page - Shows detailed error information
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function ProjectsDebug() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching projects from /api/projects-static...');
      
      const response = await fetch('/api/projects-static');
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      
      console.log('Response data:', data);
      
      setDebugInfo({
        status: response.status,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      });
      
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}: Failed to fetch projects`);
      }
      
      if (data.success) {
        setProjects(data.data.projects);
        console.log('Projects loaded successfully:', data.data.projects.length);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Projects Debug - [Your Name]</title>
      </Head>

      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Projects Debug Page</h1>
          
          {/* Debug Info */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading projects...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h3 className="text-red-800 font-semibold mb-2">Error Loading Projects</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchProjects}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Projects Display */}
          {!loading && !error && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Projects Loaded: {projects.length}
              </h2>
              
              {projects.length > 0 ? (
                <div className="grid gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold">{project.title}</h3>
                      <p className="text-gray-600 text-sm">{project.category}</p>
                      <p className="text-gray-500 text-xs mt-2">{project.description.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>No projects found, but API call was successful.</p>
                </div>
              )}
            </div>
          )}

          {/* Test API Button */}
          <div className="mt-8">
            <button
              onClick={() => window.open('/api/projects-static', '_blank')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-4"
            >
              Test API Directly
            </button>
            <button
              onClick={() => window.open('/api/test-projects', '_blank')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test Simple API
            </button>
          </div>
        </div>
      </main>
    </>
  );
}